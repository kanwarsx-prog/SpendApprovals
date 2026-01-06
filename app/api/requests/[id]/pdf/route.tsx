import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { renderToStream } from '@react-pdf/renderer'
import { ApprovalDocument } from '@/components/approval-pdf'
import React from 'react'
import path from 'path'

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        // Fetch request data
        const reqData = await prisma.request.findUnique({
            where: { id },
            include: {
                requester: true,
                approvalSteps: {
                    include: { approver: true },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!reqData) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        // Generate PDF stream

        const stream = await renderToStream(
            <ApprovalDocument
                data={{
                    id: reqData.id,
                    title: reqData.title,
                    detailedDescription: (reqData as any).detailedDescription,
                    amount: reqData.amount,
                    currency: reqData.currency,
                    supplier: reqData.supplier || "",
                    category: reqData.category,
                    justification: reqData.description,
                    requester: reqData.requester.name || "Unknown",
                    date: reqData.createdAt.toLocaleDateString(),
                    approvals: reqData.approvalSteps.map(step => ({
                        role: step.roleName,
                        name: step.approver?.name || "Pending",
                        date: step.decisionDate ? step.decisionDate.toLocaleDateString() : "-",
                        status: step.status
                    }))
                }}
            />
        )

        // Return as stream
        // Note: Next.js App Router response handling for streams can be tricky.
        // We convert the NodeJS.ReadableStream to a Web ReadableStream or use a workaround.
        // @react-pdf/renderer 'renderToStream' returns a NodeJS ReadableStream.

        return new NextResponse(stream as unknown as ReadableStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="approval-${id}.pdf"`
            }
        })

    } catch (error) {
        console.error("PDF Gen Error:", error)
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
    }
}
