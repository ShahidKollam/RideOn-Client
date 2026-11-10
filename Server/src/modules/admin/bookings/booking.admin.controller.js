import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import { bookingListQuerySchema } from './booking.admin.validation.js'
import {
    listBookings,
    getBookingById,
    createBooking,
    createDeskBooking,
    adminCheckAvailability,
    adminListAvailableBikes,
    pickupBooking,
    returnBooking,
    cancelBooking,
    recordCashRefund,
    collectAdditionalPayment,
    getLateReturnStats,
    computeLateCharges,
    getChangeBikeOptions,
    changeBookingBike,
    previewExtendBooking,
    extendBooking,
} from './booking.admin.service.js'
import prisma from '../../../config/prisma.js'

const audit = async (req, action, entityId, metadata = {}) => {
    try {
        await prisma.auditLog.create({
            data: {
                adminId: req.admin.id,
                action,
                entityType: 'Booking',
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

export const createBookingController = asyncHandler(async (req, res) => {
    const { userId, campusId, pricingId, pickupAt, returnAt, bikeId, helmetCount, notes } = req.body
    const booking = await createBooking({
        userId,
        campusId,
        pricingId,
        pickupAt,
        returnAt,
        bikeId,
        helmetCount,
        notes,
    })
    await audit(req, 'CREATE', booking.id)
    res.status(201).json(new ApiResponse(201, 'Booking created', booking))
})

/** Desk / walk-in: guest fields + shared walk-in user (no customer User create) */
export const createDeskBookingController = asyncHandler(async (req, res) => {
    const booking = await createDeskBooking(req.body)
    await audit(req, 'CREATE', booking.id, {
        source: 'desk',
        guestEmail: booking.guestEmail,
        guestName: booking.guestName,
    })
    res.status(201).json(new ApiResponse(201, 'Desk booking created', booking))
})

export const checkAvailabilityController = asyncHandler(async (req, res) => {
    const result = await adminCheckAvailability(req.body)
    res.status(200).json(new ApiResponse(200, 'Availability checked', result))
})

export const listAvailableBikesController = asyncHandler(async (req, res) => {
    const result = await adminListAvailableBikes(req.body)
    res.status(200).json(new ApiResponse(200, 'Available bikes', result))
})

export const listBookingsController = asyncHandler(async (req, res) => {
    const query = bookingListQuerySchema.parse(req.query)
    const result = await listBookings(query)
    res.status(200).json(new ApiResponse(200, 'Bookings retrieved', result))
})

export const getBookingController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const booking = await getBookingById(id)
    res.status(200).json(new ApiResponse(200, 'Booking retrieved', booking))
})

export const pickupBookingController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { pickupOdometer } = req.body
    const booking = await pickupBooking(id, pickupOdometer)
    await audit(req, 'UPDATE', id, { action: 'pickup', pickupOdometer })
    res.status(200).json(new ApiResponse(200, 'Booking picked up', booking))
})

export const returnBookingController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { returnOdometer, applyLateFee = false, applyDisruptionPenalty = false } = req.body
    const booking = await returnBooking(id, returnOdometer, {
        applyLateFee,
        applyDisruptionPenalty,
    })
    await audit(req, 'UPDATE', id, {
        action: 'return',
        returnOdometer,
        applyLateFee,
        applyDisruptionPenalty,
    })
    res.status(200).json(new ApiResponse(200, 'Booking returned', booking))
})

export const previewLateChargesController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) {
        return res.status(404).json(new ApiResponse(404, 'Booking not found', null))
    }
    if (booking.status !== 'ACTIVE') {
        return res
            .status(400)
            .json(new ApiResponse(400, 'Late charge preview is only for ACTIVE bookings', null))
    }
    const settings = await prisma.systemSetting.findFirst()
    const preview = await computeLateCharges(booking, settings)
    res.status(200).json(new ApiResponse(200, 'Late charge preview', preview))
})

export const lateReturnStatsController = asyncHandler(async (req, res) => {
    const stats = await getLateReturnStats()
    res.status(200).json(new ApiResponse(200, 'Late return stats', stats))
})

export const cancelBookingController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const {
        applyCancellationFee = true,
        adjustedRefundAmount = null,
        adjustmentReason = null,
    } = req.body || {}
    const adminId = req.admin?.id || req.user?.id || null
    const booking = await cancelBooking(id, {
        applyCancellationFee,
        adjustedRefundAmount,
        adjustmentReason,
        adminId,
    })
    await audit(req, 'UPDATE', id, {
        action: 'cancel',
        applyCancellationFee,
        adjustedRefundAmount,
        adjustmentReason,
        refundAmount: booking?.cancellation?.refundAmount,
        refundStatus: booking?.cancellation?.refundStatus,
    })
    res.status(200).json(new ApiResponse(200, 'Booking cancelled', booking))
})

export const recordCashRefundController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { reference } = req.body || {}
    const adminId = req.admin?.id || req.user?.id || null
    const booking = await recordCashRefund(id, adminId, { reference })
    await audit(req, 'UPDATE', id, { action: 'cash_refund', reference })
    res.status(200).json(new ApiResponse(200, 'Cash refund recorded', booking))
})

export const collectAdditionalPaymentController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { paymentMethod, reference } = req.body
    const payment = await collectAdditionalPayment(id, { paymentMethod, reference })
    await audit(req, 'UPDATE', id, { action: 'collect_payment', paymentMethod })
    res.status(200).json(new ApiResponse(200, 'Payment collected', payment))
})

export const changeBikeOptionsController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const data = await getChangeBikeOptions(id)
    res.status(200).json(new ApiResponse(200, 'Change bike options', data))
})

export const changeBikeController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { bikeId, confirmNonAvailable = false } = req.body || {}
    const result = await changeBookingBike(id, bikeId, { confirmNonAvailable })
    await audit(req, 'UPDATE', id, {
        action: 'change_bike',
        fromBikeId: result.fromBike?.id || null,
        fromBikeNumber: result.fromBike?.bikeNumber || null,
        toBikeId: result.toBike?.id,
        toBikeNumber: result.toBike?.bikeNumber,
        confirmNonAvailable: Boolean(confirmNonAvailable),
    })
    res.status(200).json(new ApiResponse(200, 'Bike changed', result.booking))
})


export const previewExtendController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const returnAt = req.query.returnAt || req.body?.returnAt
    if (!returnAt) {
        return res.status(400).json(new ApiResponse(400, 'returnAt is required', null))
    }
    const data = await previewExtendBooking(id, returnAt)
    res.status(200).json(new ApiResponse(200, 'Extend preview', data))
})

export const extendBookingController = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { returnAt } = req.body || {}
    const result = await extendBooking(id, returnAt)
    await audit(req, 'UPDATE', id, {
        action: 'extend',
        previousReturnAt: result.previousReturnAt,
        newReturnAt: returnAt,
        previousDurationHours: result.previousDurationHours,
        newDurationHours: result.booking?.durationHours,
    })
    res.status(200).json(new ApiResponse(200, 'Booking extended', result.booking))
})
