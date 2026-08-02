import { getSettings, updateSettings } from './settings.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getSettingsController = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  res.status(200).json(new ApiResponse(200, settings, 'Settings retrieved successfully'));
});

export const updateSettingsController = asyncHandler(async (req, res) => {
  const settings = await updateSettings(req.body);
  res.status(200).json(new ApiResponse(200, settings, 'Settings updated successfully'));
});
