import React, { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { ArrowLeft, User, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { authApiService } from '../../../core/api/auth';
import { Alert, AlertDescription } from '../../../shared/ui/components/alert';

interface RegistrationProps {
  onBack: () => void;
  onRegistrationComplete: () => void;
  onSwitchToLogin?: () => void;
}

export function Registration({ onBack, onRegistrationComplete, onSwitchToLogin }: RegistrationProps) {
  const [step, setStep] = useState<'register' | 'resume-choice'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        role: 'user'
      });

      console.log('✅ Регистрация успешна:', response);

      // Переходим к выбору типа резюме
      setStep('resume-choice');
    } catch (err: any) {
      console.error('❌ Ошибка регистрации:', err);

      // Обрабатываем ошибки валидации с бэкенда
      if (err?.details?.errors) {
        const backendErrors: Record<string, string> = {};
        err.details.errors.forEach((error: any) => {
          const field = error.param || error.field;
          if (field) {
            backendErrors[field] = error.msg || error.message;
          }
        });
        setErrors(backendErrors);
      } else {
        setError(err?.message || 'Произошла ошибка при регистрации. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChoice = (type: 'basic' | 'extended') => {
    // Сохраняем выбор типа резюме и переходим к созданию
    onRegistrationComplete();
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
              Регистрация успешна! Теперь давайте создадим ваше резюме
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="cursor-pointer border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6 text-center" onClick={() => handleResumeChoice('basic')}>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-200">Обычное резюме</h3>
                  <p className="text-gray-600 dark:text-white mb-4">
                    Стандартная форма с основной информацией о вас
                  </p>
                  <ul className="text-sm text-gray-500 dark:text-blue-100 space-y-1 mb-4">
                    <li>• Личная информация</li>
                    <li>• Опыт работы</li>
                    <li>• Образование</li>
                    <li>• Навыки</li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Выбрать
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer border-2 border-gray-200 hover:border-green-500 transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6 text-center" onClick={() => handleResumeChoice('extended')}>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-white font-bold text-xl">★</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-200">Расширенное резюме</h3>
                  <p className="text-gray-600 dark:text-white mb-4">
                    Детальное резюме с подтверждением навыков
                  </p>
                  <ul className="text-sm text-gray-500 dark:text-green-100 space-y-1 mb-4">
                    <li>• Все из обычного резюме</li>
                    <li>• Тестирование навыков</li>
                    <li>• Портфолио проектов</li>
                    <li>• Рекомендации</li>
                    <li>• Приоритет в поиске</li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white">
                    Выбрать (Рекомендуется)
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
