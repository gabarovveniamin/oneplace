import { apiClient } from './client';

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    related_id?: string;
    is_read: boolean;
    created_at: string;
}

export const notificationsApiService = {
    // Get all notifications
    getNotifications: async (): Promise<Notification[]> => {
        const response = await apiClient.get<Notification[]>('/notifications');
        return (response as any).data;
    },

    // Mark as read
    markAsRead: async (notificationIds: string[] | 'all'): Promise<void> => {
        await apiClient.post('/notifications/mark-read', { notificationIds });
    },

    // Delete notification
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/notifications/${id}`);
    }
};
