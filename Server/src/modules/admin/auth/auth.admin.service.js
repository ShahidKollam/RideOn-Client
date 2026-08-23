import bcrypt from 'bcrypt'
import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'
import { generateToken } from '../../../lib/jwt.js'

export const adminLogin = async (email, password, meta = {}) => {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
      campus: { select: { id: true, name: true, location: true } },
    },
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

  const permissions = (admin.role.permissions || []).map(
    (rp) => rp.permission.name
  )

  const accessToken = generateToken({ id: admin.id, role: 'admin' })

  return {
    accessToken,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      campusId: admin.campusId,
      campus: admin.campus,
      role: { id: admin.role.id, name: admin.role.name },
      permissions,
      lastLoginAt: admin.lastLoginAt,
    },
  }
}

export const getAdminMe = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
      campus: { select: { id: true, name: true, location: true } },
    },
  })

  if (!admin || !admin.isActive) {
    throw new ApiError(401, 'Admin not found or inactive')
  }

  const permissions = (admin.role?.permissions || []).map(
    (rp) => rp.permission.name
  )

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
