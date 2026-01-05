import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header, Hero, Footer } from './shared/ui/components';
import { PageWrapper } from './shared/ui/components/PageWrapper';
import {
  FilterTabs,
  JobsList,
  JobDetails
} from './features/jobs/components';
import { Profile, PostJob, ResumeViewer } from './features/profile/components';
import { Registration, ExtendedResumeBuilder, AuthDialog } from './features/auth/components';
import { ChatWindow } from './features/chat/components/ChatWindow';
import { MessagesPage } from './features/messages/components/MessagesPage';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { ServiceHub } from './features/hub/components/ServiceHub';
import { MarketPage } from './features/market/components/MarketPage';
import { PostMarketItem } from './features/market/components/PostMarketItem';
import { MarketItemDetails } from './features/market/components/MarketItemDetails';
import { CartPage } from './features/market/components/CartPage';
import { MarketListing, marketApiService } from './core/api/market';
import { Job, SearchFilters } from './shared/types/job';
import { Chat } from './core/api/chat';
import { useJobs } from './features/jobs/hooks/useJobs';
import { authApiService, UserResponse } from './core/api/auth';
import { Toaster, toast } from 'sonner';

// Custom Hooks for refactoring
import { useTheme } from './shared/hooks/useTheme';
import { useAuth } from './shared/hooks/useAuth';
import { useViewManager } from './shared/hooks/useViewManager';

