"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form" // I need to install react-hook-form if not installed
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod" // I need to install zod
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronRight, ChevronLeft } from "lucide-react"

// Define validation schema for the wizard
const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    expenseType: z.enum(["OPEX", "CAPEX"]),
    category: z.string().min(1, "Please select a category"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    currency: z.string().default("GBP"),
    supplier: z.string().min(1, "Supplier name is required"),
    justification: z.string().min(20, "Please provide a detailed justification"),
    detailedDescription: z.string().min(20, "Please provide a detailed description"),
})

type FormData = z.infer<typeof formSchema>

const steps = [
    { id: 1, title: "What" },
    { id: 2, title: "How much" },
    { id: 3, title: "Why" },
    { id: 4, title: "Review" },
]

const CAPEX_CATEGORIES = [
    "Port Infrastructure",
    "Terminal Equipment",
    "IT Hardware",
    "Security Systems",
    "Other CAPEX"
]

const OPEX_CATEGORIES = [
    "Marine Services",
    "Terminal Maintenance",
    "Logistics",
    "IT Infrastructure",
    "IT Software",
    "Professional Services",
    "Marketing",
    "Travel",
    "Other OPEX"
]

export function RequestWizard() {
    const [currentStep, setCurrentStep] = React.useState(1)
    const router = useRouter()

    const methods = useForm<FormData>({
        resolver: zodResolver(formSchema) as any,
        mode: "onBlur",
        defaultValues: {
            currency: "GBP",
            expenseType: "OPEX"
        }
    })

    const { register, trigger, handleSubmit, formState: { errors }, watch, setValue } = methods
    const data = watch()
    const expenseType = watch("expenseType")

    // Update categories based on expense type
    const availableCategories = expenseType === "CAPEX" ? CAPEX_CATEGORIES : OPEX_CATEGORIES

    const nextStep = async (e: React.MouseEvent) => {
        e.preventDefault()
        let valid = false
        if (currentStep === 1) valid = await trigger(["title", "expenseType", "category"])
        if (currentStep === 2) valid = await trigger(["amount", "supplier"])
        if (currentStep === 3) valid = await trigger(["justification", "detailedDescription"])

        if (valid) setCurrentStep((prev) => prev + 1)
    }

    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault()
        setCurrentStep((prev) => prev - 1)
    }

    const onSubmit = async (data: FormData) => {
        // Prevent accidental submissions from earlier steps
        if (currentStep !== 4) return

        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) throw new Error('Failed to submit')

            alert("Request submitted successfully!")
            router.push("/")
        } catch (error) {
            console.error(error)
            alert("Something went wrong. Please check console.")
        }
    }

    return (
        <div className="mx-auto max-w-2xl">
            {/* ... steps UI ... */}

            {/* Progress System - kept same */}
            <div className="mb-8 flex justify-between">
                {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${currentStep >= step.id
                            ? "border-stone-900 bg-stone-900 text-stone-50"
                            : "border-stone-200 text-stone-400"
                            }`}>
                            {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                        </div>
                        <span className="mt-2 text-xs font-medium text-stone-500">{step.title}</span>
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {currentStep === 1 && "What are you requesting?"}
                        {currentStep === 2 && "Financial Details"}
                        {currentStep === 3 && "Business Justification"}
                        {currentStep === 4 && "Review & Submit"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* ... Steps content omitted for brevity, logic remains same but need to ensure I don't overwrite ... */}
                            {/* Wait, replace_file_content needs context. I should target just the methods and nav section */}
                            {/* Actually, I'll split this into smaller chunks to be safe */}

                            {/* STEP 1 */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Request Title</Label>
                                        <Input id="title" placeholder="e.g. Q3 Marketing Campaign Usage" {...register("title")} />
                                        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Expense Type</Label>
                                        <div className="flex gap-4">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="opex"
                                                    value="OPEX"
                                                    {...register("expenseType")}
                                                    className="h-4 w-4 border-stone-300 text-stone-900 focus:ring-stone-900"
                                                />
                                                <Label htmlFor="opex" className="font-normal">OPEX (Operational)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="capex"
                                                    value="CAPEX"
                                                    {...register("expenseType")}
                                                    className="h-4 w-4 border-stone-300 text-stone-900 focus:ring-stone-900"
                                                />
                                                <Label htmlFor="capex" className="font-normal">CAPEX (Capital)</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Spend Category</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950"
                                            {...register("category")}
                                        >
                                            <option value="">Select a category...</option>
                                            {availableCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount</Label>
                                            <Input id="amount" type="number" step="0.01" {...register("amount")} />
                                            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950"
                                                {...register("currency")}
                                            >
                                                <option value="GBP">GBP (£)</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier">Supplier Name</Label>
                                        <Input id="supplier" placeholder="e.g. Google, AWS, Agency X" {...register("supplier")} />
                                        {errors.supplier && <p className="text-sm text-red-500">{errors.supplier.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="justification">Business Justification</Label>
                                        <p className="text-xs text-stone-500">Why do we need this? What happens if we don't approve it?</p>
                                        <Textarea
                                            id="justification"
                                            className="h-32"
                                            placeholder="Describe the business need..."
                                            {...register("justification")}
                                        />
                                        {errors.justification && <p className="text-sm text-red-500">{errors.justification.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="detailedDescription">Detailed Description of Goods/Services</Label>
                                        <p className="text-xs text-stone-500">Provide a comprehensive description of what is being purchased, including specifications, scope, or deliverables.</p>
                                        <Textarea
                                            id="detailedDescription"
                                            className="h-32 font-mono text-sm"
                                            placeholder="Item 1: Specs...&#10;Item 2: Specs..."
                                            {...register("detailedDescription")}
                                        />
                                        {errors.detailedDescription && <p className="text-sm text-red-500">{errors.detailedDescription.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4 */}
                            {currentStep === 4 && (
                                <div className="space-y-4 rounded-lg border bg-stone-50 p-4 text-sm">
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="font-semibold text-stone-500">Title:</span>
                                        <span className="col-span-2">{data.title}</span>

                                        <span className="font-semibold text-stone-500">Category:</span>
                                        <span className="col-span-2">
                                            <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-500/10 mr-2">
                                                {data.expenseType}
                                            </span>
                                            {data.category}
                                        </span>

                                        <span className="font-semibold text-stone-500">Amount:</span>
                                        <span className="col-span-2">{data.currency} {data.amount}</span>

                                        <span className="font-semibold text-stone-500">Supplier:</span>
                                        <span className="col-span-2">{data.supplier}</span>

                                        <span className="font-semibold text-stone-500">Justification:</span>
                                        <span className="col-span-2 break-words">{data.justification}</span>

                                        <span className="font-semibold text-stone-500">Detailed Description:</span>
                                        <span className="col-span-2 break-words whitespace-pre-wrap">{data.detailedDescription}</span>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between pt-4">
                                {currentStep > 1 ? (
                                    <Button key="back-btn" type="button" variant="outline" onClick={prevStep}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                ) : <div />}

                                {currentStep < 4 ? (
                                    <Button key="next-btn" type="button" onClick={nextStep}>
                                        Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button key="submit-btn" type="submit" className="bg-green-600 hover:bg-green-700">
                                        Submit Request
                                    </Button>
                                )}
                            </div>

                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    )
}
