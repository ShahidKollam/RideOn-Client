import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { getProfile, updateProfile } from './user.service.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { updateProfileSchema } from './user.validation.js';
import { protect } from '../../middlewares/auth.middleware.js';

export const getProfileController = asyncHandler(async (req, res) => {
  const user = await getProfile(req.user.id);
  res.json(new ApiResponse(200, 'Profile retrieved', user));
});

export const updateProfileController = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user.id, req.body);
  res.json(new ApiResponse(200, 'Profile updated', user));
});
