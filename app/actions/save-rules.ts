'use server'

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export type ProposedRule = {
    category: string
    expenseType: string
    minAmount: number
    requiredRole: string
    stepOrder: number
}

export async function saveImportedRules(rules: ProposedRule[]) {
    if (!rules || rules.length === 0) {
        return { success: false, error: "No rules to save." }
    }

    try {
        // Use a transaction to ensure all or nothing
        await prisma.$transaction(
            rules.map(rule =>
                prisma.approvalRule.create({
                    data: {
                        category: rule.category,
                        expenseType: rule.expenseType,
                        minAmount: rule.minAmount,
                        requiredRole: rule.requiredRole,
                        stepOrder: rule.stepOrder,
                        isActive: true
                    }
                })
            )
        )

        revalidatePath('/admin')
        revalidatePath('/admin/matrix')
        return { success: true, count: rules.length }

    } catch (error) {
        console.error("Failed to save rules:", error)
        return { success: false, error: "Database error occurred while saving." }
    }
}
