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

export async function cancelBooking(id) {
    const response = await apiClient.patch(`/bookings/${id}/cancel`)
    return responsePayload(response)
}
