import { apiClient } from './client';
import { UserResponse } from './auth';
import { JobResponse } from './types';

interface AdminUsersData {
    users: UserResponse[];
}

interface AdminJobsData {
    jobs: JobResponse[];
}

export class AdminApiService {
    // Получить всех пользователей
    async getAllUsers(): Promise<UserResponse[]> {
        const response = await apiClient.get<AdminUsersData>('/admin/users');
        return response.data.users;
    }

    // Удалить пользователя
    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(`/admin/users/${id}`);
    }

    // Получить все вакансии
    async getAllJobs(): Promise<JobResponse[]> {
        const response = await apiClient.get<AdminJobsData>('/admin/jobs');
        return response.data.jobs;
    }

    // Удалить вакансию
    async deleteJob(id: string): Promise<void> {
        await apiClient.delete(`/admin/jobs/${id}`);
    }
}

export const adminApiService = new AdminApiService();
