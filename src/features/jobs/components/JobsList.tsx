import { JobCard } from "./JobCard";
import { Job } from "../types";
import { Skeleton } from "../../../shared/ui/components/skeleton";
import { Alert, AlertDescription } from "../../../shared/ui/components/alert";
import { Card, CardContent } from "../../../shared/ui/components/card";
import { Button } from "../../../shared/ui/components/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { ApiError } from "../../../core/api";

interface JobsListProps {
  jobs: Job[];
  loading?: boolean;
  error?: ApiError | null;
  onJobClick: (job: Job) => void;
}

import { useFavorites } from "../hooks/useFavorites";

import { JobCardSkeleton } from "./JobCardSkeleton";

import { motion } from "framer-motion";

export function JobsList({ jobs = [], loading = false, error = null, onJobClick }: JobsListProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  // Defensive filtering: remove jobs with missing critical info to avoid "empty ads"
  const validJobs = jobs.filter(job => job.title && job.company && job.salary);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <h2 className="text-2xl font-bold text-foreground">
              Загрузка вакансий...
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <JobCardSkeleton key={index} />
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
          Найдено {validJobs.length} предложений
        </h2>
        <p className="text-muted-foreground">
          Актуальные вакансии, подработки и проекты
        </p>
      </div>

      {validJobs.length === 0 ? (
        <Card className="border-dashed py-12 px-6 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Вакансии не найдены</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              К сожалению, по вашему запросу ничего не нашлось. Попробуйте сбросить фильтры или использовать другие ключевые слова.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="hover:bg-blue-600 hover:text-white transition-colors"
            >
              Сбросить все фильтры
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid gap-6 md:grid-cols-1 lg:grid-cols-1"
        >
          {validJobs.map((job) => (
            <motion.div
              key={job.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <JobCard
                job={job}
                onJobClick={onJobClick}
                isFavorite={isFavorite(job.id)}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
