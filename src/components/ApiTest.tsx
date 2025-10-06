import { useState } from 'react';
import { Button } from '../shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/components/card';
import { jobsApiService } from '../core/api/jobs';
import { ArrowLeft } from 'lucide-react';

interface ApiTestProps {
  onBack?: () => void;
}

export function ApiTest({ onBack }: ApiTestProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGetJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Тестируем получение вакансий...');
      const data = await jobsApiService.getJobs();
      setResult(data);
      console.log('✅ Успешно получены вакансии:', data);
    } catch (err: any) {
      console.error('❌ Ошибка при получении вакансий:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testCreateJob = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Тестируем создание вакансии...');
      const jobData = {
        title: 'Test Frontend Developer',
        company: 'Test Company',
        salary: '100 000 - 150 000 ₽',
        location: 'Москва',
        type: 'full-time' as const,
        description: 'Тестовое описание вакансии',
        tags: ['React', 'TypeScript', 'Test'],
        specialization: 'Frontend разработка',
        industry: 'IT',
        region: 'Москва',
        salaryFrom: 100000,
        salaryTo: 150000,
        salaryFrequency: 'monthly' as const,
        education: 'bachelor' as const,
        experience: '1-3-years' as const,
        employmentType: 'full-time' as const,
        schedule: 'flexible' as const,
        workHours: 8,
        workFormat: 'hybrid' as const
      };
      
      const data = await jobsApiService.createJob(jobData);
      setResult(data);
      console.log('✅ Успешно создана вакансия:', data);
    } catch (err: any) {
      console.error('❌ Ошибка при создании вакансии:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {onBack && (
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>🧪 Тест API подключения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testGetJobs} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Загрузка...' : 'Тест GET /api/jobs'}
            </Button>
            
            <Button 
              onClick={testCreateJob} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Загрузка...' : 'Тест POST /api/jobs'}
            </Button>
            
            <Button 
              onClick={clearResults} 
              variant="outline"
            >
              Очистить
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800">❌ Ошибка:</h3>
              <pre className="text-red-700 text-sm mt-2">{error}</pre>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800">✅ Результат:</h3>
              <pre className="text-green-700 text-sm mt-2 overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>API URL:</strong> http://localhost:3003/api</p>
            <p><strong>Frontend URL:</strong> http://localhost:3000</p>
            <p><strong>Инструкции:</strong> Откройте консоль браузера (F12) для просмотра логов</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
