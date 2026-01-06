"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Shield } from "lucide-react"
import { NotificationBell } from "./notification-bell"

export function Header() {
    const pathname = usePathname()
    const isDashboard = pathname === "/"

    return (
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <img src="/cwit-logo.svg" alt="CWIT Logo" className="h-10 w-auto sm:h-12 cursor-pointer" />
                </Link>
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-stone-900 leading-tight">Spend Approvals</h1>
                    <p className="text-[10px] sm:text-xs text-stone-500 font-medium">COLOMBO WEST INTERNATIONAL TERMINAL</p>
                </div>
            </div>
            <nav className="flex items-center gap-4">
                {isDashboard ? (
                    <Link href="/admin/matrix">
                        <div className="flex items-center text-sm font-semibold text-stone-600 hover:text-[#C02D76] transition-colors bg-stone-100 hover:bg-[#C02D76]/5 px-3 py-2 rounded-md border border-stone-200 hover:border-[#C02D76]/20">
                            <Shield className="mr-2 h-4 w-4" />
                            DoA Rules
                        </div>
                    </Link>
                ) : (
                    <Link href="/">
                        <div className="flex items-center text-sm font-semibold text-stone-600 hover:text-[#34394D] transition-colors bg-stone-50 hover:bg-stone-100 px-3 py-2 rounded-md border border-stone-200">
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Dashboard
                        </div>
                    </Link>
                )}
                <NotificationBell />
            </nav>
        </header>
    )
}

