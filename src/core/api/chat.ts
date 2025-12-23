import { apiClient } from './client';

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Chat {
    other_user_id: string;
    last_message: string;
    last_message_at: string;
    is_read: boolean;
    sender_id: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
    unread_count: number;
}

export const chatApiService = {
    getChats: async (): Promise<Chat[]> => {
        const response = await apiClient.get('/chat');
        return response.data as Chat[];
    },

    getMessages: async (otherUserId: string): Promise<ChatMessage[]> => {
        const response = await apiClient.get(`/chat/${otherUserId}`);
        return response.data as ChatMessage[];
    },

    sendMessage: async (receiverId: string, content: string): Promise<ChatMessage> => {
        const response = await apiClient.post('/chat', { receiverId, content });
        return response.data as ChatMessage;
    },

    markAsRead: async (otherUserId: string): Promise<void> => {
        await apiClient.post(`/chat/${otherUserId}/read`);
    }
};
