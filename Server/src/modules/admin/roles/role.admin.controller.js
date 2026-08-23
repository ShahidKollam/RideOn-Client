import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import {
  listRoles, listPermissions, getRoleById, createRole, updateRole, deleteRole,
} from './role.admin.service.js'
import prisma from '../../../config/prisma.js'

const audit = async (req, action, entityId, metadata = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id, action, entityType: 'Role', entityId, metadata,
        ipAddress: req.ip, userAgent: req.get('user-agent'),
      },
    })
  } catch { /* non-blocking */ }
}

export const listRolesController = asyncHandler(async (req, res) => {
  const roles = await listRoles()
  res.status(200).json(new ApiResponse(200, 'Roles retrieved', roles))
})

export const listPermissionsController = asyncHandler(async (req, res) => {
  const permissions = await listPermissions()
  res.status(200).json(new ApiResponse(200, 'Permissions retrieved', permissions))
})

export const getRoleController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const role = await getRoleById(id)
  res.status(200).json(new ApiResponse(200, 'Role retrieved', role))
})

export const createRoleController = asyncHandler(async (req, res) => {
  const { name, description, permissionNames } = req.body
  const role = await createRole({ name, description, permissionNames })
  await audit(req, 'CREATE', role.id)
  res.status(201).json(new ApiResponse(201, 'Role created', role))
})

export const updateRoleController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, description, isActive, permissionNames } = req.body
  const role = await updateRole(id, { name, description, isActive, permissionNames })
  await audit(req, 'UPDATE', id, { fields: Object.keys(req.body) })
  res.status(200).json(new ApiResponse(200, 'Role updated', role))
})

export const deleteRoleController = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await deleteRole(id)
  await audit(req, 'DELETE', id)
  res.status(200).json(new ApiResponse(200, 'Role deleted', result))
})
