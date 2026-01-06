import { query } from '../config/database';

export interface CommunityPost {
    id: string;
    userId: string;
    content: string;
    imageUrl?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: Date;
    updatedAt: Date;
    // Joined user data
    userFirstName?: string;
    userLastName?: string;
    userAvatar?: string;
    isLiked?: boolean; // For the current user
}

export interface TrendingTag {
    tag: string;
    count: string | number; // COUNT returns string in many PG drivers
}

export interface CommunityComment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    userFirstName?: string;
    userLastName?: string;
    userAvatar?: string;
}

export class CommunityModel {
    static async createPost(userId: string, content: string, imageUrl?: string): Promise<CommunityPost> {
        // Transaction to ensure post and tags are consistent
        const client = await import('../config/database').then(m => m.getClient());
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO community_posts (user_id, content, image_url)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [userId, content, imageUrl || null]
            );
            const post = result.rows[0];

            // Extract tags
            const tags = (content.match(/#[a-zA-Zа-яА-Я0-9_]+/g) || []).map(t => t.slice(1)); // Remove #

            if (tags.length > 0) {
                // Unique tags
                const uniqueTags = [...new Set(tags)];

                for (const tag of uniqueTags) {
                    // Insert tag if not exists
                    const tagRes = await client.query(
                        `INSERT INTO community_tags (tag) VALUES ($1) 
                         ON CONFLICT (tag) DO UPDATE SET tag = EXCLUDED.tag 
                         RETURNING id`,
                        [tag]
                    );
                    // Note: ON CONFLICT DO NOTHING doesn't return ID easily in all PG versions if row exists.
                    // DO UPDATE SET tag=EXCLUDED.tag is a hack to get ID. Or fetch it.

                    let tagId = tagRes.rows[0]?.id;
                    if (!tagId) {
                        const fetchTag = await client.query('SELECT id FROM community_tags WHERE tag = $1', [tag]);
                        tagId = fetchTag.rows[0]?.id;
                    }

                    if (tagId) {
                        await client.query(
                            `INSERT INTO community_post_tags (post_id, tag_id) VALUES ($1, $2)
                             ON CONFLICT DO NOTHING`,
                            [post.id, tagId]
                        );
                    }
                }
            }

            // Fetch user info for the return object
            const userRes = await client.query('SELECT first_name, last_name, avatar FROM users WHERE id = $1', [userId]);
            const user = userRes.rows[0];

            await client.query('COMMIT');

            return this.mapRowToPost({ ...post, ...user });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async getPosts(currentUserId?: string, limit = 50, offset = 0): Promise<CommunityPost[]> {
        const result = await query(
            `SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.comments_count, p.shares_count, p.created_at, p.updated_at, 
                    u.first_name, u.last_name, u.avatar,
                    u.role as user_role,
                    EXISTS(SELECT 1 FROM community_post_likes l WHERE l.post_id = p.id AND l.user_id = $1) as is_liked
             FROM community_posts p
             JOIN users u ON p.user_id = u.id
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
            [currentUserId || null, limit, offset]
        );
        return result.rows.map(row => this.mapRowToPost(row));
    }

    static async getPostsByAuthor(authorId: string, currentUserId?: string, limit = 50, offset = 0): Promise<CommunityPost[]> {
        const result = await query(
            `SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.comments_count, p.shares_count, p.created_at, p.updated_at, 
                    u.first_name, u.last_name, u.avatar,
                    u.role as user_role,
                    EXISTS(SELECT 1 FROM community_post_likes l WHERE l.post_id = p.id AND l.user_id = $2) as is_liked
             FROM community_posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC
             LIMIT $3 OFFSET $4`,
            [authorId, currentUserId || null, limit, offset]
        );
        return result.rows.map(row => this.mapRowToPost(row));
    }

    static async getLikedPosts(userId: string, limit = 50, offset = 0): Promise<CommunityPost[]> {
        const result = await query(
            `SELECT p.id, p.user_id, p.content, p.image_url, p.likes_count, p.comments_count, p.shares_count, p.created_at, p.updated_at, 
                    u.first_name, u.last_name, u.avatar,
                    u.role as user_role,
                    true as is_liked
             FROM community_posts p
             JOIN community_post_likes l ON p.id = l.post_id
             JOIN users u ON p.user_id = u.id
             WHERE l.user_id = $1
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows.map(row => this.mapRowToPost(row));
    }

    static async getUserComments(userId: string, limit = 50, offset = 0): Promise<CommunityComment[]> {
        const result = await query(
            `SELECT c.*, u.first_name, u.last_name, u.avatar
             FROM community_comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.user_id = $1
             ORDER BY c.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows.map(row => this.mapRowToComment(row));
    }

    static async getTrendingTags(): Promise<TrendingTag[]> {
        const result = await query(
            `SELECT t.tag, COUNT(pt.post_id) as count
             FROM community_tags t
             JOIN community_post_tags pt ON t.id = pt.tag_id
             GROUP BY t.tag
             ORDER BY count DESC
             LIMIT 5`
        );
        return result.rows;
    }

    static async likePost(userId: string, postId: string): Promise<void> {
        // Use a transaction or simpler logic. This toggles like but let's make it idempotent "like" for now or toggle?
        // User asked for "Twitter like". Twitter likes are toggles.

        // Simple toggle logic in SQL
        const client = await import('../config/database').then(m => m.getClient());
        try {
            await client.query('BEGIN');

            const check = await client.query(
                'SELECT 1 FROM community_post_likes WHERE post_id = $1 AND user_id = $2',
                [postId, userId]
            );

            if (check.rowCount && check.rowCount > 0) {
                // Unlike
                await client.query('DELETE FROM community_post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
                await client.query('UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = $1', [postId]);
            } else {
                // Like
                await client.query('INSERT INTO community_post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
                await client.query('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async deletePost(postId: string, userId: string): Promise<boolean> {
        const result = await query(
            'DELETE FROM community_posts WHERE id = $1 AND user_id = $2',
            [postId, userId]
        );
        return result.rowCount > 0;
    }

    static async createComment(userId: string, postId: string, content: string): Promise<CommunityComment> {
        const client = await import('../config/database').then(m => m.getClient());
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO community_comments (user_id, post_id, content) 
                 VALUES ($1, $2, $3) 
                 RETURNING *`,
                [userId, postId, content]
            );

            await client.query('UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);

            // Fetch user info
            const userRes = await client.query('SELECT first_name, last_name, avatar FROM users WHERE id = $1', [userId]);
            const user = userRes.rows[0];

            await client.query('COMMIT');

            return this.mapRowToComment({ ...result.rows[0], ...user });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async getComments(postId: string, limit = 50, offset = 0): Promise<CommunityComment[]> {
        const result = await query(
            `SELECT c.*, u.first_name, u.last_name, u.avatar
             FROM community_comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.post_id = $1
             ORDER BY c.created_at ASC
             LIMIT $2 OFFSET $3`,
            [postId, limit, offset]
        );
        return result.rows.map(row => this.mapRowToComment(row));
    }

    private static mapRowToComment(row: any): CommunityComment {
        return {
            id: row.id,
            postId: row.post_id,
            userId: row.user_id,
            content: row.content,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            userFirstName: row.first_name,
            userLastName: row.last_name,
            userAvatar: row.avatar
        };
    }

    private static mapRowToPost(row: any): CommunityPost {
        return {
            id: row.id,
            userId: row.user_id,
            content: row.content,
            imageUrl: row.image_url,
            likesCount: row.likes_count,
            commentsCount: row.comments_count,
            sharesCount: row.shares_count,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            userFirstName: row.first_name,
            userLastName: row.last_name,
            userAvatar: row.avatar,
            isLiked: row.is_liked
        };
    }
}
