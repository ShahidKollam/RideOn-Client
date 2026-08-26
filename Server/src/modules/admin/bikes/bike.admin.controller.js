import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { bikeListQuerySchema } from './bike.admin.validation.js'
import { createBike, listBikes, getBikeById, updateBike, changeBikeStatus, deleteBike } from './bike.admin.service.js'
import prisma from '../../../config/prisma.js'

const audit = async (req, action, entityId, metadata = {}) => {
    try {
        await prisma.auditLog.create({
            data: {
                adminId: req.admin.id,
                action,
                entityType: 'Bike',
                entityId,
                metadata,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            },
        })
    } catch {
        /* non-blocking */
    }
}

export const createBikeController = asyncHandler(async (req, res) => {
    const { campusId, registrationNumber, name, brand, model, year, color, imageUrls, currentOdometer } = req.body
    const bike = await createBike({
        campusId,
        registrationNumber,
        name,
        brand,
        model,
        year,
        color,
        imageUrls,
        currentOdometer,
    })
    await audit(req, 'CREATE', bike.id)
    res.status(201).json(new ApiResponse(201, 'Bike created successfully', bike))
})

export const listBikesController = asyncHandler(async (req, res) => {
    const query = bikeListQuerySchema.parse(req.query)
    const result = await listBikes(query)
    res.status(200).json(new ApiResponse(200, 'Bikes retrieved successfully', result))
})

export const getBikeController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const bike = await getBikeById(id)
    res.status(200).json(new ApiResponse(200, 'Bike retrieved successfully', bike))
})

export const updateBikeController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const bike = await updateBike(id, req.body)
    await audit(req, 'UPDATE', id, { fields: Object.keys(req.body) })
    res.status(200).json(new ApiResponse(200, 'Bike updated successfully', bike))
})

export const changeBikeStatusController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status } = req.body
    const bike = await changeBikeStatus(id, status)
    await audit(req, 'STATUS_CHANGE', id, { status })
    res.status(200).json(new ApiResponse(200, 'Bike status updated successfully', bike))
})

export const deleteBikeController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await deleteBike(id)
    await audit(req, 'DELETE', id)
    res.status(200).json(new ApiResponse(200, 'Bike deleted successfully', result))
})
