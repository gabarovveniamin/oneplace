import { apiClient } from './client';

export interface Application {
    id: string;
    job_id: string;
    user_id: string;
    status: 'pending' | 'viewed' | 'rejected' | 'accepted';
    cover_letter?: string;
    created_at: string;
    updated_at: string;

    // Joined fields
    job_title?: string;
    company?: string;
    location?: string;
    logo?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar?: string;
}

export const applicationsApiService = {
    // Apply for a job
    apply: async (jobId: string, coverLetter?: string): Promise<void> => {
        await apiClient.post(`/applications/jobs/${jobId}/apply`, { coverLetter });
    },

    // Get my applications (candidate)
    getMyApplications: async (): Promise<Application[]> => {
        const response = await apiClient.get<Application[]>('/applications/my');
        return response.data;
    },

    // Get applications for employer's jobs
    getEmployerApplications: async (): Promise<Application[]> => {
        const response = await apiClient.get<Application[]>('/applications/employer');
        return response.data;
    },

    // Update application status
    updateStatus: async (applicationId: string, status: string): Promise<void> => {
        await apiClient.patch(`/applications/${applicationId}/status`, { status });
    }
};
