import { useState, useEffect } from 'react';
import { Header, Hero, Footer } from './shared/ui/components';
import { MessageSquare } from 'lucide-react';
import {
  FilterTabs,
  JobsList,
  JobDetails
} from './features/jobs/components';
import { Profile, PostJob, ResumeViewer } from './features/profile/components';
import { Registration, ExtendedResumeBuilder, AuthDialog } from './features/auth/components';
import { ChatWindow } from './features/chat/components/ChatWindow';
import { MessengerPopover } from './features/chat/components/MessengerPopover';
import { MessagesPage } from './features/messages/components/MessagesPage';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { ServiceHub } from './features/hub/components/ServiceHub';
import { MarketPage } from './features/market/components/MarketPage';
import { PostMarketItem } from './features/market/components/PostMarketItem';
import { Job, SearchFilters } from './shared/types/job';
import { Chat } from './core/api/chat';
import { useJobs } from './features/jobs/hooks/useJobs';
import { authApiService, UserResponse } from './core/api/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<'hub' | 'home' | 'job' | 'profile' | 'register' | 'resume-builder' | 'resume-viewer' | 'post-job' | 'admin' | 'messages' | 'market' | 'market-post'>('hub');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authDialogView, setAuthDialogView] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [viewTargetUserId, setViewTargetUserId] = useState<string | undefined>(undefined);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

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

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#register') {
        setCurrentView('register');
      } else if (hash === '#post-job') {
        const user = authApiService.getCurrentUser();
        if (user && (user.role === 'employer' || user.role === 'admin')) {
          setCurrentView('post-job');
        } else {
          window.location.hash = '';
          setCurrentView('home');
        }
      } else if (hash === '#messages') {
        const user = authApiService.getCurrentUser();
        if (user) {
          setCurrentView('messages');
        } else {
          window.location.hash = '';
          setCurrentView('home');
        }
      } else if (hash.startsWith('#resume/')) {
        const userId = hash.split('/')[1];
        if (userId) {
          setViewTargetUserId(userId);
          setCurrentView('resume-viewer');
        }
      } else if (hash.startsWith('#profile/')) {
        const userId = hash.split('/')[1];
        if (userId) {
          setViewTargetUserId(userId);
          setCurrentView('profile');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);


  const activeFiltersCount = Object.values(searchFilters).filter(value =>
    value !== undefined && value !== '' && value !== null
  ).length;


  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('job');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedJob(null);
  };

  const handleProfileClick = () => {
    setViewTargetUserId(undefined);
    window.location.hash = '';
    setCurrentView('profile');
  };

  const handleRegistrationClick = () => {
    setCurrentView('register');
  };

  const handleRegistrationComplete = (choice: 'basic' | 'extended', explicitUser?: UserResponse) => {
    // Используем переданного пользователя или получаем из хранилища
    const user = explicitUser || authApiService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
      if (user.role === 'employer') {
        setCurrentView('profile');
      } else {
        if (choice === 'basic') {
          // Если выбрано "Позже" (обычное) - сразу в профиль
          setCurrentView('profile');
        } else {
          // Если "Настроить" (расширенное) - в конструктор
          setCurrentView('resume-builder');
        }
      }
    } else {
      console.error('No user found after registration, redirecting to home');
      setCurrentView('hub');
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
    setCurrentView('hub');
    setSelectedJob(null);
    // Очищаем хеш в URL
    window.location.hash = '';
  };

  const handleLogout = () => {
    authApiService.logout();
    setCurrentUser(null);
    setCurrentView('hub');
    setIsAuthDialogOpen(false);
    window.location.hash = '';
  };

  // Синхронизируем поисковое поле с фильтрами при загрузке
  useEffect(() => {
    if (searchFilters.keyword && searchFilters.keyword !== searchValue) {
      setSearchValue(searchFilters.keyword);
    } else if (!searchFilters.keyword && searchValue) {
      setSearchValue('');
    }
  }, [searchFilters.keyword]);

  // Load current user from localStorage
  useEffect(() => {
    const user = authApiService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Handle theme persistence and application
  useEffect(() => {
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

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);


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
        onMessagesClick={() => {
          window.location.hash = '#messages';
          setCurrentView('messages');
        }}
        onMarketClick={() => setCurrentView('market')}
        onAdminClick={() => setCurrentView('admin')}
        onLogout={handleLogout}
        currentUser={currentUser}
        showSearch={currentView === 'home'}
      />

      {/* Chat Window - Global */}
      {activeChat && (
        <ChatWindow
          userId={activeChat.other_user_id}
          userName={`${activeChat.first_name} ${activeChat.last_name}`}
          userAvatar={activeChat.avatar}
          onClose={() => setActiveChat(null)}
        />
      )}

      {/* Основной контент */}
      {currentView === 'messages' ? (
        <MessagesPage isDarkMode={isDarkMode} />
      ) : (
        <main className="flex-1">
          {currentView === 'hub' && (
            <ServiceHub onSelectService={(service) => {
              if (service === 'jobs') setCurrentView('home');
              if (service === 'market') setCurrentView('market');
            }} />
          )}

          {currentView === 'market' && (
            <MarketPage
              onBack={() => setCurrentView('hub')}
              onPostClick={() => setCurrentView('market-post')}
            />
          )}

          {currentView === 'market-post' && (
            <PostMarketItem
              onBack={() => setCurrentView('market')}
              onComplete={() => setCurrentView('market')}
            />
          )}

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
              userId={viewTargetUserId}
              onChatOpen={setActiveChat}
              onPostMarketItem={() => setCurrentView('market-post')}
              onBack={() => {
                handleBackToHome();
                setViewTargetUserId(undefined);
                window.location.hash = '';
              }}
              onJobClick={handleJobClick}
              onAdminClick={() => setCurrentView('admin')}
              onCreateResume={() => setCurrentView('resume-builder')}
              onShowResume={() => {
                if (viewTargetUserId) {
                  window.location.hash = `#resume/${viewTargetUserId}`;
                } else {
                  setCurrentView('resume-viewer');
                }
              }}
            />
          )}

          {currentView === 'register' && (
            <Registration
              onBack={handleBackToHome}
              onRegistrationComplete={(user) => handleRegistrationComplete('basic', user)} // Fallback
              onResumeChoice={handleRegistrationComplete}
              onSwitchToLogin={() => {
                setCurrentView('home');
                setAuthDialogView('login');
                setIsAuthDialogOpen(true);
              }}
            />
          )}

          {currentView === 'resume-builder' && (
            <ExtendedResumeBuilder
              onBack={() => setCurrentView('profile')}
              onComplete={() => setCurrentView('resume-viewer')}
            />
          )}

          {currentView === 'resume-viewer' && (
            <ResumeViewer
              onBack={() => {
                if (viewTargetUserId) {
                  // Return to the public profile view
                  window.location.hash = `#resume/${viewTargetUserId}`;
                } else {
                  setCurrentView('resume-viewer');
                }
              }}
              onEdit={() => setCurrentView('resume-builder')}
              userId={viewTargetUserId}
              readOnly={!!viewTargetUserId}
            />
          )}
          {currentView === 'post-job' && (
            <PostJob onBack={handleBackToHome} />
          )}

          {currentView === 'admin' && (
            <AdminDashboard onBack={handleBackToHome} />
          )}
        </main>
      )}



      {/* Footer на всех страницах, кроме мессенджера */}
      {currentView !== 'messages' && <Footer />}

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        defaultView={authDialogView}
        onResumeChoice={(choice) => {
          setIsAuthDialogOpen(false);
          const user = authApiService.getCurrentUser();
          setCurrentUser(user);
          if (choice === 'extended') {
            setCurrentView('resume-builder');
          } else {
            setCurrentView('profile'); // Or stay on home? User asked for "like in profile"
          }
        }}
      />
    </div>
  );
}