import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { paymentListQuerySchema } from './payment.admin.validation.js'
import { listPayments, getPaymentById } from './payment.admin.service.js'

export const listPaymentsController = asyncHandler(async (req, res) => {
  const query = paymentListQuerySchema.parse(req.query)
  const result = await listPayments(query)
  res.status(200).json(new ApiResponse(200, 'Payments retrieved', result))
})

export const getPaymentController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const payment = await getPaymentById(id)
  res.status(200).json(new ApiResponse(200, 'Payment retrieved', payment))
})
