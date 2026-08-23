import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { listAuditLogs } from './audit.admin.service.js'

export const listAuditController = asyncHandler(async (req, res) => {
  const { page, limit, adminId, action, entityType, from, to } = req.query
  const result = await listAuditLogs({ page, limit, adminId, action, entityType, from, to })
  res.status(200).json(new ApiResponse(200, 'Audit logs retrieved', result))
})
