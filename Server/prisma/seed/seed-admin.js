/**
 * Complete Admin seed — permissions, roles, admins, sample audit logs.
 * Idempotent. Safe to re-run.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@rideon.com ADMIN_PASSWORD=Admin@12345 node prisma/seed/seed-admin.js
 *
 * Defaults (for local UI testing only — change in production):
 *   SUPER_ADMIN  admin@rideon.com / Admin@12345
 *   ADMIN        ops@rideon.com   / Ops@12345
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Permissions catalogue
// ---------------------------------------------------------------------------
const PERMISSIONS = [
  { name: 'dashboard.read', description: 'View dashboard overview' },
  { name: 'users.read', description: 'List and view users' },
  { name: 'users.update', description: 'Update users' },
  { name: 'bikes.read', description: 'List and view bikes' },
  { name: 'bikes.create', description: 'Create bikes' },
  { name: 'bikes.update', description: 'Update bikes' },
  { name: 'bikes.delete', description: 'Delete bikes' },
  { name: 'bookings.read', description: 'List and view bookings' },
  { name: 'bookings.create', description: 'Create bookings' },
  { name: 'bookings.update', description: 'Update bookings (pickup/return)' },
  { name: 'bookings.cancel', description: 'Cancel bookings' },
  { name: 'payments.read', description: 'List and view payments' },
  { name: 'payments.refund', description: 'Refund payments' },
  { name: 'pricing.read', description: 'List and view pricing' },
  { name: 'pricing.create', description: 'Create pricing' },
  { name: 'pricing.update', description: 'Update pricing' },
  { name: 'pricing.delete', description: 'Delete pricing' },
  { name: 'policies.read', description: 'View system policies/settings' },
  { name: 'policies.update', description: 'Update system policies/settings' },
  { name: 'roles.read', description: 'View roles and permissions' },
  { name: 'roles.create', description: 'Create roles' },
  { name: 'roles.update', description: 'Update roles' },
  { name: 'roles.delete', description: 'Delete roles' },
  { name: 'audit.read', description: 'View audit logs' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function upsertPermissions() {
  const map = {}
  for (const p of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description },
      create: p,
    })
    map[p.name] = perm
  }
  console.log(`Permissions: ${Object.keys(map).length}`)
  return map
}

async function upsertRole(name, description, permissionNames, permMap) {
  let role = await prisma.role.findUnique({ where: { name } })
  if (!role) {
    role = await prisma.role.create({
      data: { name, description, isActive: true },
    })
  } else {
    role = await prisma.role.update({
      where: { id: role.id },
      data: { description, isActive: true },
    })
  }

  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })
  const rows = permissionNames
    .map((n) => permMap[n])
    .filter(Boolean)
    .map((perm) => ({ roleId: role.id, permissionId: perm.id }))

  if (rows.length) {
    await prisma.rolePermission.createMany({ data: rows })
  }

  console.log(`Role: ${name} (${rows.length} permissions)`)
  return role
}

async function upsertAdmin({ name, email, password, roleId, campusId }) {
  const passwordHash = await bcrypt.hash(password, 12)
  const existing = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existing) {
    const admin = await prisma.admin.update({
      where: { id: existing.id },
      data: {
        name,
        passwordHash,
        roleId,
        campusId: campusId || null,
        isActive: true,
      },
    })
    console.log(`Admin updated: ${admin.email}`)
    return admin
  }

  const admin = await prisma.admin.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      roleId,
      campusId: campusId || null,
      isActive: true,
    },
  })
  console.log(`Admin created: ${admin.email}`)
  return admin
}

async function seedSampleAuditLogs(adminId) {
  const count = await prisma.auditLog.count({ where: { adminId } })
  if (count > 0) {
    console.log(`Audit logs: skip (already ${count} for this admin)`)
    return
  }

  const samples = [
    {
      adminId,
      action: 'LOGIN',
      entityType: 'Admin',
      entityId: adminId,
      metadata: { source: 'seed' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
    {
      adminId,
      action: 'CREATE',
      entityType: 'Bike',
      entityId: 'seed-bike-placeholder',
      metadata: { note: 'dummy audit for UI list testing' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
    {
      adminId,
      action: 'UPDATE',
      entityType: 'SystemSetting',
      entityId: null,
      metadata: { fields: ['gstRate', 'platformFee'] },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
    {
      adminId,
      action: 'STATUS_CHANGE',
      entityType: 'User',
      entityId: 'seed-user-placeholder',
      metadata: { isVerified: true },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
    {
      adminId,
      action: 'CANCEL',
      entityType: 'Booking',
      entityId: 'seed-booking-placeholder',
      metadata: { reason: 'demo cancel' },
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
    },
  ]

  await prisma.auditLog.createMany({ data: samples })
  console.log(`Audit logs: ${samples.length} sample rows created`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // Optional campus link for admins (uses first campus if present)
  const campus = await prisma.campus.findFirst({ where: { isActive: true } })
  if (campus) {
    console.log(`Campus linked: ${campus.name} (${campus.id})`)
  } else {
    console.log('No campus found — admins will have campusId = null')
  }

  const permMap = await upsertPermissions()
  const allPermNames = Object.keys(permMap)

  // SUPER_ADMIN → all permissions
  const superAdminRole = await upsertRole(
    'SUPER_ADMIN',
    'Full system access',
    allPermNames,
    permMap
  )

  // ADMIN → operational (no roles.* / audit.read)
  const opsPermNames = allPermNames.filter(
    (n) => !n.startsWith('roles.') && n !== 'audit.read'
  )
  const adminRole = await upsertRole(
    'ADMIN',
    'Operational admin access',
    opsPermNames,
    permMap
  )

  // Credentials: env preferred, dummy defaults for local UI testing
  const superEmail = process.env.ADMIN_EMAIL || 'admin@rideon.com'
  const superPassword = process.env.ADMIN_PASSWORD || 'Admin@12345'
  const superName = process.env.ADMIN_NAME || 'Super Admin'

  const opsEmail = process.env.OPS_ADMIN_EMAIL || 'ops@rideon.com'
  const opsPassword = process.env.OPS_ADMIN_PASSWORD || 'Ops@12345' 
  const opsName = process.env.OPS_ADMIN_NAME || 'Ops Admin'

  if (superPassword.length < 8 || opsPassword.length < 8) {
    throw new Error('Admin passwords must be at least 8 characters')
  }

  const superAdmin = await upsertAdmin({
    name: superName,
    email: superEmail,
    password: superPassword,
    roleId: superAdminRole.id,
    campusId: campus?.id,
  })

  await upsertAdmin({
    name: opsName,
    email: opsEmail,
    password: opsPassword,
    roleId: adminRole.id,
    campusId: campus?.id,
  })

  // Sample audit rows for UI table testing
  await seedSampleAuditLogs(superAdmin.id)

  console.log('')
  console.log('Admin seed complete.')
  console.log('----------------------------------------')
  console.log(`SUPER_ADMIN  ${superEmail}  /  ${superPassword}`)
  console.log(`ADMIN        ${opsEmail}  /  ${opsPassword}`)
  console.log('----------------------------------------')
  console.log('Change these passwords before production.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
