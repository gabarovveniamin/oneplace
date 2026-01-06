import { useState, useEffect } from 'react';
import { authApiService } from '../../core/api/auth';

export type ViewType = 'hub' | 'home' | 'job' | 'profile' | 'register' | 'login' | 'resume-builder' | 'resume-viewer' | 'post-job' | 'admin' | 'messages' | 'market' | 'market-post' | 'market-item' | 'market-cart';

export function useViewManager() {
    const [currentView, setCurrentView] = useState<ViewType>('hub');
    const [viewTargetUserId, setViewTargetUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#register') {
                setCurrentView('register');
            } else if (hash === '#login') {
                setCurrentView('login');
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

    const navigateTo = (view: ViewType, targetUserId?: string) => {
        if (targetUserId) setViewTargetUserId(targetUserId);
        setCurrentView(view);
        if (view === 'hub') window.location.hash = '';
    };

    return {
        currentView,
        setCurrentView,
        viewTargetUserId,
        setViewTargetUserId,
        navigateTo
    };
}
