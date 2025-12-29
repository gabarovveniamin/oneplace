import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/core/socket/SocketContext';
import { chatApiService, Chat, ChatMessage } from '@/core/api/chat';
import {
    Send,
    ArrowLeft,
    Search,
    MoreVertical,
    Phone,
    Paperclip,
    Smile,
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
    const { socket } = useSocket();
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
            <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-[#0e1621]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-blue-500 dark:border-[#6c7883] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-[#17212b] text-gray-900 dark:text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <div className={cn(
                "w-full md:w-[320px] flex flex-col border-r border-gray-200 dark:border-[#0e1621] bg-white dark:bg-[#17212b] transition-all",
                selectedChat && "hidden md:flex"
            )}>
                <div className="p-2 bg-white dark:bg-[#17212b]">
                    <div className="flex items-center justify-between mb-3 px-2">
                        <h1 className="text-lg font-medium text-gray-900 dark:text-white">OnePlace Messenger</h1>
                    </div>
                    <div className="relative px-2">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-[#707579]" />
                        <Input
                            placeholder="Поиск"
                            className="bg-gray-100 dark:bg-[#242f3d] border-0 pl-10 h-10 text-[15px] focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-[#707579] rounded-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {filteredChats.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-[#707579]">
                                <p>Чаты не найдены</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <button
                                    key={chat.other_user_id}
                                    onClick={() => loadMessages(chat)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 transition-colors",
                                        selectedChat?.other_user_id === chat.other_user_id
                                            ? "bg-blue-500 dark:bg-[#2b5278]"
                                            : "hover:bg-gray-100 dark:hover:bg-[#202b36]"
                                    )}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-12 w-12 bg-gradient-to-br from-[#4facfe] to-[#00f2fe]">
                                            <AvatarImage src={chat.avatar || undefined} />
                                            <AvatarFallback className="text-white font-medium text-lg bg-transparent">
                                                {chat.first_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={cn(
                                            "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full flex items-center justify-center",
                                            selectedChat?.other_user_id === chat.other_user_id ? "bg-blue-500 dark:bg-[#2b5278]" : "bg-white dark:bg-[#17212b]"
                                        )}>
                                            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-[#0e1621]/50 pb-3 ml-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={cn(
                                                "font-medium truncate text-[15px]",
                                                selectedChat?.other_user_id === chat.other_user_id ? "text-white" : "text-gray-900 dark:text-white"
                                            )}>
                                                {chat.first_name} {chat.last_name}
                                            </span>
                                            <span className={cn(
                                                "text-xs shrink-0",
                                                selectedChat?.other_user_id === chat.other_user_id ? "text-blue-100 dark:text-[#a2acb4]" : "text-gray-400 dark:text-[#6c7883]"
                                            )}>
                                                {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "text-[14px] truncate",
                                                selectedChat?.other_user_id === chat.other_user_id
                                                    ? "text-blue-50 dark:text-[#e5e5e5]"
                                                    : "text-gray-500 dark:text-[#707579]"
                                            )}>
                                                {chat.last_message}
                                            </p>
                                            {chat.unread_count > 0 && selectedChat?.other_user_id !== chat.other_user_id && (
                                                <span className="bg-blue-500 dark:bg-[#6c7883] text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
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
                "flex-1 flex flex-col bg-slate-50 dark:bg-[#0e1621] relative",
                !selectedChat && "hidden md:flex"
            )}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="h-[60px] border-b border-gray-200 dark:border-[#0e1621] px-4 flex items-center justify-between bg-white dark:bg-[#17212b] sticky top-0 z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden -ml-2 text-gray-500 dark:text-[#707579] hover:bg-gray-100 dark:hover:bg-[#2b2d31]"
                                    onClick={() => setSelectedChat(null)}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex flex-col">
                                    <h2 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                                        {selectedChat.first_name} {selectedChat.last_name}
                                    </h2>
                                    <span className="text-[13px] text-gray-500 dark:text-[#707579]">был(а) недавно</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 dark:text-[#707579]">
                                <Search className="h-5 w-5 cursor-pointer hover:text-gray-600 dark:hover:text-white" />
                                <Phone className="h-5 w-5 cursor-pointer hover:text-gray-600 dark:hover:text-white" />
                                <MoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-600 dark:hover:text-white" />
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 bg-slate-50 dark:bg-[#0e1621]">
                            <div className="p-4 space-y-2 flex flex-col justify-end min-h-full">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-[#707579]">
                                        <p>Нет сообщений. Напишите первым!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.sender_id === currentUser?.id;

                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "max-w-[70%] px-3 py-1.5 rounded-lg text-[15px] leading-relaxed relative group break-words shadow-sm",
                                                    isMe
                                                        ? "bg-blue-500 dark:bg-[#2b5278] text-white self-end rounded-tr-sm"
                                                        : "bg-white dark:bg-[#182533] text-gray-900 dark:text-white self-start rounded-tl-sm border border-gray-100 dark:border-transparent"
                                                )}
                                            >
                                                {msg.content}
                                                <div className="float-right ml-2 mt-2 flex items-center gap-1 opacity-60 select-none">
                                                    <span className={cn("text-[11px]", isMe ? "text-blue-50 dark:text-[#a2acb4]" : "text-gray-400 dark:text-[#a2acb4]")}>
                                                        {formatTime(msg.created_at)}
                                                    </span>
                                                    {isMe && (
                                                        <span className="text-blue-50 dark:text-[#a2acb4]">
                                                            {msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} className="h-0" />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-[#17212b] border-t border-gray-200 dark:border-[#0e1621]">
                            <form onSubmit={sendMessage} className="flex items-end gap-2 max-w-4xl mx-auto w-full">
                                <Button variant="ghost" size="icon" type="button" className="text-gray-400 dark:text-[#707579] hover:bg-gray-100 dark:hover:bg-white/5 h-10 w-10 flex-shrink-0">
                                    <Paperclip className="h-6 w-6" />
                                </Button>

                                <div className="flex-1 bg-gray-100 dark:bg-[#0e1621] rounded-xl flex items-center min-h-[42px] py-1">
                                    <textarea
                                        placeholder="Написать сообщение..."
                                        className="bg-transparent border-0 px-4 focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-[#707579] w-full resize-none h-[24px] max-h-[120px] py-0 leading-6 focus:outline-none"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        rows={1}
                                        disabled={sending}
                                    />
                                    <Button variant="ghost" size="icon" type="button" className="text-gray-400 dark:text-[#707579] hover:text-gray-600 dark:hover:text-white h-10 w-10">
                                        <Smile className="h-6 w-6" />
                                    </Button>
                                </div>

                                {newMessage.trim() ? (
                                    <Button
                                        type="submit"
                                        className="h-10 w-10 rounded-full bg-blue-500 dark:bg-[#2b5278] hover:bg-blue-600 dark:hover:bg-[#326291] p-0 flex-shrink-0 flex items-center justify-center transition-all"
                                        disabled={sending}
                                    >
                                        <Send className="h-5 w-5 text-white ml-0.5" />
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="icon" type="button" className="text-gray-400 dark:text-[#707579] hover:bg-gray-100 dark:hover:bg-white/5 h-10 w-10 flex-shrink-0">
                                        {/* Placeholder for voice message icon if needed */}
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-[#707579]" />
                                    </Button>
                                )}
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-[#0e1621]">
                        <span className="bg-slate-200 dark:bg-[#17212b] px-4 py-1 rounded-full text-sm text-gray-500 dark:text-white/50 mb-4 select-none">
                            Выберите чат, чтобы начать общение
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
