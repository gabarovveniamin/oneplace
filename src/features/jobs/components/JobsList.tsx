import { JobCard } from "./JobCard";
import { Job } from "../types";
import { Skeleton } from "../../../shared/ui/components/skeleton";
import { Alert, AlertDescription } from "../../../shared/ui/components/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { ApiError } from "../../../core/api";

interface JobsListProps {
  jobs: Job[];
  loading?: boolean;
  error?: ApiError | null;
  onJobClick: (job: Job) => void;
}

import { useFavorites } from "../hooks/useFavorites";

export function JobsList({ jobs = [], loading = false, error = null, onJobClick }: JobsListProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <h2 className="text-2xl font-bold text-foreground">
              Загрузка вакансий...
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border border-border rounded-lg p-6">
              <div className="flex items-start space-x-4 mb-4">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Произошла ошибка при загрузке вакансий: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Найдено {jobs.length} предложений
        </h2>
        <p className="text-muted-foreground">
          Актуальные вакансии, подработки и проекты
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Вакансии не найдены</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobClick={onJobClick}
              isFavorite={isFavorite(job.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}