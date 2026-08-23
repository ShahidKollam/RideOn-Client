/**
 * Central Admin API router — mount at /api/v1/admin
 * Fully independent admin module. Does not import client services.
 */
import express from 'express'

import authAdminRoutes from './auth/auth.admin.routes.js'
import dashboardAdminRoutes from './dashboard/dashboard.admin.routes.js'
import userAdminRoutes from './users/user.admin.routes.js'
import bikeAdminRoutes from './bikes/bike.admin.routes.js'
import bookingAdminRoutes from './bookings/booking.admin.routes.js'
import paymentAdminRoutes from './payments/payment.admin.routes.js'
import pricingAdminRoutes from './pricing/pricing.admin.routes.js'
import policyAdminRoutes from './policies/policy.admin.routes.js'
import roleAdminRoutes from './roles/role.admin.routes.js'
import auditAdminRoutes from './audit/audit.admin.routes.js'

const router = express.Router()

router.use('/auth', authAdminRoutes)
router.use('/dashboard', dashboardAdminRoutes)
router.use('/users', userAdminRoutes)
router.use('/bikes', bikeAdminRoutes)
router.use('/bookings', bookingAdminRoutes)
router.use('/payments', paymentAdminRoutes)
router.use('/pricing', pricingAdminRoutes)
router.use('/policies', policyAdminRoutes)
router.use('/roles', roleAdminRoutes)
router.use('/audit', auditAdminRoutes)

export default router
