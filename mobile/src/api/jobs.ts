import apiClient from './client';
import { API_ENDPOINTS } from '../config/api';

export interface Job {
    id: number;
    title: string;
    company: string;
    description?: string;
    requirements?: string;
    location: string;
    job_type: 'full_time' | 'part_time' | 'internship' | 'contract' | 'remote';
    salary_range: string;
    apply_type: 'google_form' | 'email' | 'in_app' | 'external';
    apply_target?: string;
    posted_at: string;
    deadline?: string;
    active: boolean;
    featured: boolean;
    applications_count: number;
    posted_by_name?: string;
}

export interface JobFilters {
    company?: string;
    job_type?: string;
    search?: string;
    page?: number;
}

export interface ApplicationData {
    name: string;
    email: string;
    phone?: string;
    resume_url?: string;
    cover_letter?: string;
}

export const jobsApi = {
    getJobs: async (filters?: JobFilters) => {
        const response = await apiClient.get(API_ENDPOINTS.JOBS, { params: filters });
        return response.data;
    },

    getJobDetail: async (id: number) => {
        const response = await apiClient.get(API_ENDPOINTS.JOB_DETAIL(id));
        return response.data;
    },

    applyToJob: async (jobId: number, applicationData?: ApplicationData) => {
        const response = await apiClient.post(
            API_ENDPOINTS.APPLY_TO_JOB(jobId),
            applicationData || {}
        );
        return response.data;
    },

    // Admin only
    createJob: async (jobData: Partial<Job>) => {
        const response = await apiClient.post(API_ENDPOINTS.JOBS, jobData);
        return response.data;
    },

    updateJob: async (id: number, jobData: Partial<Job>) => {
        const response = await apiClient.patch(API_ENDPOINTS.JOB_DETAIL(id), jobData);
        return response.data;
    },

    deleteJob: async (id: number) => {
        const response = await apiClient.delete(API_ENDPOINTS.JOB_DETAIL(id));
        return response.data;
    },

    uploadResume: async (formData: FormData) => {
        const response = await apiClient.post(API_ENDPOINTS.UPLOAD_RESUME, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getApplications: async () => {
        const response = await apiClient.get(API_ENDPOINTS.APPLICATIONS);
        return response.data;
    },
};
