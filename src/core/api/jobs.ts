import { apiClient } from './client';
import {
  JobResponse,
  CreateJobRequest,
  UpdateJobRequest,
  SearchJobsRequest,
  PaginatedResponse,
  ApiResponse
} from './types';

export class JobsApiService {
  // Получить все вакансии с пагинацией
  async getJobs(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaginatedResponse<JobResponse>> {
    const response = await apiClient.get<PaginatedResponse<JobResponse>>('/jobs', params);
    return response.data;
  }

  // Получить вакансию по ID
  async getJobById(id: string): Promise<JobResponse> {
    const response = await apiClient.get<JobResponse>(`/jobs/${id}`);
    return response.data;
  }

  // Поиск вакансий с фильтрами
  async searchJobs(searchParams: SearchJobsRequest): Promise<PaginatedResponse<JobResponse>> {
    const response = await apiClient.get<PaginatedResponse<JobResponse>>('/jobs/search', searchParams);
    return response.data;
  }

  // Создать новую вакансию
  async createJob(jobData: CreateJobRequest): Promise<JobResponse> {
    const response = await apiClient.post<JobResponse>('/jobs', jobData);
    return response.data;
  }

  // Обновить вакансию
  async updateJob(jobData: UpdateJobRequest): Promise<JobResponse> {
    const { id, ...updateData } = jobData;
    const response = await apiClient.put<JobResponse>(`/jobs/${id}`, updateData);
    return response.data;
  }

  // Удалить вакансию
  async deleteJob(id: string): Promise<void> {
    await apiClient.delete(`/jobs/${id}`);
  }

  // Получить вакансии пользователя
  async getUserJobs(userId?: string): Promise<JobResponse[]> {
    const endpoint = userId ? `/users/${userId}/jobs` : '/users/me/jobs';
    const response = await apiClient.get<JobResponse[]>(endpoint);
    return response.data;
  }

  // Получить популярные вакансии
  async getPopularJobs(limit: number = 10): Promise<JobResponse[]> {
    const response = await apiClient.get<JobResponse[]>('/jobs/popular', { limit });
    return response.data;
  }

  // Получить недавние вакансии
  async getRecentJobs(limit: number = 10): Promise<JobResponse[]> {
    const response = await apiClient.get<JobResponse[]>('/jobs/recent', { limit });
    return response.data;
  }

  // Получить статистику вакансий
  async getJobsStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byIndustry: Record<string, number>;
    byRegion: Record<string, number>;
  }> {
    const response = await apiClient.get('/jobs/stats');
    return response.data;
  }
}

// Создаем экземпляр сервиса
export const jobsApiService = new JobsApiService();
