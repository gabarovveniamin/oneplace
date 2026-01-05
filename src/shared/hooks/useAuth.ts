import { useState, useEffect } from 'react';
import { authApiService, UserResponse } from '../../core/api/auth';

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [authDialogView, setAuthDialogView] = useState<'login' | 'register'>('login');

    useEffect(() => {
        const user = authApiService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    const login = (user: UserResponse) => {
        setCurrentUser(user);
        setIsAuthDialogOpen(false);
    };

    const logout = () => {
        authApiService.logout();
        setCurrentUser(null);
        window.location.hash = '';
        window.location.reload();
    };

    const openLogin = () => {
        setAuthDialogView('login');
        setIsAuthDialogOpen(true);
    };

    const openRegister = () => {
        setAuthDialogView('register');
        setIsAuthDialogOpen(true);
    };

    return {
        currentUser,
        setCurrentUser,
        isAuthDialogOpen,
        setIsAuthDialogOpen,
        authDialogView,
        setAuthDialogView,
        login,
        logout,
        openLogin,
        openRegister
    };
}
