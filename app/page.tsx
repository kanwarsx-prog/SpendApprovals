import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, FileText, Clock, AlertCircle, CheckCircle2, Shield } from "lucide-react"
import { PrismaClient } from "@prisma/client"
import { Header } from "@/components/header"

// Instantiate Prisma
const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

interface HomeProps {
  searchParams: {
    submitted?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  // 1. Fetch data
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: 'desc' },
    include: { requester: true, approvalSteps: true },
    take: 10
  })

  // Simulated counts
  const awaitingApprovalCount = requests.filter(r => r.status === 'SUBMITTED').length
  const myRequestsCount = requests.length // Simulating "My Requests" as total for now

  const showSuccessBanner = searchParams?.submitted === 'true';

  const getFriendlyStatus = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'In approval';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Returned for changes';
      case 'DRAFT': return 'Draft';
      default: return status;
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'text-amber-600 bg-amber-50';
      case 'APPROVED': return 'text-emerald-600 bg-emerald-50';
      case 'REJECTED': return 'text-rose-600 bg-rose-50';
      default: return 'text-stone-600 bg-stone-50';
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Header />

        {/* User Reassurance Messaging */}
        {showSuccessBanner && (
          <div className="rounded-md bg-emerald-50 p-4 border border-emerald-200 flex items-start">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-emerald-800">Request Submitted</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Your request has been submitted. The system is collecting approvals automatically.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          {/* Space for potential future header elements or just layout balance */}
          <div className="flex items-center gap-4">
            <Link href="/analytics" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              Insights
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-stone-500">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Action is always visible via the Header or here. Changes.md asks for prominent button. */}
        <div className="flex justify-end mb-8">
          <Link href="/new">
            <Button size="lg" className="shadow-lg bg-[#C02D76] hover:bg-[#a62666] text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Spend Request
            </Button>
          </Link>
        </div>


        <div className="grid gap-6 md:grid-cols-2">
          {/* Summary Card 1: Awaiting My Approval */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#C02D76]" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">Approvals waiting for you</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-4xl font-bold text-stone-900">
                  {awaitingApprovalCount > 0 ? awaitingApprovalCount : 0}
                </div>
                {awaitingApprovalCount === 0 && (
                  <span className="text-sm text-stone-400 font-medium">No approvals waiting</span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-2">Awaiting My Approval</p>
            </CardContent>
          </Card>

          {/* Summary Card 2: My Requests */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#34394D]" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-500">Requests I have submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-4xl font-bold text-stone-900">{myRequestsCount}</div>
              </div>
              <p className="text-xs text-stone-400 mt-2">My Requests</p>
            </CardContent>
          </Card>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-lg font-semibold text-stone-900">Recent Activity</h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">
              No recent activity
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {requests.map((req) => (
                <Link href={`/requests/${req.id}`} key={req.id} className="block hover:bg-stone-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-2">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-stone-100 rounded-lg text-stone-500 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 truncate">{req.title}</p>
                        <p className="text-sm text-stone-500 truncate">
                          {req.requester?.name || 'Unknown User'} • {req.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right pl-[52px] sm:pl-0">
                      <div className="font-bold text-stone-900">
                        {req.currency} {req.amount.toLocaleString()}
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${getStatusColor(req.status)}`}>
                        {getFriendlyStatus(req.status)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
