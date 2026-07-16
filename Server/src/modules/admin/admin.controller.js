import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { getAdminProfile, getUsers } from './admin.service.js';
import { protectAdmin } from '../../middlewares/auth.middleware.js';

export const getProfileController = asyncHandler(async (req, res) => {
  const admin = await getAdminProfile(req.admin.id);
  res.json(new ApiResponse(200, 'Admin profile retrieved', admin));
});

export const getUsersController = asyncHandler(async (req, res) => {
  const users = await getUsers(req.admin.campusId);
  res.json(new ApiResponse(200, 'Users retrieved', users));
});
