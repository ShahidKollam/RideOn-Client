import prisma from '../../../config/prisma.js'

export const listAuditLogs = async (query = {}) => {
  const { page = 1, limit = 50, adminId, action, entityType, from, to } = query
  const where = {}
  if (adminId) where.adminId = adminId
  if (action) where.action = action
  if (entityType) where.entityType = entityType
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { admin: { select: { id: true, name: true, email: true } } },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    items,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
  }
}
