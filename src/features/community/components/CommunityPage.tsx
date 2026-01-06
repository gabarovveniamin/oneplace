import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Repeat2, Send, Image as ImageIcon, Smile, MoreHorizontal, User as UserIcon, X, BadgeCheck, BarChart3, Bookmark, Upload, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '../../../shared/ui/components/button';
import { Textarea } from '../../../shared/ui/components/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/ui/components/avatar';
import { toast } from 'sonner';
import { authApiService } from '../../../core/api/auth';
import { communityApiService, CommunityPost, TrendingTag, CommunityComment } from '../../../core/api/community';
import { useAuth } from '../../../shared/hooks/useAuth';
import { cn } from '../../../shared/ui/components/utils';
import { config } from '../../../config/env';

interface CommunityPageProps {
    onBack?: () => void;
}

// Emoji categories with popular emojis
const EMOJI_CATEGORIES = {
    'Смайлики': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕'],
    'Жесты': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'],
    'Сердца': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '🩷', '🩵', '🩶'],
    'Животные': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴'],
    'Еда': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔'],
    'Активности': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷'],
    'Объекты': ['💼', '📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '💽', '💾', '💿', '📀', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲'],
    'Символы': ['💯', '🔥', '⭐', '🌟', '✨', '⚡', '💫', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '📣', '💬', '💭', '🗯', '💤', '🔔', '🔕', '🎵', '🎶', '🔊', '🔉', '🔈', '🔇']
};

interface ViewTrackerProps {
    postId: string;
    onView?: () => void;
}

const ViewTracker = ({ postId, onView }: ViewTrackerProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    communityApiService.trackView(postId).then(() => {
                        onView?.();
                    }).catch(() => { });
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [postId]);

    return <div ref={ref} className="absolute inset-0 pointer-events-none" />;
};

