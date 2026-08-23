import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { getOverview } from './dashboard.admin.service.js'

export const overviewController = asyncHandler(async (req, res) => {
  const data = await getOverview()
  res.status(200).json(new ApiResponse(200, 'Dashboard overview', data))
})
