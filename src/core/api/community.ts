import { apiClient } from './client';
import { ApiResponse } from './types';

export interface CommunityPost {
    id: string;
    userId: string;
    content: string;
    imageUrl?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    viewsCount: number;
    createdAt: string;
    updatedAt: string;
    userFirstName?: string;
    userLastName?: string;
    userAvatar?: string;
    isLiked?: boolean;
    isReposted?: boolean;
    isRepost?: boolean;
    repostedBy?: string;
}

export interface TrendingTag {
    tag: string;
    count: string | number;
}

export interface CommunityComment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
    userFirstName?: string;
    userLastName?: string;
    userAvatar?: string;
}

export const communityApiService = {
    getPosts: async (limit = 50, offset = 0) => {
        const response = await apiClient.get<CommunityPost[]>('/community/posts', { limit, offset });
        return response as any as CommunityPost[];
    },

    getTrendingTags: async () => {
        const response = await apiClient.get<TrendingTag[]>('/community/tags/trending');
        return response as any as TrendingTag[];
    },

    createPost: async (content: string, image?: File) => {
        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }
        const response = await apiClient.post<CommunityPost>('/community/posts', formData);
        return response as any as CommunityPost;
    },


    toggleLike: async (postId: string) => {
        const response = await apiClient.post<{ success: boolean }>(`/community/posts/${postId}/like`);
        return response as any as { success: boolean };
    },

    toggleRepost: async (postId: string) => {
        const response = await apiClient.post<{ success: boolean }>(`/community/posts/${postId}/repost`);
        return response as any as { success: boolean };
    },

    trackView: async (postId: string) => {
        const response = await apiClient.post<{ success: boolean }>(`/community/posts/${postId}/view`);
        return response as any as { success: boolean };
    },

    deletePost: async (postId: string) => {
        const response = await apiClient.delete<{ success: boolean }>(`/community/posts/${postId}`);
        return response as any as { success: boolean };
    },

    getComments: async (postId: string) => {
        const response = await apiClient.get<CommunityComment[]>(`/community/posts/${postId}/comments`);
        return response as any as CommunityComment[];
    },

    createComment: async (postId: string, content: string) => {
        const response = await apiClient.post<CommunityComment>(`/community/posts/${postId}/comments`, { content });
        return response as any as CommunityComment;
    },

    getUserPosts: async (userId: string) => {
        const response = await apiClient.get<CommunityPost[]>(`/community/users/${userId}/posts`);
        return response as any as CommunityPost[];
    },

    getUserReplies: async (userId: string) => {
        const response = await apiClient.get<CommunityComment[]>(`/community/users/${userId}/replies`);
        return response as any as CommunityComment[];
    },

    getUserLikedPosts: async () => {
        const response = await apiClient.get<CommunityPost[]>('/community/me/likes');
        return response as any as CommunityPost[];
    }
};
