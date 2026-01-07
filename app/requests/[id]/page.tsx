import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { ChevronLeft, Check, Download, FileText, AlertTriangle } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"

const prisma = new PrismaClient()

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const request = await prisma.request.findUnique({
        where: { id },
        include: { requester: true, approvalSteps: { orderBy: { order: 'asc' } } }
    })

    if (!request) return <div>Not found</div>

    // Check budget status (handling potentially missing field if schema update failed)
    // Defaulting to FALSE (Unbudgeted) is safer for compliance. If data is missing, we flag it.
    const isBudgeted = (request as any).isBudgeted ?? false

    // Server Action for Approval
    async function approveAction(formData: FormData) {
        "use server"

        // Find the first pending step
        const firstPending = await prisma.approvalStep.findFirst({
            where: { requestId: id, status: "PENDING" },
            orderBy: { order: 'asc' }
        })

        if (!firstPending) return

        // Update step to approved
        await prisma.approvalStep.update({
            where: { id: firstPending.id },
            data: {
                status: "APPROVED",
                decisionDate: new Date(),
                // In real app, we would record WHO approved here
                approver: {
                    connectOrCreate: {
                        where: { email: "manager@example.com" },
                        create: { email: "manager@example.com", name: "Manager" }
                    }
                }
            }
        })

        // Check if all approved
        const remaining = await prisma.approvalStep.count({
            where: { requestId: id, status: "PENDING" }
        })

        if (remaining === 0) {
            await prisma.request.update({
                where: { id },
                data: { status: "APPROVED" }
            })
        }

        revalidatePath(`/requests/${id}`)
        revalidatePath('/')
    }

    const currentStep = request.approvalSteps.find(s => s.status === 'PENDING')
    const completed = request.status === 'APPROVED'



    // ... imports

    return (
        <main className="min-h-screen bg-stone-50 p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <Header />
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Button>
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">{request.title}</h1>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Link href={`/api/requests/${request.id}/pdf`} target="_blank" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Request Details (The "Document") */}
                    <div className="space-y-6">
                        <Card className="h-full border-stone-300 shadow-md">
                            <CardHeader className="bg-stone-100 border-b border-stone-200">
                                <CardTitle className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5" />
                                    Request Specification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-stone-400">AMOUNT</p>
                                        <p className="text-xl font-mono">{request.currency} {request.amount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400">SUPPLIER</p>
                                        <p className="text-xl">{request.supplier}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400">CATEGORY</p>
                                        <p className="">{request.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400">REQUESTER</p>
                                        <p className="">{request.requester.name}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-stone-400 mb-2">BUSINESS JUSTIFICATION</p>
                                    <p className="text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-md border border-stone-100">
                                        {request.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Approval Timeline & Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Approval Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative border-l-2 border-stone-200 ml-4 space-y-8 py-4">
                                    {request.approvalSteps.map((step, idx) => {
                                        const isDone = step.status === 'APPROVED'
                                        const isCurrent = step.status === 'PENDING' && !completed && currentStep?.id === step.id

                                        return (
                                            <div key={step.id} className="relative pl-8">
                                                <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${isDone ? "border-green-500 bg-green-500" :
                                                    isCurrent ? "border-blue-500 bg-white" : "border-stone-300 bg-white"
                                                    }`} />

                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-semibold ${isDone ? "text-stone-900" : "text-stone-500"}`}>
                                                        {step.roleName}
                                                    </span>
                                                    <span className="text-xs text-stone-400">
                                                        {isDone ? "Approved" : (isCurrent ? "Reviewing now..." : "Queue")}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-stone-50 flex justify-end p-6">
                                {completed ? (
                                    <div className="flex items-center text-green-600 font-bold">
                                        <Check className="mr-2 h-5 w-5" /> Request Fully Approved
                                    </div>
                                ) : (
                                    <form action={approveAction}>
                                        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                                            Approve as {currentStep?.roleName}
                                        </Button>
                                    </form>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