export function CommunityPage({ onBack }: CommunityPageProps) {
    const { currentUser: user } = useAuth();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    // Image upload state
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Emoji picker state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>('Смайлики');
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Comments state
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
    const [newComment, setNewComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    useEffect(() => {
        loadPosts();
        loadTags();
    }, []);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadTags = async () => {
        try {
            setTagsLoading(true);
            const tags = await communityApiService.getTrendingTags();
            setTrendingTags(tags);
        } catch (error) {
            console.error('Failed to load tags:', error);
        } finally {
            setTagsLoading(false);
        }
    };

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await communityApiService.getPosts();
            setPosts(data);
        } catch (error) {
            console.error('Failed to load posts:', error);
            toast.error('Не удалось загрузить ленту');
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = (post: CommunityPost) => {
        if (expandedPostId === post.id) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(post.id);
            if (!comments[post.id]) {
                loadComments(post.id);
            }
        }
    };

    const loadComments = async (postId: string) => {
        try {
            const data = await communityApiService.getComments(postId);
            setComments(prev => ({ ...prev, [postId]: data }));
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleCreateComment = async (postId: string) => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Войдите, чтобы комментировать');
            return;
        }
        if (!newComment.trim()) return;

        try {
            setCommenting(true);
            const comment = await communityApiService.createComment(postId, newComment);
            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), comment]
            }));
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
            ));
            setNewComment('');
            toast.success('Комментарий добавлен');
        } catch (error) {
            console.error('Failed to comment:', error);
            toast.error('Не удалось отправить комментарий');
        } finally {
            setCommenting(false);
        }
    };

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Размер изображения не должен превышать 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Можно загружать только изображения');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected image
    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle emoji selection
    const handleEmojiSelect = (emoji: string) => {
        setNewPostContent(prev => prev + emoji);
        textareaRef.current?.focus();
    };

    const handleCreatePost = async () => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Войдите, чтобы публиковать посты');
            return;
        }

        if (!newPostContent.trim() && !selectedImage) {
            toast.error('Добавьте текст или изображение');
            return;
        }

        try {
            setPosting(true);
            const newPost = await communityApiService.createPost(newPostContent, selectedImage || undefined);
            setPosts([newPost, ...posts]);
            setNewPostContent('');
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            toast.success('Пост опубликован');
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error('Не удалось опубликовать пост');
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (post: CommunityPost) => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Войдите, чтобы оценить пост');
            return;
        }

        // Optimistic update
        const originalPosts = [...posts];
        const updatedPosts = posts.map(p => {
            if (p.id === post.id) {
                return {
                    ...p,
                    isLiked: !p.isLiked,
                    likesCount: (p.likesCount || 0) + (p.isLiked ? -1 : 1)
                };
            }
            return p;
        });

        setPosts(updatedPosts);

        try {
            await communityApiService.toggleLike(post.id);
        } catch (error) {
            console.error('Failed to like:', error);
            setPosts(originalPosts); // Revert
            toast.error('Ошибка при лайке');
        }
    };

    const handleRepost = async (post: CommunityPost) => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Войдите, чтобы сделать репост');
            return;
        }

        // Optimistic update
        const originalPosts = [...posts];
        const updatedPosts = posts.map(p => {
            if (p.id === post.id) {
                return {
                    ...p,
                    isReposted: !p.isReposted,
                    sharesCount: (p.sharesCount || 0) + (p.isReposted ? -1 : 1)
                };
            }
            return p;
        });

        setPosts(updatedPosts);

        try {
            await communityApiService.toggleRepost(post.id);
            toast.success(post.isReposted ? 'Репост отменен' : 'Пост репостнут');
        } catch (error) {
            console.error('Failed to repost:', error);
            setPosts(originalPosts);
            toast.error('Ошибка при репосте');
        }
    };

    const handleShare = async (post: CommunityPost) => {
        const shareUrl = `${window.location.origin}/community/post/${post.id}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'OnePlace Community',
                    text: post.content.substring(0, 100),
                    url: shareUrl
                });
                toast.success('Поделились!');
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (error) {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Ссылка скопирована в буфер обмена');
            } catch (clipboardError) {
                toast.error('Не удалось скопировать ссылку');
            }
        }
    };

    // Build image URL helper
    const getImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl) return undefined;
        if (imageUrl.startsWith('http')) return imageUrl;
        // Remove /api from baseUrl since static files are served from root
        const baseUrl = config.api.baseUrl.replace('/api', '');
        return `${baseUrl}${imageUrl}`;
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex justify-center">
            {/* Main Feed Column */}
            <div className="w-full max-w-2xl border-x border-border min-h-screen">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">OnePlace Сообщество</h1>
                    {onBack && (
                        <Button variant="ghost" size="sm" onClick={onBack}>
                            Назад
                        </Button>
                    )}
                </div>

                {/* Create Post Area */}
                <div className="p-4 border-b border-border">
                    <div className="flex gap-4">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback><UserIcon className="w-6 h-6" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                            <Textarea
                                ref={textareaRef as any}
                                placeholder="Что происходит?"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="min-h-[100px] bg-transparent border-none focus-visible:ring-0 text-lg resize-none p-0 placeholder:text-muted-foreground/50"
                            />

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-64 rounded-xl object-cover border border-border"
                                    />
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex gap-3 text-primary relative">
                                    {/* Image Upload Button - Hidden input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageSelect}
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        className="sr-only"
                                        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-primary hover:bg-primary/10 rounded-full h-10 w-10"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImageIcon className="w-6 h-6" />
                                    </Button>

                                    {/* Emoji Picker Button */}
                                    <div className="relative" ref={emojiPickerRef}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "text-primary hover:bg-primary/10 rounded-full h-10 w-10",
                                                showEmojiPicker && "bg-primary/10"
                                            )}
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        >
                                            <Smile className="w-6 h-6" />
                                        </Button>

                                        {/* Emoji Picker Dropdown */}
                                        <AnimatePresence>
                                            {showEmojiPicker && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-10 left-0 z-50 bg-background border border-border rounded-xl shadow-xl w-[320px] overflow-hidden"
                                                >
                                                    {/* Category Tabs */}
                                                    <div className="flex overflow-x-auto p-2 border-b border-border gap-1 scrollbar-hide">
                                                        {Object.keys(EMOJI_CATEGORIES).map(category => (
                                                            <button
                                                                key={category}
                                                                onClick={() => setSelectedEmojiCategory(category)}
                                                                className={cn(
                                                                    "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                                                                    selectedEmojiCategory === category
                                                                        ? "bg-primary text-primary-foreground"
                                                                        : "text-muted-foreground hover:bg-muted"
                                                                )}
                                                            >
                                                                {category}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Emoji Grid */}
                                                    <div className="grid grid-cols-8 gap-1 p-3 max-h-[200px] overflow-y-auto">
                                                        {EMOJI_CATEGORIES[selectedEmojiCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleEmojiSelect(emoji)}
                                                                className="text-xl hover:bg-muted p-1.5 rounded-lg transition-colors flex items-center justify-center"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleCreatePost}
                                    disabled={(!newPostContent.trim() && !selectedImage) || posting}
                                    className="rounded-full font-bold px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    {posting ? 'Публикация...' : 'Пост'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : posts.map((post) => (
                        <div
                            key={post.id + (post.isRepost ? '-repost' : '')}
                            className="hover:bg-muted/10 transition-colors cursor-pointer border-b border-border text-left relative group"
                            onClick={() => handlePostClick(post)}
                        >
                            <ViewTracker postId={post.id} />
                            <div className="p-4 relative flex gap-3">
                                {/* Thread line */}
                                <div className="absolute left-[33px] top-[60px] bottom-0 w-0.5 bg-border/40" />

                                <div className="flex flex-col items-center shrink-0">
                                    <Avatar className="w-10 h-10 relative z-10">
                                        <AvatarImage src={post.userAvatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {post.userFirstName?.[0] || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="flex items-center gap-1 min-w-0">
                                            <span className="font-bold text-white hover:underline truncate">
                                                {post.userFirstName} {post.userLastName}
                                            </span>
                                            {(post.userId === '1' || post.userFirstName === 'Timur') && (
                                                <BadgeCheck className="w-4 h-4 text-[#1d9bf0] fill-current shrink-0" />
                                            )}
                                            <span className="text-muted-foreground text-[14px] truncate ml-1">
                                                @{post.userFirstName?.toLowerCase()}{post.userLastName?.toLowerCase()}
                                            </span>
                                            <span className="text-muted-foreground text-[14px]">·</span>
                                            <span className="text-muted-foreground text-[14px] hover:underline shrink-0">
                                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })}
                                            </span>
                                        </div>

                                        <div className="ml-auto flex items-center gap-1">
                                            <button className="p-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                                                <Ban className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-[15px] leading-normal whitespace-pre-wrap break-words mb-3 text-foreground/95">
                                        {post.content}
                                        {post.content.length > 280 && (
                                            <span className="text-primary hover:underline ml-1 cursor-pointer">Показать еще</span>
                                        )}
                                    </div>

                                    {post.imageUrl && (
                                        <div className="mb-3 rounded-2xl overflow-hidden border border-border/50 bg-muted/20 relative group/image max-w-[500px]">
                                            <img
                                                src={getImageUrl(post.imageUrl)}
                                                alt="Post image"
                                                className="w-full h-auto object-cover transition-transform duration-500 group-hover/image:scale-[1.01]"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center max-w-md text-muted-foreground mt-3 -ml-2">
                                        <button className="flex items-center gap-1.5 group/btn hover:text-blue-400 transition-colors p-2 rounded-full">
                                            <MessageCircle className="w-[18px] h-[18px]" />
                                            <span className="text-[13px]">{post.commentsCount || 1}</span>
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRepost(post); }}
                                            className={cn(
                                                "flex items-center gap-1.5 group/btn transition-colors p-2 rounded-full",
                                                post.isReposted ? "text-green-500" : "hover:text-green-500"
                                            )}
                                        >
                                            <Repeat2 className="w-[18px] h-[18px]" />
                                            <span className="text-[13px]">{post.sharesCount || 0}</span>
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleLike(post); }}
                                            className={cn(
                                                "flex items-center gap-1.5 group/btn transition-colors p-2 rounded-full",
                                                post.isLiked ? "text-pink-600" : "hover:text-pink-600"
                                            )}
                                        >
                                            <Heart className={cn("w-[18px] h-[18px]", post.isLiked && "fill-current")} />
                                            <span className="text-[13px]">{post.likesCount || 0}</span>
                                        </button>

                                        <div className="flex items-center gap-1.5 p-2">
                                            <BarChart3 className="w-[18px] h-[18px]" />
                                            <span className="text-[13px]">{post.viewsCount || 3}</span>
                                        </div>

                                        <div className="flex items-center gap-0.5">
                                            <button
                                                className="p-2 text-muted-foreground hover:text-blue-400 transition-colors"
                                                onClick={(e) => { e.stopPropagation(); toast.success('Добавлено в закладки'); }}
                                            >
                                                <Bookmark className="w-[18px] h-[18px]" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                                                className="p-2 text-muted-foreground hover:text-blue-400 transition-colors"
                                            >
                                                <Upload className="w-[18px] h-[18px]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {expandedPostId === post.id && (
                                <div className="bg-muted/10 p-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
                                    <div className="space-y-4 mb-4">
                                        {comments[post.id]?.map(comment => (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={comment.userAvatar} />
                                                    <AvatarFallback>{comment.userFirstName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 bg-background rounded-lg p-3 border border-border">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-sm">
                                                            {comment.userFirstName} {comment.userLastName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 flex gap-2">
                                            <Textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Написать комментарий..."
                                                className="min-h-[40px] h-[40px] py-2 resize-none"
                                            />
                                            <Button
                                                size="icon"
                                                onClick={() => handleCreateComment(post.id)}
                                                disabled={!newComment.trim() || commenting}
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Sidebar (Optional trends) */}
            <div className="hidden lg:block w-[350px] pl-8 py-4">
                <div className="bg-muted/50 rounded-xl p-4 space-y-4">
                    <h2 className="font-bold text-xl">Актуальные темы</h2>
                    {tagsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse space-y-2">
                                    <div className="h-4 bg-muted-foreground/20 rounded w-1/3"></div>
                                    <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : trendingTags.length > 0 ? (
                        trendingTags.map((item) => (
                            <div key={item.tag} className="hover:bg-muted p-2 rounded-lg cursor-pointer transition-colors">
                                <div className="text-sm text-muted-foreground">Популярное в OnePlace</div>
                                <div className="font-bold">#{item.tag}</div>
                                <div className="text-sm text-muted-foreground">{item.count} постов</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-muted-foreground p-2">
                            Пока нет актуальных тем
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
