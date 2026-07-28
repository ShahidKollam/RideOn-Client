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

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/admin', adminRoutes)
router.use('/campuses', campusRoutes)
router.use('/driving-licenses', drivingLicenseRoutes)

// Mount routes (adjust prefixes to match existing style, e.g., /api/...)
router.use('/bikes', bikeRoutes) // Admin part
router.use('/admin/bikes', bikeRoutes) // Admin part
// Public bikes can be exposed separately
router.use('/bookings', bookingUserRoutes)
router.use('/admin/bookings', bookingAdminRoutes)
router.use('/admin/pricing', pricingAdminRoutes)

export default router
