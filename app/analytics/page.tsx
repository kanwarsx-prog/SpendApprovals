import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PrismaClient } from "@prisma/client"
import { CategoryBarChart } from "./_components/CategoryBarChart"
import { TrendChart } from "./_components/TrendChart"
import { ArrowLeft, TrendingUp, PoundSterling, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    // 1. Fetch Data
    const requests = await prisma.request.findMany({
        select: {
            id: true,
            amount: true,
            category: true,
            status: true,
            createdAt: true
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

    // 3. Aggregate for Category Chart
    const categoryMap = new Map<string, number>()
    requests.forEach(r => {
        const current = categoryMap.get(r.category) || 0
        categoryMap.set(r.category, current + r.amount)
    })
    const categoryData = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6) // Top 6

    // 4. Aggregate for Trend Chart (Monthly)
    const trendMap = new Map<string, number>()

    // Seed last 6 months to ensure continuity
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = d.toLocaleString('default', { month: 'short' })
        trendMap.set(key, 0)
    }

    requests.forEach(r => {
        const key = r.createdAt.toLocaleString('default', { month: 'short' })
        // Only count if it's within our seeded range (roughly)
        if (trendMap.has(key)) {
            trendMap.set(key, (trendMap.get(key) || 0) + r.amount)
        }
    })
    const trendData = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount }))


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
                            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                            <FileText className="h-4 w-4 text-stone-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeRequests}</div>
                            <p className="text-xs text-stone-500">Currently pending approval</p>
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

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Trend Chart */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Spend Velocity</CardTitle>
                            <CardDescription>Total requested volume over the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <TrendChart data={trendData} />
                        </CardContent>
                    </Card>

                    {/* Category Chart */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Spend by Category</CardTitle>
                            <CardDescription>Top spending categories by requested volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryBarChart data={categoryData} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
