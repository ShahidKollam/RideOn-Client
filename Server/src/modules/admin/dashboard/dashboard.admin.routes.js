import express from 'express'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import { overviewController } from './dashboard.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)
router.get('/overview', requirePermission('dashboard.read'), overviewController)
export default router
