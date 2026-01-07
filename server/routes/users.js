const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { 
  authenticateToken, 
  optionalAuth, 
  checkProfileAccess, 
  allowAnonymous 
} = require('../middleware/auth');

const router = express.Router();

// Check username availability
router.post('/check-username', [
  body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        available: false,
        error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
      });
    }

    const { username } = req.body;

    // Check if username exists
    const result = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()]
    );

    const available = result.rows.length === 0;

    res.json({
      available,
      username: username.toLowerCase(),
      message: available ? 'Username is available' : 'Username is already taken'
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ 
      available: false,
      error: 'Internal server error' 
    });
  }
});

// Configure multer for profile image uploads with enhanced validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID and timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user?.id || 'temp';
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${userId}-${uniqueSuffix}${extension}`);
  }
});

// Enhanced file filter with better validation
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, and .webp files are allowed.'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile images
    files: 1 // Only allow one file at a time
  },
  fileFilter: fileFilter
});

// Get current user's profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        id, name, username, email, phone_number as "phoneNumber", 
        bio, location, profile_image as "profileImage", 
        created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile by username (public endpoint with privacy controls)
router.get('/profile/:username', optionalAuth, allowAnonymous, checkProfileAccess, async (req, res) => {
  try {
    const { username } = req.params;
    const { profileUserId, currentUserId, isOwnProfile, canViewPosts, isFriend, friendRequestStatus } = req.profileAccess;

    // Get user profile by username
    const userResult = await pool.query(`
      SELECT 
        u.id,
        u.uid,
        u.name,
        u.bio,
        u.profile_image_url,
        u.username,
        u.created_at,
        COUNT(DISTINCT p.id) as posts_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.uid, u.name, u.bio, u.profile_image_url, u.username, u.created_at
    `, [profileUserId]);

    const user = userResult.rows[0];

    // Get friends count (accepted friends only)
    const friendsCountResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM friends 
      WHERE (user_id = $1 OR friend_id = $1) AND status = 'accepted'
    `, [profileUserId]);
    const friendsCount = parseInt(friendsCountResult.rows[0].count);

    // Get posts if user can view them
    let posts = [];
    if (canViewPosts) {
      const postsResult = await pool.query(`
        SELECT 
          p.id,
          p.content,
          p.image_url,
          p.created_at,
          COUNT(DISTINCT l.id) as likes_count,
          COUNT(DISTINCT c.id) as comments_count,
          CASE WHEN ul.id IS NOT NULL THEN true ELSE false END as is_liked
        FROM posts p
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN comments c ON p.id = c.post_id
        LEFT JOIN likes ul ON p.id = ul.post_id AND ul.user_id = $2
        WHERE p.user_id = $1
        GROUP BY p.id, p.content, p.image_url, p.created_at, ul.id
        ORDER BY p.created_at DESC
      `, [profileUserId, currentUserId]);

      posts = postsResult.rows.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        likesCount: parseInt(post.likes_count),
        commentsCount: parseInt(post.comments_count),
        isLiked: post.is_liked
      }));
    }

    // Prepare response based on authentication status
    const response = {
      user: {
        id: user.id,
        uid: user.uid,
        username: user.username,
        name: user.name,
        bio: user.bio,
        profileImage: user.profile_image_url,
        friendsCount: friendsCount,
        postsCount: parseInt(user.posts_count),
        joinedAt: user.created_at
      },
      posts,
      isFriend,
      friendRequestStatus,
      canViewPosts,
      isOwnProfile
    };

    // Add anonymous access information if not authenticated
    if (req.isAnonymous) {
      response.anonymousAccess = {
        message: 'Login to see posts and interact with this profile',
        canViewPosts: false,
        requiresLogin: true
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Get profile by username error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user suggestions (users not friends with current user)
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.username,
        u.bio,
        u.profile_image_url,
        u.created_at,
        COUNT(DISTINCT p.id) as posts_count,
        (
          SELECT COUNT(*)
          FROM friends f_count
          WHERE (f_count.user_id = u.id OR f_count.friend_id = u.id)
          AND f_count.status = 'accepted'
        ) as friends_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE u.id != $1 
        AND u.id NOT IN (
          SELECT CASE 
            WHEN f.user_id = $1 THEN f.friend_id 
            ELSE f.user_id 
          END
          FROM friends f 
          WHERE (f.user_id = $1 OR f.friend_id = $1) 
          AND f.status IN ('accepted', 'pending')
        )
      GROUP BY u.id, u.name, u.username, u.bio, u.profile_image_url, u.created_at
      ORDER BY friends_count DESC, posts_count DESC, u.created_at DESC
      LIMIT $2
    `, [userId, limit]);

    const suggestions = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      username: row.username,
      bio: row.bio,
      profileImage: row.profile_image_url,
      friendsCount: parseInt(row.friends_count),
      postsCount: parseInt(row.posts_count),
      joinedAt: row.created_at
    }));

    res.json({ suggestions });
  } catch (error) {
    console.error('Get user suggestions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.uid,
        u.name,
        u.bio,
        u.profile_image_url,
        u.created_at,
        COUNT(DISTINCT p.id) as posts_count,
        COUNT(DISTINCT f1.id) as followers_count,
        COUNT(DISTINCT f2.id) as following_count,
        CASE WHEN f3.id IS NOT NULL THEN true ELSE false END as is_following,
        CASE WHEN fr.id IS NOT NULL THEN fr.status ELSE null END as friend_status
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN followers f1 ON u.id = f1.following_id
      LEFT JOIN followers f2 ON u.id = f2.follower_id
      LEFT JOIN followers f3 ON u.id = f3.following_id AND f3.follower_id = $2
      LEFT JOIN friends fr ON (u.id = fr.friend_id AND fr.user_id = $2) OR (u.id = fr.user_id AND fr.friend_id = $2)
      WHERE u.id = $1
      GROUP BY u.id, u.uid, u.name, u.bio, u.profile_image_url, u.created_at, f3.id, fr.id, fr.status
    `, [userId, currentUserId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        uid: user.uid,
        name: user.name,
        bio: user.bio,
        profileImage: user.profile_image_url,
        createdAt: user.created_at,
        postsCount: parseInt(user.posts_count),
        followersCount: parseInt(user.followers_count),
        followingCount: parseInt(user.following_count),
        isFollowing: user.is_following,
        friendStatus: user.friend_status
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('profileImage'), [
  body('name').optional().trim().isLength({ min: 1 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').optional().isEmail().normalizeEmail(),
  body('phoneNumber').optional().trim().isMobilePhone(),
  body('location').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { name, bio, username, email, phoneNumber, location } = req.body;
    const profileImageUrl = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

    // Check username availability if provided and different from current
    if (username) {
      const currentUserResult = await pool.query(
        'SELECT username FROM users WHERE id = $1',
        [userId]
      );
      
      const currentUsername = currentUserResult.rows[0].username;
      
      if (username.toLowerCase() !== currentUsername) {
        const usernameCheck = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [username.toLowerCase(), userId]
        );

        if (usernameCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
      }
    }

    // Check email availability if provided and different from current
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }

    if (username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(username.toLowerCase());
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (phoneNumber !== undefined) {
      updates.push(`phone_number = $${paramCount++}`);
      values.push(phoneNumber);
    }

    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }

    if (profileImageUrl !== undefined) {
      // Delete old profile image if exists and not from Google
      const oldImageResult = await pool.query(
        'SELECT profile_image_url, auth_provider FROM users WHERE id = $1',
        [userId]
      );
      
      const oldUser = oldImageResult.rows[0];
      if (oldUser.profile_image_url && 
          oldUser.auth_provider === 'email' && 
          oldUser.profile_image_url.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), oldUser.profile_image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updates.push(`profile_image_url = $${paramCount++}`);
      values.push(profileImageUrl);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, uid, name, bio, username, email, phone_number, profile_image_url, auth_provider
    `;

    const result = await pool.query(query, values);
    const user = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        uid: user.uid,
        name: user.name,
        bio: user.bio,
        username: user.username,
        email: user.email,
        phoneNumber: user.phone_number,
        profileImage: user.profile_image_url,
        authProvider: user.auth_provider
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Follow/Unfollow user
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const followResult = await pool.query(
      'SELECT id FROM followers WHERE follower_id = $1 AND following_id = $2',
      [currentUserId, userId]
    );

    if (followResult.rows.length > 0) {
      // Unfollow
      await pool.query(
        'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, userId]
      );

      res.json({
        message: 'User unfollowed',
        isFollowing: false
      });
    } else {
      // Follow
      await pool.query(
        'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
        [currentUserId, userId]
      );

      res.json({
        message: 'User followed',
        isFollowing: true
      });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user suggestions (users not followed) - Legacy endpoint for backward compatibility
router.get('/suggestions/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.profile_image_url,
        COUNT(DISTINCT f.id) as followers_count
      FROM users u
      LEFT JOIN followers f ON u.id = f.following_id
      WHERE u.id != $1 
        AND u.id NOT IN (
          SELECT following_id FROM followers WHERE follower_id = $1
        )
      GROUP BY u.id, u.name, u.profile_image_url
      ORDER BY followers_count DESC, u.created_at DESC
      LIMIT $2
    `, [userId, limit]);

    const suggestions = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      profileImage: row.profile_image_url,
      followersCount: parseInt(row.followers_count)
    }));

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.profile_image_url,
        COUNT(DISTINCT f.id) as followers_count
      FROM users u
      LEFT JOIN followers f ON u.id = f.following_id
      WHERE u.name ILIKE $1
      GROUP BY u.id, u.name, u.profile_image_url
      ORDER BY followers_count DESC
      LIMIT $2
    `, [`%${query}%`, limit]);

    const users = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      profileImage: row.profile_image_url,
      followersCount: parseInt(row.followers_count)
    }));

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;