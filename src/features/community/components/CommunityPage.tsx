import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Repeat2, Send, Image as ImageIcon, Smile, MoreHorizontal, User as UserIcon } from 'lucide-react';
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

interface CommunityPageProps {
    onBack?: () => void;
}

export function CommunityPage({ onBack }: CommunityPageProps) {
    const { currentUser: user } = useAuth();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    // Comments state
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
    const [newComment, setNewComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    useEffect(() => {
        loadPosts();
        loadTags();
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

    const handleCreatePost = async () => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Войдите, чтобы публиковать посты');
            return;
        }

        if (!newPostContent.trim()) return;

        try {
            setPosting(true);
            const newPost = await communityApiService.createPost(newPostContent);
            setPosts([newPost, ...posts]);
            setNewPostContent('');
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
                                placeholder="Что происходит?"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="min-h-[100px] bg-transparent border-none focus-visible:ring-0 text-lg resize-none p-0 placeholder:text-muted-foreground/50"
                            />
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex gap-2 text-primary">
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full h-8 w-8">
                                        <ImageIcon className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full h-8 w-8">
                                        <Smile className="w-5 h-5" />
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleCreatePost}
                                    disabled={!newPostContent.trim() || posting}
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
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-muted/50 transition-colors cursor-pointer border-b border-border text-left"
                            onClick={() => handlePostClick(post)}
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
                                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-muted-foreground rounded-full hover:bg-primary/10 hover:text-primary">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <p className="text-base whitespace-pre-wrap break-words mb-3">
                                            {post.content}
                                        </p>

                                        <div className="flex justify-between max-w-md text-muted-foreground">
                                            <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
                                                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                                    <MessageCircle className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm">{post.commentsCount || 0}</span>
                                            </button>
                                            <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
                                                <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                                    <Repeat2 className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm">{post.sharesCount || 0}</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleLike(post); }}
                                                className={cn(
                                                    "flex items-center gap-2 group transition-colors",
                                                    post.isLiked ? "text-pink-600" : "hover:text-pink-600"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-full transition-colors",
                                                    post.isLiked ? "bg-pink-600/10" : "group-hover:bg-pink-600/10"
                                                )}>
                                                    <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
                                                </div>
                                                <span className="text-sm">{post.likesCount || 0}</span>
                                            </button>
                                            <button className="flex items-center gap-2 group hover:text-primary transition-colors">
                                                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                                    <Share2 className="w-4 h-4" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {expandedPostId === post.id && (
                                <div className="bg-muted/30 p-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
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

                        </motion.div>
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
        </div>
    );
}
