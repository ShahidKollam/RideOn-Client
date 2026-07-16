import { createPricing, updatePricing, getPricingById, getPricingList, deletePricing } from './pricing.service.js';
import { createPricingSchema, updatePricingSchema, pricingQuerySchema } from './pricing.validation.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const createPricingController = asyncHandler(async (req, res) => {
  // Validation assumed
  const pricing = await createPricing(req.body);
  res.status(201).json(new ApiResponse(201, pricing, 'Pricing created successfully'));
});

export const getPricingListController = asyncHandler(async (req, res) => {
  const result = await getPricingList(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Pricings retrieved successfully'));
});

export const getPricingByIdController = asyncHandler(async (req, res) => {
  const pricing = await getPricingById(req.params.id);
  res.status(200).json(new ApiResponse(200, pricing, 'Pricing retrieved successfully'));
});

export const updatePricingController = asyncHandler(async (req, res) => {
  const pricing = await updatePricing(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, pricing, 'Pricing updated successfully'));
});

export const deletePricingController = asyncHandler(async (req, res) => {
  const result = await deletePricing(req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Pricing deleted successfully'));
});
