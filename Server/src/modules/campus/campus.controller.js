import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { getActiveCampuses } from './campus.service.js';

export const getActiveCampusesController = asyncHandler(async (req, res) => {
  const campuses = await getActiveCampuses();
  res.json(new ApiResponse(200, 'Active campuses retrieved', campuses));
});
