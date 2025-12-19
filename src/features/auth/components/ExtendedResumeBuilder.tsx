import { useState, useEffect } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { Textarea } from "../../../shared/ui/components/textarea";
import { Badge } from "../../../shared/ui/components/badge";
import { Progress } from "../../../shared/ui/components/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Upload,
  Plus,
  X,
  Star,
  Code,
  Briefcase,
  GraduationCap,
  User,
  Trophy,
  FileText,
  Loader2
} from "lucide-react";
import { resumeApiService, ResumeData, Experience, Education, Project } from '../../../core/api/resume';
import { authApiService } from '../../../core/api/auth';
import { ApiError } from '../../../core/api';

interface ExtendedResumeBuilderProps {
  onBack: () => void;
  onComplete: () => void;
}

export function ExtendedResumeBuilder({ onBack, onComplete }: ExtendedResumeBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillTests, setSkillTests] = useState<{ [key: string]: boolean }>({});

  // State for all form data
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: '',
    city: '',
    phone: '',
    salary: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: []
  });

  // Temporary state for new items being added
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({});
  const [newEducation, setNewEducation] = useState<Partial<Education>>({});
  const [newProject, setNewProject] = useState<Partial<Project> & { techString?: string }>({});

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const resume = await resumeApiService.getResume();
        if (resume) {
          setResumeData(resume);
        } else {
          // Pre-fill user data if available and no resume exists
          const user = authApiService.getCurrentUser();
          if (user) {
            setResumeData(prev => ({
              ...prev,
              phone: user.phone || '',
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load resume', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const availableSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'HTML/CSS', 'PostgreSQL', 'MongoDB',
    'Docker', 'AWS', 'Git', 'Photoshop', 'Figma'
  ];

  const handleInputChange = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSkillTest = (skill: string) => {
    setTimeout(() => {
      setSkillTests(prev => ({
        ...prev,
        [skill]: Math.random() > 0.3
      }));
    }, 1500);
  };

  const addExperience = () => {
    if (!newExperience.company || !newExperience.position) return;

    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        company: newExperience.company!,
        position: newExperience.position!,
        period: newExperience.period || '',
        description: newExperience.description || ''
      }]
    }));
    setNewExperience({});
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id)
    }));
  };

  const addProject = () => {
    if (!newProject.title) return;

    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now().toString(),
        title: newProject.title!,
        description: newProject.description || '',
        technologies: newProject.techString ? newProject.techString.split(',').map(s => s.trim()) : []
      }]
    }));
    setNewProject({});
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const addEducation = () => {
    if (!newEducation.university) return;

    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        university: newEducation.university!,
        degree: newEducation.degree || '',
        year: newEducation.year || ''
      }]
    }));
    setNewEducation({});
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await resumeApiService.updateResume(resumeData);
      alert('Резюме успешно сохранено!'); // Explicit feedback
      onComplete();
    } catch (err: any) {
      const apiError = err as ApiError;
      console.error('Failed to save resume', apiError);
      const message = apiError.message || 'Не удалось сохранить резюме. Пожалуйста, попробуйте снова.';
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Личная информация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image upload placeholder */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="position">Желаемая должность</Label>
                <Input
                  id="position"
                  value={resumeData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Например: Frontend разработчик"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    value={resumeData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Москва"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Желаемая зарплата</Label>
                  <Input
                    id="salary"
                    value={resumeData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="150 000 ₽"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={resumeData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                />
              </div>

              <div>
                <Label htmlFor="about">О себе</Label>
                <Textarea
                  id="about"
                  value={resumeData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  rows={4}
                  placeholder="Расскажите кратко о себе и своих профессиональных целях..."
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-600" />
                <span>Выбор навыков</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Выберите ваши профессиональные навыки</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${resumeData.skills.includes(skill)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-300'
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {resumeData.skills.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 dark:text-white">Выбранные навыки:</h4>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill) => (
                      <Badge key={skill} className="bg-blue-100 text-blue-800">
                        {skill}
                        <button
                          onClick={() => handleSkillToggle(skill)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <span>Подтверждение навыков</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Пройдите тесты для подтверждения ваших навыков</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resumeData.skills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${skillTests[skill] === true ? 'bg-green-500' :
                        skillTests[skill] === false ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                      <span className="font-medium dark:text-white">{skill}</span>
                      {skillTests[skill] === true && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Подтвержден
                        </Badge>
                      )}
                      {skillTests[skill] === false && (
                        <Badge className="bg-red-100 text-red-800">
                          Не пройден
                        </Badge>
                      )}
                    </div>

                    {skillTests[skill] === undefined && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSkillTest(skill)}
                      >
                        Пройти тест
                      </Button>
                    )}

                    {skillTests[skill] === false && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSkillTest(skill)}
                      >
                        Пересдать
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {resumeData.skills.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Сначала выберите навыки на предыдущем шаге
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span>Опыт работы</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* List existing items */}
              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="p-4 border rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <h4 className="font-bold">{exp.position}</h4>
                  <div className="text-sm text-gray-600">{exp.company} | {exp.period}</div>
                  <p className="mt-2 text-sm">{exp.description}</p>
                </div>
              ))}

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Добавить место работы</h4>
                <div>
                  <Label>Компания</Label>
                  <Input
                    placeholder="Название компании"
                    value={newExperience.company || ''}
                    onChange={e => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Должность</Label>
                    <Input
                      placeholder="Ваша должность"
                      value={newExperience.position || ''}
                      onChange={e => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Период работы</Label>
                    <Input
                      placeholder="2020 - 2023"
                      value={newExperience.period || ''}
                      onChange={e => setNewExperience(prev => ({ ...prev, period: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Обязанности и достижения</Label>
                  <Textarea
                    rows={4}
                    placeholder="Опишите ваши основные обязанности..."
                    value={newExperience.description || ''}
                    onChange={e => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button variant="outline" className="w-full" onClick={addExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  Сохранить место работы
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Портфолио проектов</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Добавьте ваши лучшие проекты</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.projects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold dark:text-white">{project.title}</h4>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeProject(project.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Добавить проект</h4>
                <div>
                  <Label>Название проекта</Label>
                  <Input
                    placeholder="Мой проект"
                    value={newProject.title || ''}
                    onChange={e => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Описание</Label>
                  <Textarea
                    rows={3}
                    placeholder="Опишите проект и вашу роль в нем..."
                    value={newProject.description || ''}
                    onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Технологии (через запятую)</Label>
                  <Input
                    placeholder="React, TypeScript, Node.js"
                    value={newProject.techString || ''}
                    onChange={e => setNewProject(prev => ({ ...prev, techString: e.target.value }))}
                  />
                </div>

                <Button variant="outline" className="w-full" onClick={addProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Сохранить проект
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>Образование и завершение</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="p-4 border rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => removeEducation(edu.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <h4 className="font-bold">{edu.university}</h4>
                  <div className="text-sm text-gray-600">{edu.degree} | {edu.year}</div>
                </div>
              ))}

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Добавить образование</h4>
                <div>
                  <Label>Учебное заведение</Label>
                  <Input
                    placeholder="Название вуза"
                    value={newEducation.university || ''}
                    onChange={e => setNewEducation(prev => ({ ...prev, university: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Степень/Специальность</Label>
                    <Input
                      placeholder="Бакалавр..."
                      value={newEducation.degree || ''}
                      onChange={e => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Год окончания</Label>
                    <Input
                      placeholder="2020"
                      value={newEducation.year || ''}
                      onChange={e => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={addEducation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Сохранить образование
                </Button>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg mt-6">
                <h3 className="font-semibold mb-3 flex items-center dark:text-white">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  Ваше резюме готово к публикации!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Проверьте все данные. После нажатия "Завершить" резюме будет сохранено и вы сможете откликаться на вакансии.
                </p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Навыков выбрано: {resumeData.skills.length}
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Мест работы: {resumeData.experience.length}
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Проектов: {resumeData.projects.length}
                  </div>
                </div>
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
            className="mb-4 text-gray-600 dark:text-gray-300 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Создание расширенного резюме
              </h1>
              <p className="text-muted-foreground">
                Шаг {currentStep} из {totalSteps}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Прогресс</div>
              <div className="w-32">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </div>

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
            >
              Далее
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  Завершить создание
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