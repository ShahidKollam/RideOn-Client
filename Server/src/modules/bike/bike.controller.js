import { createBike, updateBike, getBikeById, getBikeList, changeBikeStatus, deleteBike } from './bike.service.js'
import { bikeQuerySchema } from './bike.validation.js'
import asyncHandler from '../../utils/asyncHandler.js'
import ApiResponse from '../../utils/ApiResponse.js'

export const createBikeController = asyncHandler(async (req, res) => {
    const bike = await createBike(req.body)
    return res.status(201).json(new ApiResponse(201, bike, 'Bike created successfully'))
})

export const getBikeListController = asyncHandler(async (req, res) => {
    const query = bikeQuerySchema.parse(req.query)
    const result = await getBikeList(query)
    return res.status(200).json(new ApiResponse(200, result, 'Bikes retrieved successfully'))
})

export const getBikeByIdController = asyncHandler(async (req, res) => {
    const bike = await getBikeById(req.params.id)
    return res.status(200).json(new ApiResponse(200, bike, 'Bike retrieved successfully'))
})

export const updateBikeController = asyncHandler(async (req, res) => {
    const bike = await updateBike(req.params.id, req.body)
    return res.status(200).json(new ApiResponse(200, bike, 'Bike updated successfully'))
})

export const changeBikeStatusController = asyncHandler(async (req, res) => {
    const bike = await changeBikeStatus(req.params.id, req.body.status)
    return res.status(200).json(new ApiResponse(200, bike, 'Bike status updated successfully'))
})

export const deleteBikeController = asyncHandler(async (req, res) => {
    const result = await deleteBike(req.params.id)
    return res.status(200).json(new ApiResponse(200, result, 'Bike deleted successfully'))
})
