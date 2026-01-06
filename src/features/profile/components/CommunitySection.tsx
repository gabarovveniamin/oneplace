import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { MessageCircle, Heart, Share2, Repeat2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/ui/components/avatar';
import { Button } from '../../../shared/ui/components/button';
import { cn } from '../../../shared/ui/components/utils';
import { communityApiService, CommunityPost, CommunityComment } from '../../../core/api/community';
import { toast } from 'sonner';

interface CommunitySectionProps {
    userId: string;
    isOwnProfile: boolean;
}

export function CommunitySection({ userId, isOwnProfile }: CommunitySectionProps) {
    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'likes'>('posts');
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [replies, setReplies] = useState<CommunityComment[]>([]);
    const [loading, setLoading] = useState(false);

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
            } else if (activeTab === 'likes' && isOwnProfile) {
                const data = await communityApiService.getUserLikedPosts();
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to load community data:', error);
            toast.error('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    // Helper to render a post (simplified version of CommunityPage item)
    const renderPost = (post: CommunityPost) => (
        <motion.div
            key={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-muted/50 transition-colors cursor-pointer border-b border-border text-left"
        >
            <div className="p-4">
                <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={post.userAvatar} />
                        <AvatarFallback>{post.userFirstName?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold hover:underline cursor-pointer">
                                {post.userFirstName} {post.userLastName}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                @{post.userFirstName?.toLowerCase()}{post.userLastName?.toLowerCase()}
                            </span>
                            <span className="text-muted-foreground text-sm">·</span>
                            <span className="text-muted-foreground text-sm hover:underline cursor-pointer">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })}
                            </span>
                        </div>

                        <p className="text-base whitespace-pre-wrap break-words mb-3">
                            {post.content}
                        </p>

                        <div className="flex justify-between max-w-md text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">{post.commentsCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className={cn("w-4 h-4", post.isLiked && "fill-current text-pink-600")} />
                                <span className="text-sm">{post.likesCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderReply = (comment: CommunityComment) => (
        <motion.div
            key={comment.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-muted/50 transition-colors cursor-pointer border-b border-border text-left"
        >
            <div className="p-4">
                <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback>{comment.userFirstName?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">
                                {comment.userFirstName} {comment.userLastName}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru })}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-1">В ответ на пост</p>
                        <p className="text-base whitespace-pre-wrap break-words">
                            {comment.content}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="w-full bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50",
                        activeTab === 'posts' ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                    )}
                >
                    Посты
                </button>
                <button
                    onClick={() => setActiveTab('replies')}
                    className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50",
                        activeTab === 'replies' ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                    )}
                >
                    Посты и ответы
                </button>
                {isOwnProfile && (
                    <button
                        onClick={() => setActiveTab('likes')}
                        className={cn(
                            "flex-1 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50",
                            activeTab === 'likes' ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                        )}
                    >
                        Нравится
                    </button>
                )}
            </div>

            <div className="min-h-[200px]">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'posts' && (
                            posts.length > 0 ? posts.map(renderPost) : <div className="p-8 text-center text-muted-foreground">Нет постов</div>
                        )}
                        {activeTab === 'likes' && (
                            posts.length > 0 ? posts.map(renderPost) : <div className="p-8 text-center text-muted-foreground">Нет понравившихся постов</div>
                        )}
                        {activeTab === 'replies' && (
                            replies.length > 0 ? replies.map(renderReply) : <div className="p-8 text-center text-muted-foreground">Нет ответов</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
