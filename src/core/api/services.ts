import { apiClient } from './client';

export type ServicePricingType = 'hourly' | 'fixed' | 'monthly';
export type ServiceExperienceLevel = 'junior' | 'middle' | 'senior';
export type ServiceStatus = 'active' | 'paused';

export interface ServiceListing {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: string;
    price: number;
    pricingType: ServicePricingType;
    experienceLevel: ServiceExperienceLevel;
    tags: string[];
    location?: string;
    portfolioUrl?: string;
    status: ServiceStatus;
    views: number;
    createdAt: string;
    updatedAt: string;
    userFirstName?: string;
    userLastName?: string;
    userAvatar?: string;
}

export interface CreateServiceData {
    title: string;
    description: string;
    category: string;
    price: number;
    pricingType?: ServicePricingType;
    experienceLevel?: ServiceExperienceLevel;
    tags?: string[];
    location?: string;
    portfolioUrl?: string;
}

export const servicesApiService = {
    async getServices(category?: string, userId?: string): Promise<ServiceListing[]> {
        const params: Record<string, string> = {};
        if (category && category !== 'all') params.category = category;
        if (userId) params.userId = userId;

        const response = await apiClient.get<ServiceListing[]>('/services', params);
        return response.data;
    },

    async getServiceById(id: string): Promise<ServiceListing> {
        const response = await apiClient.get<ServiceListing>(`/services/${id}`);
        if (!response.success) throw new Error(response.message || 'Не удалось загрузить услугу');
        return response.data;
    },

    async getUserServices(userId: string): Promise<ServiceListing[]> {
        const response = await apiClient.get<ServiceListing[]>(`/services/user/${userId}`);
        return response.data;
    },

    async createService(data: CreateServiceData): Promise<ServiceListing> {
        const response = await apiClient.post<ServiceListing>('/services', data);
        if (!response.success) throw new Error(response.message || 'Не удалось создать услугу');
        return response.data;
    },

    async deleteService(id: string): Promise<void> {
        const response = await apiClient.delete<null>(`/services/${id}`);
        if (!response.success) throw new Error(response.message || 'Не удалось удалить услугу');
    }
};