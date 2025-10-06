import { Button } from "../../../shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";
import { Input } from "../../../shared/ui/components/input";
import { Label } from "../../../shared/ui/components/label";
import { Textarea } from "../../../shared/ui/components/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/components/tabs";
import { Badge } from "../../../shared/ui/components/badge";
import { ImageWithFallback } from "../../../shared/ui/figma/ImageWithFallback";
import { User, Upload, FileText, Heart, Send, ArrowLeft } from "lucide-react";

interface ProfileProps {
  onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
  const appliedJobs = [
    { id: '1', title: 'Frontend разработчик', company: 'TechCorp', status: 'На рассмотрении', date: '2 дня назад' },
    { id: '2', title: 'React Developer', company: 'StartupXYZ', status: 'Приглашен на собеседование', date: '5 дней назад' },
  ];

  const savedJobs = [
    { id: '3', title: 'Senior Frontend Developer', company: 'BigTech', salary: '200 000 ₽', type: 'full-time' },
    { id: '4', title: 'Веб-разработчик', company: 'WebStudio', salary: '150 000 ₽', type: 'full-time' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        На главную
      </Button>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhdmF0YXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTkxMjc3OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold mb-1">Александр Петров</h3>
              <p className="text-gray-600 text-sm mb-4">Frontend разработчик</p>
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Изменить фото
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="applications" className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Мои отклики</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Сохраненные</span>
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Резюме</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="mt-6">
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle>Мои отклики</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appliedJobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={
                                job.status === 'Приглашен на собеседование' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {job.status}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">{job.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle>Сохраненные вакансии</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedJobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{job.salary}</p>
                            <Badge className="bg-blue-100 text-blue-800 mt-1">
                              Постоянная работа
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resume" className="mt-6">
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle>Мое резюме</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">Имя</Label>
                        <Input id="firstName" defaultValue="Александр" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Фамилия</Label>
                        <Input id="lastName" defaultValue="Петров" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="position">Желаемая должность</Label>
                      <Input id="position" defaultValue="Frontend разработчик" />
                    </div>

                    <div>
                      <Label htmlFor="skills">Навыки</Label>
                      <div className="flex flex-wrap gap-2 mt-2 mb-2">
                        {['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Node.js'].map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                      <Input id="skills" placeholder="Добавить навык..." />
                    </div>

                    <div>
                      <Label htmlFor="experience">Опыт работы</Label>
                      <Textarea 
                        id="experience" 
                        rows={4}
                        placeholder="Опишите ваш опыт работы..."
                        defaultValue="Frontend разработчик с 3-летним опытом работы. Специализируюсь на React, TypeScript и современных веб-технологиях."
                      />
                    </div>

                    <div>
                      <Label htmlFor="education">Образование</Label>
                      <Textarea 
                        id="education" 
                        rows={3}
                        placeholder="Опишите ваше образование..."
                        defaultValue="Высшее техническое образование, МФТИ, факультет информатики и вычислительной техники."
                      />
                    </div>

                    <div>
                      <Label>Загрузить резюме (PDF)</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Перетащите файл сюда или нажмите для выбора</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Выбрать файл
                        </Button>
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Сохранить резюме
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}