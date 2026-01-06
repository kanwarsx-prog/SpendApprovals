
import { prisma } from './prisma';

export async function createNotification(
    userEmail: string,
    title: string,
    message: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION' = 'INFO'
) {
    try {
        return await prisma.notification.create({
            data: {
                userEmail,
                title,
                message,
                type,
            },
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
        // Non-blocking, return null
        return null;
    }
}

export async function getUnreadNotifications(userEmail: string) {
    try {
        return await prisma.notification.findMany({
            where: {
                userEmail,
                isRead: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }
}

export async function markAsRead(notificationId: string) {
    try {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

export async function markAllAsRead(userEmail: string) {
    try {
        return await prisma.notification.updateMany({
            where: { userEmail, isRead: false },
            data: { isRead: true }
        });
    } catch (error) {
        console.error('Failed to mark all as read', error);
    }
}
