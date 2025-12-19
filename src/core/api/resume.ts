import { apiClient } from './client';

export interface Experience {
    id: string;
    company: string;
    position: string;
    period: string;
    description: string;
}

export interface Education {
    id: string;
    university: string;
    degree: string;
    year: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string[];
}

export interface ResumeData {
    id?: string;
    title: string;
    city: string;
    phone: string;
    salary: string;
    summary: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    projects: Project[];
}

export const resumeApiService = {
    getResume: async (userId?: string): Promise<ResumeData | null> => {
        try {
            const url = userId ? `/resumes/user/${userId}` : '/resumes/me';
            const response = await apiClient.get<ResumeData>(url);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch resume:', error);
            return null;
        }
    },

    updateResume: async (data: ResumeData): Promise<ResumeData> => {
        const response = await apiClient.post<ResumeData>('/resumes', data);
        return response.data;
    }
};
