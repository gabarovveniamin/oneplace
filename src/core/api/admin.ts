import { apiClient } from './client';
import { UserResponse } from './auth';
import { JobResponse } from './types';

export class AdminApiService {
    // Получить всех пользователей
    async getAllUsers(): Promise<UserResponse[]> {
        const response = await apiClient.get<any>('/admin/users');
        return response.data?.users || response.data;
    }

    // Удалить пользователя
    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(`/admin/users/${id}`);
    }

    // Получить все вакансии
    async getAllJobs(): Promise<JobResponse[]> {
        const response = await apiClient.get<any>('/admin/jobs');
        return response.data?.jobs || response.data;
    }

    // Удалить вакансию
    async deleteJob(id: string): Promise<void> {
        await apiClient.delete(`/admin/jobs/${id}`);
    }
}

export const adminApiService = new AdminApiService();
