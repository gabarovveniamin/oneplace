import React, { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Badge } from "../../../shared/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { ImageWithFallback } from "../../../shared/ui/figma/ImageWithFallback";
import { ArrowLeft, MapPin, Clock, Building, CheckCircle } from "lucide-react";
import { Job } from "../types";
import { applicationsApiService } from '../../../core/api/applications';
import { authApiService } from '../../../core/api/auth';
import { ApiError } from '../../../core/api';

interface JobDetailsProps {
  job: Job;
  onBack: () => void;
}

export function JobDetails({ job, onBack }: JobDetailsProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const skills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'];
  const requirements = [
    'Опыт работы с React от 2 лет',
    'Знание TypeScript и современного JavaScript',
    'Опыт работы с REST API и GraphQL',
    'Понимание принципов разработки UI/UX',
    'Знание системы контроля версий Git'
  ];

  const handleApply = async () => {
    if (!authApiService.isAuthenticated()) {
      alert('Пожалуйста, войдите в систему, чтобы откликнуться');
      return;
    }

    try {
      setIsApplying(true);
      await applicationsApiService.apply(job.id);
      setHasApplied(true);
    } catch (error: any) {
      const apiError = error as ApiError;
      if (apiError.message && apiError.message.includes('already applied')) {
        setHasApplied(true);
      } else {
        console.error('Failed to apply:', apiError);
        alert('Не удалось откликнуться: ' + (apiError.message || 'Unknown error'));
      }
    } finally {
      setIsApplying(false);
    }
  };

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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-blue-600 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к поиску
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="shadow-md border border-border bg-card">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                    {job.logo ? (
                      <ImageWithFallback
                        src={job.logo}
                        alt={job.company || 'Company'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-xl">
                        {job.company ? job.company.charAt(0) : '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-3 text-foreground">{job.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company || 'Компания не указана'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.postedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getTypeColor(job.type)}>
                        {getTypeLabel(job.type)}
                      </Badge>
                      <span className="font-bold text-green-600 dark:text-green-400 text-xl bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                        {job.salary}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  <div>
                    <h3 className="font-semibold mb-4 text-foreground text-lg border-l-4 border-blue-500 pl-3">
                      Описание вакансии
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <p className="text-muted-foreground leading-relaxed">
                        {job.description} Мы ищем талантливого разработчика для работы над современными веб-приложениями.
                        Вы будете работать в команде профессионалов над интересными проектами,
                        используя передовые технологии и методы разработки.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 text-foreground text-lg border-l-4 border-green-500 pl-3">
                      Требования
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <ul className="space-y-3">
                        {requirements.map((req, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 text-foreground text-lg border-l-4 border-purple-500 pl-3">
                      Ключевые навыки
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-accent hover:bg-accent/80 text-accent-foreground border border-border/50 px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-md border border-border bg-card sticky top-24">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {hasApplied ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md cursor-default" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Вы откликнулись
                    </Button>
                  ) : (
                    <Button
                      onClick={handleApply}
                      disabled={isApplying}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                    >
                      {isApplying ? 'Отправка...' : 'Откликнуться'}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full border-border hover:bg-accent">
                    Сохранить вакансию
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <h4 className="font-semibold text-foreground mb-4">Подтверждение навыков</h4>
                  <div className="space-y-3">
                    {skills.slice(0, 3).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                        <span className="text-sm text-muted-foreground font-medium">{skill}</span>
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    Пройти тест навыков
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg p-4 border border-border/50">
                    <h5 className="font-semibold text-sm text-foreground mb-2">💡 Совет</h5>
                    <p className="text-xs text-muted-foreground">
                      Пройдите тест навыков, чтобы увеличить шансы на получение этой вакансии
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}