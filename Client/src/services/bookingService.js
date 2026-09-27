import { apiClient } from '@/lib/apiClient'

const responsePayload = (response) => {
    const data = response.data?.data
    return data && typeof data === 'object' ? data : response.data?.message
}

export async function checkAvailability(bookingRequest) {
    const response = await apiClient.post('/bookings/check-availability', bookingRequest)
    return responsePayload(response)
}

export async function createBooking(bookingRequest) {
    const response = await apiClient.post('/bookings', bookingRequest)
    return responsePayload(response)
}

export async function getBookings(params = {}) {
    const response = await apiClient.get('/bookings', { params })
    return responsePayload(response)
}

export async function getBooking(id) {
    const response = await apiClient.get(`/bookings/${id}`)
    return responsePayload(response)
}

/**
 * Cancellation preview — backend is the only source of truth for fees/refund.
 * GET /bookings/:id/cancellation-preview — no body.
 */
export async function getCancellationPreview(id) {
    const response = await apiClient.get(`/bookings/${id}/cancellation-preview`)
    return responsePayload(response)
}

/**
 * Confirm cancellation — empty body. Backend recalculates everything.
 * PATCH /bookings/:id/cancel — body {}
 */
export async function cancelBooking(id) {
    const response = await apiClient.patch(`/bookings/${id}/cancel`, {})
    return responsePayload(response)
}
