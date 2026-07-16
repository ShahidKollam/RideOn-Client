import { createBike, updateBike, getBikeById, getBikeList, changeBikeStatus, deleteBike } from './bike.service.js';
import { createBikeSchema, updateBikeSchema, changeBikeStatusSchema, bikeQuerySchema } from './bike.validation.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { validate } from '../../middlewares/validation.middleware.js'; // Assuming this exists or will be adapted

// Note: Adjust validation middleware call based on project

export const createBikeController = asyncHandler(async (req, res) => {
  const validatedData = validate(createBikeSchema, req.body); // Adapt as per project
  const bike = await createBike(validatedData);
  return res.status(201).json(new ApiResponse(201, bike, 'Bike created successfully'));
});

export const getBikeListController = asyncHandler(async (req, res) => {
  const query = bikeQuerySchema.parse(req.query);
  const result = await getBikeList(query);
  return res.status(200).json(new ApiResponse(200, result, 'Bikes retrieved successfully'));
});

export const getBikeByIdController = asyncHandler(async (req, res) => {
  const bike = await getBikeById(req.params.id);
  return res.status(200).json(new ApiResponse(200, bike, 'Bike retrieved successfully'));
});

export const updateBikeController = asyncHandler(async (req, res) => {
  const validatedData = validate(updateBikeSchema, req.body);
  const bike = await updateBike(req.params.id, validatedData);
  return res.status(200).json(new ApiResponse(200, bike, 'Bike updated successfully'));
});

export const changeBikeStatusController = asyncHandler(async (req, res) => {
  const validatedData = validate(changeBikeStatusSchema, req.body);
  const bike = await changeBikeStatus(req.params.id, validatedData.status);
  return res.status(200).json(new ApiResponse(200, bike, 'Bike status updated successfully'));
});

export const deleteBikeController = asyncHandler(async (req, res) => {
  const result = await deleteBike(req.params.id);
  return res.status(200).json(new ApiResponse(200, result, 'Bike deleted successfully'));
});
