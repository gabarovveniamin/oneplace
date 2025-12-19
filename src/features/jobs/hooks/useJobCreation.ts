import { useState } from 'react';
import { jobsApiService } from '../../../core/api/jobs';
import { CreateJobRequest, JobResponse } from '../../../core/api/types';
import { ApiError } from '../../../core/api';

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
      setError(err as ApiError);
      throw err;
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
