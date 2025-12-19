import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Badge } from "../../../shared/ui/components/badge";
import { Button } from "../../../shared/ui/components/button";
import {
    Calendar,
    Building,
    User as UserIcon,
    Mail,
    FileText,
    CheckCircle,
    XCircle,
    Eye,
    MessageSquare
} from "lucide-react";
import { applicationsApiService, Application } from "../../../core/api/applications";
import { cn } from "../../../shared/ui/components/utils";
import { Alert, AlertDescription } from "../../../shared/ui/components/alert";
import { ApiError } from "../../../core/api";

interface EmployerApplicationsSectionProps {
    className?: string;
}

export function EmployerApplicationsSection({ className }: EmployerApplicationsSectionProps) {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const data = await applicationsApiService.getEmployerApplications();
            setApplications(data);
        } catch (err: any) {
            const apiError = err as ApiError;
            console.error('Failed to load employer applications', apiError);
            setError(apiError.message || 'Не удалось загрузить отклики');
        } finally {
            setLoading(false);
        }
    };

    const refreshApplications = async () => {
        try {
            const data = await applicationsApiService.getEmployerApplications();
            setApplications(data);
        } catch (err) {
            console.error('Silent refresh failed', err);
        }
    };

    useEffect(() => {
        loadApplications();
        const interval = setInterval(refreshApplications, 5000); // 5 sec poll
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (appId: string, newStatus: string) => {
        try {
            setActionLoading(appId);
            await applicationsApiService.updateStatus(appId, newStatus);
            // Optimistic update
            setApplications((prev: Application[]) => prev.map((app: Application) =>
                app.id === appId ? { ...app, status: newStatus as any } : app
            ));
        } catch (err: any) {
            const apiError = err as ApiError;
            console.error('Failed to update status', apiError);
            // Optionally could set a specific error for this row
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">На рассмотрении</Badge>;
            case 'viewed':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Просмотрено</Badge>;
            case 'rejected':
                return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Отказ</Badge>;
            case 'accepted':
                return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Приглашение</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Card className={cn("w-full mt-8", className)}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <p className="text-muted-foreground">Загрузка откликов...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mt-8">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (applications.length === 0) {
        return (
            <Card className={cn("w-full mt-8 border-dashed", className)}>
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <UserIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Нет откликов</h3>
                    <p className="text-muted-foreground max-w-sm">
                        На ваши вакансии пока никто не откликнулся.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("w-full mt-8 shadow-sm", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Отклики на ваши вакансии
                    <Badge variant="secondary" className="ml-2">
                        {applications.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="group flex flex-col md:flex-row gap-4 p-4 rounded-xl border bg-card hover:bg-accent/5 transition-all"
                    >
                        {/* Candidate Info */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                                <div
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => window.location.hash = `#profile/${app.user_id}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {app.avatar ? (
                                            <img src={app.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            (app.first_name?.[0] || 'U').toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">
                                            {app.first_name} {app.last_name}
                                        </h4>
                                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                                            <Mail className="h-3 w-3" />
                                            {app.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="md:hidden">
                                    {getStatusBadge(app.status)}
                                </div>
                            </div>

                            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                                <div className="font-medium text-foreground mb-1 flex items-center gap-2">
                                    <Building className="h-3 w-3" />
                                    Вакансия: {app.job_title}
                                </div>
                                {app.cover_letter && (
                                    <div className="mt-2 flex gap-2">
                                        <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <p className="italic">"{app.cover_letter}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(app.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-3 justify-center min-w-[200px]">
                            <div className="hidden md:block">
                                {getStatusBadge(app.status)}
                            </div>

                            <div className="flex flex-wrap justify-end gap-2 w-full">
                                {app.status === 'pending' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(app.id, 'viewed')}
                                        disabled={actionLoading === app.id}
                                        className="w-full md:w-auto"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Просмотрено
                                    </Button>
                                )}

                                {(app.status === 'pending' || app.status === 'viewed') && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                                            onClick={() => handleStatusUpdate(app.id, 'accepted')}
                                            disabled={actionLoading === app.id}
                                        >
                                            <CheckCircle className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">Пригласить</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                            disabled={actionLoading === app.id}
                                            className="w-full md:w-auto"
                                        >
                                            <XCircle className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">Отказать</span>
                                        </Button>
                                    </>
                                )}

                                {(app.status === 'accepted' || app.status === 'rejected') && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleStatusUpdate(app.id, 'pending')}
                                        disabled={actionLoading === app.id}
                                        className="text-muted-foreground"
                                    >
                                        Изменить решение
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
