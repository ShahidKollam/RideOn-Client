import bcrypt from 'bcrypt'
import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'
import { generateToken, generateRefreshToken, verifyToken } from '../../../lib/jwt.js'
import { config } from '../../../config/env.js'

const REFRESH_MS = (() => {
  const raw = config.refreshTokenExpiresIn || '7d'
  // support Nd / Nh / Nm simple forms used by jwt
  const m = String(raw).match(/^(\d+)([dhms])$/i)
  if (!m) return 7 * 24 * 60 * 60 * 1000
  const n = Number(m[1])
  const u = m[2].toLowerCase()
  if (u === 'd') return n * 24 * 60 * 60 * 1000
  if (u === 'h') return n * 60 * 60 * 1000
  if (u === 'm') return n * 60 * 1000
  return n * 1000
})()

const ADMIN_INCLUDE = {
  role: {
    include: {
      permissions: { include: { permission: true } },
    },
  },
  campus: { select: { id: true, name: true, location: true } },
}

const toAdminPayload = (admin) => {
  const permissions = (admin.role?.permissions || []).map((rp) => rp.permission.name)
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    isActive: admin.isActive,
    campusId: admin.campusId,
    campus: admin.campus,
    role: admin.role ? { id: admin.role.id, name: admin.role.name } : null,
    permissions,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
  }
}

const issueTokens = async (admin, meta = {}) => {
  const accessToken = generateToken({ id: admin.id, role: 'admin' })
  const refreshToken = generateRefreshToken({ id: admin.id, role: 'admin' })
  const expiresAt = new Date(Date.now() + REFRESH_MS)

  await prisma.adminRefreshToken.create({
    data: {
      token: refreshToken,
      adminId: admin.id,
      expiresAt,
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
    },
  })

  return { accessToken, refreshToken, expiresAt }
}

export const adminLogin = async (email, password, meta = {}) => {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
    include: ADMIN_INCLUDE,
  })

  if (!admin) throw new ApiError(401, 'Invalid credentials')
  if (!admin.isActive) throw new ApiError(403, 'Admin account is inactive')
  if (!admin.role || !admin.role.isActive) {
    throw new ApiError(403, 'Admin role is inactive')
  }

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) throw new ApiError(401, 'Invalid credentials')

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })

  try {
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        entityType: 'Admin',
        entityId: admin.id,
        ipAddress: meta.ipAddress || null,
        userAgent: meta.userAgent || null,
      },
    })
  } catch {
    // non-blocking
  }

  const { accessToken, refreshToken } = await issueTokens(admin, meta)
  const payload = toAdminPayload(admin)

  return {
    accessToken,
    refreshToken,
    admin: payload,
  }
}

export const getAdminMe = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: ADMIN_INCLUDE,
  })

  if (!admin || !admin.isActive) {
    throw new ApiError(401, 'Admin not found or inactive')
  }
  if (!admin.role || !admin.role.isActive) {
    throw new ApiError(403, 'Admin role is inactive')
  }

  return toAdminPayload(admin)
}

/**
 * Rotate refresh token: validate JWT + DB session, issue new pair, revoke old.
 */
export const adminRefresh = async (refreshToken, meta = {}) => {
  if (!refreshToken) throw new ApiError(401, 'No refresh token')

  let decoded
  try {
    decoded = verifyToken(refreshToken, config.jwtRefreshSecret)
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token')
  }

  if (decoded.role !== 'admin' || !decoded.id) {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const stored = await prisma.adminRefreshToken.findUnique({
    where: { token: refreshToken },
  })

  if (!stored) {
    throw new ApiError(401, 'Refresh session revoked or not found')
  }

  if (stored.expiresAt.getTime() < Date.now()) {
    await prisma.adminRefreshToken.delete({ where: { id: stored.id } }).catch(() => {})
    throw new ApiError(401, 'Refresh token expired')
  }

  if (stored.adminId !== decoded.id) {
    throw new ApiError(401, 'Invalid refresh token')
  }

  const admin = await prisma.admin.findUnique({
    where: { id: decoded.id },
    include: ADMIN_INCLUDE,
  })

  if (!admin || !admin.isActive) {
    await prisma.adminRefreshToken.deleteMany({ where: { adminId: decoded.id } }).catch(() => {})
    throw new ApiError(401, 'Admin not found or inactive')
  }
  if (!admin.role || !admin.role.isActive) {
    throw new ApiError(403, 'Admin role is inactive')
  }

  // Rotate: delete old session, create new
  const { accessToken, refreshToken: newRefreshToken } = await prisma.$transaction(async (tx) => {
    await tx.adminRefreshToken.delete({ where: { id: stored.id } })

    const accessToken = generateToken({ id: admin.id, role: 'admin' })
    const newRefreshToken = generateRefreshToken({ id: admin.id, role: 'admin' })
    const expiresAt = new Date(Date.now() + REFRESH_MS)

    await tx.adminRefreshToken.create({
      data: {
        token: newRefreshToken,
        adminId: admin.id,
        expiresAt,
        ipAddress: meta.ipAddress || null,
        userAgent: meta.userAgent || null,
      },
    })

    return { accessToken, refreshToken: newRefreshToken }
  })

  return {
    accessToken,
    refreshToken: newRefreshToken,
    admin: toAdminPayload(admin),
  }
}

/**
 * Revoke a single refresh session (logout current device).
 */
export const adminLogout = async (refreshToken, adminId = null, meta = {}) => {
  if (refreshToken) {
    await prisma.adminRefreshToken.deleteMany({ where: { token: refreshToken } })
  }

  if (adminId) {
    try {
      await prisma.auditLog.create({
        data: {
          adminId,
          action: 'LOGOUT',
          entityType: 'Admin',
          entityId: adminId,
          ipAddress: meta.ipAddress || null,
          userAgent: meta.userAgent || null,
        },
      })
    } catch {
      // non-blocking
    }
  }
}

/**
 * Revoke all refresh sessions for an admin (logout all devices).
 */
export const adminLogoutAll = async (adminId) => {
  await prisma.adminRefreshToken.deleteMany({ where: { adminId } })
}
