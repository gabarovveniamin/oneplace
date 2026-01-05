import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { Button } from '../../../shared/ui/components/button';
import { Input } from '../../../shared/ui/components/input';
import { Card, CardHeader, CardContent, CardFooter } from '../../../shared/ui/components/card';
import { ScrollArea } from '../../../shared/ui/components/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/ui/components/avatar';
import { X, Send, Minus, MessageCircle } from 'lucide-react';
import { cn } from '../../../shared/ui/components/utils';
import { authApiService } from '../../../core/api/auth';
import { ModernAudioPlayer } from './ModernAudioPlayer';
import { config } from '../../../config/env';

interface ChatWindowProps {
    userId: string;
    userName: string;
    userAvatar?: string | null;
    onClose: () => void;
}

export function ChatWindow({ userId, userName, userAvatar, onClose }: ChatWindowProps) {
    const [content, setContent] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const { messages, loading, sending, sendMessage, messagesEndRef } = useChat(userId);
    const currentUser = authApiService.getCurrentUser();

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!content.trim() || sending) return;

        await sendMessage(content);
        setContent('');
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    onClick={() => setIsMinimized(false)}
                    className="rounded-full h-12 w-12 shadow-xl bg-blue-600 hover:bg-blue-700 p-0"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            </div>
        );
    }

    return (
        <Card className="fixed bottom-4 right-4 w-80 h-[450px] shadow-2xl z-50 flex flex-col border-blue-100 animate-in slide-in-from-bottom-5 duration-300">
            <CardHeader className="p-3 border-b bg-blue-600 text-white rounded-t-xl flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarImage src={userAvatar || undefined} />
                        <AvatarFallback className="bg-blue-400 text-white text-xs">
                            {userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate leading-none">{userName}</p>
                        <p className="text-[10px] text-blue-100 leading-none mt-1">В сети</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={() => setIsMinimized(true)}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                <ScrollArea className="h-full p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <MessageCircle className="h-10 w-10 mx-auto mb-2" />
                            <p className="text-xs">Начните общение первым!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === currentUser?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex flex-col max-w-[85%]",
                                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "px-3 py-2 rounded-2xl text-sm shadow-sm",
                                                isMe
                                                    ? "bg-blue-600 text-white rounded-br-none"
                                                    : "bg-white dark:bg-slate-800 text-foreground border rounded-bl-none"
                                            )}
                                        >
                                            {msg.content.includes('/uploads/voice/') ? (
                                                <ModernAudioPlayer
                                                    url={msg.content.startsWith('http') ? msg.content : `${config.api.baseUrl.replace('/api', '')}${msg.content}`}
                                                    isMe={isMe}
                                                />
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                        <span className="text-[10px] mt-1 opacity-50 px-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-3 border-t bg-card">
                <form onSubmit={handleSend} className="flex w-full items-center gap-2">
                    <Input
                        placeholder="Напишите сообщение..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 h-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-blue-600"
                        autoComplete="off"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!content.trim() || sending}
                        className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
