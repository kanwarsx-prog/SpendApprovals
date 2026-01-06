
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding approval rules...')

    // Clear existing rules to avoid duplicates in this demo
    await prisma.approvalRule.deleteMany({})

    const rules = [
        // OPEX Rules
        {
            expenseType: 'OPEX',
            minAmount: 5000,
            requiredRole: 'Finance Manager',
            stepOrder: 1,
        },
        {
            expenseType: 'OPEX',
            minAmount: 20000,
            requiredRole: 'Head of Department',
            stepOrder: 2,
        },
        {
            expenseType: 'OPEX',
            minAmount: 50000,
            requiredRole: 'CFO',
            stepOrder: 3,
        },

        // CAPEX Rules (Stricter)
        {
            expenseType: 'CAPEX',
            minAmount: 1000, // Even small CAPEX needs tracking
            requiredRole: 'Asset Manager',
            stepOrder: 1,
        },
        {
            expenseType: 'CAPEX',
            minAmount: 10000,
            requiredRole: 'Finance Director',
            stepOrder: 2,
        },
        {
            expenseType: 'CAPEX',
            minAmount: 100000,
            requiredRole: 'CEO',
            stepOrder: 3,
        },
    ]

    for (const rule of rules) {
        await prisma.approvalRule.create({
            data: rule,
        })
    }

    console.log('Seeding finished.')
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
