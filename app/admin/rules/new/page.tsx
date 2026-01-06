import { RuleBuilder } from "@/components/rule-builder"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function NewRulePage() {
    return (
        <main className="min-h-screen bg-stone-50 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <div className="flex items-center space-x-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Admin
                        </Button>
                    </Link>
                </div>

                <RuleBuilder />
            </div>
        </main>
    )
}
