/**
 * Background reconciliation entry point.
 *
 * Run via cron (every 1–5 minutes) or a process manager:
 *
 *   node src/modules/payment/payment.reconcile.js
 *
 * Or import and schedule with node-cron / bull / agenda in your app bootstrap.
 */

import { reconcilePaidPaymentsWithoutBooking } from './payment.service.js'

const run = async () => {
    try {
        const result = await reconcilePaidPaymentsWithoutBooking()
        console.log('🟣 [reconcile-job] Done:', JSON.stringify(result, null, 2))
        process.exit(0)
    } catch (err) {
        console.error('❌ [reconcile-job] Fatal:', err)
        process.exit(1)
    }
}

// Only auto-run when executed directly
const isDirectRun =
    process.argv[1] &&
    (process.argv[1].endsWith('payment.reconcile.js') ||
        process.argv[1].includes('payment.reconcile'))

if (isDirectRun) {
    run()
}

export { reconcilePaidPaymentsWithoutBooking }
