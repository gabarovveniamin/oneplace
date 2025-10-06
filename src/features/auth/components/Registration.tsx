import { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";

interface RegistrationProps {
  onBack: () => void;
  onRegistrationComplete: () => void;
}

export function Registration({ onBack, onRegistrationComplete }: RegistrationProps) {
  const [step, setStep] = useState<'register' | 'resume-choice'>('register');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '', 
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegistration = () => {
    // Здесь была бы логика регистрации
    setStep('resume-choice');
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
              Теперь давайте создадим ваше резюме
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
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleRegistration(); }}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Ваша фамилия"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Зарегистрироваться
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Уже есть аккаунт?{' '}
                <button type="button" className="text-blue-600 hover:underline">
                  Войти
                </button>
              </p>
              <Button variant="ghost" onClick={onBack} className="text-gray-600 dark:text-gray-300">
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