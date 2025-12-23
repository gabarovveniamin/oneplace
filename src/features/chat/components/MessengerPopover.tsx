import React, { useEffect, useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "../../../shared/ui/components/popover";
import { Button } from "../../../shared/ui/components/button";
import { ScrollArea } from "../../../shared/ui/components/scroll-area";
import { chatApiService, Chat } from '../../../core/api/chat';
import { authApiService } from '../../../core/api/auth';
import { cn } from '../../../shared/ui/components/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/ui/components/avatar';
import { useSocket } from '../../../core/socket/SocketContext';

interface MessengerPopoverProps {
    onChatSelect: (chat: Chat) => void;
    customTrigger?: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
}

export function MessengerPopover({ onChatSelect, customTrigger, side = "bottom", align = "end" }: MessengerPopoverProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { socket } = useSocket();

    const loadChats = async () => {
        try {
            const data = await chatApiService.getChats();
            setChats(data);
            setUnreadCount(data.reduce((acc, chat) => acc + (chat.unread_count || 0), 0));
        } catch (error) {
            console.error('Failed to load chats', error);
        }
    };

    useEffect(() => {
        if (authApiService.isAuthenticated()) {
            loadChats();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = () => {
            // Reload chats when a new message arrives to update last message and unread count
            loadChats();
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket]);

    const handleChatClick = (chat: Chat) => {
        onChatSelect(chat);
        setIsOpen(false);
    };

    if (!authApiService.isAuthenticated()) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {customTrigger ? (
                    <div className="relative cursor-pointer transition-transform hover:scale-105">
                        {customTrigger}
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                ) : (
                    <Button variant="ghost" size="icon" className="relative">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white ring-2 ring-background">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align={align} side={side} sideOffset={10}>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Сообщения</h4>
                    <Button variant="ghost" size="sm" className="h-auto py-1 text-xs text-blue-600 p-0">
                        Все чаты
                    </Button>
                </div>
                <ScrollArea className="h-[400px]">
                    {chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                            <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">Нет активных диалогов</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {chats.map((chat) => (
                                <div
                                    key={chat.other_user_id}
                                    className={cn(
                                        "flex items-center gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer text-left relative",
                                        chat.unread_count > 0 && "bg-blue-50/30 dark:bg-blue-900/10"
                                    )}
                                    onClick={() => handleChatClick(chat)}
                                >
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={chat.avatar || undefined} />
                                        <AvatarFallback>
                                            {chat.first_name[0]}{chat.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-semibold truncate leading-none">
                                                {chat.first_name} {chat.last_name}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(chat.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-xs truncate",
                                            chat.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                        )}>
                                            {chat.sender_id === authApiService.getCurrentUser()?.id && "Вы: "}{chat.last_message}
                                        </p>
                                    </div>
                                    {chat.unread_count > 0 && (
                                        <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
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
