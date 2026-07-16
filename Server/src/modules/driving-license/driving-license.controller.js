import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { uploadLicense, updateLicense, getLicense } from './driving-license.service.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { uploadLicenseSchema } from './driving-license.validation.js';
import { protect } from '../../middlewares/auth.middleware.js';

export const uploadLicenseController = asyncHandler(async (req, res) => {
  const license = await uploadLicense(req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, 'License uploaded', license));
});

export const updateLicenseController = asyncHandler(async (req, res) => {
  const license = await updateLicense(req.user.id, req.body);
  res.json(new ApiResponse(200, 'License updated', license));
});

export const getLicenseController = asyncHandler(async (req, res) => {
  const license = await getLicense(req.user.id);
  res.json(new ApiResponse(200, 'License retrieved', license));
});
