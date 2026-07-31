import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // ⚠️ Replace this with a real campusId from your database
    const campusId = 'cmr5yu5r70000vhicku98sn2n'

    const pricingData = [
        {
            packageName: '1 Hour',
            durationHours: 1,
            price: 80,
            includedKm: 15,
            extraKmRate: 5,
            depositAmount: 0, // adjust as needed
            displayOrder: 1,
            isFeatured: false,
        },
        {
            packageName: '2 Hours',
            durationHours: 2,
            price: 160,
            includedKm: 25,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 2,
            isFeatured: false,
        },
        {
            packageName: '3 Hours',
            durationHours: 3,
            price: 220,
            includedKm: 40,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 3,
            isFeatured: true, // ⭐ featured
        },
        {
            packageName: '4 Hours',
            durationHours: 4,
            price: 290,
            includedKm: 50,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 4,
            isFeatured: false,
        },
        {
            packageName: '5 Hours',
            durationHours: 5,
            price: 360,
            includedKm: 60,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 5,
            isFeatured: false,
        },
        {
            packageName: '6 Hours',
            durationHours: 6,
            price: 400,
            includedKm: 80,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 6,
            isFeatured: true, // ⭐ featured
        },
        {
            packageName: '7 Hours',
            durationHours: 7,
            price: 460,
            includedKm: 88,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 7,
            isFeatured: false,
        },
        {
            packageName: '8 Hours',
            durationHours: 8,
            price: 520,
            includedKm: 96,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 8,
            isFeatured: false,
        },
        {
            packageName: '9 Hours',
            durationHours: 9,
            price: 580,
            includedKm: 104,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 9,
            isFeatured: false,
        },
        {
            packageName: '10 Hours',
            durationHours: 10,
            price: 630,
            includedKm: 110,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 10,
            isFeatured: false,
        },
        {
            packageName: '11 Hours',
            durationHours: 11,
            price: 680,
            includedKm: 115,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 11,
            isFeatured: false,
        },
        {
            packageName: '12 Hours',
            durationHours: 12,
            price: 720,
            includedKm: 120,
            extraKmRate: 5,
            depositAmount: 0,
            displayOrder: 12,
            isFeatured: true, // ⭐ featured
        },
        {
            packageName: '24 Hours',
            durationHours: 24,
            price: 960,
            includedKm: 140,
            extraKmRate: 5,
            depositAmount: 0, // higher deposit for full day
            displayOrder: 13,
            isFeatured: false,
        },
    ]

    for (const data of pricingData) {
        await prisma.pricing.create({
            data: {
                campusId,
                ...data,
                isActive: true,
            },
        })
    }

    console.log('✅ Pricing seed completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
