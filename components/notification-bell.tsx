
"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type Notification = {
    id: string
    title: string
    message: string
    type: string
    createdAt: string
    isRead: boolean
}

// Mock current user email - in real app this comes from auth context
const currentUserEmail = "employee@example.com"
// Or update to "approver@cwit.lk" to see approver view
// For demo, we might want to toggle this or fetch for both

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = async () => {
        try {
            // For demo purposes, let's fetch for the employee
            const res = await fetch(`/api/notifications?email=${currentUserEmail}`)
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
                setUnreadCount(data.length)
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        }
    }

    const markAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                body: JSON.stringify({ email: currentUserEmail })
            })
            setUnreadCount(0)
            // We could also re-fetch or optimistically update local state to empty
            // setNotifications([]) // If we only show unread
        } catch (error) {
            console.error("Failed to mark read", error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <DropdownMenu onOpenChange={(open) => {
            if (open) {
                // optionally mark as read on open, or explicitly on a "Mark all read" button
            }
        }}>
            <DropdownMenuTrigger className="relative outline-none">
                <Bell className="w-6 h-6 text-stone-600 hover:text-[#C02D76] transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C02D76] text-[10px] font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                markAsRead()
                            }}
                            className="text-xs text-[#C02D76] hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-stone-500">
                        No new notifications
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map((n) => (
                            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-default focus:bg-stone-50">
                                <div className="flex items-center gap-2 w-full">
                                    <span className={`h-2 w-2 rounded-full ${n.type === 'ACTION' ? 'bg-amber-500' :
                                            n.type === 'SUCCESS' ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`} />
                                    <span className="font-semibold text-sm">{n.title}</span>
                                    <span className="ml-auto text-[10px] text-stone-400">
                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-600 pl-4 leading-normal">
                                    {n.message}
                                </p>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
