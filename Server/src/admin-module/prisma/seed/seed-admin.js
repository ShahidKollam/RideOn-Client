/**
 * Admin seed — idempotent. Independent of client seeds.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node prisma/seed/seed-admin.js
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

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
  for (const pname of permissionNames) {
    const perm = permMap[pname]
    if (perm) {
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm.id },
      })
    }
  }
  return role
}

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Super Admin'

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters')
    process.exit(1)
  }

  const permMap = await upsertPermissions()
  const allPermNames = Object.keys(permMap)
  const adminPermNames = allPermNames.filter(
    (n) => !n.startsWith('roles.') && n !== 'audit.read'
  )

  const superAdminRole = await upsertRole(
    'SUPER_ADMIN',
    'Full system access',
    allPermNames,
    permMap
  )
  await upsertRole('ADMIN', 'Operational admin access', adminPermNames, permMap)

  const passwordHash = await bcrypt.hash(password, 12)
  const existing = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existing) {
    await prisma.admin.update({
      where: { id: existing.id },
      data: {
        name,
        passwordHash,
        roleId: superAdminRole.id,
        isActive: true,
      },
    })
    console.log(`Admin updated: ${email.toLowerCase()} (role: SUPER_ADMIN)`)
  } else {
    await prisma.admin.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        roleId: superAdminRole.id,
        isActive: true,
      },
    })
    console.log(`Admin created: ${email.toLowerCase()} (role: SUPER_ADMIN)`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
