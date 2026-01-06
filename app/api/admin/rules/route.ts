import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Create Rule
        // We assume the user is admin (Mocked auth)

        const newRule = await prisma.approvalRule.create({
            data: {
                category: body.category === "Any" ? null : body.category,
                expenseType: body.expenseType === "Any" ? null : body.expenseType,
                minAmount: Number(body.minAmount),
                requiredRole: body.requiredRole,
                stepOrder: 1, // Defaulting for MVP, normally calculated
                isActive: true
            },
        })

        return NextResponse.json(newRule)
    } catch (error) {
        console.error("Failed to create rule:", error)
        return NextResponse.json({ error: "Failed to create rule" }, { status: 500 })
    }
}
