import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Find existing campus
    let campus = await prisma.campus.findFirst({
        where: {
            name: 'NIT Calicut',
        },
    })

    // Create campus if it doesn't exist
    if (!campus) {
        campus = await prisma.campus.create({
            data: {
                name: 'NIT Calicut',
                location: 'Kozhikode, Kerala',
                isActive: true,
            },
        })

        console.log('Campus created:', campus.name)
    }

    // Seed user
    const user = await prisma.user.upsert({
        where: {
            email: 'student@nitc.ac.in',
        },
        update: {},
        create: {
            email: 'student@nitc.ac.in',
            name: 'Demo Student',
            phone: '9876543210',
            campusId: campus.id,
            isVerified: true,
        },
    })

    console.log('User seeded:', user.email)
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