export default function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    currentUser,
    setCurrentUser,
    isAuthDialogOpen,
    setIsAuthDialogOpen,
    authDialogView,
    setAuthDialogView,
    logout,
    openLogin,
    openRegister
  } = useAuth();
  const {
    currentView,
    setCurrentView,
    viewTargetUserId,
    setViewTargetUserId,
    navigateTo
  } = useViewManager();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedMarketItem, setSelectedMarketItem] = useState<MarketListing | null>(null);
  const [searchValue, setSearchValue] = useState('');
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

  const activeFiltersCount = Object.values(searchFilters).filter(value =>
    value !== undefined && value !== '' && value !== null
  ).length;

  // Handlers
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

  const handleRegistrationComplete = (choice: 'basic' | 'extended', explicitUser?: UserResponse) => {
    const user = explicitUser || authApiService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === 'employer') {
        setCurrentView('profile');
      } else {
        setCurrentView(choice === 'basic' ? 'profile' : 'resume-builder');
      }
    } else {
      setCurrentView('hub');
    }
  };

  const handleHeaderSearch = (filters: SearchFilters) => {
    handleAdvancedSearch(filters);
    if (filters.keyword) setSearchValue(filters.keyword);
  };

  const handleHeaderClearSearch = () => {
    handleClearAdvancedSearch();
    setSearchValue('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        onSearch={handleHeaderSearch}
        onClearSearch={handleHeaderClearSearch}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        activeFiltersCount={activeFiltersCount}
        onLogoClick={() => navigateTo('hub')}
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        onProfileClick={handleProfileClick}
        onMessagesClick={() => {
          window.location.hash = '#messages';
          setCurrentView('messages');
        }}
        onMarketClick={() => setCurrentView('market')}
        onCartClick={() => setCurrentView('market-cart')}
        onAdminClick={() => setCurrentView('admin')}
        onLogout={logout}
        currentUser={currentUser}
        showSearch={currentView === 'home'}
      />

      {activeChat && (
        <ChatWindow
          userId={activeChat.other_user_id}
          userName={`${activeChat.first_name} ${activeChat.last_name}`}
          userAvatar={activeChat.avatar}
          onClose={() => setActiveChat(null)}
        />
      )}

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'hub' && (
            <PageWrapper key="hub">
              <ServiceHub onSelectService={(service) => {
                if (service === 'jobs') setCurrentView('home');
                if (service === 'market') setCurrentView('market');
              }} />
            </PageWrapper>
          )}

          {currentView === 'market' && (
            <PageWrapper key="market">
              <MarketPage
                onBack={() => setCurrentView('hub')}
                onPostClick={() => setCurrentView('market-post')}
                onItemClick={(item) => {
                  setSelectedMarketItem(item);
                  setCurrentView('market-item');
                }}
              />
            </PageWrapper>
          )}

          {currentView === 'market-item' && selectedMarketItem && (
            <PageWrapper key="market-item">
              <MarketItemDetails
                item={selectedMarketItem}
                onBack={() => setCurrentView('market')}
                onChatOpen={(user) => {
                  setActiveChat({
                    id: '',
                    other_user_id: user.other_user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar: user.avatar,
                    content: '',
                    created_at: new Date().toISOString(),
                    is_read: true
                  } as any);
                }}
              />
            </PageWrapper>
          )}

          {currentView === 'market-post' && (
            <PageWrapper key="market-post">
              <PostMarketItem
                onBack={() => setCurrentView('market')}
                onComplete={() => setCurrentView('market')}
              />
            </PageWrapper>
          )}

          {currentView === 'market-cart' && (
            <PageWrapper key="market-cart">
              <CartPage
                onBack={() => setCurrentView('market')}
                onCheckout={() => toast.info('Оформление заказа в разработке')}
                onItemClick={async (id: string) => {
                  try {
                    const item = await marketApiService.getListingById(id);
                    setSelectedMarketItem(item);
                    setCurrentView('market-item');
                  } catch (e) {
                    toast.error('Не удалось загрузить товар');
                  }
                }}
              />
            </PageWrapper>
          )}

          {currentView === 'home' && (
            <PageWrapper key="home">
              <Hero />
              <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              <JobsList
                jobs={filteredJobs}
                loading={jobsLoading}
                error={jobsError}
                onJobClick={handleJobClick}
              />
            </PageWrapper>
          )}

          {currentView === 'job' && selectedJob && (
            <PageWrapper key="job">
              <JobDetails job={selectedJob} onBack={handleBackToHome} />
            </PageWrapper>
          )}

          {currentView === 'profile' && (
            <PageWrapper key="profile">
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
            </PageWrapper>
          )}

          {currentView === 'messages' && (
            <PageWrapper key="messages">
              <MessagesPage isDarkMode={isDarkMode} />
            </PageWrapper>
          )}

          {currentView === 'register' && (
            <PageWrapper key="register">
              <Registration
                onBack={handleBackToHome}
                onRegistrationComplete={(user) => handleRegistrationComplete('basic', user)}
                onResumeChoice={handleRegistrationComplete}
                onSwitchToLogin={openLogin}
              />
            </PageWrapper>
          )}

          {currentView === 'resume-builder' && (
            <PageWrapper key="resume-builder">
              <ExtendedResumeBuilder
                onBack={() => setCurrentView('profile')}
                onComplete={() => setCurrentView('resume-viewer')}
              />
            </PageWrapper>
          )}

          {currentView === 'resume-viewer' && (
            <PageWrapper key="resume-viewer">
              <ResumeViewer
                onBack={() => {
                  if (viewTargetUserId) {
                    window.location.hash = `#profile/${viewTargetUserId}`;
                  } else {
                    setCurrentView('profile');
                  }
                }}
                onEdit={() => setCurrentView('resume-builder')}
                userId={viewTargetUserId}
                readOnly={!!viewTargetUserId}
              />
            </PageWrapper>
          )}

          {currentView === 'post-job' && (
            <PageWrapper key="post-job">
              <PostJob onBack={handleBackToHome} />
            </PageWrapper>
          )}

          {currentView === 'admin' && (
            <PageWrapper key="admin">
              <AdminDashboard onBack={handleBackToHome} />
            </PageWrapper>
          )}
        </AnimatePresence>
      </main>

      {currentView !== 'messages' && <Footer />}

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        defaultView={authDialogView}
        onResumeChoice={(choice) => {
          setIsAuthDialogOpen(false);
          const user = authApiService.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setCurrentView(choice === 'extended' ? 'resume-builder' : 'profile');
          }
        }}
      />
      <Toaster position="top-center" richColors />
    </div>
  );
}