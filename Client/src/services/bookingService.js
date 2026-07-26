import { apiClient } from '@/lib/apiClient'

const payload = (response) => {
    const data = response.data?.data
    return data && typeof data === 'object' ? data : response.data?.message
}

export async function createBooking(payload) {
    const response = await apiClient.post('/bookings', payload)
    return payload(response)
}

export async function getBookings(params = {}) {
    const response = await apiClient.get('/bookings', { params })
    return payload(response)
}

export async function getBooking(id) {
    const response = await apiClient.get(`/bookings/${id}`)
    return payload(response)
}

export async function cancelBooking(id) {
    const response = await apiClient.patch(`/bookings/${id}/cancel`)
    return payload(response)
}
