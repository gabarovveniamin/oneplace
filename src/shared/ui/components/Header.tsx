import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./button";
import { Input } from "./input";
import { Search, Filter, X, LogOut, MessageSquare, MapPin, ShoppingCart, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchFilters } from "../../../shared/types/job";
import { UserResponse } from "../../../core/api/auth";
import { Card, CardContent } from "./card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { NotificationsPopover } from '../../../features/notifications/components/NotificationsPopover';
import { useCart } from '../../../features/market/hooks/useCart';

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
  onMessagesClick?: () => void;
  onCartClick?: () => void;
  onAdminClick?: () => void;
  onLogout?: () => void;
  currentUser?: UserResponse | null;
  showSearch?: boolean;
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
  onMessagesClick,
  onCartClick,
  onAdminClick,
  onLogout,
  currentUser,
  showSearch = true
}: HeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filters, setFilters] = useState<SearchFilters>({});
  const filterRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  // Track mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleAdvancedSearch = () => setIsFilterOpen(prev => !prev);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch?.(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onClearSearch?.();
  };

  // Close filter on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isFilterOpen]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMobileMenuOpen]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchValueChange?.(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) onSearch?.({ keyword: searchValue.trim() });
  };

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@oneplace.com');

  return (
    <div className="relative">
      <header className="header-adaptive sticky top-0 z-50" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '8px' }}>

            {/* ── Logo ── */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
              onClick={onLogoClick}
            >
              <MapPin style={{ width: 20, height: 20, color: '#3b82f6' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                <span style={{ color: '#3b82f6' }}>One</span>
                <span style={{ color: '#22c55e' }}>Place</span>
              </span>
            </div>

            {/* ── Search ── */}
            {showSearch ? (
              <div style={{ flex: 1, minWidth: 0, maxWidth: '480px', margin: '0 8px' }}>
                <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
                  <Search className="icon-adaptive" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16 }} />
                  <Input
                    type="text"
                    placeholder="Поиск..."
                    className="search-input-adaptive"
                    style={{ paddingLeft: 36, paddingRight: searchValue ? 32 : 12, height: 38, width: '100%', borderRadius: 999, border: 'none', fontSize: 14 }}
                    value={searchValue}
                    onChange={handleSearchInputChange}
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => onSearchValueChange?.('')}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                    >
                      <X className="icon-adaptive" style={{ width: 14, height: 14 }} />
                    </button>
                  )}
                </form>
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            {/* ── Desktop nav ── */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {/* Theme toggle */}
                <ThemeToggle isDark={isDarkMode} onToggle={onThemeToggle} />

                {currentUser ? (
                  <>
                    {/* Filter button (only on search page) */}
                    {showSearch && (
                      <button
                        onClick={toggleAdvancedSearch}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 999, background: 'none', border: 'none', cursor: 'pointer' }}
                        className="hover-adaptive"
                      >
                        <Filter className="icon-adaptive" style={{ width: 16, height: 16 }} />
                        {activeFiltersCount > 0 && (
                          <span style={{ position: 'absolute', top: 2, right: 2, background: '#2563eb', color: '#fff', fontSize: 10, borderRadius: 999, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {activeFiltersCount}
                          </span>
                        )}
                      </button>
                    )}

                    <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

                    <NotificationsPopover onNavigateToProfile={onProfileClick} />

                    <button
                      onClick={onMessagesClick}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 999, background: 'none', border: 'none', cursor: 'pointer' }}
                      className="hover-adaptive"
                    >
                      <MessageSquare className="icon-adaptive" style={{ width: 18, height: 18 }} />
                    </button>

                    <button
                      onClick={onCartClick}
                      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 999, background: 'none', border: 'none', cursor: 'pointer' }}
                      className="hover-adaptive"
                    >
                      <ShoppingCart className="icon-adaptive" style={{ width: 18, height: 18 }} />
                      {totalItems > 0 && (
                        <span style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', color: '#fff', fontSize: 10, borderRadius: 999, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {totalItems}
                        </span>
                      )}
                    </button>

                    <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

                    <button
                      onClick={onProfileClick}
                      style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: 36, borderRadius: 999, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
                      className="hover-adaptive text-adaptive"
                    >
                      Профиль
                    </button>

                    <button
                      onClick={onLogout}
                      title="Выйти"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 999, background: 'none', border: 'none', cursor: 'pointer' }}
                      className="hover-adaptive"
                    >
                      <LogOut className="icon-adaptive" style={{ width: 16, height: 16 }} />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onAdminClick?.()}
                        style={{ padding: '0 10px', height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                      >
                        Админ
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={onLoginClick}
                      style={{ padding: '0 14px', height: 36, borderRadius: 999, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
                      className="hover-adaptive text-adaptive"
                    >
                      Войти
                    </button>
                    <button
                      onClick={onRegisterClick}
                      style={{ padding: '0 16px', height: 36, borderRadius: 999, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                    >
                      Регистрация
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── Mobile right side ── */}
            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                {currentUser && (
                  <>
                    <NotificationsPopover onNavigateToProfile={onProfileClick} />
                    <button
                      onClick={onCartClick}
                      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 999, background: 'none', border: 'none', cursor: 'pointer' }}
                      className="hover-adaptive"
                    >
                      <ShoppingCart className="icon-adaptive" style={{ width: 18, height: 18 }} />
                      {totalItems > 0 && (
                        <span style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', color: '#fff', fontSize: 10, borderRadius: 999, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {totalItems}
                        </span>
                      )}
                    </button>
                  </>
                )}

                {/* Theme toggle — compact on mobile */}
                <ThemeToggle isDark={isDarkMode} onToggle={onThemeToggle} />

                {/* Hamburger */}
                <button
                  onClick={() => setIsMobileMenuOpen(prev => !prev)}
                  aria-label="Открыть меню"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 999, background: 'none', border: 'none', cursor: 'pointer' }}
                  className="hover-adaptive"
                >
                  {isMobileMenuOpen
                    ? <X className="icon-adaptive" style={{ width: 20, height: 20 }} />
                    : <Menu className="icon-adaptive" style={{ width: 20, height: 20 }} />}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ── Mobile dropdown menu ── */}
        {isMobile && isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 16px 14px' }}>
              {currentUser ? (
                <>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {currentUser.firstName} {currentUser.lastName}
                  </div>
                  <MobileMenuItem icon="👤" label="Профиль" onClick={() => { onProfileClick?.(); setIsMobileMenuOpen(false); }} />
                  <MobileMenuItem icon={<MessageSquare style={{ width: 16, height: 16 }} />} label="Сообщения" onClick={() => { onMessagesClick?.(); setIsMobileMenuOpen(false); }} />
                  {isAdmin && (
                    <MobileMenuItem icon="🛡️" label="Панель администратора" onClick={() => { onAdminClick?.(); setIsMobileMenuOpen(false); }} style={{ color: '#ef4444' }} />
                  )}
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                  <MobileMenuItem icon={<LogOut style={{ width: 16, height: 16 }} />} label="Выйти" onClick={() => { onLogout?.(); setIsMobileMenuOpen(false); }} style={{ color: '#ef4444' }} />
                </>
              ) : (
                <>
                  <MobileMenuItem icon="🔑" label="Войти" onClick={() => { onLoginClick?.(); setIsMobileMenuOpen(false); }} />
                  <button
                    onClick={() => { onRegisterClick?.(); setIsMobileMenuOpen(false); }}
                    style={{ width: '100%', marginTop: 6, padding: '10px', borderRadius: 12, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                  >
                    Регистрация
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Filter Dropdown ── */}
      {isFilterOpen && (
        <div ref={filterRef} style={{ position: 'absolute', top: 60, left: 0, right: 0, zIndex: 50, background: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px' }}>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Регион */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Регион</label>
                    <Select onValueChange={(value: string) => handleFilterChange('region', value)}>
                      <SelectTrigger><SelectValue placeholder="Выберите регион" /></SelectTrigger>
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

                  {/* Опыт */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Опыт работы</label>
                    <Select onValueChange={(value: string) => handleFilterChange('experience', value)}>
                      <SelectTrigger><SelectValue placeholder="Выберите опыт" /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Выберите образование" /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Выберите зарплату" /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Выберите специализацию" /></SelectTrigger>
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

                  {/* График */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">График работы</label>
                    <Select onValueChange={(value: string) => handleFilterChange('schedule', value)}>
                      <SelectTrigger><SelectValue placeholder="Выберите график" /></SelectTrigger>
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(filters).length > 0 && `Выбрано фильтров: ${Object.keys(filters).length}`}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="outline" onClick={handleClearFilters}>
                      <X className="h-4 w-4 mr-2" /> Очистить все
                    </Button>
                    <Button onClick={() => setIsFilterOpen(false)}>
                      <Search className="h-4 w-4 mr-2" /> Показать результаты
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

// Helper component for mobile menu items
function MobileMenuItem({
  icon,
  label,
  onClick,
  style,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        textAlign: 'left',
        color: 'var(--foreground)',
        ...style,
      }}
      className="hover-adaptive"
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      {label}
    </button>
  );
}
