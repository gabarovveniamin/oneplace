import { useState } from 'react';
import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { Textarea } from "../../../shared/ui/components/textarea";
import { Badge } from "../../../shared/ui/components/badge";
import { Progress } from "../../../shared/ui/components/progress";
import { ImageWithFallback } from "../../../shared/ui/figma/ImageWithFallback";
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
  FileText
} from "lucide-react";

interface ExtendedResumeBuilderProps {
  onBack: () => void;
  onComplete: () => void;
}

export function ExtendedResumeBuilder({ onBack, onComplete }: ExtendedResumeBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [skillTests, setSkillTests] = useState<{[key: string]: boolean}>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<Array<{title: string, description: string, technologies: string[]}>>([]);

  const totalSteps = 6;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const availableSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'HTML/CSS', 'PostgreSQL', 'MongoDB',
    'Docker', 'AWS', 'Git', 'Photoshop', 'Figma'
  ];

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSkillTest = (skill: string) => {
    // Симуляция прохождения теста
    setTimeout(() => {
      setSkillTests(prev => ({
        ...prev,
        [skill]: Math.random() > 0.3 // 70% успешных тестов
      }));
    }, 1500);
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
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Имя</Label>
                  <Input id="firstName" placeholder="Ваше имя" />
                </div>
                <div>
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input id="lastName" placeholder="Ваша фамилия" />
                </div>
              </div>

              <div>
                <Label htmlFor="position">Желаемая должность</Label>
                <Input id="position" placeholder="Например: Frontend разработчик" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="city">Город</Label>
                  <Input id="city" placeholder="Москва" />
                </div>
                <div>
                  <Label htmlFor="salary">Желаемая зарплата</Label>
                  <Input id="salary" placeholder="150 000 ₽" />
                </div>
              </div>

              <div>
                <Label htmlFor="about">О себе</Label>
                <Textarea 
                  id="about" 
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
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                      selectedSkills.includes(skill)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              
              {selectedSkills.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 dark:text-white">Выбранные навыки:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
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
                {selectedSkills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        skillTests[skill] === true ? 'bg-green-500' :
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
              
              {selectedSkills.length === 0 && (
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Компания</Label>
                  <Input id="company" placeholder="Название компании" />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="jobTitle">Должность</Label>
                    <Input id="jobTitle" placeholder="Ваша должность" />
                  </div>
                  <div>
                    <Label htmlFor="period">Период работы</Label>
                    <Input id="period" placeholder="2020 - 2023" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="responsibilities">Обязанности и достижения</Label>
                  <Textarea 
                    id="responsibilities" 
                    rows={4}
                    placeholder="Опишите ваши основные обязанности и достижения..."
                  />
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Добавить еще место работы
              </Button>
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
              {projects.map((project, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold dark:text-white">{project.title}</h4>
                    <Button size="sm" variant="ghost" className="text-red-500">
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

              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectTitle">Название проекта</Label>
                  <Input id="projectTitle" placeholder="Мой проект" />
                </div>
                
                <div>
                  <Label htmlFor="projectDescription">Описание</Label>
                  <Textarea 
                    id="projectDescription" 
                    rows={3}
                    placeholder="Опишите проект и вашу роль в нем..."
                  />
                </div>

                <div>
                  <Label htmlFor="projectTech">Технологии (через запятую)</Label>
                  <Input id="projectTech" placeholder="React, TypeScript, Node.js" />
                </div>

                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить проект
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="university">Учебное заведение</Label>
                  <Input id="university" placeholder="Название университета/института" />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="degree">Степень/Специальность</Label>
                    <Input id="degree" placeholder="Бакалавр, Информатика" />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Год окончания</Label>
                    <Input id="graduationYear" placeholder="2020" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center dark:text-white">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  Ваше резюме готово!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Отличная работа! Ваше расширенное резюме с подтвержденными навыками 
                  даст вам преимущество при поиске работы.
                </p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Приоритет в результатах поиска
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Подтвержденные навыки
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Портфолио проектов
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
              onClick={onComplete}
              className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
            >
              Завершить создание резюме
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}