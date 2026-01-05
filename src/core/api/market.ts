import { apiClient } from './client';

export interface MarketListing {
    id: string;
    userId: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    location?: string;
    status: 'active' | 'sold' | 'hidden';
    views: number;
    createdAt: string;
    updatedAt: string;
    userFirstName?: string;
    userLastName?: string;
    userAvatar?: string;
}

export interface CreateListingData {
    title: string;
    description: string;
    price: number;
    category: string;
    images?: string[];
    location?: string;
}

export const marketApiService = {
    async getListings(category?: string, userId?: string): Promise<MarketListing[]> {
        const params: Record<string, any> = {};
        if (category && category !== 'all') params.category = category;
        if (userId) params.userId = userId;

        const response = await apiClient.get<any>('/market', params);
        return response.data;
    },

    async getUserListings(userId: string): Promise<MarketListing[]> {
        const response = await apiClient.get<any>(`/market/user/${userId}`);
        return response.data;
    },

    async createListing(data: CreateListingData): Promise<MarketListing> {
        const response = await apiClient.post<any>('/market', data);
        if (!response.success) throw new Error(response.message);
        return response.data;
    },

    async deleteListing(id: string): Promise<void> {
        const response = await apiClient.delete<any>(`/market/${id}`);
        if (!response.success) throw new Error(response.message);
    }
};
