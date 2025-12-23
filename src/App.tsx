import { useState } from 'react';
import * as React from 'react';
import { Header, Hero, Footer } from './shared/ui/components';
import {
  FilterTabs,
  JobsList,
  JobDetails
} from './features/jobs/components';
import { Profile, PostJob } from './features/profile/components';
import { Registration, ExtendedResumeBuilder, AuthDialog } from './features/auth/components';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { Job, SearchFilters } from './shared/types/job';
import { useJobs } from './features/jobs/hooks/useJobs';
import { authApiService, UserResponse } from './core/api/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'job' | 'profile' | 'register' | 'resume-builder' | 'post-job' | 'admin'>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authDialogView, setAuthDialogView] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

  // Используем хук для работы с вакансиями
  const {
    jobs: filteredJobs,
    loading: jobsLoading,
    error: jobsError,
    activeFilter,
    setActiveFilter,
    searchFilters,
    handleAdvancedSearch,
    handleClearAdvancedSearch
  } = useJobs();

  // Подсчитываем количество активных фильтров
  const activeFiltersCount = Object.values(searchFilters).filter(value =>
    value !== undefined && value !== '' && value !== null
  ).length;

  // Логика фильтрации перенесена в useJobs хук

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('job');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedJob(null);
  };

  const handleProfileClick = () => {
    setCurrentView('profile');
  };

  const handleRegistrationClick = () => {
    setCurrentView('register');
  };

  const handleRegistrationComplete = () => {
    // Обновляем пользователя, так как он был сохранен в localStorage при регистрации
    const user = authApiService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === 'employer') {
        setCurrentView('profile'); // Работодателя отправляем в профиль
      } else {
        setCurrentView('resume-builder'); // Соискателя - создавать резюме
      }
    } else {
      // Fallback
      setCurrentView('resume-builder');
    }
  };

  const handleResumeComplete = () => {
    setCurrentView('profile');
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Обработчики поиска
  const handleHeaderSearch = (filters: SearchFilters) => {
    handleAdvancedSearch(filters);
    // Если есть ключевое слово, обновляем значение в поле поиска
    if (filters.keyword) {
      setSearchValue(filters.keyword);
    }
  };

  const handleHeaderClearSearch = () => {
    handleClearAdvancedSearch();
    setSearchValue('');
  };

  const handleSearchValueChange = (value: string) => {
    setSearchValue(value);
    // Если поле очищено, сбрасываем поиск
    if (!value.trim()) {
      handleClearAdvancedSearch();
    }
  };

  const handleLogoClick = () => {
    setCurrentView('home');
    setSelectedJob(null);
    // Очищаем хеш в URL
    window.location.hash = '';
  };

  // Синхронизируем поисковое поле с фильтрами при загрузке
  React.useEffect(() => {
    if (searchFilters.keyword && searchFilters.keyword !== searchValue) {
      setSearchValue(searchFilters.keyword);
    } else if (!searchFilters.keyword && searchValue) {
      setSearchValue('');
    }
  }, [searchFilters.keyword]);

  // Handle hash-based navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#register') {
        setCurrentView('register');
      } else if (window.location.hash === '#post-job') {
        const user = authApiService.getCurrentUser();
        if (user && (user.role === 'employer' || user.role === 'admin')) {
          setCurrentView('post-job');
        } else {
          // If not authorized, redirect to home
          window.location.hash = '';
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load current user from localStorage
  React.useEffect(() => {
    const user = authApiService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Handle theme persistence and application
  React.useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  React.useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    authApiService.logout();
    setCurrentUser(null);
    setCurrentView('home');
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header на всех страницах */}
      <Header
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        onSearch={handleHeaderSearch}
        onClearSearch={handleHeaderClearSearch}
        searchValue={searchValue}
        onSearchValueChange={handleSearchValueChange}
        activeFiltersCount={activeFiltersCount}
        onLogoClick={handleLogoClick}
        onLoginClick={() => {
          setAuthDialogView('login');
          setIsAuthDialogOpen(true);
        }}
        onRegisterClick={() => {
          setAuthDialogView('register');
          setIsAuthDialogOpen(true);
        }}
        onProfileClick={handleProfileClick}
        onAdminClick={() => setCurrentView('admin')}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Основной контент */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero />
            <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <JobsList
              jobs={filteredJobs}
              loading={jobsLoading}
              error={jobsError}
              onJobClick={handleJobClick}
            />
          </>
        )}

        {currentView === 'job' && selectedJob && (
          <JobDetails job={selectedJob} onBack={handleBackToHome} />
        )}

        {currentView === 'profile' && (
          <Profile
            onBack={handleBackToHome}
            onJobClick={handleJobClick}
            onAdminClick={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'register' && (
          <Registration
            onBack={handleBackToHome}
            onRegistrationComplete={handleRegistrationComplete}
          />
        )}

        {currentView === 'resume-builder' && (
          <ExtendedResumeBuilder
            onBack={() => setCurrentView('register')}
            onComplete={handleResumeComplete}
          />
        )}

        {currentView === 'post-job' && (
          <PostJob onBack={handleBackToHome} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onBack={handleBackToHome} />
        )}
      </main>

      {/* Quick Profile Access */}
      {currentView === 'home' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleProfileClick}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Footer на всех страницах */}
      <Footer />

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        defaultView={authDialogView}
      />
    </div>
  );
}