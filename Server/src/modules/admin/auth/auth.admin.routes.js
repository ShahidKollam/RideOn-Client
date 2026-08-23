import express from 'express'
import { validate } from '../../../middlewares/validation.middleware.js'
import { adminLoginSchema } from './auth.admin.validation.js'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import {
  loginController,
  meController,
  logoutController,
} from './auth.admin.controller.js'

const router = express.Router()

router.post('/login', validate(adminLoginSchema), loginController)
router.get('/me', authenticateAdmin, meController)
router.post('/logout', authenticateAdmin, logoutController)

export default router
