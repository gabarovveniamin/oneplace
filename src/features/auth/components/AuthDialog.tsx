import React, { useState, useEffect } from 'react';
import { Login } from './Login';
import { Registration } from './Registration';

interface AuthDialogProps {
    isOpen: boolean;
    onClose: () => void;
    defaultView?: 'login' | 'register';
    onSuccess?: () => void;
    onResumeChoice?: (type: 'basic' | 'extended') => void;
}

export function AuthDialog({
    isOpen,
    onClose,
    defaultView = 'login',
    onSuccess,
    onResumeChoice
}: AuthDialogProps) {
    const [view, setView] = useState<'login' | 'register'>(defaultView);

    // Синхронизируем view с defaultView при открытии
    useEffect(() => {
        if (isOpen) {
            setView(defaultView);
        }
    }, [isOpen, defaultView]);

    const handleLoginSuccess = () => {
        onSuccess?.();
        onClose();
        // Перезагружаем страницу для обновления UI с авторизованным пользователем
        window.location.reload();
    };

    const handleRegistrationComplete = () => {
        onSuccess?.();
        onClose();
        // Перезагружаем страницу для обновления UI с авторизованным пользователем
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {view === 'login' ? (
                <Login
                    onBack={onClose}
                    onLoginSuccess={handleLoginSuccess}
                    onSwitchToRegister={() => setView('register')}
                />
            ) : (
                <Registration
                    onBack={onClose}
                    onRegistrationComplete={handleRegistrationComplete}
                    onSwitchToLogin={() => setView('login')}
                    onResumeChoice={(type, user) => {
                        onClose();
                        if (onResumeChoice) {
                            onResumeChoice(type);
                        } else {
                            window.location.reload();
                        }
                    }}
                />
            )}
        </div>
    );
}
