import { useState, useEffect, useCallback } from 'react';
import { Job } from '../types';
import { jobsApiService } from '../../../core/api';
import { useApi } from '../../../core/hooks/useApi';
import { UpdateJobRequest } from '../../../core/api/types';

export function useJob(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);

  const {
    data: jobData,
    loading,
    error,
    execute: fetchJob
  } = useApi(jobsApiService.getJobById.bind(jobsApiService));

  const {
    data: updateData,
    loading: updateLoading,
    error: updateError,
    execute: updateJob
  } = useApi(jobsApiService.updateJob.bind(jobsApiService));

  const {
    data: deleteData,
    loading: deleteLoading,
    error: deleteError,
    execute: deleteJob
  } = useApi(jobsApiService.deleteJob.bind(jobsApiService));

  // Загружаем вакансию при изменении ID
  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  // Обновляем локальное состояние при получении данных
  useEffect(() => {
    if (jobData) {
      setJob(jobData as Job);
    }
  }, [jobData]);

  const loadJob = useCallback(async () => {
    if (jobId) {
      await fetchJob(jobId);
    }
  }, [jobId, fetchJob]);

  const handleUpdateJob = useCallback(async (jobData: UpdateJobRequest): Promise<Job | null> => {
    const result = await updateJob(jobData);
    if (result) {
      setJob(result as Job);
      return result as Job;
    }
    return null;
  }, [updateJob]);

  const handleDeleteJob = useCallback(async (): Promise<boolean> => {
    if (!jobId) return false;
    
    const result = await deleteJob(jobId);
    return result !== null;
  }, [jobId, deleteJob]);

  return {
    job,
    loading,
    error,
    updateLoading,
    deleteLoading,
    updateError,
    deleteError,
    handleUpdateJob,
    handleDeleteJob,
    loadJob
  };
}
