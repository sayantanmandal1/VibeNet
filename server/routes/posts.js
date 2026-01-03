const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, checkFriendAccess } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create a new post
router.post('/', authenticateToken, upload.single('image'), [
  body('content').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, image_url) 
       VALUES ($1, $2, $3) 
       RETURNING id, content, image_url, created_at`,
      [userId, content, imageUrl]
    );

    const post = result.rows[0];

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        user: {
          id: req.user.id,
          name: req.user.name,
          profileImage: req.user.profile_image_url
        },
        likesCount: 0,
        commentsCount: 0,
        isLiked: false
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get posts feed (paginated) - Friend-based filtering
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get posts from friends + own posts (friend-based privacy)
    const result = await pool.query(`
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id as user_id,
        u.name as user_name,
        u.username as user_username,
        u.profile_image_url as user_profile_image,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count,
        CASE WHEN ul.id IS NOT NULL THEN true ELSE false END as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN likes ul ON p.id = ul.post_id AND ul.user_id = $1
      WHERE p.user_id = $1 
         OR p.user_id IN (
           SELECT DISTINCT 
             CASE 
               WHEN f.user_id = $1 THEN f.friend_id 
               ELSE f.user_id 
             END as friend_id
           FROM friends f
           WHERE (f.user_id = $1 OR f.friend_id = $1) 
           AND f.status = 'accepted'
         )
      GROUP BY p.id, p.content, p.image_url, p.created_at, u.id, u.name, u.username, u.profile_image_url, ul.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const posts = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        username: row.user_username,
        profileImage: row.user_profile_image
      },
      likesCount: parseInt(row.likes_count),
      commentsCount: parseInt(row.comments_count),
      isLiked: row.is_liked
    }));

    res.json({ posts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post - with enhanced friend-based privacy
router.get('/:postId', authenticateToken, checkFriendAccess, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // First get the post and its owner
    const postOwnerResult = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postOwnerResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Post not found',
        message: 'The requested post does not exist or has been removed'
      });
    }

    const postOwnerId = postOwnerResult.rows[0].user_id;

    // Check if user can access this post
    const { canAccess } = await req.checkFriendship(postOwnerId);
    
    if (!canAccess) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'This post is only visible to friends',
        requiresFriendship: true
      });
    }

    // Get the full post details
    const result = await pool.query(`
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id as user_id,
        u.name as user_name,
        u.username as user_username,
        u.profile_image_url as user_profile_image,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count,
        CASE WHEN ul.id IS NOT NULL THEN true ELSE false END as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN likes ul ON p.id = ul.post_id AND ul.user_id = $1
      WHERE p.id = $2
      GROUP BY p.id, p.content, p.image_url, p.created_at, u.id, u.name, u.username, u.profile_image_url, ul.id
    `, [userId, postId]);

    const row = result.rows[0];
    const post = {
      id: row.id,
      content: row.content,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        username: row.user_username,
        profileImage: row.user_profile_image
      },
      likesCount: parseInt(row.likes_count),
      commentsCount: parseInt(row.comments_count),
      isLiked: row.is_liked
    };

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get posts by user (for profile pages) - with enhanced friend-based privacy
router.get('/user/:userId', authenticateToken, checkFriendAccess, async (req, res) => {
  try {
    const { userId: profileUserId } = req.params;
    const currentUserId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Check if current user can view this user's posts
    const { canAccess, isFriend } = await req.checkFriendship(profileUserId);

    if (!canAccess) {
      return res.json({ 
        posts: [], 
        canViewPosts: false,
        isFriend: false,
        message: 'Posts are only visible to friends. Send a friend request to view this user\'s posts.',
        restrictedContent: true
      });
    }

    const result = await pool.query(`
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id as user_id,
        u.name as user_name,
        u.username as user_username,
        u.profile_image_url as user_profile_image,
        COUNT(DISTINCT l.id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count,
        CASE WHEN ul.id IS NOT NULL THEN true ELSE false END as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN likes ul ON p.id = ul.post_id AND ul.user_id = $1
      WHERE p.user_id = $2
      GROUP BY p.id, p.content, p.image_url, p.created_at, u.id, u.name, u.username, u.profile_image_url, ul.id
      ORDER BY p.created_at DESC
      LIMIT $3 OFFSET $4
    `, [currentUserId, profileUserId, limit, offset]);

    const posts = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        username: row.user_username,
        profileImage: row.user_profile_image
      },
      likesCount: parseInt(row.likes_count),
      commentsCount: parseInt(row.comments_count),
      isLiked: row.is_liked
    }));

    res.json({ 
      posts, 
      canViewPosts: true,
      isFriend,
      totalPosts: posts.length,
      isOwnProfile: currentUserId === profileUserId
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists and belongs to user
    const postResult = await pool.query(
      'SELECT id, user_id, image_url FROM posts WHERE id = $1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];
    if (post.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete associated image file if exists
    if (post.image_url) {
      const imagePath = path.join(process.cwd(), post.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete post (cascades to likes and comments)
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike post
router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const postResult = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    const likeResult = await pool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (likeResult.rows.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );
      
      // Get updated like count
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM likes WHERE post_id = $1',
        [postId]
      );

      res.json({
        message: 'Post unliked',
        isLiked: false,
        likesCount: parseInt(countResult.rows[0].count)
      });
    } else {
      // Like
      await pool.query(
        'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
        [userId, postId]
      );

      // Get updated like count
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM likes WHERE post_id = $1',
        [postId]
      );

      res.json({
        message: 'Post liked',
        isLiked: true,
        likesCount: parseInt(countResult.rows[0].count)
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;