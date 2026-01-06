import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { MessageCircle, Heart, Repeat2, MoreHorizontal, BadgeCheck, BarChart3, Bookmark, Upload, Ban } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/ui/components/avatar';
import { Button } from '../../../shared/ui/components/button';
import { cn } from '../../../shared/ui/components/utils';
import { communityApiService, CommunityPost, CommunityComment } from '../../../core/api/community';
import { authApiService } from '../../../core/api/auth';
import { config } from '../../../config/env';
import { toast } from 'sonner';

interface CommunitySectionProps {
    userId: string;
    isOwnProfile: boolean;
}

const ViewTracker = ({ postId, onView }: { postId: string; onView?: () => void }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
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

export function CommunitySection({ userId, isOwnProfile }: CommunitySectionProps) {
    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'likes'>('posts');
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [replies, setReplies] = useState<CommunityComment[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<{ [key: string]: CommunityComment[] }>({});
    const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        loadData();
    }, [activeTab, userId]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'posts') {
                const data = await communityApiService.getUserPosts(userId);
                setPosts(data);
            } else if (activeTab === 'replies') {
                const data = await communityApiService.getUserReplies(userId);
                setReplies(data);
            } else if (activeTab === 'likes') {
                const data = await communityApiService.getUserLikedPosts();
                // If it's not own profile, this might need a different API if we want public likes
                // But for now, user specified "likes are private" in summary
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to load community data:', error);
            // Don't toast on initial load to avoid clutter, maybe just log
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (post: CommunityPost) => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Войдите, чтобы оценить пост');
            return;
        }

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
            setPosts(originalPosts);
            toast.error('Ошибка при лайке');
        }
    };

    const handleRepost = async (post: CommunityPost) => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Войдите, чтобы сделать репост');
            return;
        }

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
                throw new Error('Not supported');
            }
        } catch (error) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Ссылка скопирована');
            } catch (err) {
                toast.error('Не удалось скопировать ссылку');
            }
        }
    };

    const getImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl) return undefined;
        if (imageUrl.startsWith('http')) return imageUrl;
        const baseUrl = config.api.baseUrl.replace('/api', '');
        return `${baseUrl}${imageUrl}`;
    };

    const handlePostClick = async (post: CommunityPost) => {
        if (expandedPostId === post.id) {
            setExpandedPostId(null);
            return;
        }

        setExpandedPostId(post.id);
        if (!comments[post.id]) {
            try {
                const data = await communityApiService.getComments(post.id);
                setComments(prev => ({ ...prev, [post.id]: data }));
            } catch (error) {
                toast.error('Не удалось загрузить комментарии');
            }
        }
    };

    const handleAddComment = async (postId: string) => {
        const content = commentTexts[postId];
        if (!content?.trim()) return;

        try {
            const newComment = await communityApiService.createComment(postId, content);
            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newComment]
            }));
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));

            // Update UI count
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
        } catch (error) {
            toast.error('Ошибка при отправке комментария');
        }
    };

    const renderPost = (post: CommunityPost) => (
        <div
            key={post.id + (post.isRepost ? '-repost' : '')}
            className="hover:bg-muted/10 transition-colors cursor-pointer border-b border-border text-left group relative"
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

            {/* Expanded Content (Comments) */}
            <AnimatePresence>
                {expandedPostId === post.id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-muted/10 border-t border-border/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 space-y-4">
                            {/* Comment Input */}
                            {authApiService.isAuthenticated() && (
                                <div className="flex gap-3 items-start pb-2">
                                    <Avatar className="w-8 h-8 shrink-0">
                                        <AvatarImage src={authApiService.getCurrentUser()?.avatar} />
                                        <AvatarFallback>{authApiService.getCurrentUser()?.firstName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <textarea
                                            value={commentTexts[post.id] || ''}
                                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                            placeholder="Оставить комментарий..."
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-1.5"
                                            rows={1}
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                size="sm"
                                                className="rounded-full px-4 h-8 text-[13px] font-bold"
                                                disabled={!commentTexts[post.id]?.trim()}
                                                onClick={() => handleAddComment(post.id)}
                                            >
                                                Ответить
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Comments List */}
                            <div className="space-y-4">
                                {comments[post.id]?.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <Avatar className="w-8 h-8 shrink-0">
                                                <AvatarImage src={comment.userAvatar} />
                                                <AvatarFallback className="text-[10px]">{comment.userFirstName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="w-0.5 grow bg-border rounded-full" />
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm">
                                                    {comment.userFirstName} {comment.userLastName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru })}
                                                </span>
                                            </div>
                                            <p className="text-[14px] leading-snug">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderReply = (comment: CommunityComment) => (
        <motion.div
            key={comment.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-muted/30 transition-colors border-b border-border text-left p-4"
        >
            <div className="flex gap-3">
                <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback>{comment.userFirstName?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold">
                            {comment.userFirstName} {comment.userLastName}
                        </span>
                        <span className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru })}
                        </span>
                    </div>
                    <div className="text-muted-foreground text-[13px] mb-2">
                        В ответ на <span className="text-primary hover:underline cursor-pointer">@пост</span>
                    </div>
                    <p className="text-[15px] leading-normal whitespace-pre-wrap break-words">
                        {comment.content}
                    </p>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="w-full bg-background/50 backdrop-blur-md rounded-2xl shadow-2xl border border-border/40 overflow-hidden mb-8 min-h-[600px]">
            <div className="flex sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={cn(
                        "flex-1 px-4 py-4 text-[15px] font-bold transition-all relative",
                        activeTab === 'posts' ? "text-foreground" : "text-muted-foreground hover:bg-muted/40"
                    )}
                >
                    Посты
                    {activeTab === 'posts' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-[25%] right-[25%] h-1 bg-primary rounded-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('replies')}
                    className={cn(
                        "flex-1 px-4 py-4 text-[15px] font-bold transition-all relative",
                        activeTab === 'replies' ? "text-foreground" : "text-muted-foreground hover:bg-muted/40"
                    )}
                >
                    Посты и ответы
                    {activeTab === 'replies' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-[25%] right-[25%] h-1 bg-primary rounded-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('likes')}
                    className={cn(
                        "flex-1 px-4 py-4 text-[15px] font-bold transition-all relative",
                        activeTab === 'likes' ? "text-foreground" : "text-muted-foreground hover:bg-muted/40"
                    )}
                >
                    Нравится
                    {activeTab === 'likes' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-[25%] right-[25%] h-1 bg-primary rounded-full" />
                    )}
                </button>
            </div>

            <div className="divide-y divide-border/50">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-muted-foreground font-medium animate-pulse text-sm">Загружаем ленту...</span>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'posts' && (
                            posts.length > 0 ? posts.map(renderPost) : (
                                <div className="py-20 text-center space-y-4 px-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">Постов пока нет</h3>
                                        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                                            Здесь будут отображаться посты и репосты этого пользователя.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                        {activeTab === 'replies' && (
                            replies.length > 0 ? replies.map(renderReply) : (
                                <div className="py-20 text-center space-y-4 px-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">Ответов пока нет</h3>
                                        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                                            Здесь будут видны комментарии в сообществе.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                        {activeTab === 'likes' && (
                            posts.length > 0 ? posts.map(renderPost) : (
                                <div className="py-20 text-center space-y-4 px-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                        <Heart className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">Понравившихся постов нет</h3>
                                        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                                            Оцените чьи-нибудь посты, и они появятся здесь.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
