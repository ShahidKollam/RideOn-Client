import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { getPolicies, updatePolicies } from './policy.admin.service.js'
import prisma from '../../../config/prisma.js'

export const getPoliciesController = asyncHandler(async (req, res) => {
  const policies = await getPolicies()
  res.status(200).json(new ApiResponse(200, 'Policies retrieved', policies))
})

export const updatePoliciesController = asyncHandler(async (req, res) => {
  const {
    gstEnabled,
    gstRate,
    platformFeeEnabled,
    platformFee,
    helmetFirstPrice,
    helmetSecondPrice,
    lateHelmetFee,
    bookingBufferMinutes,
    disruptionPenalty,
    cancellationPolicy,
  } = req.body

  const policies = await updatePolicies({
    ...(gstEnabled !== undefined && { gstEnabled }),
    ...(gstRate !== undefined && { gstRate }),
    ...(platformFeeEnabled !== undefined && { platformFeeEnabled }),
    ...(platformFee !== undefined && { platformFee }),
    ...(helmetFirstPrice !== undefined && { helmetFirstPrice }),
    ...(helmetSecondPrice !== undefined && { helmetSecondPrice }),
    ...(lateHelmetFee !== undefined && { lateHelmetFee }),
    ...(bookingBufferMinutes !== undefined && { bookingBufferMinutes }),
    ...(disruptionPenalty !== undefined && { disruptionPenalty }),
    ...(cancellationPolicy !== undefined && { cancellationPolicy }),
  })

  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'SystemSetting',
        entityId: null,
        metadata: { fields: Object.keys(req.body || {}) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    })
  } catch {
    /* non-blocking */
  }

  res.status(200).json(new ApiResponse(200, 'Policies updated', policies))
})