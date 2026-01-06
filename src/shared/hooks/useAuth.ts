import { useState, useEffect } from 'react';
import { authApiService, UserResponse } from '../../core/api/auth';

export function useAuth() {
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

    useEffect(() => {
        const user = authApiService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    const login = (user: UserResponse) => {
        setCurrentUser(user);
    };

    const logout = () => {
        authApiService.logout();
        setCurrentUser(null);
        window.location.hash = '';
        window.location.reload();
    };

    return {
        currentUser,
        setCurrentUser,
        login,
        logout
    };
}
