
import { NextResponse } from 'next/server'
import { getUnreadNotifications, markAllAsRead } from '@/lib/notification-service'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const notifications = await getUnreadNotifications(email)
    return NextResponse.json(notifications)
}

export async function POST(request: Request) {
    const body = await request.json()
    const { email } = body

    if (email) {
        await markAllAsRead(email)
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Email required" }, { status: 400 })
}
