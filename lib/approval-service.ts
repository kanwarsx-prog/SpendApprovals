import { PrismaClient } from "@prisma/client"

/**
 * Business Logic for Delegation of Authority
 */

const prisma = new PrismaClient()

export interface DeterminedApproval {
    roleName: string
    order: number
}

// Now Async to fetch rules
export async function determineApprovers(amount: number, category: string, expenseType: string = "OPEX"): Promise<DeterminedApproval[]> {
    const steps: DeterminedApproval[] = []
    let orderCounter = 1

    // 1. Fetch Dynamic Rules
    try {
        const rules = await prisma.approvalRule.findMany({
            where: { isActive: true },
            orderBy: { minAmount: 'asc' }
        })

        // Apply Rules
        for (const rule of rules) {
            let match = true

            // Expense Type Check (New)
            // If rule has specific expense type, it must match. If "Any", it matches all.
            if (rule.expenseType && rule.expenseType !== "Any" && rule.expenseType !== expenseType) {
                match = false
            }

            // Category Check
            if (rule.category && rule.category !== "Any" && rule.category !== category) {
                match = false
            }

            // Amount Check
            if (amount <= rule.minAmount) {
                match = false
            }

            if (match) {
                steps.push({ roleName: rule.requiredRole, order: orderCounter++ })
            }
        }
    } catch (e) {
        console.error("Failed to load dynamic rules, using fallback", e)
    }

    // 2. Fallback / Base Logic (if no dynamic rules found or added on top)
    // If we have some steps from dynamic rules, we might still want the Line Manager

    // CAPEX requests always need Finance Director if not already added by rules (Business Rule Example)
    // OPEX always needs Line Manager

    if (expenseType === "OPEX") {
        const hasLineManager = steps.some(s => s.roleName === "Line Manager")
        if (!hasLineManager) {
            steps.unshift({ roleName: "Line Manager", order: 0 })
        }
    }

    // Re-index at the end
    steps.forEach((s, i) => s.order = i + 1)

    return steps
}
