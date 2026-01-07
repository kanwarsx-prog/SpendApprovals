import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { CategoryBarChart } from "./_components/CategoryBarChart"
import { TrendChart } from "./_components/TrendChart"
import { StackedExposureChart } from "./_components/StackedExposureChart"
import { BudgetDonutChart } from "./_components/BudgetDonutChart"
import { ArrowLeft, TrendingUp, PoundSterling, FileText, CheckCircle, Clock, PieChart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    // 1. Fetch Data with Approval Steps for Exposure Analysis
    const requests = await prisma.request.findMany({
        select: {
            id: true,
            amount: true,
            category: true,
            status: true,
            createdAt: true,
            expenseType: true,
            isBudgeted: true,
            approvalSteps: {
                where: { status: 'PENDING' },
                orderBy: { order: 'asc' },
                take: 1, // Get the current active step
                select: { roleName: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    })

    // 2. Metrics Calculation
    const totalSpend = requests.reduce((sum, r) => sum + r.amount, 0)
    const activeRequests = requests.filter(r => ['SUBMITTED', 'IN_APPROVAL'].includes(r.status)).length
    const approvedSpend = requests
        .filter(r => r.status === 'APPROVED')
        .reduce((sum, r) => sum + r.amount, 0)
    const approvalRate = requests.length > 0
        ? Math.round((requests.filter(r => r.status === 'APPROVED').length / requests.length) * 100)
        : 0

    // NEW: Budget Adherence Calc
    const budgetRequests = requests.filter(r => (r as any).isBudgeted === true)
    const unbudgetedRequests = requests.filter(r => !(r as any).isBudgeted)

    const budgetedSpend = budgetRequests.reduce((sum, r) => sum + r.amount, 0)
    const unbudgetedSpend = unbudgetedRequests.reduce((sum, r) => sum + r.amount, 0)
    const totalSpendCalculated = budgetedSpend + unbudgetedSpend
    const budgetAdherenceRate = totalSpendCalculated > 0
        ? Math.round((budgetedSpend / totalSpendCalculated) * 100)
        : 100

    const budgetChartData = [
        { name: "Budgeted", value: budgetedSpend, color: "#22C55E" },
        { name: "Unbudgeted", value: unbudgetedSpend, color: "#EF4444" }
    ]

    // 3. Aggregate for Category Chart
    const categoryMap = new Map<string, number>()
    requests.forEach(r => {
        const current = categoryMap.get(r.category) || 0
        categoryMap.set(r.category, current + r.amount)
    })
    const categoryData = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)

    // 4. Aggregate for Split Trend Chart (Monthly)
    const trendMap = new Map<string, { total: number, capex: number, opex: number }>()

    // Seed last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        // Format: "Jan 2024" to ensure uniqueness across years
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
        trendMap.set(key, { total: 0, capex: 0, opex: 0 })
    }

    requests.forEach(r => {
        const key = r.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' })
        if (trendMap.has(key)) {
            const current = trendMap.get(key)!
            current.total += r.amount
            if (r.expenseType === 'CAPEX') current.capex += r.amount
            if (r.expenseType === 'OPEX') current.opex += r.amount
        }
    })
    const trendData = Array.from(trendMap.entries()).map(([date, values]) => ({ date, ...values }))

    // 5. Aggregate for Exposure Charts (Pending only)
    // 5. Aggregate for Stacked Exposure Chart (Pending only)
    const exposureMap = new Map<string, { role: string, capex: number, opex: number }>()

    requests
        .filter(r => ['SUBMITTED', 'IN_APPROVAL'].includes(r.status) && r.approvalSteps.length > 0)
        .forEach(r => {
            const currentRole = r.approvalSteps[0].roleName
            if (!exposureMap.has(currentRole)) {
                exposureMap.set(currentRole, { role: currentRole, capex: 0, opex: 0 })
            }
            const current = exposureMap.get(currentRole)!

            if (r.expenseType === 'CAPEX') current.capex += r.amount
            if (r.expenseType === 'OPEX') current.opex += r.amount
        })

    const exposureData = Array.from(exposureMap.values())
        .sort((a, b) => (b.capex + b.opex) - (a.capex + a.opex))

    return (
        <main className="min-h-screen bg-stone-50 p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Spend Insights</h1>
                        <p className="text-stone-500">Analytics and reporting for approval requests.</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requested</CardTitle>
                            <PoundSterling className="h-4 w-4 text-stone-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">£{totalSpend.toLocaleString()}</div>
                            <p className="text-xs text-stone-500">Across {requests.length} total requests</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Budget Adherence</CardTitle>
                            <PieChart className="h-4 w-4 text-stone-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{budgetAdherenceRate}%</div>
                            <p className="text-xs text-stone-500">Of spend is within budget</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved Value</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">£{approvedSpend.toLocaleString()}</div>
                            <p className="text-xs text-stone-500">Successfully authorized</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{approvalRate}%</div>
                            <p className="text-xs text-stone-500">Of decided requests approved</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Charts Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Trend Chart */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Spend Velocity</CardTitle>
                            <CardDescription>Requested volume over time (split by CAPEX/OPEX)</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <TrendChart data={trendData} />
                        </CardContent>
                    </Card>

                    {/* Budget Donut Chart */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Budget Ratio</CardTitle>
                            <CardDescription>Budgeted vs Unbudgeted Spend</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BudgetDonutChart data={budgetChartData} />
                        </CardContent>
                    </Card>
                </div>

                {/* Category & Exposure Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Top Spend Categories</CardTitle>
                            <CardDescription>Highest volume categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryBarChart data={categoryData} />
                        </CardContent>
                    </Card>

                    <div className="col-span-1">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Pending Approvals Exposure</CardTitle>
                                <CardDescription>Combined CAPEX & OPEX Bottlenecks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {exposureData.length > 0 ? (
                                    <StackedExposureChart data={exposureData} />
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-stone-400">
                                        No pending approvals
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
