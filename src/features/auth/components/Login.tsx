import React, { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { ArrowLeft, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { authApiService } from '../../../core/api/auth';
import { ApiError } from '../../../core/api';
import { Alert, AlertDescription } from '../../../shared/ui/components/alert';

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
        // Очищаем ошибку для поля при изменении
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

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен для заполнения';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Некорректный формат email';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен для заполнения';
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

            // Вызываем колбэк успешного входа
            onLoginSuccess();
        } catch (err: any) {
            const apiError = err as ApiError;
            console.error('❌ Ошибка входа:', apiError);

            // Обрабатываем ошибки валидации с бэкенда
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-lg border-0">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl mb-2">
                        Вход в <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">OnePlace</span>
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                        Добро пожаловать! Войдите в свой аккаунт
                    </p>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleLogin}>
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={loading}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Пароль</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Введите пароль"
                                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    disabled={loading}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">Запомнить меня</span>
                            </label>
                            <button type="button" className="text-sm text-blue-600 hover:underline">
                                Забыли пароль?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
                            disabled={loading}
                        >
                            {loading ? 'Вход...' : 'Войти'}
                        </Button>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Нет аккаунта?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToRegister}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    Зарегистрироваться
                                </button>
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onBack}
                                className="text-gray-600 dark:text-gray-300"
                                disabled={loading}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                На главную
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
