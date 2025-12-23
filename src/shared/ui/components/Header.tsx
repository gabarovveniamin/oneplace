import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./button";
import { Input } from "./input";
import { Search, User, Filter, X, ChevronDown, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchFilters } from "../../../shared/types/job";
import { UserResponse } from "../../../core/api/auth";
import { Card, CardContent } from "./card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { NotificationsPopover } from '../../../features/notifications/components/NotificationsPopover';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onSearch?: (filters: SearchFilters) => void;
  onClearSearch?: () => void;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  activeFiltersCount?: number;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onProfileClick?: () => void;
  onAdminClick?: () => void;
  onLogout?: () => void;
  currentUser?: UserResponse | null;
}

export function Header({
  isDarkMode,
  onThemeToggle,
  onSearch,
  onClearSearch,
  searchValue = '',
  onSearchValueChange,
  activeFiltersCount = 0,
  onLogoClick,
  onLoginClick,
  onRegisterClick,
  onProfileClick,
  onAdminClick,
  onLogout,
  currentUser
}: HeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const filterRef = useRef<HTMLDivElement>(null);

  const toggleAdvancedSearch = () => {
    setIsFilterOpen(prev => !prev);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch?.(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onClearSearch?.();
  };

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchValueChange?.(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch?.({ keyword: searchValue.trim() });
    }
  };

  return (
    <div className="relative">
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={onLogoClick}>
              <div className="flex-shrink-0 flex items-center space-x-3">
                <img src="/Log.png" alt="OnePlace" className="h-14 w-14 object-contain" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  OnePlace
                </h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Поиск вакансий, проектов, подработок..."
                  className="pl-10 pr-20 bg-muted border-0 rounded-lg focus:bg-card focus:ring-2 focus:ring-blue-500"
                  value={searchValue}
                  onChange={handleSearchInputChange}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleAdvancedSearch}
                    className="h-6 w-6 p-0 hover:bg-accent relative"
                  >
                    <Filter className="h-3 w-3" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                  {searchValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onSearchValueChange?.('')}
                      className="h-6 w-6 p-0 hover:bg-accent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              {currentUser && (currentUser.role === 'employer' || currentUser.role === 'admin') && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-blue-600"
                  onClick={() => window.location.hash = 'post-job'}
                >
                  Разместить вакансию
                </Button>
              )}

              {/* Theme Toggle */}
              <ThemeToggle isDark={isDarkMode} onToggle={onThemeToggle} />

              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    <NotificationsPopover onNavigateToProfile={onProfileClick} />
                    <span className="text-sm font-medium text-foreground">
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                    {(currentUser.role === 'admin' || currentUser.email === 'admin@oneplace.com') && (
                      <Button
                        variant="ghost"
                        className="bg-red-600 text-white hover:bg-red-700 font-bold px-4 py-2 rounded-lg transition-all shadow-lg hover:scale-105 active:scale-95"
                        onClick={() => onAdminClick?.()}
                      >
                        Админ панель
                      </Button>
                    )}
                    <Button variant="outline" className="rounded-lg" onClick={onProfileClick}>
                      Профиль
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-red-600 px-2"
                      onClick={onLogout}
                      title="Выйти"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-blue-600"
                      onClick={onLoginClick}
                    >
                      Войти
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      onClick={onRegisterClick}
                    >
                      Зарегистрироваться
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Dropdown */}
      {isFilterOpen && (
        <div ref={filterRef} className="absolute top-16 left-0 right-0 z-50 bg-card border border-border shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Регион */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Регион</label>
                    <Select onValueChange={(value: string) => handleFilterChange('region', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите регион" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="almaty">Алматы</SelectItem>
                        <SelectItem value="nur-sultan">Нур-Султан</SelectItem>
                        <SelectItem value="shymkent">Шымкент</SelectItem>
                        <SelectItem value="aktobe">Актобе</SelectItem>
                        <SelectItem value="taraz">Тараз</SelectItem>
                        <SelectItem value="pavlodar">Павлодар</SelectItem>
                        <SelectItem value="semey">Семей</SelectItem>
                        <SelectItem value="oral">Уральск</SelectItem>
                        <SelectItem value="kostanay">Костанай</SelectItem>
                        <SelectItem value="kyzylorda">Кызылорда</SelectItem>
                        <SelectItem value="petropavlovsk">Петропавловск</SelectItem>
                        <SelectItem value="aktau">Актау</SelectItem>
                        <SelectItem value="temirtau">Темиртау</SelectItem>
                        <SelectItem value="turkestan">Туркестан</SelectItem>
                        <SelectItem value="remote">Удаленно</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Опыт работы */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Опыт работы</label>
                    <Select onValueChange={(value: string) => handleFilterChange('experience', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите опыт" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-experience">Без опыта</SelectItem>
                        <SelectItem value="less-than-1">Менее 1 года</SelectItem>
                        <SelectItem value="1-3-years">1-3 года</SelectItem>
                        <SelectItem value="3-5-years">3-5 лет</SelectItem>
                        <SelectItem value="5-10-years">5-10 лет</SelectItem>
                        <SelectItem value="10+ years">Более 10 лет</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Тип занятости */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тип занятости</label>
                    <Select onValueChange={(value: string) => handleFilterChange('employmentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Полная занятость</SelectItem>
                        <SelectItem value="part-time">Частичная занятость</SelectItem>
                        <SelectItem value="contract">Контракт</SelectItem>
                        <SelectItem value="project">Проектная работа</SelectItem>
                        <SelectItem value="internship">Стажировка</SelectItem>
                        <SelectItem value="volunteer">Волонтерство</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Образование */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Образование</label>
                    <Select onValueChange={(value: string) => handleFilterChange('education', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите образование" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-education">Без образования</SelectItem>
                        <SelectItem value="secondary">Среднее</SelectItem>
                        <SelectItem value="vocational">Среднее специальное</SelectItem>
                        <SelectItem value="bachelor">Высшее (бакалавр)</SelectItem>
                        <SelectItem value="master">Высшее (магистр)</SelectItem>
                        <SelectItem value="phd">Аспирантура/PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Зарплата */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Зарплата от</label>
                    <Select onValueChange={(value: string) => handleFilterChange('salaryFrom', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите зарплату" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50000">50 000 ₸</SelectItem>
                        <SelectItem value="100000">100 000 ₸</SelectItem>
                        <SelectItem value="150000">150 000 ₸</SelectItem>
                        <SelectItem value="200000">200 000 ₸</SelectItem>
                        <SelectItem value="250000">250 000 ₸</SelectItem>
                        <SelectItem value="300000">300 000 ₸</SelectItem>
                        <SelectItem value="400000">400 000 ₸</SelectItem>
                        <SelectItem value="500000">500 000 ₸</SelectItem>
                        <SelectItem value="700000">700 000 ₸</SelectItem>
                        <SelectItem value="1000000">1 000 000 ₸</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Специализация */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Специализация</label>
                    <Select onValueChange={(value: string) => handleFilterChange('specialization', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите специализацию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">IT, интернет, телеком</SelectItem>
                        <SelectItem value="finance">Банки, инвестиции, лизинг</SelectItem>
                        <SelectItem value="marketing">Маркетинг, реклама, PR</SelectItem>
                        <SelectItem value="sales">Продажи</SelectItem>
                        <SelectItem value="hr">HR, тренинги</SelectItem>
                        <SelectItem value="logistics">Логистика, склад, ВЭД</SelectItem>
                        <SelectItem value="production">Производство, сельское хозяйство</SelectItem>
                        <SelectItem value="medicine">Медицина, фармацевтика</SelectItem>
                        <SelectItem value="education">Образование, наука</SelectItem>
                        <SelectItem value="tourism">Туризм, гостиницы, рестораны</SelectItem>
                        <SelectItem value="media">СМИ, издательство, полиграфия</SelectItem>
                        <SelectItem value="transport">Транспорт, автобизнес</SelectItem>
                        <SelectItem value="construction">Строительство, недвижимость</SelectItem>
                        <SelectItem value="retail">Торговля</SelectItem>
                        <SelectItem value="consulting">Консалтинг, аудит</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* График работы */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">График работы</label>
                    <Select onValueChange={(value: string) => handleFilterChange('schedule', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите график" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-day">Полный день</SelectItem>
                        <SelectItem value="shift">Сменный график</SelectItem>
                        <SelectItem value="flexible">Гибкий график</SelectItem>
                        <SelectItem value="remote">Удаленная работа</SelectItem>
                        <SelectItem value="part-time">Неполный день</SelectItem>
                        <SelectItem value="weekends">Выходные дни</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {Object.keys(filters).length > 0 && `Выбрано фильтров: ${Object.keys(filters).length}`}
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={handleClearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Очистить все
                    </Button>
                    <Button onClick={() => setIsFilterOpen(false)}>
                      <Search className="h-4 w-4 mr-2" />
                      Показать результаты
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}