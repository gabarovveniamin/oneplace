import { apiClient } from './client';
import { Job } from '../../shared/types/job';

export const favoritesApiService = {
    // Get all favorite jobs
    getFavorites: async (): Promise<Job[]> => {
        // ApiClient returns ApiResponse<T> ({ data: T, ... })
        // Server returns { data: Job[] }
        // So T should be Job[]
        const response = await apiClient.get<Job[]>('/favorites');
        return response.data;
    },

    // Get list of favorite job IDs (lightweight)
    getFavoriteIds: async (): Promise<string[]> => {
        // Server returns { data: string[] }
        const response = await apiClient.get<string[]>('/favorites/ids');
        return response.data;
    },

    // Add job to favorites
    addToFavorites: async (jobId: string): Promise<void> => {
        await apiClient.post(`/favorites/${jobId}`, {});
    },

    // Remove job from favorites
    removeFromFavorites: async (jobId: string): Promise<void> => {
        await apiClient.delete(`/favorites/${jobId}`);
    }
};
