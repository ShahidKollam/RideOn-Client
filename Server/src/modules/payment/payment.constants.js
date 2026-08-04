export const PAYMENT_GATEWAY = {
    RAZORPAY: 'RAZORPAY',
}

export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
    PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
}

export const CURRENCY = {
    INR: 'INR',
}

export const RAZORPAY_WEBHOOK_EVENTS = {
    PAYMENT_CAPTURED: 'payment.captured',
    PAYMENT_FAILED: 'payment.failed',
    ORDER_PAID: 'order.paid',
}
