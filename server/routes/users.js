const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for profile images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
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
  body('bio').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { name, bio } = req.body;
    const profileImageUrl = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

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
      RETURNING id, uid, name, bio, profile_image_url, auth_provider
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

// Get user suggestions (users not followed)
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