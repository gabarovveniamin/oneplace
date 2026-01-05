import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Edit2,
    Download,
    Calendar,
    Building2,
    GraduationCap,
    Code2,
    Trophy,
    ExternalLink,
    User,
    Github,
    Linkedin,
    UserPlus,
    UserCheck,
    Clock,
    ShieldCheck
} from "lucide-react";
import { friendshipAPI, FriendshipStatus } from '../../../core/api/friendships';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Badge } from "../../../shared/ui/components/badge";
import { Separator } from "../../../shared/ui/components/separator";
import { resumeApiService, ResumeData } from '../../../core/api/resume';
import { authApiService, UserResponse } from '../../../core/api/auth';

interface ResumeViewerProps {
    onBack: () => void;
    onEdit?: () => void;
    userId?: string;
    readOnly?: boolean;
    onFriendRequestSent?: () => void;
}

export function ResumeViewer({ onBack, onEdit, userId, readOnly = false }: ResumeViewerProps) {
    const [resume, setResume] = useState<ResumeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserResponse | null>(null); // For avatar and name if not in resume
    const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>({ status: 'none' });
    const [friendActionLoading, setFriendActionLoading] = useState(false);

    const isOwnResume = !userId || (authApiService.getCurrentUser()?.id === userId);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // If userId is provided, we fetch that user's resume and profile
                // Otherwise we fetch 'me'
                const [resumeData, profileData] = await Promise.all([
                    resumeApiService.getResume(userId),
                    authApiService.getProfile(userId)
                ]);

                setResume(resumeData);
                setUserProfile(profileData);

                // Load friendship status if viewing someone else
                if (userId && !isOwnResume) {
                    try {
                        const status = await friendshipAPI.getFriendshipStatus(userId);
                        setFriendshipStatus(status);
                    } catch (e) {
                        console.warn('Failed to load friendship status', e);
                    }
                }
            } catch (err: any) {
                console.error('Failed to load resume data', err);
                setError('Не удалось загрузить резюме');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500">Загрузка резюме...</p>
                </div>
            </div>
        );
    }

    if (error || !resume) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <div className="mb-4 bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Briefcase className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Резюме не найдено</h3>
                        <p className="text-gray-500 mb-6">{error || "Пользователь еще не создал резюме."}</p>
                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={onBack}>Назад</Button>
                            {!readOnly && onEdit && <Button onClick={onEdit}>Создать резюме</Button>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Helper to format currency
    const formatSalary = (salary: string) => {
        if (!salary) return '';
        if (salary.includes('₽') || salary.includes('$')) return salary;
        return `${salary.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₽`;
    };

    return (
        <div className="resume-viewer-container">
            {/* Control Bar - Not Visible in Print */}
            <div className="resume-controls print:hidden">
                <Button variant="ghost" onClick={onBack} className="hover:bg-gray-200 dark:hover:bg-gray-800">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    К профилю
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                    {!readOnly && onEdit && (
                        <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Edit2 className="h-4 w-4 mr-2" />
                            Редактировать
                        </Button>
                    )}

                    {!isOwnResume && (
                        <div className="flex gap-2">
                            {friendshipStatus.status === 'none' && (
                                <Button
                                    onClick={async () => {
                                        if (!userId) return;
                                        setFriendActionLoading(true);
                                        try {
                                            const res = await friendshipAPI.sendFriendRequest(userId);
                                            setFriendshipStatus({ id: res.id, direction: 'outgoing', status: 'pending' });
                                        } finally { setFriendActionLoading(false); }
                                    }}
                                    disabled={friendActionLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Добавить в друзья
                                </Button>
                            )}
                            {friendshipStatus.status === 'pending' && friendshipStatus.direction === 'outgoing' && (
                                <Button disabled variant="secondary" className="bg-gray-100 text-gray-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Заявка отправлена
                                </Button>
                            )}
                            {friendshipStatus.status === 'pending' && friendshipStatus.direction === 'incoming' && (
                                <Button
                                    onClick={async () => {
                                        if (!friendshipStatus.id) return;
                                        setFriendActionLoading(true);
                                        try {
                                            await friendshipAPI.acceptFriendRequest(friendshipStatus.id);
                                            setFriendshipStatus({ ...friendshipStatus, status: 'accepted' });
                                        } finally { setFriendActionLoading(false); }
                                    }}
                                    disabled={friendActionLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Принять заявку
                                </Button>
                            )}
                            {friendshipStatus.status === 'accepted' && (
                                <Button disabled variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    В друзьях
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Resume Paper */}
            <div className="resume-paper">

                {/* LEFT SIDEBAR - Dark */}
                <div className="resume-sidebar">

                    {/* Avatar */}
                    {userProfile?.avatar && (
                        <div className="resume-avatar-container">
                            <img src={userProfile.avatar} alt="Profile" className="resume-avatar-img" />
                        </div>
                    )}

                    {/* Contacts */}
                    <div className="resume-contacts">
                        {resume.phone && (
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="contact-label">Телефон</p>
                                    <span className="contact-value">{resume.phone}</span>
                                </div>
                            </div>
                        )}
                        {userProfile?.email && (
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="contact-label">Email</p>
                                    <span className="contact-value break-all">{userProfile.email}</span>
                                </div>
                            </div>
                        )}
                        {resume.city && (
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="contact-label">Город</p>
                                    <span className="contact-value">{resume.city}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* About Me */}
                    {resume.summary && (
                        <div className="resume-section-sidebar">
                            <h3 className="section-title-sidebar">
                                Обо мне
                            </h3>
                            <p className="section-content-sidebar">
                                {resume.summary}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT CONTENT - White & Top Banner */}
                <div className="resume-main">

                    {/* Top Banner - Name & Role */}
                    <div className="resume-header">
                        <h1 className="resume-name">
                            {userProfile?.firstName} <span className="resume-lastname">{userProfile?.lastName}</span>
                        </h1>
                        <div className="resume-role-container">
                            <p className="resume-role">{resume.title}</p>
                            {resume.salary && (
                                <span className="resume-salary">
                                    {formatSalary(resume.salary)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="resume-body">

                        {/* Experience */}
                        {resume.experience && resume.experience.length > 0 && (
                            <section>
                                <h3 className="section-title-main">
                                    Опыт работы
                                </h3>
                                <div className="space-y-8">
                                    {resume.experience.map((exp) => (
                                        <div key={exp.id} className="group">
                                            <div className="experience-header">
                                                <h4 className="experience-role">{exp.position}</h4>
                                                <span className="experience-period">{exp.period}</span>
                                            </div>
                                            <div className="experience-company">{exp.company}</div>
                                            <p className="experience-desc">
                                                {exp.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Projects */}
                        {resume.projects && resume.projects.length > 0 && (
                            <section>
                                <h3 className="section-title-main mt-8">
                                    Проекты
                                </h3>
                                <div className="projects-grid">
                                    {resume.projects.map((project) => (
                                        <div key={project.id} className="project-card">
                                            <div className="project-header">
                                                <h4 className="project-title">{project.title}</h4>
                                            </div>
                                            <p className="project-desc">{project.description}</p>
                                            <div className="project-tech">
                                                {project.technologies?.map((tech, i) => (
                                                    <span key={i} className="tech-tag">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {resume.education && resume.education.length > 0 && (
                            <section>
                                <h3 className="section-title-main mt-8">
                                    Образование
                                </h3>
                                <div className="space-y-6">
                                    {resume.education.map((edu) => (
                                        <div key={edu.id}>
                                            <h4 className="education-uni">{edu.university}</h4>
                                            <p className="education-degree">{edu.degree}</p>
                                            <p className="education-year">{edu.year}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Skills */}
                        {resume.skills && resume.skills.length > 0 && (
                            <section>
                                <h3 className="section-title-main mt-8">
                                    Навыки
                                </h3>
                                <div className="skills-grid">
                                    {resume.skills.map((skill, i) => (
                                        <div key={i}>
                                            <div className="skill-header">
                                                <span className="skill-name">{skill}</span>
                                            </div>
                                            <div className="skill-bar-bg">
                                                <div
                                                    className="skill-bar-fill"
                                                    style={{ width: `${Math.floor(Math.random() * (95 - 60) + 60)}%` }} // Visual simulation
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            </div>

            <style>{`
                /* General Layout */
                .resume-viewer-container {
                    min-height: 100vh;
                    background-color: #f3f4f6;
                    padding: 2rem 1rem;
                    font-family: ui-sans-serif, system-ui, sans-serif;
                }
                .resume-controls {
                    max-width: 210mm;
                    margin: 0 auto 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .resume-paper {
                    max-width: 210mm;
                    margin: 0 auto;
                    background-color: white;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    display: flex;
                    flex-direction: column;
                    min-height: 297mm; /* A4 height */
                }
                @media (min-width: 768px) {
                    .resume-paper {
                        flex-direction: row;
                    }
                }

                /* Sidebar */
                .resume-sidebar {
                    width: 100%;
                    background-color: #333333;
                    color: white;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                }
                @media (min-width: 768px) {
                    .resume-sidebar {
                        width: 35%;
                    }
                }

                /* Header & Main */
                .resume-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background-color: white;
                    color: #111827;
                }

                .resume-header {
                    background-color: #333333;
                    color: white;
                    padding: 2rem;
                    padding-top: 3rem;
                }
                @media (min-width: 768px) {
                    .resume-header {
                        margin-left: -1px; /* Overlap border if any */
                    }
                }

                .resume-body {
                    padding: 2rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 3rem;
                }

                /* Typography & Elements */
                .resume-name {
                    font-size: 2.25rem;
                    line-height: 2.5rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                    margin-bottom: 1rem;
                }
                @media (min-width: 768px) {
                    .resume-name { font-size: 3rem; line-height: 1; }
                }
                .resume-lastname { font-weight: 300; display: block; }
                @media (min-width: 768px) { .resume-lastname { display: inline; } }

                .resume-role-container { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; }
                .resume-role { font-size: 1.125rem; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.9; font-weight: 500; }
                .resume-salary { border: 1px solid rgba(255,255,255,0.3); padding: 0.125rem 0.625rem; font-size: 0.75rem; border-radius: 9999px; }

                /* Avatar & Contacts */
                .resume-avatar-container { display: flex; justify-content: center; margin-bottom: 1.5rem; }
                .resume-avatar-img { width: 8rem; height: 8rem; border-radius: 9999px; border: 4px solid #6b7280; object-fit: cover; }
                
                .resume-contacts { display: flex; flex-direction: column; gap: 1.5rem; }
                .contact-item { display: flex; align-items: flex-start; gap: 1rem; }
                .contact-icon { width: 2rem; height: 2rem; border-radius: 9999px; background-color: white; color: #333333; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 0.25rem; }
                .contact-label { font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
                .contact-value { font-size: 0.875rem; font-weight: 500; letter-spacing: 0.025em; color: white; }

                /* Sections */
                .resume-section-sidebar { padding-top: 1.5rem; border-top: 1px solid #4b5563; }
                .section-title-sidebar { font-size: 1.125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 1.5rem; border-bottom: 2px solid white; padding-bottom: 0.5rem; display: inline-block; }
                .section-content-sidebar { color: #d1d5db; font-size: 0.875rem; line-height: 1.625; text-align: justify; white-space: pre-wrap; }

                .section-title-main { font-size: 1.25rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 2rem; color: #333333; border-bottom: 1px solid #d1d5db; padding-bottom: 0.5rem; }
                
                /* Experience Items */
                .experience-header { display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0.5rem; }
                @media (min-width: 768px) { .experience-header { flex-direction: row; align-items: baseline; } }
                .experience-role { font-size: 1.125rem; font-weight: 700; color: #333333; text-transform: uppercase; letter-spacing: 0.025em; }
                .experience-period { font-size: 0.875rem; color: #6b7280; background-color: #f3f4f6; padding: 0.25rem 0.75rem; border-radius: 9999px; white-space: nowrap; font-weight: 500; margin-top: 0.25rem; }
                @media (min-width: 768px) { .experience-period { margin-top: 0; } }
                .experience-company { font-size: 1rem; font-weight: 600; color: #4b5563; margin-bottom: 0.75rem; }
                .experience-desc { color: #4b5563; font-size: 0.875rem; line-height: 1.625; white-space: pre-wrap; }

                /* Projects */
                .projects-grid { display: grid; gap: 1.5rem; }
                .project-card { background-color: #f9fafb; padding: 1.25rem; border-left: 4px solid #333333; }
                .project-title { font-size: 1.125rem; font-weight: 700; color: #333333; text-transform: uppercase; }
                .project-desc { color: #4b5563; font-size: 0.875rem; margin-top: 0.5rem; margin-bottom: 0.75rem; }
                .project-tech { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .tech-tag { font-size: 0.75rem; padding: 0.25rem 0.5rem; background-color: white; border: 1px solid #e5e7eb; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }

                /* Education */
                .education-uni { font-size: 1.125rem; font-weight: 700; color: #333333; text-transform: uppercase; letter-spacing: 0.025em; }
                .education-degree { color: #374151; font-weight: 500; margin-top: 0.25rem; }
                .education-year { color: #6b7280; font-size: 0.875rem; font-style: italic; margin-top: 0.25rem; }

                /* Skills */
                .skills-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
                @media (min-width: 640px) { .skills-grid { grid-template-columns: repeat(2, 1fr); gap: 3rem; } }
                .skill-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
                .skill-name { font-weight: 700; color: #333333; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.025em; }
                .skill-bar-bg { height: 0.5rem; background-color: #e5e7eb; }
                .skill-bar-fill { height: 100%; background-color: #333333; }

                /* Utilities */
                .mt-8 { margin-top: 2rem; }
                .space-y-8 > * + * { margin-top: 2rem; }
                .space-y-6 > * + * { margin-top: 1.5rem; }
                .break-all { word-break: break-all; }
                .cursor-pointer { cursor: pointer; }

                /* Print Overrides */
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; }
                    .resume-viewer-container { padding: 0; background-color: white; }
                    .resume-controls { display: none; }
                    .resume-paper { shadow: none; max-width: none; width: 100%; box-shadow: none; min-height: auto; }
                    .resume-sidebar { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #333333 !important; color: white !important; }
                    .resume-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #333333 !important; color: white !important; }
                    .resume-body  { padding: 20px 40px; } /* Adjust padding for print to fit better */
                    .skill-bar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #333333 !important; }
                    .contact-icon { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }

            `}</style>
        </div>
    );
}
