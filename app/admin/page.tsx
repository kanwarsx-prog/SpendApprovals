import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Shield, Trash2 } from "lucide-react"
import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const rules = await prisma.approvalRule.findMany({
        orderBy: { stepOrder: 'asc' }
    })

    async function deleteRule(formData: FormData) {
        "use server"
        const id = formData.get("id") as string
        await prisma.approvalRule.delete({ where: { id } })
        revalidatePath('/admin')
    }

    return (
        <main className="min-h-screen bg-stone-50 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Admin Console</h1>
                        <p className="text-stone-500">Manage Delegation of Authority Rules</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">
                            Back to App
                        </Button>
                    </Link>
                </header>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center">
                            <Shield className="mr-2 h-5 w-5" />
                            Active Approval Rules
                            Active Approval Rules
                        </CardTitle>
                        <div className="flex gap-2">
                            <Link href="/admin/matrix">
                                <Button variant="outline" size="sm">
                                    View Matrix
                                </Button>
                            </Link>
                            <Link href="/admin/rules/new">
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Add Rule
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {rules.length === 0 ? (
                            <div className="text-center py-12 text-stone-400">
                                No custom rules defined. System using default hardcoded logic.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rules.map((rule) => (
                                    <div key={rule.id} className="flex items-center justify-between rounded-lg border border-stone-200 p-4 bg-white">
                                        <div className="space-y-1">
                                            <p className="font-medium text-stone-900">
                                                {rule.requiredRole} Approval
                                            </p>
                                            <p className="text-sm text-stone-500">
                                                If {rule.category ? `Category is ${rule.category}` : 'Any Category'}
                                                {' '}and Amount &gt; {rule.minAmount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <form action={deleteRule}>
                                                <input type="hidden" name="id" value={rule.id} />
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
