import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { userListQuerySchema } from './user.admin.validation.js'
import {
  listUsers,
  getUserById,
  updateUser,
  updateUserStatus,
} from './user.admin.service.js'
import prisma from '../../../config/prisma.js'

export const listUsersController = asyncHandler(async (req, res) => {
  const query = userListQuerySchema.parse(req.query)
  const result = await listUsers(query)
  res.status(200).json(new ApiResponse(200, 'Users retrieved', result))
})

export const getUserController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const user = await getUserById(id)
  res.status(200).json(new ApiResponse(200, 'User retrieved', user))
})

export const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, phone, hostel, department, yearOfStudy } = req.body
  const user = await updateUser(id, {
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone }),
    ...(hostel !== undefined && { hostel }),
    ...(department !== undefined && { department }),
    ...(yearOfStudy !== undefined && { yearOfStudy }),
  })
  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        metadata: { fields: Object.keys(req.body) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    })
  } catch { /* non-blocking */ }
  res.status(200).json(new ApiResponse(200, 'User updated', user))
})

export const updateUserStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { isVerified, onboardingStatus } = req.body
  const user = await updateUserStatus(id, {
    ...(isVerified !== undefined && { isVerified }),
    ...(onboardingStatus !== undefined && { onboardingStatus }),
  })
  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'STATUS_CHANGE',
        entityType: 'User',
        entityId: id,
        metadata: { isVerified, onboardingStatus },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    })
  } catch { /* non-blocking */ }
  res.status(200).json(new ApiResponse(200, 'User status updated', user))
})
