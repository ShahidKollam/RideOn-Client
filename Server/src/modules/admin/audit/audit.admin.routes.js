import express from 'express'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import { listAuditController } from './audit.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)
router.get('/', requirePermission('audit.read'), listAuditController)
export default router
