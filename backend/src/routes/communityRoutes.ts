import { Router } from 'express';
import { CommunityController } from '../controllers/communityController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { communityUpload } from '../middleware/communityUpload';

const router = Router();

// Public routes (but with optional auth to check likes)
router.get('/posts', optionalAuth, CommunityController.getPosts);
router.get('/tags/trending', optionalAuth, CommunityController.getTrendingTags);

// Protected routes - with image upload support
router.post('/posts', authenticate, communityUpload.single('image'), CommunityController.createPost);
router.post('/posts/:id/like', authenticate, CommunityController.toggleLike);
router.delete('/posts/:id', authenticate, CommunityController.deletePost);

router.get('/posts/:id/comments', optionalAuth, CommunityController.getComments);
router.post('/posts/:id/comments', authenticate, CommunityController.createComment);

// User specific community routes
router.get('/users/:userId/posts', optionalAuth, CommunityController.getUserPosts);
router.get('/users/:userId/replies', optionalAuth, CommunityController.getUserReplies);
router.get('/me/likes', authenticate, CommunityController.getUserLikedPosts);

export default router;
