import React, { useEffect, useState } from 'react';
import { Application, applicationsApiService } from '../../../core/api/applications';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Badge } from "../../../shared/ui/components/badge";
import { Calendar, Building, MapPin, Clock } from "lucide-react";
import { Job } from '../../../shared/types/job';

interface ApplicationsSectionProps {
    onJobClick?: (job: Job) => void;
}

import { useSocket } from '../../../core/socket/SocketContext';

export function ApplicationsSection({ onJobClick }: ApplicationsSectionProps) {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        loadApplications();
    }, []);

    // Listen for real-time status updates
    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (data: any) => {
            if (data.type === 'application_status') {
                console.log('🔄 Application status updated, refreshing list...');
                loadApplications();
            }
        };

        socket.on('notification', handleStatusUpdate);

        return () => {
            socket.off('notification', handleStatusUpdate);
        };
    }, [socket]);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const data = await applicationsApiService.getMyApplications();
            setApplications(data);
        } catch (error) {
            console.error('Failed to load applications', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">На рассмотрении</Badge>;
            case 'viewed': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Просмотрено</Badge>;
            case 'rejected': return <Badge variant="destructive">Отказ</Badge>;
            case 'accepted': return <Badge className="bg-green-600 text-white hover:bg-green-700">Приглашение</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Загрузка откликов...</div>;
    }

    if (applications.length === 0) {
        return null; // Don't show section if no applications
    }

    return (
        <Card className="shadow-sm mt-8">
            <CardHeader>
                <CardTitle>Мои отклики ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => {
                                if (onJobClick && app.job_id) {
                                    // Construct partial job object to navigate
                                    onJobClick({
                                        id: app.job_id,
                                        title: app.job_title || 'Вакансия',
                                        company: app.company || 'Компания',
                                        location: app.location || 'Нет локации',
                                        logo: app.logo,
                                        description: 'Загрузка описания...',
                                        tags: [],
                                        type: 'Полная занятость',
                                        salary: 'По договоренности',
                                        postedAt: new Date(app.created_at).toLocaleDateString()
                                    } as Job);
                                }
                            }}
                        >
                            <div className="space-y-2 mb-4 md:mb-0">
                                <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 hover:underline">
                                    {app.job_title}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-1" />
                                        {app.company}
                                    </div>
                                    {app.location && (
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {app.location}
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground mb-1">Статус</div>
                                    {getStatusBadge(app.status)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
