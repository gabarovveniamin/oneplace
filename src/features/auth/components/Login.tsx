import React, { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { ArrowLeft, Mail, Lock, AlertCircle, Eye, EyeOff, ShieldCheck, MapPin } from "lucide-react";
import { authApiService } from '../../../core/api/auth';
import { ApiError } from '../../../core/api';
import { Alert, AlertDescription } from '../../../shared/ui/components/alert';
import { motion } from 'framer-motion';

interface LoginProps {
    onBack: () => void;
    onLoginSuccess: () => void;
    onSwitchToRegister?: () => void;
}

export function Login({ onBack, onLoginSuccess, onSwitchToRegister }: LoginProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        setError(null);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Универсальная проверка email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен для заполнения';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Введите корректный email (например, name@example.com)';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен для заполнения';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await authApiService.login({
                email: formData.email.trim(),
                password: formData.password
            });
            onLoginSuccess();
        } catch (err: any) {
            const apiError = err as ApiError;
            if (apiError.details?.errors) {
                const backendErrors: Record<string, string> = {};
                apiError.details.errors.forEach((error: any) => {
                    const field = error.param || error.field;
                    if (field) {
                        backendErrors[field] = error.msg || error.message;
                    }
                });
                setErrors(backendErrors);
            } else {
                setError(apiError.message || 'Неверный email или пароль');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#0A0C10] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-0 shadow-2xl shadow-blue-500/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-green-500" />

                    <CardHeader className="text-center pt-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl flex items-center space-x-2">
                                <MapPin className="w-8 h-8 text-blue-600" />
                                <div className="flex text-2xl font-bold tracking-tight">
                                    <span className="text-blue-600">One</span>
                                    <span className="text-green-500">Place</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Добро пожаловать обратно в экосистему
                        </p>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <form className="space-y-5" onSubmit={handleLogin}>
                            {error && (
                                <Alert variant="destructive" className="bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold">Email адрес</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className={`pl-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus:border-blue-500/50 transition-all ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={loading}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-xs text-red-500 font-medium ml-1"
                                    >
                                        {errors.email}
                                    </motion.p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" text-sm font-semibold>Пароль</Label>
                                    <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                        Забыли пароль?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Введите пароль"
                                        className={`pl-10 pr-10 h-12 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus:border-blue-500/50 transition-all ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        disabled={loading}
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-xs text-red-500 font-medium ml-1"
                                    >
                                        {errors.password}
                                    </motion.p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/25 mt-6"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Вход...</span>
                                    </div>
                                ) : 'Войти в аккаунт'}
                            </Button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Или</span>
                                </div>
                            </div>

                            <div className="text-center pt-6">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Нет аккаунта?{' '}
                                    <button
                                        type="button"
                                        onClick={onSwitchToRegister}
                                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all"
                                    >
                                        Создать профиль
                                    </button>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
