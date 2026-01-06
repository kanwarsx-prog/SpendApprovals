
import { PrismaClient } from "@prisma/client"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function MatrixPage() {
    // Fetch all rules
    const rules = await prisma.approvalRule.findMany({
        orderBy: [
            { expenseType: 'asc' }, // Group by Type
            { minAmount: 'asc' }    // Then by Amount
        ]
    })

    // Group rules by Expense Type
    const groupedRules = rules.reduce((acc, rule) => {
        const type = rule.expenseType || 'General';
        if (!acc[type]) acc[type] = [];
        acc[type].push(rule);
        return acc;
    }, {} as Record<string, typeof rules>);

    return (
        <main className="min-h-screen bg-stone-50 p-8">
            <div className="mx-auto max-w-5xl space-y-8">
                <Header />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900">Delegation of Authority Matrix</h2>
                        <p className="text-stone-500">Visual overview of approval thresholds and responsibilities</p>
                    </div>
                    <Link href="/admin">
                        <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Rules
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-8">
                    {Object.entries(groupedRules).map(([type, typeRules]) => (
                        <Card key={type} className="overflow-hidden border-t-4 border-t-[#C02D76]">
                            <CardHeader className="bg-stone-50/50 border-b border-stone-100">
                                <CardTitle className="flex items-center gap-2">
                                    {type}
                                    <Badge variant="outline" className="ml-2 bg-white">{typeRules.length} Rules</Badge>
                                </CardTitle>
                                <CardDescription>
                                    Approval chain for {type} expenses
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="hidden sm:table-header-group text-xs text-stone-500 uppercase bg-stone-50">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Category</th>
                                            <th className="px-6 py-4 font-medium">Amount Threshold</th>
                                            <th className="px-6 py-4 font-medium">Required Approver</th>
                                            <th className="px-6 py-4 font-medium">Order</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {/* Always show Line Manager as implicit first step */}
                                        <tr className="bg-white hover:bg-stone-50/50 block sm:table-row border-b sm:border-b-0">
                                            {/* Mobile View: Implicit Card */}
                                            <td className="block sm:hidden p-4 bg-stone-50/30">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-semibold text-stone-500 border-b border-stone-100 pb-1 w-full mb-2">
                                                        All Categories
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="text-stone-500">Threshold:</div>
                                                    <div className="text-stone-900 font-medium">£0+</div>

                                                    <div className="text-stone-500">Approver:</div>
                                                    <div className="font-semibold text-stone-700 flex items-center gap-2">
                                                        Line Manager <Badge variant="secondary" className="text-[10px] h-5">Implicit</Badge>
                                                    </div>

                                                    <div className="text-stone-500">Step:</div>
                                                    <div className="text-stone-400">0</div>
                                                </div>
                                            </td>

                                            {/* Desktop View */}
                                            <td className="hidden sm:table-cell px-6 py-4 text-stone-500">All</td>
                                            <td className="hidden sm:table-cell px-6 py-4 font-medium text-stone-900">£0+</td>
                                            <td className="hidden sm:table-cell px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-stone-700">Line Manager</span>
                                                    <Badge variant="secondary" className="text-[10px]">Implicit</Badge>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4 text-stone-400">0</td>
                                        </tr>
                                        {typeRules.map((rule) => (
                                            <tr key={rule.id} className="bg-white hover:bg-stone-50/50 block sm:table-row border-b sm:border-b-0">
                                                {/* Mobile View: Stacked Card style */}
                                                <td className="block sm:hidden p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-semibold text-stone-900 border-b border-stone-100 pb-1 w-full mb-2">
                                                            {rule.category || 'Any Category'}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div className="text-stone-500">Threshold:</div>
                                                        <div className="text-stone-900 font-medium">&gt; £{rule.minAmount.toLocaleString()}</div>

                                                        <div className="text-stone-500">Approver:</div>
                                                        <div className="font-semibold text-stone-700">{rule.requiredRole}</div>

                                                        <div className="text-stone-500">Step:</div>
                                                        <div className="text-stone-400">{rule.stepOrder}</div>
                                                    </div>
                                                </td>

                                                {/* Desktop View: Table cells */}
                                                <td className="hidden sm:table-cell px-6 py-4">
                                                    {rule.category ? (
                                                        <Badge variant="outline" className="font-normal">
                                                            {rule.category}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-stone-400 italic">Any Category</span>
                                                    )}
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4 font-medium text-stone-900">
                                                    &gt; £{rule.minAmount.toLocaleString()}
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4">
                                                    <span className="font-semibold text-stone-700">{rule.requiredRole}</span>
                                                </td>
                                                <td className="hidden sm:table-cell px-6 py-4 text-stone-400">
                                                    {rule.stepOrder}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    )
}
