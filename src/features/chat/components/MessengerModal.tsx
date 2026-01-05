import React, { useState, useEffect } from 'react';
import {
    Search,
    X,
    Paperclip,
    Smile,
    Send,
    Phone,
    Video,
    MoreVertical,
    MessageSquare
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
} from "../../../shared/ui/components/dialog";
import { Button } from "../../../shared/ui/components/button";
import { Input } from "../../../shared/ui/components/input";
import { ScrollArea } from "../../../shared/ui/components/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../../../shared/ui/components/avatar";
import { chatApiService, Chat } from '../../../core/api/chat';
import { useChat } from '../hooks/useChat';
import { authApiService } from '../../../core/api/auth';
import { cn } from '../../../shared/ui/components/utils';
import { useSocket } from '../../../core/socket/SocketContext';
import { ModernAudioPlayer } from './ModernAudioPlayer';
import { config } from '../../../config/env';

export function MessengerModal() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const { socket } = useSocket();

    const { messages, loading, sending, sendMessage, messagesEndRef } = useChat(selectedChat?.other_user_id || null);
    const currentUser = authApiService.getCurrentUser();

    const loadChats = async () => {
        try {
            const data = await chatApiService.getChats();
            setChats(data);
        } catch (error) {
            console.error('Failed to load chats', error);
        }
    };

    useEffect(() => {
        if (authApiService.isAuthenticated()) {
            loadChats();
        }
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = () => {
            loadChats();
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageContent.trim() || sending || !selectedChat) return;

        await sendMessage(messageContent);
        setMessageContent('');
    };

    const filteredChats = chats.filter(chat =>
        `${chat.first_name} ${chat.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnreadCount = chats.reduce((acc, chat) => acc + (chat.unread_count || 0), 0);

    return (
        <Dialog onOpenChange={(open) => { if (open) loadChats(); }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/10 flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    {totalUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 border-[#0f172a]">
                            {totalUnreadCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl p-0 gap-0 bg-[#0f172a] border-white/5 overflow-hidden h-[80vh] flex flex-row">
                <DialogTitle className="sr-only">Сообщения</DialogTitle>
                <DialogDescription className="sr-only">Мессенджер для общения</DialogDescription>

                {/* Sidebar */}
                <div className="w-80 border-r border-white/5 flex flex-col bg-[#0f172a] flex-shrink-0">
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Сообщения</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Поиск..."
                                className="bg-[#1e293b] border-0 pl-10 h-10 text-sm focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-muted-foreground"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="px-2">
                            {filteredChats.map((chat) => (
                                <button
                                    key={chat.other_user_id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 text-left",
                                        selectedChat?.other_user_id === chat.other_user_id
                                            ? "bg-blue-600/20 text-white"
                                            : "hover:bg-white/5 text-muted-foreground hover:text-white"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 border border-white/10">
                                            <AvatarImage src={chat.avatar || undefined} />
                                            <AvatarFallback className="bg-blue-500 text-white">
                                                {chat.first_name[0]}{chat.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0f172a]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="font-semibold text-sm truncate uppercase">
                                                {chat.first_name} {chat.last_name}
                                            </span>
                                            <span className="text-[10px] opacity-50">
                                                {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs truncate opacity-70">
                                                {chat.last_message}
                                            </p>
                                            {chat.unread_count > 0 && (
                                                <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                                                    {chat.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-[#0b1120]">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-white/5 px-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={selectedChat.avatar || undefined} />
                                        <AvatarFallback className="bg-blue-500 text-white">
                                            {selectedChat.first_name[0]}{selectedChat.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-white leading-none">
                                            {selectedChat.first_name} {selectedChat.last_name}
                                        </h3>
                                        <p className="text-xs text-blue-400 mt-1">Online</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                                        <Phone className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                                        <Video className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {messages.map((msg) => {
                                        const isMe = msg.sender_id === currentUser?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex w-full",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "max-w-[75%] px-4 py-2 rounded-2xl relative shadow-sm",
                                                        isMe
                                                            ? "bg-[#246bfd] text-white rounded-tr-sm"
                                                            : "bg-[#1e293b] text-white rounded-tl-sm"
                                                    )}
                                                >
                                                    <div className="text-[14px] leading-relaxed pr-8">
                                                        {msg.content.includes('/uploads/voice/') ? (
                                                            <ModernAudioPlayer
                                                                url={msg.content.startsWith('http') ? msg.content : `${config.api.baseUrl.replace('/api', '')}${msg.content}`}
                                                                isMe={isMe}
                                                            />
                                                        ) : (
                                                            msg.content
                                                        )}
                                                    </div>
                                                    <span className="absolute bottom-1 right-2 text-[10px] opacity-60">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-4 bg-[#0f172a]">
                                <form onSubmit={handleSend} className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-white">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <div className="flex-1 relative">
                                        <Input
                                            placeholder="Написать сообщение..."
                                            className="bg-[#1e293b] border-0 h-11 pr-10 rounded-xl focus:ring-1 focus:ring-blue-500/50 text-white"
                                            value={messageContent}
                                            onChange={(e) => setMessageContent(e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                        >
                                            <Smile className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg p-0"
                                        disabled={!messageContent.trim() || sending}
                                    >
                                        <Send className="h-5 w-5 text-white" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <MessageSquare className="h-10 w-10 opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Ваши сообщения</h3>
                            <p className="text-sm max-w-xs">Выберите чат из списка слева, чтобы начать общение</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
