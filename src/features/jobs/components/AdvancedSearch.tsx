import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/components/card';
import { Input } from '../../../shared/ui/components/input';
import { Label } from '../../../shared/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/components/select';
import { Button } from '../../../shared/ui/components/button';
import { Badge } from '../../../shared/ui/components/badge';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { SearchFilters } from '../types';
import {
  SPECIALIZATIONS,
  INDUSTRIES,
  REGIONS,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
  SCHEDULES,
  WORK_FORMATS,
  SALARY_FREQUENCIES
} from '../constants';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Константы импортированы из constants/index.ts

export function AdvancedSearch({ onSearch, onClear, isOpen, onToggle }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== undefined && value !== '').length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Кнопка для открытия/закрытия расширенного поиска - скрыта, так как теперь в Header */}
        {!isOpen && (
          <div className="py-4">
            <Button
              variant="outline"
              onClick={onToggle}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Расширенный поиск</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Панель расширенного поиска */}
        {isOpen && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Расширенный поиск</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Очистить
                  </Button>
                  <Button size="sm" onClick={handleSearch}>
                    Найти
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ключевое слово */}
                <div className="space-y-2">
                  <Label htmlFor="keyword">Ключевое слово</Label>
                  <Input
                    id="keyword"
                    placeholder="Введите ключевое слово..."
                    value={filters.keyword || ''}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  />
                </div>

                {/* Специализация */}
                <div className="space-y-2">
                  <Label>Специализация</Label>
                  <Select
                    value={filters.specialization || ''}
                    onValueChange={(value: string) => handleFilterChange('specialization', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите специализацию" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Отрасль */}
                <div className="space-y-2">
                  <Label>Отрасль</Label>
                  <Select
                    value={filters.industry || ''}
                    onValueChange={(value: string) => handleFilterChange('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите отрасль" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Регион */}
                <div className="space-y-2">
                  <Label>Регион</Label>
                  <Select
                    value={filters.region || ''}
                    onValueChange={(value: string) => handleFilterChange('region', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите регион" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Уровень дохода от */}
                <div className="space-y-2">
                  <Label>Зарплата от (₸)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.salaryFrom || ''}
                    onChange={(e) => handleFilterChange('salaryFrom', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                {/* Уровень дохода до */}
                <div className="space-y-2">
                  <Label>Зарплата до (₸)</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={filters.salaryTo || ''}
                    onChange={(e) => handleFilterChange('salaryTo', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                {/* Частота выплат */}
                <div className="space-y-2">
                  <Label>Частота выплат</Label>
                  <Select
                    value={filters.salaryFrequency || ''}
                    onValueChange={(value: string) => handleFilterChange('salaryFrequency', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите частоту" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALARY_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Образование */}
                <div className="space-y-2">
                  <Label>Образование</Label>
                  <Select
                    value={filters.education || ''}
                    onValueChange={(value: string) => handleFilterChange('education', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите образование" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((edu) => (
                        <SelectItem key={edu.value} value={edu.value}>
                          {edu.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Опыт работы */}
                <div className="space-y-2">
                  <Label>Опыт работы</Label>
                  <Select
                    value={filters.experience || ''}
                    onValueChange={(value: string) => handleFilterChange('experience', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите опыт" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((exp) => (
                        <SelectItem key={exp.value} value={exp.value}>
                          {exp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Тип занятости */}
                <div className="space-y-2">
                  <Label>Тип занятости</Label>
                  <Select
                    value={filters.employmentType || ''}
                    onValueChange={(value: string) => handleFilterChange('employmentType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* График работы */}
                <div className="space-y-2">
                  <Label>График работы</Label>
                  <Select
                    value={filters.schedule || ''}
                    onValueChange={(value: string) => handleFilterChange('schedule', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите график" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHEDULES.map((schedule) => (
                        <SelectItem key={schedule.value} value={schedule.value}>
                          {schedule.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Рабочие часы в день */}
                <div className="space-y-2">
                  <Label>Рабочие часы в день</Label>
                  <Input
                    type="number"
                    placeholder="8"
                    min="1"
                    max="24"
                    value={filters.workHours || ''}
                    onChange={(e) => handleFilterChange('workHours', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>

                {/* Формат работы */}
                <div className="space-y-2">
                  <Label>Формат работы</Label>
                  <Select
                    value={filters.workFormat || ''}
                    onValueChange={(value: string) => handleFilterChange('workFormat', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите формат" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Активные фильтры */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Активные фильтры:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (value === undefined || value === '') return null;

                      let displayValue = value;
                      if (key === 'education') {
                        displayValue = EDUCATION_LEVELS.find(e => e.value === value)?.label || value;
                      } else if (key === 'experience') {
                        displayValue = EXPERIENCE_LEVELS.find(e => e.value === value)?.label || value;
                      } else if (key === 'employmentType') {
                        displayValue = EMPLOYMENT_TYPES.find(e => e.value === value)?.label || value;
                      } else if (key === 'schedule') {
                        displayValue = SCHEDULES.find(e => e.value === value)?.label || value;
                      } else if (key === 'workFormat') {
                        displayValue = WORK_FORMATS.find(e => e.value === value)?.label || value;
                      } else if (key === 'salaryFrequency') {
                        displayValue = SALARY_FREQUENCIES.find(e => e.value === value)?.label || value;
                      }

                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <span>{displayValue}</span>
                          <button
                            onClick={() => handleFilterChange(key as keyof SearchFilters, undefined)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
