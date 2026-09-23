import { apiClient } from '@/lib/apiClient'

const payload = (response) => response.data?.data

export async function createPaymentOrder(request) {
    const response = await apiClient.post('/payments/create-order', request)
    return payload(response)
}

export async function verifyPayment(request) {
    const response = await apiClient.post('/payments/verify', request)
    return payload(response)
}

export async function markPaymentFailed(razorpayOrderId) {
    await apiClient.post('/payments/mark-failed', { razorpay_order_id: razorpayOrderId })
}
