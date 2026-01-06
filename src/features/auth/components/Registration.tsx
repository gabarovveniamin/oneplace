import React, { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { ArrowLeft, User, Mail, Lock, AlertCircle, CheckCircle, Briefcase, ChevronRight, UserPlus, MapPin } from "lucide-react";
import { authApiService, UserResponse } from '../../../core/api/auth';
import { ApiError } from '../../../core/api';
import { Alert, AlertDescription } from '../../../shared/ui/components/alert';
import { cn } from '../../../shared/ui/components/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
      newErrors.firstName = 'Имя обязательно';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email (например, name@example.com)';
    }

    if (!formData.password) {
      newErrors.password = 'Придумайте пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Минимум 6 символов для вашей безопасности';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Повторите пароль';
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

      setRegisteredUser(response.user);

      if (role === 'employer') {
        onRegistrationComplete(response.user);
      } else {
        setStep('resume-choice');
      }
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
        setError(apiError.message || 'Произошла ошибка при регистрации. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChoice = (type: 'basic' | 'extended') => {
    if (onResumeChoice) {
      onResumeChoice(type, registeredUser || undefined);
    } else {
      onRegistrationComplete(registeredUser || undefined);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#0A0C10] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />

      <AnimatePresence mode="wait">
        {step === 'register' ? (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl relative z-10"
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
                  Станьте частью сообщества профессионалов
                </p>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form className="space-y-5" onSubmit={handleRegistration}>
                  {error && (
                    <Alert variant="destructive" className="bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "cursor-pointer rounded-2xl border-2 p-4 text-center transition-all duration-300",
                        role === 'user'
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
                          : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20"
                      )}
                      onClick={() => setRole('user')}
                    >
                      <User className={cn("mx-auto mb-2 h-6 w-6", role === 'user' ? "text-blue-600" : "text-slate-400")} />
                      <div className={cn("font-bold text-sm", role === 'user' ? "text-blue-600" : "text-slate-500")}>Соискатель</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "cursor-pointer rounded-2xl border-2 p-4 text-center transition-all duration-300",
                        role === 'employer'
                          ? "border-green-500 bg-green-50/50 dark:bg-green-500/10"
                          : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20"
                      )}
                      onClick={() => setRole('employer')}
                    >
                      <Briefcase className={cn("mx-auto mb-2 h-6 w-6", role === 'employer' ? "text-green-600" : "text-slate-400")} />
                      <div className={cn("font-bold text-sm", role === 'employer' ? "text-green-600" : "text-slate-500")}>Работодатель</div>
                    </motion.div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1">Имя</Label>
                      <Input
                        placeholder="Александр"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={cn("h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent transition-all", errors.firstName && "border-red-500 focus:border-red-500")}
                        disabled={loading}
                      />
                      {errors.firstName && <p className="text-[10px] text-red-500 font-medium ml-1">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1">Фамилия</Label>
                      <Input
                        placeholder="Иванов"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={cn("h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent transition-all", errors.lastName && "border-red-500 focus:border-red-500")}
                        disabled={loading}
                      />
                      {errors.lastName && <p className="text-[10px] text-red-500 font-medium ml-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold ml-1">Email адрес</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={cn("pl-10 h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent transition-all", errors.email && "border-red-500 focus:border-red-500")}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 font-medium ml-1">{errors.email}</p>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1">Пароль</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={cn("pl-10 h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent transition-all", errors.password && "border-red-500 focus:border-red-500")}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1">Подтверждение</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={cn("pl-10 h-11 bg-slate-100/50 dark:bg-slate-800/50 border-transparent transition-all", errors.confirmPassword && "border-red-500 focus:border-red-500")}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                  {(errors.password || errors.confirmPassword) && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.password || errors.confirmPassword}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/25 mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Создание аккаунта...</span>
                      </div>
                    ) : 'Создать аккаунт'}
                  </Button>

                  <div className="text-center pt-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Уже есть аккаунт?{' '}
                      <button type="button" className="text-blue-600 hover:text-blue-700 font-bold" onClick={onSwitchToLogin}>
                        Войти
                      </button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="success-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl relative z-10"
          >
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <CardTitle className="text-4xl font-extrabold tracking-tight">
                  Поздравляем!
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-300 text-xl">
                  Ваш аккаунт в <span className="font-bold text-blue-600">OnePlace</span> готов.
                  Начнем строить вашу карьеру?
                </p>

                <div className="grid gap-6 md:grid-cols-2 mt-12">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/20 cursor-pointer text-left group hover:border-blue-500/50 transition-all"
                    onClick={() => handleResumeChoice('basic')}
                  >
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Пропустить</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Перейти к ленте вакансий сразу. Резюме можно заполнить позже.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="p-6 rounded-3xl border-2 border-blue-500 bg-blue-500/5 cursor-pointer text-left relative overflow-hidden group"
                    onClick={() => handleResumeChoice('extended')}
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <div className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">Рекомендуем</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-4">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Настроить резюме</h3>
                    <p className="text-sm text-slate-600 dark:text-blue-100/70">
                      В 5 раз повышает шансы на приглашение от топовых компаний.
                    </p>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}