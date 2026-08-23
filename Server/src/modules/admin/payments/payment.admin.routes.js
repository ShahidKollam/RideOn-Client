import express from 'express'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import { listPaymentsController, getPaymentController } from './payment.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)
router.get('/', requirePermission('payments.read'), listPaymentsController)
router.get('/:id', requirePermission('payments.read'), getPaymentController)
export default router
