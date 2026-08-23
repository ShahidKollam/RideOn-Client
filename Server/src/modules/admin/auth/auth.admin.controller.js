import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { adminLogin, getAdminMe } from './auth.admin.service.js'
import prisma from '../../../config/prisma.js'

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await adminLogin(email, password, {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })
  res.status(200).json(new ApiResponse(200, 'Login successful', result))
})

export const meController = asyncHandler(async (req, res) => {
  const admin = await getAdminMe(req.admin.id)
  res.status(200).json(new ApiResponse(200, 'Admin profile retrieved', admin))
})

export const logoutController = asyncHandler(async (req, res) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'LOGOUT',
        entityType: 'Admin',
        entityId: req.admin?.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    })
  } catch {
    // non-blocking
  }
  res.status(200).json(new ApiResponse(200, 'Logged out successfully', null))
})
