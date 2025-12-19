import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApiService, ChatMessage } from '../../../core/api/chat';
import { useSocket } from '../../../core/socket/SocketContext';

export function useChat(otherUserId: string | null) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const { socket } = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadMessages = useCallback(async () => {
        if (!otherUserId) return;
        try {
            setLoading(true);
            const data = await chatApiService.getMessages(otherUserId);
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages', error);
        } finally {
            setLoading(false);
        }
    }, [otherUserId]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    useEffect(() => {
        if (!socket || !otherUserId) return;

        const handleNewMessage = (message: ChatMessage) => {
            // Add message if it's from the person we are chatting with OR from us to them
            if (
                (message.sender_id === otherUserId) ||
                (message.sender_id !== otherUserId && message.receiver_id === otherUserId)
            ) {
                setMessages(prev => {
                    // Check for duplicates (e.g. if we already added it optimistically)
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });

                // If message is from other user, mark as read
                if (message.sender_id === otherUserId) {
                    chatApiService.markAsRead(otherUserId);
                }
            }
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, otherUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (content: string) => {
        if (!otherUserId || !content.trim()) return;
        try {
            setSending(true);
            await chatApiService.sendMessage(otherUserId, content);
            // Socket will handle adding the message to the list via the listener above
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setSending(false);
        }
    };

    return {
        messages,
        loading,
        sending,
        sendMessage,
        messagesEndRef
    };
}
