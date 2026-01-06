import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting analytics data seed...')

    // 1. Ensure we have a requester user
    const requester = await prisma.user.upsert({
        where: { email: 'demo.user@cwit.com' },
        update: {},
        create: {
            email: 'demo.user@cwit.com',
            name: 'Demo User',
            role: 'REQUESTER'
        }
    })

    // 2. Define data pools
    const categories = ['IT Hardware', 'Travel', 'Port Infrastructure', 'Marine Services', 'Terminal Equipment', 'Software Licenses']
    const statuses = ['APPROVED', 'REJECTED', 'SUBMITTED', 'IN_APPROVAL']
    const expenseTypes = ['CAPEX', 'OPEX']

    const requestsToCreate = []

    // 3. Generate 50 random requests over the last 6 months
    for (let i = 0; i < 50; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const type = expenseTypes[Math.floor(Math.random() * expenseTypes.length)]

        // Random amount between 500 and 50000
        const amount = Math.floor(Math.random() * 49500) + 500

        // Random date in last 6 months
        const date = new Date()
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 6))
        date.setDate(Math.floor(Math.random() * 28) + 1)

        requestsToCreate.push({
            title: `${category} Request #${i + 100}`,
            description: `Generated seed data for ${category} analytics testing.`,
            amount: amount,
            currency: 'GBP',
            expenseType: type,
            category: category,
            status: status,
            requesterId: requester.id,
            createdAt: date,
            updatedAt: date // Keep same as created for simplicity
        })
    }

    // 4. Batch Insert
    console.log(`Creating ${requestsToCreate.length} dummy requests...`)
    for (const data of requestsToCreate) {
        await prisma.request.create({ data })
    }

    console.log('✅ Seeding complete! Dashboard should now be populated.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
