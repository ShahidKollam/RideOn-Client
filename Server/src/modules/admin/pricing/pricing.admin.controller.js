import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { pricingListQuerySchema } from './pricing.admin.validation.js'
import {
  createPricing, listPricing, getPricingById, updatePricing, deletePricing,
} from './pricing.admin.service.js'
import prisma from '../../../config/prisma.js'

const audit = async (req, action, entityId, metadata = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id, action, entityType: 'Pricing', entityId, metadata,
        ipAddress: req.ip, userAgent: req.get('user-agent'),
      },
    })
  } catch { /* non-blocking */ }
}

export const createPricingController = asyncHandler(async (req, res) => {
  const pricing = await createPricing(req.body)
  await audit(req, 'CREATE', pricing.id)
  res.status(201).json(new ApiResponse(201, 'Pricing created', pricing))
})

export const listPricingController = asyncHandler(async (req, res) => {
  const query = pricingListQuerySchema.parse(req.query)
  const result = await listPricing(query)
  res.status(200).json(new ApiResponse(200, 'Pricing list retrieved', result))
})

export const getPricingController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const pricing = await getPricingById(id)
  res.status(200).json(new ApiResponse(200, 'Pricing retrieved', pricing))
})

export const updatePricingController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const pricing = await updatePricing(id, req.body)
  await audit(req, 'UPDATE', id, { fields: Object.keys(req.body) })
  res.status(200).json(new ApiResponse(200, 'Pricing updated', pricing))
})

export const deletePricingController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await deletePricing(id)
  await audit(req, 'DELETE', id)
  res.status(200).json(new ApiResponse(200, 'Pricing deleted', result))
})
