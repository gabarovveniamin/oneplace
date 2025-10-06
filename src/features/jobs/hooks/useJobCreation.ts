import { useState } from 'react';
import { jobsApiService } from '../../../core/api/jobs';
import { CreateJobRequest, JobResponse, ApiError } from '../../../core/api/types';

export interface UseJobCreationReturn {
  createJob: (jobData: CreateJobRequest) => Promise<JobResponse>;
  isCreating: boolean;
  error: ApiError | null;
  success: boolean;
  reset: () => void;
}

export function useJobCreation(): UseJobCreationReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState(false);

  const createJob = async (jobData: CreateJobRequest): Promise<JobResponse> => {
    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await jobsApiService.createJob(jobData);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.response?.data?.message || err.message || 'Ошибка при создании вакансии',
        code: err.response?.data?.code,
        details: err.response?.data?.details
      };
      setError(apiError);
      throw apiError;
    } finally {
      setIsCreating(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setIsCreating(false);
  };

  return {
    createJob,
    isCreating,
    error,
    success,
    reset
  };
}
