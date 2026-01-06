'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parsePolicyDocument } from '@/app/actions/import-policy'
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ImportPolicyPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [rules, setRules] = useState<any[]>([])
    const [error, setError] = useState('')
    const [warning, setWarning] = useState('')
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError('')
        setWarning('')
        setRules([])

        const formData = new FormData(event.currentTarget)
        const result = await parsePolicyDocument(formData)

        if (result.success) {
            setRules(result.data || [])
            if (result.warning) setWarning(result.warning)
        } else {
            setError(result.error || 'Unknown error')
        }
        setIsLoading(false)
    }

    async function handleSave() {
        // Here we would effectively save to DB
        // For MVP, just redirect
        alert("Simulating Save: " + rules.length + " rules would be added.")
        router.push('/admin')
    }

    return (
        <main className="min-h-screen bg-stone-50 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Admin
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">Import Policy</h1>
                    <p className="text-stone-500">Upload your PDF document to automatically generate approval rules.</p>
                </div>

                {/* Upload Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Upload</CardTitle>
                        <CardDescription>Select a PDF file to analyze</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                            <div className="grid w-full max-w-[400px] items-center gap-1.5">
                                <Label htmlFor="policy">Policy Document (PDF)</Label>
                                <Input id="policy" name="policyFile" type="file" accept=".pdf" required />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Analyze with AI'
                                )}
                            </Button>
                        </form>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        {warning && <p className="text-amber-600 text-sm mt-4 bg-amber-50 p-2 rounded">{warning}</p>}
                    </CardContent>
                </Card>

                {/* Results Table */}
                {rules.length > 0 && (
                    <Card className="border-t-4 border-t-[#C02D76]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Proposed Rules ({rules.length})</CardTitle>
                                <CardDescription>Review and verify the extracted logic before saving.</CardDescription>
                            </div>
                            <Button onClick={handleSave} className="bg-[#C02D76] hover:bg-[#a62666]">
                                <Save className="mr-2 h-4 w-4" />
                                Approve & Save
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-stone-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-stone-50 text-stone-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Threshold</th>
                                            <th className="px-4 py-3">Required Role</th>
                                            <th className="px-4 py-3">Step</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {rules.map((rule, idx) => (
                                            <tr key={idx} className="bg-white hover:bg-stone-50/50">
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{rule.expenseType}</Badge>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{rule.category}</td>
                                                <td className="px-4 py-3 text-stone-900">&gt; £{rule.minAmount.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-[#C02D76] font-semibold">{rule.requiredRole}</td>
                                                <td className="px-4 py-3 text-stone-400">{rule.stepOrder}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    )
}
