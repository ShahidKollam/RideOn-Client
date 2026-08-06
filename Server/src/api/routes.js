import express from 'express'

import authRoutes from '../modules/auth/auth.routes.js'
import userRoutes from '../modules/user/user.routes.js'
import adminRoutes from '../modules/admin/admin.routes.js'
import campusRoutes from '../modules/campus/campus.routes.js'
import drivingLicenseRoutes from '../modules/driving-license/driving-license.routes.js'

import bikeRoutes from '../modules/bike/bike.routes.js'
import bookingUserRoutes from '../modules/booking/booking.user.routes.js'
import bookingAdminRoutes from '../modules/booking/booking.admin.routes.js'
import pricingAdminRoutes from '../modules/booking/pricing.admin.routes.js'
import pricingUserRoutes from '../modules/booking/pricing.user.routes.js'
import bikeAdminRoutes from '../modules/bike/bike.admin.routes.js'
import settingsAdminRoutes from '../modules/settings/settings.routes.js'
import paymentRoutes from '../modules/payment/payment.routes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/campus', campusRoutes)
router.use('/driving-licenses', drivingLicenseRoutes)
router.use('/pricing', pricingUserRoutes)
router.use('/bikes', bikeRoutes) 
// router.use('/payment', paymentRoutes)
router.use('/payments', paymentRoutes)


router.use('/admin', adminRoutes)
router.use('/admin/bikes', bikeAdminRoutes) // Admin part
router.use('/bookings', bookingUserRoutes)
router.use('/admin/bookings', bookingAdminRoutes)
router.use('/admin/pricing', pricingAdminRoutes)

router.use('/admin/settings', settingsAdminRoutes)


export default router
