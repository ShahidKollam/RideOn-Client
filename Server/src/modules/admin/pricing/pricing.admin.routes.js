import express from 'express'
import { validate } from '../../../middlewares/validation.middleware.js'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import { createPricingSchema, updatePricingSchema } from './pricing.admin.validation.js'
import {
  createPricingController, listPricingController, getPricingController,
  updatePricingController, deletePricingController,
} from './pricing.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)
router.post('/', requirePermission('pricing.create'), validate(createPricingSchema), createPricingController)
router.get('/', requirePermission('pricing.read'), listPricingController)
router.get('/:id', requirePermission('pricing.read'), getPricingController)
router.patch('/:id', requirePermission('pricing.update'), validate(updatePricingSchema), updatePricingController)
router.delete('/:id', requirePermission('pricing.delete'), deletePricingController)
export default router
