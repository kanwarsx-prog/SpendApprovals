import { NextResponse } from 'next/server'
import { determineApprovers } from '@/lib/approval-service'
import { createNotification } from '@/lib/notification-service'
import { prisma } from '@/lib/prisma'
import { getContactForRole } from '@/lib/role-directory'


export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Calculate approvals 
        const approvers = await determineApprovers(body.amount, body.category, body.expenseType)

        // Create the request
        const newRequest = await prisma.request.create({
            data: {
                title: body.title,
                description: body.justification,
                amount: body.amount,
                currency: body.currency,
                expenseType: body.expenseType,
                isBudgeted: body.isBudgeted,
                detailedDescription: body.detailedDescription,
                category: body.category,
                supplier: body.supplier,
                // Mocking a requester ID heavily here since we don't have auth yet
                // In a real app, this comes from session
                requester: {
                    connectOrCreate: {
                        where: { email: "employee@example.com" },
                        create: {
                            email: "employee@example.com",
                            name: "Demo Employee",
                            role: "REQUESTER"
                        }
                    }
                },
                status: "SUBMITTED",
                approvalSteps: {
                    create: approvers.map(step => ({
                        roleName: step.roleName,
                        order: step.order,
                        status: "PENDING"
                    }))
                }
            },
        })


        // NOTIFICATION LOGIC
        // 1. Notify the first approver
        const firstApprover = approvers.sort((a, b) => a.order - b.order)[0]
        if (firstApprover) {
            const approverContact = getContactForRole(firstApprover.roleName)

            await createNotification(
                approverContact.email,
                "Action Required: New Approval Request",
                `You have a new request pending approval: "${body.title}" from Demo Employee. Amount: ${body.currency} ${body.amount}.`,
                "ACTION"
            )
        }

        // 2. Notify the requester
        await createNotification(
            "employee@example.com",
            "Request Submitted",
            `Your request "${body.title}" has been successfully submitted and is awaiting approval from ${firstApprover?.roleName || 'Approver'}.`,
            "SUCCESS"
        )

        return NextResponse.json(newRequest)
    } catch (error) {
        console.error("Failed to create request:", error)
        return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
    }
}

