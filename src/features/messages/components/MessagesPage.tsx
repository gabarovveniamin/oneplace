import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/core/socket/SocketContext';
import { chatApiService, Chat, ChatMessage } from '@/core/api/chat';
import {
    Send,
    ArrowLeft,
    Search,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Smile,
    MessageSquare,
    Check,
    CheckCheck
} from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/components/avatar";
import { ScrollArea } from "@/shared/ui/components/scroll-area";
import { cn } from '@/shared/ui/components/utils';
import { authApiService } from '@/core/api/auth';

export function MessagesPage() {
    const { socket, isConnected } = useSocket();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = authApiService.getCurrentUser();

    // Загрузка списка чатов
    const loadChats = useCallback(async () => {
        try {
            const data = await chatApiService.getChats();
            setChats(data);
        } catch (error) {
            console.error('Failed to load chats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    // Загрузка сообщений
    const loadMessages = useCallback(async (chat: Chat) => {
        try {
            setSelectedChat(chat);
            const data = await chatApiService.getMessages(chat.other_user_id);
            setMessages(data);

            if (chat.unread_count > 0) {
                await chatApiService.markAsRead(chat.other_user_id);
                loadChats();
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [loadChats]);

    // WebSocket listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: ChatMessage) => {
            if (selectedChat && (message.sender_id === selectedChat.other_user_id || message.receiver_id === selectedChat.other_user_id)) {
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                if (message.sender_id === selectedChat.other_user_id) {
                    chatApiService.markAsRead(selectedChat.other_user_id).then(() => loadChats());
                }
            } else {
                loadChats();
            }
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, selectedChat, loadChats]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !selectedChat || sending) return;

        try {
            setSending(true);
            await chatApiService.sendMessage(selectedChat.other_user_id, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredChats = chats.filter(chat =>
        `${chat.first_name} ${chat.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[#0f172a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-blue-400 font-medium">Загрузка мессенджера...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#0f172a] text-white overflow-hidden">
            {/* Sidebar */}
            <div className={cn(
                "w-full md:w-[380px] flex flex-col border-r border-white/5 bg-[#0f172a] transition-all",
                selectedChat && "hidden md:flex"
            )}>
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Чаты</h1>
                        <Button variant="ghost" size="icon" className="hover:bg-white/5" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск контактов..."
                            className="bg-[#1e293b] border-0 pl-10 h-11 text-sm focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-muted-foreground rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="px-2 pb-4">
                        {filteredChats.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Чатов пока нет</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <button
                                    key={chat.other_user_id}
                                    onClick={() => loadMessages(chat)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all mb-1 text-left group",
                                        selectedChat?.other_user_id === chat.other_user_id
                                            ? "bg-blue-600 shadow-lg shadow-blue-600/20"
                                            : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-14 w-14 border-2 border-white/10 shadow-md">
                                            <AvatarImage src={chat.avatar || undefined} />
                                            <AvatarFallback className={cn(
                                                "bg-blue-500 text-white font-bold text-lg",
                                                selectedChat?.other_user_id === chat.other_user_id && "bg-white/20"
                                            )}>
                                                {chat.first_name[0]}{chat.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-[#0f172a] shadow-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn(
                                                "font-bold truncate text-base",
                                                selectedChat?.other_user_id === chat.other_user_id ? "text-white" : "text-slate-200"
                                            )}>
                                                {chat.first_name} {chat.last_name}
                                            </span>
                                            <span className={cn(
                                                "text-xs font-medium shrink-0",
                                                selectedChat?.other_user_id === chat.other_user_id ? "text-blue-100" : "text-muted-foreground"
                                            )}>
                                                {new Date(chat.last_message_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "text-sm truncate font-medium",
                                                selectedChat?.other_user_id === chat.other_user_id
                                                    ? "text-blue-50/80"
                                                    : chat.unread_count > 0 ? "text-white font-bold" : "text-muted-foreground"
                                            )}>
                                                {chat.last_message}
                                            </p>
                                            {chat.unread_count > 0 && selectedChat?.other_user_id !== chat.other_user_id && (
                                                <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 shadow-md animate-pulse">
                                                    {chat.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-[#0b1120] transition-all relative",
                !selectedChat && "hidden md:flex"
            )}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden -ml-2 hover:bg-white/5"
                                    onClick={() => setSelectedChat(null)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-blue-500/20 shadow-lg">
                                        <AvatarImage src={selectedChat.avatar || undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                            {selectedChat.first_name[0]}{selectedChat.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-[#0b1120]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">
                                        {selectedChat.first_name} {selectedChat.last_name}
                                    </h2>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Online</span>
                                        <span className="h-1 w-1 rounded-full bg-white/20" />
                                        <span className="text-xs text-muted-foreground">активен сейчас</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/5 hidden sm:flex">
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/5 hidden sm:flex">
                                    <Video className="h-5 w-5" />
                                </Button>
                                <div className="h-6 w-[1px] bg-white/5 mx-2 hidden sm:block" />
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/5">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 bg-gradient-to-b from-[#0b1120] to-[#0f172a]/50">
                            <div className="p-6 space-y-6">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    const nextMsg = messages[idx + 1];
                                    const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-300",
                                                isMe ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "max-w-[70%] flex flex-col",
                                                isMe ? "items-end" : "items-start"
                                            )}>
                                                <div className={cn(
                                                    "px-5 py-3.5 rounded-2xl shadow-xl relative transition-all group-hover:scale-[1.01]",
                                                    isMe
                                                        ? "bg-blue-600 text-white rounded-tr-[4px] shadow-blue-600/10"
                                                        : "bg-[#1e293b] text-slate-100 rounded-tl-[4px] border border-white/5"
                                                )}>
                                                    <p className="text-base leading-relaxed break-words font-medium">
                                                        {msg.content}
                                                    </p>
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 mt-2 justify-end opacity-60",
                                                        isMe ? "text-blue-50" : "text-slate-400"
                                                    )}>
                                                        <span className="text-[10px] font-bold">
                                                            {formatTime(msg.created_at)}
                                                        </span>
                                                        {isMe && (
                                                            msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-6 bg-[#0f172a]/80 backdrop-blur-xl border-t border-white/5">
                            <form onSubmit={sendMessage} className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-white hover:bg-white/5 h-12 w-12 rounded-xl">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-white hover:bg-white/5 h-12 w-12 rounded-xl hidden sm:flex">
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Введите сообщение..."
                                        className="bg-[#1e293b] border-0 h-12 px-6 rounded-2xl focus:ring-2 focus:ring-blue-500/30 text-white text-base placeholder:text-muted-foreground/50 w-full"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={sending}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className={cn(
                                        "h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all p-0 flex-shrink-0",
                                        !newMessage.trim() && "opacity-50 grayscale"
                                    )}
                                    disabled={!newMessage.trim() || sending}
                                >
                                    <Send className="h-5 w-5 text-white" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-b from-[#0b1120] to-[#0f172a]">
                        <div className="relative mb-8 text-blue-500">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                            <div className="relative w-32 h-32 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center backdrop-blur-sm">
                                <MessageSquare className="h-16 w-16 opacity-40 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Ваш Мессенджер</h3>
                        <p className="text-slate-400 max-w-sm text-lg font-medium leading-relaxed">
                            Выберите собеседника из списка слева, чтобы начать продуктивный диалог
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
