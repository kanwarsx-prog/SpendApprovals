import { Trash2, Save, ArrowLeft, Loader2 } from "lucide-react"

// ... imports remain the same

export default function ImportPolicyPage() {
    // ... logic remains same

    // Helper to update rule at specific index
    const updateRule = (index: number, field: string, value: any) => {
        const newRules = [...rules]
        newRules[index] = { ...newRules[index], [field]: value }
        setRules(newRules)
    }

    // Helper to remove rule
    const removeRule = (index: number) => {
        const newRules = rules.filter((_, i) => i !== index)
        setRules(newRules)
    }

    async function handleSave() {
        if (rules.length === 0) return

        setIsLoading(true)
        try {
            const { saveImportedRules } = await import('@/app/actions/save-rules')
            // Clean up data before saving (ensure numbers are numbers)
            const cleanedRules = rules.map(r => ({
                ...r,
                minAmount: Number(r.minAmount),
                stepOrder: Number(r.stepOrder)
            }))

            const result = await saveImportedRules(cleanedRules)

            if (result.success) {
                router.push('/admin')
                router.refresh()
            } else {
                setError(result.error || "Failed to save rules")
            }
        } catch (e) {
            setError("Network error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-stone-50 p-8">
            {/* ... Header and Upload Card remain same ... */}

            <div className="mx-auto max-w-4xl space-y-8">
                {/* ... existing header code ... */}
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

                <Card>
                    {/* ... Upload Form ... */}
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
                                <CardDescription>Review, edit, or delete the extracted logic before saving.</CardDescription>
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
                                            <th className="px-4 py-3 w-[100px]">Type</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3 w-[140px]">Min Amount</th>
                                            <th className="px-4 py-3">Required Role</th>
                                            <th className="px-4 py-3 w-[50px]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {rules.map((rule, idx) => (
                                            <tr key={idx} className="bg-white hover:bg-stone-50/50">
                                                <td className="px-2 py-2">
                                                    <select
                                                        value={rule.expenseType}
                                                        onChange={(e) => updateRule(idx, 'expenseType', e.target.value)}
                                                        className="h-8 w-full rounded border-stone-200 text-xs"
                                                    >
                                                        <option value="OPEX">OPEX</option>
                                                        <option value="CAPEX">CAPEX</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        value={rule.category}
                                                        onChange={(e) => updateRule(idx, 'category', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        type="number"
                                                        value={rule.minAmount}
                                                        onChange={(e) => updateRule(idx, 'minAmount', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Input
                                                        value={rule.requiredRole}
                                                        onChange={(e) => updateRule(idx, 'requiredRole', e.target.value)}
                                                        className="h-8 text-xs font-medium text-[#C02D76]"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-stone-400 hover:text-red-500"
                                                        onClick={() => removeRule(idx)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
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
