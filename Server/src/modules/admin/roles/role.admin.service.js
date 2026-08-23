import prisma from '../../../config/prisma.js'
import ApiError from '../../../utils/ApiError.js'

export const listRoles = async () => {
  return prisma.role.findMany({
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { admins: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export const listPermissions = async () => {
  return prisma.permission.findMany({ orderBy: { name: 'asc' } })
}

export const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { admins: true } },
    },
  })
  if (!role) throw new ApiError(404, 'Role not found')
  return role
}

export const createRole = async ({ name, description, permissionNames = [] }) => {
  const existing = await prisma.role.findUnique({ where: { name } })
  if (existing) throw new ApiError(409, 'Role name already exists')

  const permissions = await prisma.permission.findMany({
    where: { name: { in: permissionNames } },
  })

  return prisma.role.create({
    data: {
      name,
      description,
      permissions: { create: permissions.map((p) => ({ permissionId: p.id })) },
    },
    include: { permissions: { include: { permission: true } } },
  })
}

export const updateRole = async (id, { name, description, isActive, permissionNames }) => {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) throw new ApiError(404, 'Role not found')
  if (role.name === 'SUPER_ADMIN' && name && name !== 'SUPER_ADMIN') {
    throw new ApiError(400, 'Cannot rename SUPER_ADMIN role')
  }
  if (name && name !== role.name) {
    const clash = await prisma.role.findUnique({ where: { name } })
    if (clash) throw new ApiError(409, 'Role name already exists')
  }

  const data = {}
  if (name !== undefined) data.name = name
  if (description !== undefined) data.description = description
  if (isActive !== undefined) data.isActive = isActive

  if (permissionNames !== undefined) {
    const permissions = await prisma.permission.findMany({
      where: { name: { in: permissionNames } },
    })
    await prisma.rolePermission.deleteMany({ where: { roleId: id } })
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: id, permissionId: p.id })),
    })
  }

  return prisma.role.update({
    where: { id },
    data,
    include: { permissions: { include: { permission: true } } },
  })
}

export const deleteRole = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { admins: true } } },
  })
  if (!role) throw new ApiError(404, 'Role not found')
  if (role.name === 'SUPER_ADMIN') throw new ApiError(400, 'Cannot delete SUPER_ADMIN role')
  if (role._count.admins > 0) throw new ApiError(400, 'Cannot delete role with assigned admins')

  await prisma.rolePermission.deleteMany({ where: { roleId: id } })
  await prisma.role.delete({ where: { id } })
  return { id, deleted: true }
}
