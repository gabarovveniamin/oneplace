import { Response } from 'express';
import { CommunityModel } from '../models/Community';
import { AuthRequest } from '../middleware/auth';

export class CommunityController {
    static async getPosts(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const posts = await CommunityModel.getPosts(userId);
            res.json(posts);
        } catch (error) {
            console.error('Get posts error:', error);
            res.status(500).json({ message: 'Error fetching posts' });
        }
    }

    static async getUserPosts(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const currentUserId = req.user?.id;
            const posts = await CommunityModel.getPostsByAuthor(userId, currentUserId);
            res.json(posts);
        } catch (error) {
            console.error('Get user posts error:', error);
            res.status(500).json({ message: 'Error fetching user posts' });
        }
    }

    static async getUserLikedPosts(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id; // Only for current user
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const posts = await CommunityModel.getLikedPosts(userId);
            res.json(posts);
        } catch (error) {
            console.error('Get liked posts error:', error);
            res.status(500).json({ message: 'Error fetching liked posts' });
        }
    }

    static async getUserReplies(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const comments = await CommunityModel.getUserComments(userId);
            res.json(comments);
        } catch (error) {
            console.error('Get user replies error:', error);
            res.status(500).json({ message: 'Error fetching user replies' });
        }
    }

    static async getTrendingTags(req: AuthRequest, res: Response): Promise<void> {
        try {
            const tags = await CommunityModel.getTrendingTags();
            res.json(tags);
        } catch (error) {
            console.error('Get trending tags error:', error);
            res.status(500).json({ message: 'Error fetching trending tags' });
        }
    }

    static async createPost(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { content } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            if (!content || !content.trim()) {
                res.status(400).json({ message: 'Content is required' });
                return;
            }

            // Handle uploaded image
            let imageUrl: string | undefined;
            if (req.file) {
                imageUrl = `/uploads/community/${req.file.filename}`;
            }

            const post = await CommunityModel.createPost(userId, content, imageUrl);
            res.status(201).json(post);
        } catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({ message: 'Error creating post' });
        }
    }

    static async toggleLike(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            await CommunityModel.likePost(userId, id);
            res.json({ success: true });
        } catch (error) {
            console.error('Like error:', error);
            res.status(500).json({ message: 'Error toggling like' });
        }
    }

    static async getComments(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const comments = await CommunityModel.getComments(id);
            res.json(comments);
        } catch (error) {
            console.error('Get comments error:', error);
            res.status(500).json({ message: 'Error fetching comments' });
        }
    }

    static async createComment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            if (!content || !content.trim()) {
                res.status(400).json({ message: 'Content is required' });
                return;
            }

            const comment = await CommunityModel.createComment(userId, id, content);
            res.status(201).json(comment);
        } catch (error) {
            console.error('Create comment error:', error);
            res.status(500).json({ message: 'Error creating comment' });
        }
    }

    static async deletePost(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const success = await CommunityModel.deletePost(id, userId);
            if (!success) {
                res.status(404).json({ message: 'Post not found or unauthorized' });
                return;
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Delete post error:', error);
            res.status(500).json({ message: 'Error deleting post' });
        }
    }
}
