import React, { useEffect, useState } from 'react';
import { adminApiService } from '../../../core/api/admin';
import { UserResponse } from '../../../core/api/auth';
import { JobResponse } from '../../../core/api/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/components/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/ui/components/table";
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Badge } from "../../../shared/ui/components/badge";
import { Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../../shared/ui/components/alert";

interface AdminDashboardProps {
    onBack?: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [jobs, setJobs] = useState<JobResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            if (activeTab === "users") {
                const data = await adminApiService.getAllUsers();
                setUsers(data);
            } else {
                const data = await adminApiService.getAllJobs();
                setJobs(data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminApiService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete user');
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await adminApiService.deleteJob(id);
            setJobs(jobs.filter(j => j.id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete job');
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                {onBack && (
                    <Button variant="outline" onClick={onBack}>
                        Назад на главную
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="jobs">Jobs</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users Management ({users.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="py-10 text-center">Loading...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Registered</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                            {user.avatar ? (
                                                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs">{user.firstName[0]}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{user.firstName} {user.lastName}</div>
                                                            {/* <div className="text-xs text-muted-foreground">{user.id}</div> */}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'admin' ? 'default' : (user.role === 'employer' ? 'secondary' : 'outline')}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={user.role === 'admin'}
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="jobs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jobs Management ({jobs.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="py-10 text-center">Loading...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Posted By</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {jobs.map((job) => (
                                            <TableRow key={job.id}>
                                                <TableCell className="font-medium">{job.title}</TableCell>
                                                <TableCell>{job.company}</TableCell>
                                                <TableCell>
                                                    {job.postedByUser ? (
                                                        <span>{job.postedByUser.firstName} {job.postedByUser.lastName}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">Unknown</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={job.isActive ? 'outline' : 'secondary'}>
                                                        {job.isActive ? 'Active' : 'Closed'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteJob(job.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
