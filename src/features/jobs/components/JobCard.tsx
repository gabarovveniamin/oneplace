import { Card, CardContent, CardFooter } from "../../../shared/ui/components/card";
import { Badge } from "../../../shared/ui/components/badge";
import { Button } from "../../../shared/ui/components/button";
import { ImageWithFallback } from "../../../shared/ui/figma/ImageWithFallback";
import { MapPin, Clock, Heart } from "lucide-react";
import { Job } from "../types";

interface JobCardProps {
  job: Job;
  onJobClick: (job: Job) => void;
}

export function JobCard({ job, onJobClick }: JobCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'daily': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'projects': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'travel': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-accent text-accent-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'Постоянная работа';
      case 'daily': return 'Подработка';
      case 'projects': return 'Проект';
      case 'travel': return 'Командировка';
      default: return type;
    }
  };

  return (
    <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group border border-border bg-card shadow-md">
      <CardContent className="p-6" onClick={() => onJobClick(job)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border group-hover:shadow-md transition-shadow">
              {job.logo ? (
                <ImageWithFallback
                  src={job.logo}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">
                  {job.company.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 text-foreground font-semibold text-lg">
                {job.title}
              </h3>
              <p className="text-muted-foreground font-medium">{job.company}</p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-accent">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 mb-4 border border-border/50">
          <p className="text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 bg-muted/50 px-2 py-1 rounded-md">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center space-x-1 bg-muted/50 px-2 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span>{job.postedAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge className={`${getTypeColor(job.type)} border border-border/50`}>
              {getTypeLabel(job.type)}
            </Badge>
            {job.tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-accent hover:bg-accent/80 text-accent-foreground border border-border/50"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800">
            <span className="font-bold text-green-600 dark:text-green-400">{job.salary}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Нажмите для просмотра</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}