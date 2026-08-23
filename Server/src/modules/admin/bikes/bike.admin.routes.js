import express from 'express'
import { validate } from '../../../middlewares/validation.middleware.js'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import {
  createBikeSchema,
  updateBikeSchema,
  changeBikeStatusSchema,
} from './bike.admin.validation.js'
import {
  createBikeController,
  listBikesController,
  getBikeController,
  updateBikeController,
  changeBikeStatusController,
  deleteBikeController,
} from './bike.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)

router.post('/', requirePermission('bikes.create'), validate(createBikeSchema), createBikeController)
router.get('/', requirePermission('bikes.read'), listBikesController)
router.get('/:id', requirePermission('bikes.read'), getBikeController)
router.patch('/:id', requirePermission('bikes.update'), validate(updateBikeSchema), updateBikeController)
router.patch('/:id/status', requirePermission('bikes.update'), validate(changeBikeStatusSchema), changeBikeStatusController)
router.delete('/:id', requirePermission('bikes.delete'), deleteBikeController)

export default router
