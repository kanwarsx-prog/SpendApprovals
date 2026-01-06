"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight } from "lucide-react"

type RuleFormData = {
    category: string
    expenseType: string
    minAmount: number
    requiredRole: string
}

export function RuleBuilder() {
    const router = useRouter()
    const { register, handleSubmit, watch } = useForm<RuleFormData>({
        defaultValues: {
            category: "Any",
            expenseType: "Any",
            minAmount: 0
        }
    })

    const watchAll = watch()

    const onSubmit = async (data: RuleFormData) => {
        try {
            const response = await fetch('/api/admin/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) throw new Error('Failed to create rule')

            router.push("/admin")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to save rule")
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create New Approval Rule</CardTitle>
                <CardDescription>
                    Configure "When... Then..." logic for approvals.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 text-lg leading-relaxed text-stone-700">
                        <span className="font-semibold text-stone-500 mr-2 block sm:inline mb-2 sm:mb-0">WHEN</span>

                        <div className="block sm:inline-block mx-1 mb-4 sm:mb-0">
                            <label className="text-xs font-bold text-stone-400 block mb-1">TYPE</label>
                            <select
                                {...register("expenseType")}
                                className="w-full sm:w-auto h-10 rounded-md border-stone-300 bg-white px-3 py-1 text-base focus:ring-2 focus:ring-stone-900"
                            >
                                <option value="Any">Any Type</option>
                                <option value="OPEX">OPEX</option>
                                <option value="CAPEX">CAPEX</option>
                            </select>
                        </div>

                        <span className="mx-2 hidden sm:inline">and</span>

                        <div className="block sm:inline-block mx-1 mb-4 sm:mb-0">
                            <label className="text-xs font-bold text-stone-400 block mb-1">CATEGORY IS</label>
                            <select
                                {...register("category")}
                                className="w-full sm:w-auto h-10 rounded-md border-stone-300 bg-white px-3 py-1 text-base focus:ring-2 focus:ring-stone-900"
                            >
                                <option value="Any">Any Category</option>
                                <option value="Port Operations">Port Operations</option>
                                <option value="Terminal Maintenance">Terminal Maintenance</option>
                                <option value="Marine Services">Marine Services</option>
                                <option value="Security & Safety">Security & Safety</option>
                                <option value="IT Infrastructure">IT Infrastructure</option>
                                <option value="Logistics">Logistics</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Professional Services">Professional Services</option>
                            </select>
                        </div>

                        <span className="mx-2 hidden sm:inline">and</span>

                        <div className="block sm:inline-block mx-1 mb-4 sm:mb-0">
                            <label className="text-xs font-bold text-stone-400 block mb-1">AMOUNT &gt;</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-stone-500">£</span>
                                <Input
                                    type="number"
                                    {...register("minAmount")}
                                    className="pl-6 w-full sm:w-32 block sm:inline-block h-10 text-base"
                                />
                            </div>
                        </div>

                        <div className="my-6 border-t border-stone-200" />

                        <span className="font-semibold text-stone-500 mr-2 block sm:inline mb-2 sm:mb-0">THEN</span>
                        <span className="hidden sm:inline">require approval from</span>

                        <div className="block sm:inline-block mx-1">
                            <label className="text-xs font-bold text-stone-400 block mb-1">ROLE</label>
                            <Input
                                placeholder="e.g. Finance Director"
                                {...register("requiredRole", { required: true })}
                                className="w-full sm:w-64 block sm:inline-block h-10 text-base"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" className="bg-stone-900">
                            Save Rule <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    )
}
