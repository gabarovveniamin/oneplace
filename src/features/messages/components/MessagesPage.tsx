import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/core/socket/SocketContext';
import { chatApiService } from '@/core/api/chat';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

interface Chat {
    other_user_id: string;
    first_name: string;
    last_name: string;
    avatar?: string | null;
    last_message: string;
    last_message_at: string;
    unread_count: number;
    is_read: boolean;
    sender_id: string;
}

export function MessagesPage() {
    const { socket, isConnected } = useSocket();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserId = localStorage.getItem('userId');

    // Загрузка списка чатов
    useEffect(() => {
        loadChats();
    }, []);

    // Подписка на новые сообщения через WebSocket
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            console.log('📨 New message received:', message);
            // Обновляем список сообщений если чат открыт
            if (selectedChat && (message.sender_id === selectedChat.other_user_id || message.receiver_id === selectedChat.other_user_id)) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();

                // Помечаем как прочитанное
                if (message.sender_id === selectedChat.other_user_id) {
                    chatApiService.markAsRead(selectedChat.other_user_id);
                }
            }

            // Обновляем список чатов
            loadChats();
        };

        socket.on('new_message', handleNewMessage);
        console.log('🔌 WebSocket listener attached for new_message');

        return () => {
            socket.off('new_message', handleNewMessage);
            console.log('🔌 WebSocket listener removed for new_message');
        };
    }, [socket, selectedChat]);

    // Автоскролл вниз при новых сообщениях
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChats = async () => {
        try {
            const data = await chatApiService.getChats();
            setChats(data);
        } catch (error) {
            console.error('Failed to load chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chat: Chat) => {
        try {
            setSelectedChat(chat);
            const data = await chatApiService.getMessages(chat.other_user_id);
            setMessages(data);

            // Помечаем сообщения как прочитанные
            if (chat.unread_count > 0) {
                await chatApiService.markAsRead(chat.other_user_id);
                loadChats(); // Обновляем счётчик
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            await chatApiService.sendMessage(selectedChat.other_user_id, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Загрузка чатов...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Список чатов */}
            <div className={`w-full md:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${selectedChat ? 'hidden md:block' : ''}`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold">Сообщения</h1>
                        <Button variant="ghost" size="icon" onClick={() => window.location.hash = ''}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-73px)]">
                    {chats.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-semibold">Нет активных чатов</p>
                            <p className="text-sm mt-2">Чаты появятся после откликов на вакансии</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.other_user_id}
                                onClick={() => loadMessages(chat)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-200 ${selectedChat?.other_user_id === chat.other_user_id
                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-l-blue-600'
                                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                            {chat.first_name[0]}{chat.last_name[0]}
                                        </div>
                                        {chat.unread_count > 0 && chat.sender_id !== currentUserId && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                                                {chat.unread_count}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold truncate text-gray-900 dark:text-white">
                                                {chat.first_name} {chat.last_name}
                                            </h3>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {new Date(chat.last_message_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${chat.unread_count > 0 && chat.sender_id !== currentUserId
                                                ? 'font-bold text-gray-900 dark:text-white'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {chat.last_message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Окно чата */}
            <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : ''}`}>
                {selectedChat ? (
                    <>
                        {/* Шапка чата */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setSelectedChat(null)}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {selectedChat.first_name[0]}{selectedChat.last_name[0]}
                            </div>
                            <div className="flex-1">
                                <h2 className="font-semibold">{selectedChat.first_name} {selectedChat.last_name}</h2>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <p className="text-xs text-gray-500">{isConnected ? 'Онлайн' : 'Оффлайн'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Сообщения */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
                            {messages.map((message) => {
                                const isOwn = message.sender_id === currentUserId;
                                return (
                                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg backdrop-blur-sm ${isOwn
                                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md shadow-blue-500/30'
                                            : 'bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white border border-slate-600 dark:border-slate-500 rounded-bl-md shadow-slate-500/30'
                                            }`}>
                                            <p className="break-words leading-relaxed font-medium">{message.content}</p>
                                            <p className={`text-xs mt-2 ${isOwn ? 'text-blue-100' : 'text-slate-300'} flex items-center gap-1`}>
                                                <span>{new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isOwn && <span className="text-blue-200">✓</span>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        {/* Поле ввода */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Написать сообщение..."
                                    className="flex-1"
                                />
                                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <p className="text-lg">Выберите чат для начала общения</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
