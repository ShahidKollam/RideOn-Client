import express from 'express'
import { validate } from '../../../middlewares/validation.middleware.js'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import {
  updateUserSchema,
  updateUserStatusSchema,
} from './user.admin.validation.js'
import {
  listUsersController,
  getUserController,
  updateUserController,
  updateUserStatusController,
} from './user.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)

router.get('/', requirePermission('users.read'), listUsersController)
router.get('/:id', requirePermission('users.read'), getUserController)
router.patch('/:id', requirePermission('users.update'), validate(updateUserSchema), updateUserController)
router.patch('/:id/status', requirePermission('users.update'), validate(updateUserStatusSchema), updateUserStatusController)

export default router
