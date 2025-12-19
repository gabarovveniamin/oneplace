import React, { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { ArrowLeft, User, Mail, Lock, AlertCircle, CheckCircle, Briefcase } from "lucide-react";
import { authApiService, UserResponse } from '../../../core/api/auth';
import { ApiError } from '../../../core/api';
import { Alert, AlertDescription } from '../../../shared/ui/components/alert';
import { cn } from '../../../shared/ui/components/utils';

interface RegistrationProps {
  onBack: () => void;
  onRegistrationComplete: (user?: UserResponse) => void;
  onSwitchToLogin?: () => void;
  onResumeChoice?: (type: 'basic' | 'extended', user?: UserResponse) => void;
}

export function Registration({ onBack, onRegistrationComplete, onSwitchToLogin, onResumeChoice }: RegistrationProps) {
  const [step, setStep] = useState<'register' | 'resume-choice'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'user' | 'employer'>('user');
  const [registeredUser, setRegisteredUser] = useState<UserResponse | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно для заполнения';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна для заполнения';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApiService.register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: role
      });

      // Store user in state incase we need it for next step
      // Note: authApiService.register returns { user, token }
      // but response type is AuthResponse which has { user: UserResponse }
      setRegisteredUser(response.user);

      // Если работодатель, сразу завершаем (без резюме)
      if (role === 'employer') {
        onRegistrationComplete(response.user);
      } else {
        // Переходим к выбору типа резюме для соискателя
        setStep('resume-choice');
      }
    } catch (err: any) {
      const apiError = err as ApiError;

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
        setError(apiError.message || 'Произошла ошибка при регистрации. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChoice = (type: 'basic' | 'extended') => {
    // В зависимости от выбора вызываем callback
    if (onResumeChoice) {
      onResumeChoice(type, registeredUser || undefined);
    } else {
      onRegistrationComplete(registeredUser || undefined);
    }
  };

  if (step === 'resume-choice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl shadow-lg border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl mb-4">
              Добро пожаловать в <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">OnePlace</span>!
            </CardTitle>
            <p className="text-gray-600 dark:text-white text-lg">
              Регистрация успешна! Хотите настроить резюме сейчас?
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="cursor-pointer border-2 border-gray-200 hover:border-gray-500 transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6 text-center" onClick={() => handleResumeChoice('basic')}>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Позже</h3>
                  <p className="text-gray-600 dark:text-white mb-4">
                    Перейти к поиску вакансий без создания резюме
                  </p>
                  <Button variant="outline" className="w-full">
                    Пропустить
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6 text-center" onClick={() => handleResumeChoice('extended')}>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-200">Настроить резюме</h3>
                  <p className="text-gray-600 dark:text-white mb-4">
                    Заполнить информацию о навыках и опыте работы
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Настроить
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={onBack} className="text-gray-600 dark:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">
            Регистрация в <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">OnePlace</span>
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Создайте аккаунт и найдите работу мечты
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleRegistration}>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                  role === 'user'
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-700"
                )}
                onClick={() => setRole('user')}
              >
                <div className={cn(
                  "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full",
                  role === 'user' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                )}>
                  <User className="h-6 w-6" />
                </div>
                <div className="font-semibold text-sm">Ищу работу</div>
              </div>

              <div
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-4 text-center transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                  role === 'employer'
                    ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                    : "border-slate-200 dark:border-slate-700"
                )}
                onClick={() => setRole('employer')}
              >
                <div className={cn(
                  "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full",
                  role === 'employer' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
                )}>
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="font-semibold text-sm">Я работодатель</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                  disabled={loading}
                  required
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Ваша фамилия"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                  disabled={loading}
                  required
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
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
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Пароль *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Уже есть аккаунт?{' '}
                <button type="button" className="text-blue-600 hover:underline" onClick={onSwitchToLogin}>
                  Войти
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
