import { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { Textarea } from "../../../shared/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/components/select";
import { Badge } from "../../../shared/ui/components/badge";
import { Alert, AlertDescription } from "../../../shared/ui/components/alert";
import { useJobCreation } from '../../jobs/hooks/useJobCreation';
import { CreateJobRequest } from '../../../core/api/types';
import {
  ArrowLeft,
  Building,
  FileText,
  Upload,
  Plus,
  X,
  CheckCircle,
  Eye,
  AlertCircle,
  Loader2
} from "lucide-react";

interface PostJobProps {
  onBack: () => void;
}

export function PostJob({ onBack }: PostJobProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    salary: '',
    location: '',
    type: '' as CreateJobRequest['type'] | '',
    description: '',
    requirements: '',
    benefits: '',
    contactEmail: '',
    contactPhone: '',
    // Дополнительные поля для API
    specialization: '',
    industry: '',
    region: '',
    salaryFrom: undefined as number | undefined,
    salaryTo: undefined as number | undefined,
    salaryFrequency: 'monthly' as CreateJobRequest['salaryFrequency'],
    education: undefined as CreateJobRequest['education'],
    experience: undefined as CreateJobRequest['experience'],
    employmentType: undefined as CreateJobRequest['employmentType'],
    schedule: undefined as CreateJobRequest['schedule'],
    workHours: undefined as number | undefined,
    workFormat: undefined as CreateJobRequest['workFormat']
  });

  const { createJob, isCreating, error, success } = useJobCreation();
  const totalSteps = 3;

  const popularTags = [
    'React', 'TypeScript', 'JavaScript', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'HTML/CSS', 'PostgreSQL', 'MongoDB',
    'Docker', 'AWS', 'Git', 'Agile', 'Scrum', 'Remote', 'Гибкий график'
  ];

  const jobTypes = [
    { value: 'full-time', label: 'Постоянная работа' },
    { value: 'daily', label: 'Подработка на день' },
    { value: 'projects', label: 'Проект/Стартап' },
    { value: 'travel', label: 'Командировка' }
  ];

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handlePublish = async () => {
    try {
      // Подготовка данных для API
      const apiJobData: CreateJobRequest = {
        title: jobData.title,
        company: jobData.company,
        salary: jobData.salary,
        location: jobData.location,
        type: jobData.type as CreateJobRequest['type'],
        description: jobData.description,
        tags: selectedTags,
        specialization: jobData.specialization || undefined,
        industry: jobData.industry || undefined,
        region: jobData.region || undefined,
        salaryFrom: jobData.salaryFrom,
        salaryTo: jobData.salaryTo,
        salaryFrequency: jobData.salaryFrequency,
        education: jobData.education,
        experience: jobData.experience,
        employmentType: jobData.employmentType,
        schedule: jobData.schedule,
        workHours: jobData.workHours,
        workFormat: jobData.workFormat
      };

      await createJob(apiJobData);

      // Успешное создание
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error) {
      console.error('Ошибка при создании вакансии:', error);
      // Ошибка уже обработана в хуке
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>Основная информация о вакансии</span>
              </CardTitle>
              <p className="text-gray-600">Заполните основные данные о вашем предложении</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Название вакансии *</Label>
                <Input
                  id="title"
                  placeholder="Например: Senior Frontend разработчик"
                  value={jobData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="company">Название компании *</Label>
                <Input
                  id="company"
                  placeholder="Ваша компания"
                  value={jobData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="type">Тип работы *</Label>
                  <Select value={jobData.type} onValueChange={(value: string) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Местоположение *</Label>
                  <Input
                    id="location"
                    placeholder="Москва / Удаленно"
                    value={jobData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="salary">Зарплата *</Label>
                <Input
                  id="salary"
                  placeholder="150 000 - 200 000 ₽ / 3 000 ₽/день"
                  value={jobData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Укажите зарплатную вилку или ставку. Честная зарплата привлекает лучших кандидатов.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="salaryFrom">Зарплата от (₽)</Label>
                  <Input
                    id="salaryFrom"
                    type="number"
                    placeholder="150000"
                    value={jobData.salaryFrom || ''}
                    onChange={(e) => handleInputChange('salaryFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="salaryTo">Зарплата до (₽)</Label>
                  <Input
                    id="salaryTo"
                    type="number"
                    placeholder="200000"
                    value={jobData.salaryTo || ''}
                    onChange={(e) => handleInputChange('salaryTo', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="specialization">Специализация</Label>
                  <Input
                    id="specialization"
                    placeholder="Frontend разработка"
                    value={jobData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Отрасль</Label>
                  <Input
                    id="industry"
                    placeholder="IT, Финансы, Медицина"
                    value={jobData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Логотип компании</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Загрузите логотип компании (необязательно)</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Выбрать файл
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Описание и требования</span>
              </CardTitle>
              <p className="text-gray-600">Подробно опишите вакансию и требования к кандидатам</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="description">Описание вакансии *</Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Опишите суть работы, задачи, которые будет решать сотрудник, команду, в которой он будет работать..."
                  value={jobData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="requirements">Требования к кандидату *</Label>
                <Textarea
                  id="requirements"
                  rows={4}
                  placeholder="• Опыт работы с React от 3 лет&#10;• Знание TypeScript&#10;• Опыт работы с REST API&#10;• Понимание принципов UI/UX..."
                  value={jobData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="benefits">Условия и преимущества</Label>
                <Textarea
                  id="benefits"
                  rows={4}
                  placeholder="• Официальное трудоустройство&#10;• ДМС для сотрудника и семьи&#10;• Гибкий график работы&#10;• Обучение за счет компании..."
                  value={jobData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                />
              </div>

              {/* Дополнительные поля */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="experience">Требуемый опыт</Label>
                  <Select value={jobData.experience} onValueChange={(value: string) => handleInputChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите опыт" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-experience">Без опыта</SelectItem>
                      <SelectItem value="1-year">До 1 года</SelectItem>
                      <SelectItem value="1-3-years">1-3 года</SelectItem>
                      <SelectItem value="3-5-years">3-5 лет</SelectItem>
                      <SelectItem value="5-10-years">5-10 лет</SelectItem>
                      <SelectItem value="10-plus-years">Более 10 лет</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={jobData.education} onValueChange={(value: string) => handleInputChange('education', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите образование" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-education">Не требуется</SelectItem>
                      <SelectItem value="secondary">Среднее</SelectItem>
                      <SelectItem value="vocational">Среднее специальное</SelectItem>
                      <SelectItem value="bachelor">Высшее (бакалавр)</SelectItem>
                      <SelectItem value="master">Высшее (магистр)</SelectItem>
                      <SelectItem value="phd">Ученая степень</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="workFormat">Формат работы</Label>
                  <Select value={jobData.workFormat || ''} onValueChange={(value: string) => handleInputChange('workFormat', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите формат" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">В офисе</SelectItem>
                      <SelectItem value="remote">Удаленно</SelectItem>
                      <SelectItem value="hybrid">Гибридный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workHours">Рабочие часы в день</Label>
                  <Input
                    id="workHours"
                    type="number"
                    min="1"
                    max="24"
                    placeholder="8"
                    value={jobData.workHours || ''}
                    onChange={(e) => handleInputChange('workHours', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div>
                <Label>Ключевые навыки и технологии</Label>
                <div className="mt-2">
                  <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-5 mb-4">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 text-sm ${selectedTags.includes(tag)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Добавить свой тег..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    />
                    <Button type="button" onClick={addCustomTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedTags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Выбранные теги:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} className="bg-blue-100 text-blue-800">
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Контакты и публикация</span>
              </CardTitle>
              <p className="text-gray-600">Укажите контактную информацию и опубликуйте вакансию</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contactEmail">Email для откликов *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="hr@company.com"
                    value={jobData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Телефон (необязательно)</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+7 (999) 123-45-67"
                    value={jobData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Предварительный просмотр
                </h4>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
                            {jobData.company.charAt(0) || 'C'}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{jobData.title || 'Название вакансии'}</h3>
                          <p className="text-gray-600">{jobData.company || 'Название компании'}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {jobData.description || 'Описание вакансии будет отображаться здесь...'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {jobData.type && (
                          <Badge className="bg-blue-100 text-blue-800">
                            {jobTypes.find(t => t.value === jobData.type)?.label}
                          </Badge>
                        )}
                        {selectedTags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div>
                        <span className="font-bold text-green-600">{jobData.salary || 'Зарплата'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Условия размещения</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Вакансия будет опубликована сразу после модерации</li>
                  <li>• Срок размещения: 30 дней</li>
                  <li>• Вы получите уведомления о новых откликах на email</li>
                  <li>• Можно редактировать вакансию в личном кабинете</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Размещение вакансии
              </h1>
              <p className="text-gray-600">
                Шаг {currentStep} из {totalSteps} - {
                  currentStep === 1 ? 'Основная информация' :
                    currentStep === 2 ? 'Описание и требования' :
                      'Контакты и публикация'
                }
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-8">
            {Array.from({ length: totalSteps }, (_, index) => {
              const step = index + 1;
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;

              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-500'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all duration-200 ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold">{error.message}</div>
              {error.details?.errors && (
                <ul className="mt-2 list-disc list-inside text-sm">
                  {error.details.errors.map((err: { msg: string }, index: number) => (
                    <li key={index}>{err.msg}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Вакансия успешно создана! Перенаправляем...
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                (currentStep === 1 && (!jobData.title || !jobData.company || !jobData.type || !jobData.salary)) ||
                (currentStep === 2 && (!jobData.description || !jobData.requirements))
              }
            >
              Далее
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
              disabled={!jobData.contactEmail || isCreating || success}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Создано!
                </>
              ) : (
                <>
                  Опубликовать вакансию
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}