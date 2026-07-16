import express from 'express'
import { getProfileController, getUsersController } from './admin.controller.js'
import { protectAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/profile', protectAdmin, getProfileController)
router.get('/users', protectAdmin, getUsersController)

export default router
