/**
 * One-time seed: shared Walk-in / Admin Desk user for admin desk bookings.
 * Does NOT create real customers. Safe to re-run (upsert by email).
 *
 *   node prisma/seed/seed-walkin-user.js
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const WALKIN_EMAIL = 'walkin@rideon.internal'
const WALKIN_NAME = 'Walk-in / Admin Desk'

async function main() {
  let campus = await prisma.campus.findFirst({ where: { isActive: true } })
  if (!campus) {
    campus = await prisma.campus.findFirst()
  }
  if (!campus) {
    throw new Error('No campus found. Seed a campus first.')
  }

  const user = await prisma.user.upsert({
    where: { email: WALKIN_EMAIL },
    update: {
      name: WALKIN_NAME,
      isVerified: true,
    },
    create: {
      email: WALKIN_EMAIL,
      name: WALKIN_NAME,
      campusId: campus.id,
      isVerified: true,
      acceptedTerms: true,
      acceptedTermsAt: new Date(),
      onboardingStatus: 'SIGNED_UP',
    },
  })

  console.log('Walk-in user ready:')
  console.log(`  id:    ${user.id}`)
  console.log(`  email: ${user.email}`)
  console.log(`  name:  ${user.name}`)
  console.log(`  campusId: ${user.campusId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
