import { useState, useMemo, useEffect, useCallback } from 'react';
import { Job, SearchFilters } from '../types';
import { jobsApiService } from '../../../core/api';
import { useApi } from '../../../core/hooks/useApi';
import { JobResponse, CreateJobRequest, UpdateJobRequest } from '../../../core/api/types';

export function useJobs() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // API хуки
  const {
    data: jobsData,
    loading: jobsLoading,
    error: jobsError,
    execute: fetchJobs
  } = useApi(jobsApiService.getJobs.bind(jobsApiService));

  const {
    data: searchData,
    loading: searchLoading,
    error: searchError,
    execute: searchJobs
  } = useApi(jobsApiService.searchJobs.bind(jobsApiService));

  const {
    data: createData,
    loading: createLoading,
    error: createError,
    execute: createJob
  } = useApi(jobsApiService.createJob.bind(jobsApiService));

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

  // Загружаем вакансии при монтировании
  useEffect(() => {
    loadJobs();
  }, [activeFilter]);

  // Загружаем вакансии
  const loadJobs = useCallback(async () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...(activeFilter !== 'all' && { type: activeFilter })
    };

    const result = await fetchJobs(params);
    if (result) {
      setJobs(result.data as Job[]);
      setPagination(result.pagination);
    }
  }, [activeFilter, pagination.page, pagination.limit, fetchJobs]);

  // Выполняем поиск
  const performSearch = useCallback(async (filters: SearchFilters) => {
    const searchParams = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      ...(activeFilter !== 'all' && { type: activeFilter })
    };

    const result = await searchJobs(searchParams);
    if (result) {
      setJobs(result.data as Job[]);
      setPagination(result.pagination);
    }
  }, [activeFilter, pagination.page, pagination.limit, searchJobs]);

  // Обработчики
  const handleAdvancedSearch = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
    if (Object.keys(filters).length > 0) {
      performSearch(filters);
    } else {
      loadJobs();
    }
  }, [performSearch, loadJobs]);

  const handleClearAdvancedSearch = useCallback(() => {
    setSearchFilters({});
    loadJobs();
  }, [loadJobs]);

  const handleCreateJob = useCallback(async (jobData: CreateJobRequest): Promise<Job | null> => {
    const result = await createJob(jobData);
    if (result) {
      // Перезагружаем список вакансий
      await loadJobs();
      return result as Job;
    }
    return null;
  }, [createJob, loadJobs]);

  const handleUpdateJob = useCallback(async (jobData: UpdateJobRequest): Promise<Job | null> => {
    const result = await updateJob(jobData);
    if (result) {
      // Обновляем вакансию в списке
      setJobs(prev => prev.map(job =>
        job.id === jobData.id ? { ...job, ...result } as Job : job
      ));
      return result as Job;
    }
    return null;
  }, [updateJob]);

  const handleDeleteJob = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteJob(id);
    if (result !== null) {
      // Удаляем вакансию из списка
      setJobs(prev => prev.filter(job => job.id !== id));
      return true;
    }
    return false;
  }, [deleteJob]);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Определяем текущее состояние загрузки
  const loading = jobsLoading || searchLoading;
  const error = jobsError || searchError;

  // Динамическое обновление (Polling)
  const silentReload = useCallback(async () => {
    // Не обновляем если идет активная загрузка
    if (loading) return;

    try {
      if (Object.keys(searchFilters).length > 0) {
        // Режим поиска
        const params = {
          ...searchFilters,
          page: pagination.page,
          limit: pagination.limit,
          ...(activeFilter !== 'all' && { type: activeFilter })
        };
        const result = await jobsApiService.searchJobs(params);
        if (result) {
          setJobs(result.data as Job[]);
          setPagination(result.pagination);
        }
      } else {
        // Обычный список
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...(activeFilter !== 'all' && { type: activeFilter })
        };
        const result = await jobsApiService.getJobs(params);
        if (result) {
          setJobs(result.data as Job[]);
          setPagination(result.pagination);
        }
      }
    } catch (err) {
      console.error('Silent reload failed', err);
    }
  }, [activeFilter, pagination.page, pagination.limit, searchFilters, loading]);

  useEffect(() => {
    const interval = setInterval(silentReload, 10000); // 10 sec polling
    return () => clearInterval(interval);
  }, [silentReload]);

  return {
    // Данные
    jobs,
    pagination,

    // Состояние
    loading,
    error,
    createLoading,
    updateLoading,
    deleteLoading,

    // Фильтры
    activeFilter,
    setActiveFilter,
    searchFilters,

    // Действия
    handleAdvancedSearch,
    handleClearAdvancedSearch,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handlePageChange,
    loadJobs,

    // API ошибки
    createError,
    updateError,
    deleteError
  };
}
