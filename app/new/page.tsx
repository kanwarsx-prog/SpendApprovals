import { RequestWizard } from "@/components/request-wizard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Header } from "@/components/header"

export default function NewRequestPage() {
    return (
        <main className="min-h-screen bg-stone-50 p-8">
            <div className="mx-auto max-w-5xl space-y-8">
                <Header />
                <div className="flex items-center space-x-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">New Spend Request</h1>
                    <p className="text-stone-500">Please provide details about the purchase you need to make.</p>
                </div>

                <RequestWizard />
            </div>
        </main>
    )
}
