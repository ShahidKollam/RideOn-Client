import express from 'express'
import { validate } from '../../../middlewares/validation.middleware.js'
import { adminLoginSchema } from './auth.admin.validation.js'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { authRateLimit } from '../../../middlewares/rateLimit.middleware.js'
import {
  loginController,
  meController,
  logoutController,
  refreshController,
} from './auth.admin.controller.js'

const router = express.Router()

router.post('/login', authRateLimit, validate(adminLoginSchema), loginController)
router.post('/refresh', authRateLimit, refreshController)
router.get('/me', authenticateAdmin, meController)
// Logout accepts either valid access token OR just the refresh cookie
router.post('/logout', logoutController)

export default router
