import { apiClient } from './client';

export interface Friend {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    avatar?: string;
    friendship_date?: string;
}

export interface FriendRequest extends Friend {
    request_id: string;
    created_at: string;
}

export interface FriendshipStatus {
    id?: string;
    direction?: 'incoming' | 'outgoing';
    status: 'none' | 'pending' | 'accepted';
}

class FriendshipAPI {
    // Отправить заявку в друзья
    async sendFriendRequest(friendId: string): Promise<any> {
        const response = await apiClient.post('/friendships/request', { friendId });
        return response.data;
    }

    // Принять заявку в друзья
    async acceptFriendRequest(requestId: string): Promise<any> {
        const response = await apiClient.post(`/friendships/accept/${requestId}`);
        return response.data;
    }

    // Отклонить заявку в друзья
    async rejectFriendRequest(requestId: string): Promise<void> {
        await apiClient.delete(`/friendships/reject/${requestId}`);
    }

    // Удалить из друзей
    async removeFriend(friendId: string): Promise<void> {
        await apiClient.delete(`/friendships/${friendId}`);
    }

    // Получить список друзей
    async getFriends(): Promise<Friend[]> {
        const response = await apiClient.get('/friendships');
        return response.data as Friend[];
    }

    // Получить входящие заявки
    async getIncomingRequests(): Promise<FriendRequest[]> {
        const response = await apiClient.get('/friendships/requests/incoming');
        return response.data as FriendRequest[];
    }

    // Получить исходящие заявки
    async getOutgoingRequests(): Promise<FriendRequest[]> {
        const response = await apiClient.get('/friendships/requests/outgoing');
        return response.data as FriendRequest[];
    }

    // Проверить статус дружбы с пользователем
    async getFriendshipStatus(targetUserId: string): Promise<FriendshipStatus> {
        const response = await apiClient.get(`/friendships/status/${targetUserId}`);
        return response.data as FriendshipStatus;
    }
}

export const friendshipAPI = new FriendshipAPI();
