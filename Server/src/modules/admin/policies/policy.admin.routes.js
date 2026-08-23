import express from 'express'
import { validate } from '../../../middlewares/validation.middleware.js'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import { updatePolicySchema } from './policy.admin.validation.js'
import { getPoliciesController, updatePoliciesController } from './policy.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)
router.get('/', requirePermission('policies.read'), getPoliciesController)
router.patch('/', requirePermission('policies.update'), validate(updatePolicySchema), updatePoliciesController)
export default router
