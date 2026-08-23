import express from 'express'
import { validate } from '../../../middlewares/validation.middleware.js'
import { authenticateAdmin } from '../../../middlewares/authenticateAdmin.js'
import { requirePermission } from '../../../middlewares/requirePermission.js'
import { createRoleSchema, updateRoleSchema } from './role.admin.validation.js'
import {
  listRolesController, listPermissionsController, getRoleController,
  createRoleController, updateRoleController, deleteRoleController,
} from './role.admin.controller.js'

const router = express.Router()
router.use(authenticateAdmin)
router.get('/', requirePermission('roles.read'), listRolesController)
router.get('/permissions', requirePermission('roles.read'), listPermissionsController)
router.get('/:id', requirePermission('roles.read'), getRoleController)
router.post('/', requirePermission('roles.create'), validate(createRoleSchema), createRoleController)
router.patch('/:id', requirePermission('roles.update'), validate(updateRoleSchema), updateRoleController)
router.delete('/:id', requirePermission('roles.delete'), deleteRoleController)
export default router
