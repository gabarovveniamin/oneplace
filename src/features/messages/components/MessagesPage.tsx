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
    CheckCheck,
    Menu,
    Mic,
    Square,
    Play,
    Pause,
    Trash2
} from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/components/avatar";
import { ScrollArea } from "@/shared/ui/components/scroll-area";
import { cn } from '@/shared/ui/components/utils';
import { authApiService } from '@/core/api/auth';
import { config } from '@/config/env';

interface MessagesPageProps {
    isDarkMode: boolean;
}

export function MessagesPage({ isDarkMode }: MessagesPageProps) {
    const { socket } = useSocket();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const currentUser = authApiService.getCurrentUser();
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Popular emojis - expanded collection
    const emojis = [
        // Smileys & Emotion
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
        '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
        '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
        '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
        '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
        '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
        '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾',

        // Gestures & Body Parts
        '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
        '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
        '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
        '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
        '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋',

        // People & Fantasy
        '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱',
        '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲',
        '🧑‍🦲', '👨‍🦲', '🧔', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️',
        '🧕', '👮‍♀️', '👮', '👮‍♂️', '👷‍♀️', '👷', '👷‍♂️', '💂‍♀️', '💂', '💂‍♂️',
        '🕵️‍♀️', '🕵️', '🕵️‍♂️', '👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍🌾', '🧑‍🌾', '👨‍🌾', '👩‍🍳',

        // Animals & Nature
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
        '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
        '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
        '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
        '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕',
        '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
        '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛',
        '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖',

        // Food & Drink
        '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈',
        '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
        '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐',
        '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇',
        '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪',
        '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲',
        '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥',
        '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰',
        '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜',

        // Activities & Sports
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
        '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁',
        '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️',
        '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️',
        '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵',

        // Travel & Places
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
        '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️',
        '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃',
        '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊',
        '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁',

        // Objects
        '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
        '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
        '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
        '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',

        // Symbols & Hearts
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
        '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
        '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
        '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',

        // Popular & Misc
        '✨', '⭐', '🌟', '💫', '⚡', '🔥', '💥', '💯', '✔️', '✅',
        '❌', '❎', '➕', '➖', '✖️', '➗', '💲', '💱', '™️', '©️',
        '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️',
        '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪',
        '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️',
        '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦',
        '🟪', '⬛', '⬜', '🟫', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇',
        '🥈', '🥉', '🏅', '🎖️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🎨',
    ];

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

        // Status & Typing listeners
        socket.on('online_users', (users: string[]) => {
            setOnlineUsers(new Set(users));
        });

        socket.on('user_status_change', ({ userId, status }: { userId: string, status: 'online' | 'offline' }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                if (status === 'online') next.add(userId);
                else next.delete(userId);
                return next;
            });
        });

        socket.on('user_typing', ({ userId }: { userId: string }) => {
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.add(userId);
                return next;
            });
        });

        socket.on('user_stop_typing', ({ userId }: { userId: string }) => {
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        });

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('online_users');
            socket.off('user_status_change');
            socket.off('user_typing');
            socket.off('user_stop_typing');
        };
    }, [socket, selectedChat, loadChats]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Use simplest constructor to let browser pick best supported format
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please allow permissions.');
        }
    };

    const stopAndSendRecording = async () => {
        if (!mediaRecorderRef.current || !selectedChat) return;

        const recorder = mediaRecorderRef.current;

        if (recorder.state !== 'recording') {
            setIsRecording(false);
            return;
        }

        return new Promise<void>((resolve) => {
            recorder.onstop = async () => {
                if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

                // Default to standard webm if not specified, usually browsers are good at this
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                if (audioBlob.size > 0) {
                    try {
                        const filename = `voice_${Date.now()}.webm`;
                        // Create a file object to preserve name if needed, though FormData handles blob
                        await chatApiService.sendVoiceMessage(selectedChat.other_user_id, audioBlob);
                    } catch (error) {
                        console.error('Failed to send voice:', error);
                    }
                } else {
                    console.error('Recording was empty');
                }

                setIsRecording(false);
                setRecordingDuration(0);
                recorder.stream.getTracks().forEach(t => t.stop());
                resolve();
            };

            recorder.stop();
        });
    };

    const cancelRecording = () => {
        if (!mediaRecorderRef.current) return;
        mediaRecorderRef.current.onstop = () => {
            // Just cleanup
            mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorderRef.current.stop();
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setRecordingDuration(0);
        audioChunksRef.current = [];
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderMessageContent = (msg: ChatMessage, isMe: boolean) => {
        if (msg.content.includes('/uploads/voice/')) {
            const url = msg.content.startsWith('http')
                ? msg.content
                : `${config.api.baseUrl.replace('/api', '')}${msg.content}`;

            return (
                <div className="flex items-center gap-2 min-w-[200px]">
                    {/* Use key to force re-render if url changes */}
                    <audio
                        key={url}
                        controls
                        preload="metadata"
                        crossOrigin="anonymous"
                        src={url}
                        className="h-10 w-[240px]"
                        style={{
                            borderRadius: '20px'
                        }}
                        onError={(e) => console.error('Audio load error:', e)}
                    />
                </div>
            );
        }
        return msg.content;
    };

    const filteredChats = chats.filter(chat =>
        `${chat.first_name} ${chat.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Theme Configuration
    const theme = {
        bg: isDarkMode ? '#17212b' : '#ffffff',
        text: isDarkMode ? '#ffffff' : '#000000',
        subText: isDarkMode ? '#aaaaaa' : '#707579',

        sidebarBg: isDarkMode ? '#17212b' : '#ffffff',
        sidebarBorder: isDarkMode ? '#0e1621' : '#dfe1e5',
        sidebarHover: isDarkMode ? '#202b36' : '#f4f4f5',
        sidebarActive: isDarkMode ? '#2b5278' : '#3390ec',
        sidebarActiveText: '#ffffff',

        chatBgColor: isDarkMode ? '#0e1621' : '#a2b3be',

        headerBg: isDarkMode ? '#17212b' : '#ffffff',
        headerBorder: isDarkMode ? '#0e1621' : '#dfe1e5',

        inputBg: isDarkMode ? '#17212b' : '#ffffff',
        inputBorder: isDarkMode ? '#0e1621' : '#dfe1e5',

        myMessageBg: isDarkMode ? '#2b5278' : '#effdde',
        myMessageText: isDarkMode ? '#ffffff' : '#000000',
        otherMessageBg: isDarkMode ? '#182533' : '#ffffff',
        otherMessageText: isDarkMode ? '#ffffff' : '#000000',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)', backgroundColor: theme.bg }}>
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: isDarkMode ? '#6c7883' : '#3390ec', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    return (
        <div
            className="flex w-full overflow-hidden font-sans"
            style={{
                height: 'calc(100vh - 64px)',
                backgroundColor: theme.bg,
                color: theme.text,
            }}
        >
            {/* LEFT SIDEBAR - FIXED WIDTH */}
            <div
                className="flex-shrink-0 flex flex-col border-r"
                style={{
                    width: '300px',
                    flex: '0 0 300px',
                    backgroundColor: theme.sidebarBg,
                    borderColor: theme.sidebarBorder
                }}
            >
                {/* Sidebar Header */}
                <div className="h-[60px] px-4 flex items-center justify-between flex-shrink-0 border-b"
                    style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarBorder }}>
                    <div className="flex items-center gap-4 w-full">
                        <Menu className="w-6 h-6 cursor-pointer flex-shrink-0" style={{ color: theme.subText }} />
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: theme.subText }} />
                            <input
                                placeholder="Search"
                                className="w-full h-10 pl-10 pr-4 rounded-full text-[15px] focus:outline-none transition-all"
                                style={{
                                    backgroundColor: isDarkMode ? '#242f3d' : '#f1f1f1',
                                    color: theme.text,
                                    border: 'none'
                                }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Chat List */}
                <ScrollArea className="flex-1">
                    <div className="flex flex-col py-2">
                        {filteredChats.length === 0 ? (
                            <div className="p-8 text-center" style={{ color: theme.subText }}>
                                <p>No chats found</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <button
                                    key={chat.other_user_id}
                                    onClick={() => loadMessages(chat)}
                                    className="w-full flex items-center gap-2 px-2 py-2 mx-1 rounded-lg transition-colors duration-200"
                                    style={{
                                        backgroundColor: selectedChat?.other_user_id === chat.other_user_id
                                            ? theme.sidebarActive
                                            : 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedChat?.other_user_id !== chat.other_user_id) {
                                            e.currentTarget.style.backgroundColor = theme.sidebarHover;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedChat?.other_user_id !== chat.other_user_id) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-11 w-11 text-base">
                                            <AvatarImage src={chat.avatar || undefined} />
                                            <AvatarFallback style={{ backgroundColor: '#58bdf3', color: '#fff' }}>
                                                {chat.first_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        {onlineUsers.has(chat.other_user_id) && (
                                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2"
                                                style={{
                                                    backgroundColor: '#00c73e',
                                                    borderColor: selectedChat?.other_user_id === chat.other_user_id ? theme.sidebarActive : theme.sidebarBg
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate text-[14px]"
                                                style={{
                                                    color: selectedChat?.other_user_id === chat.other_user_id ? theme.sidebarActiveText : theme.text
                                                }}>
                                                {chat.first_name} {chat.last_name}
                                            </span>
                                            <span className="text-[11px] shrink-0 ml-1"
                                                style={{
                                                    color: selectedChat?.other_user_id === chat.other_user_id ? 'rgba(255,255,255,0.7)' : theme.subText
                                                }}>
                                                {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[13px] truncate"
                                                style={{
                                                    color: selectedChat?.other_user_id === chat.other_user_id ? 'rgba(255,255,255,0.8)' : theme.subText
                                                }}>
                                                {chat.last_message}
                                            </p>
                                            {chat.unread_count > 0 && selectedChat?.other_user_id !== chat.other_user_id && (
                                                <span className="text-white text-[12px] font-bold rounded-full px-2 h-5 flex items-center justify-center min-w-[20px]"
                                                    style={{ backgroundColor: isDarkMode ? '#6c7883' : '#c4c9cc' }}>
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

            {/* RIGHT CHAT AREA - FLEXIBLE */}
            <div
                className="flex flex-col"
                style={{
                    flex: '1',
                    backgroundColor: theme.chatBgColor,
                    backgroundImage: isDarkMode ? 'none' : 'url("https://web.telegram.org/img/bg_0.png")',
                    backgroundSize: 'cover',
                }}
            >
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-[60px] px-4 md:px-6 flex items-center justify-between shadow-sm z-20 flex-shrink-0"
                            style={{ backgroundColor: theme.headerBg, borderBottom: `1px solid ${theme.headerBorder}` }}>
                            <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h2 className="text-[16px] font-semibold leading-tight truncate" style={{ color: theme.text }}>
                                        {selectedChat.first_name} {selectedChat.last_name}
                                    </h2>
                                    <span className="text-[13px] truncate" style={{ color: theme.subText }}>
                                        {typingUsers.has(selectedChat.other_user_id)
                                            ? <span className="text-[#3390ec] animate-pulse">печатает...</span>
                                            : (onlineUsers.has(selectedChat.other_user_id)
                                                ? <span className="text-[#00c73e]">в сети</span>
                                                : 'был(а) недавно')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                                <Search className="h-5 w-5 md:h-6 md:w-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" style={{ color: theme.subText }} />
                                <Phone className="h-5 w-5 md:h-6 md:w-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" style={{ color: theme.subText }} />
                                <MoreVertical className="h-5 w-5 md:h-6 md:w-6 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" style={{ color: theme.subText }} />
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-hidden relative">
                            <ScrollArea className="h-full">
                                <div className="w-full h-full px-3 md:px-6 py-4 flex flex-col justify-end min-h-full">
                                    {messages.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center" style={{ color: theme.subText }}>
                                            <div className="bg-black/20 rounded-full px-4 py-2 text-sm text-white backdrop-blur-sm">
                                                No messages here yet...
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.sender_id === currentUser?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={cn(
                                                        "relative max-w-full md:max-w-[90%] px-4 py-2 my-1 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words",
                                                        isMe ? "self-end rounded-tr-md" : "self-start rounded-tl-md"
                                                    )}
                                                    style={{
                                                        backgroundColor: isMe ? theme.myMessageBg : theme.otherMessageBg,
                                                        color: isMe ? theme.myMessageText : theme.otherMessageText,
                                                    }}
                                                >
                                                    {renderMessageContent(msg, isMe)}
                                                    <div className="float-right ml-3 mt-2 flex items-center gap-0.5 select-none opacity-70 h-full align-bottom translate-y-[2px]">
                                                        <span className="text-[11px]">
                                                            {formatTime(msg.created_at)}
                                                        </span>
                                                        {isMe && (
                                                            <span>
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
                        </div>

                        {/* Input Area */}
                        <div className="z-20 p-3 relative" style={{ backgroundColor: theme.inputBg, borderTop: `1px solid ${theme.inputBorder}` }}>
                            {/* Emoji Picker Popup - Above input, full width */}
                            {showEmojiPicker && (
                                <div
                                    ref={emojiPickerRef}
                                    className="absolute rounded-2xl shadow-2xl"
                                    style={{
                                        backgroundColor: theme.inputBg,
                                        border: `1px solid ${theme.inputBorder}`,
                                        width: 'calc(100% - 24px)',
                                        maxWidth: '800px',
                                        height: '450px',
                                        bottom: '100%',
                                        left: '12px',
                                        right: '12px',
                                        marginBottom: '8px',
                                        zIndex: 1000,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {/* Header */}
                                    <div className="p-3 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: theme.inputBorder }}>
                                        <div>
                                            <h3 className="text-sm font-semibold" style={{ color: theme.text }}>Emojis & Stickers</h3>
                                            <p className="text-xs mt-0.5" style={{ color: theme.subText }}>{emojis.length} эмодзи для ваших сообщений</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(false)}
                                            className="text-lg opacity-60 hover:opacity-100 transition-opacity px-2"
                                            style={{ color: theme.subText }}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Scrollable emoji grid */}
                                    <div
                                        className="flex-1 overflow-y-auto p-3"
                                        style={{
                                            overflowX: 'hidden',
                                        }}
                                    >
                                        <div
                                            className="grid gap-1"
                                            style={{
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                                            }}
                                        >
                                            {emojis.map((emoji, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => addEmoji(emoji)}
                                                    className="text-2xl p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        minHeight: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="w-full relative">
                                <form onSubmit={sendMessage} className="flex items-end gap-3 w-full">
                                    {isRecording ? (
                                        <div className="flex-1 flex items-center justify-between px-4 py-2 bg-red-500/10 rounded-2xl border border-red-500/20 h-[52px]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-red-500 font-medium font-mono">{formatDuration(recordingDuration)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-red-500 hover:bg-red-500/10 rounded-full"
                                                    onClick={cancelRecording}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md animate-pulse"
                                                    onClick={stopAndSendRecording}
                                                >
                                                    <Send className="h-5 w-5 ml-0.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Button variant="ghost" size="icon" type="button" className="h-12 w-12 flex-shrink-0 rounded-full hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.subText }}>
                                                <Paperclip className="h-6 w-6" />
                                            </Button>

                                            <div className="flex-1 rounded-2xl flex items-center min-h-[48px] py-2 px-4 shadow-sm transition-all"
                                                style={{ backgroundColor: isDarkMode ? '#17212b' : '#f4f4f5' }}>
                                                <textarea
                                                    placeholder="Message"
                                                    className="bg-transparent border-0 w-full resize-none h-[24px] max-h-[160px] py-0 leading-6 focus:outline-none text-[16px]"
                                                    style={{ color: theme.text }}
                                                    value={newMessage}
                                                    onChange={(e) => {
                                                        setNewMessage(e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';

                                                        if (socket && selectedChat) {
                                                            socket.emit('typing', { receiverId: selectedChat.other_user_id });

                                                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

                                                            typingTimeoutRef.current = setTimeout(() => {
                                                                socket.emit('stop_typing', { receiverId: selectedChat.other_user_id });
                                                            }, 2000);
                                                        }
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    className="h-10 w-10 ml-2"
                                                    style={{ color: showEmojiPicker ? (isDarkMode ? '#3390ec' : '#2b5278') : theme.subText }}
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                >
                                                    <Smile className="h-6 w-6" />
                                                </Button>
                                            </div>

                                            {newMessage.trim() ? (
                                                <Button
                                                    type="submit"
                                                    className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95"
                                                    style={{ backgroundColor: isDarkMode ? '#2b5278' : '#3390ec', color: 'white' }}
                                                    disabled={sending}
                                                >
                                                    <Send className="h-6 w-6 ml-0.5" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95"
                                                    style={{ backgroundColor: isDarkMode ? '#2b5278' : '#3390ec', color: 'white' }}
                                                    onClick={startRecording}
                                                >
                                                    <Mic className="h-6 w-6" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="rounded-full bg-black/40 p-4 mb-4" style={{ backgroundColor: isDarkMode ? '#242f3d' : '#e4e4e4' }}>
                            <span className="text-[14px]" style={{ color: theme.subText }}>
                                Select a chat to start messaging
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
