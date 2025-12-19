import React, { useEffect, useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "../../../shared/ui/components/popover";
import { Button } from "../../../shared/ui/components/button";
import { ScrollArea } from "../../../shared/ui/components/scroll-area";
import { notificationsApiService, Notification } from '../../../core/api/notifications';
import { authApiService } from '../../../core/api/auth';
import { cn } from '../../../shared/ui/components/utils';

import { useSocket } from '../../../core/socket/SocketContext';

interface NotificationsPopoverProps {
    onNavigateToProfile?: () => void;
}

export function NotificationsPopover({ onNavigateToProfile }: NotificationsPopoverProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { socket } = useSocket();

    // Initial load
    useEffect(() => {
        if (authApiService.isAuthenticated()) {
            loadNotifications();
        }
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: Notification) => {
            console.log('📬 Real-time notification received:', notification);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        socket.on('notification', handleNewNotification);

        return () => {
            socket.off('notification', handleNewNotification);
        };
    }, [socket]);

    const loadNotifications = async () => {
        try {
            const data = await notificationsApiService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await notificationsApiService.markAsRead([id]);
        } catch (error) {
            console.error('Failed to mark as read', error);
            loadNotifications(); // Revert on error
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await handleMarkAsRead(notification.id);
        }

        // Navigate if related to applications
        if (onNavigateToProfile && (notification.type === 'new_application' || notification.type === 'application_status')) {
            onNavigateToProfile();
            setIsOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length === 0) return;

            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);

            await notificationsApiService.markAsRead('all');
        } catch (error) {
            console.error('Failed to mark all as read', error);
            loadNotifications();
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (!notifications.find(n => n.id === id)?.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            await notificationsApiService.delete(id);
        } catch (error) {
            console.error('Failed to delete notification', error);
            loadNotifications();
        }
    };

    if (!authApiService.isAuthenticated()) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse ring-2 ring-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Уведомления</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 text-blue-600 hover:text-blue-700 p-0"
                            onClick={handleMarkAllRead}
                        >
                            Прочитать все
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Нет новых уведомлений</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-4 transition-colors hover:bg-muted/50 cursor-pointer text-left relative group",
                                        !notification.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={cn(
                                            "text-sm font-medium leading-none",
                                            !notification.is_read && "text-blue-700 dark:text-blue-400"
                                        )}>
                                            {notification.title}
                                        </p>
                                        <button
                                            onClick={(e) => handleDelete(notification.id, e)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-500"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        {new Date(notification.created_at).toLocaleString('ru-RU', {
                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                    {!notification.is_read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
