const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const admin = require('../config/firebase');
const pool = require('../config/database');
const { generateToken, blacklistToken } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register with email/password
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1 }),
  body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('phoneNumber').optional().trim().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, username, bio, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check username availability if provided
    let finalUsername = null;
    let defaultUsernameHash = null;

    if (username) {
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username.toLowerCase()]
      );

      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Username is already taken' });
      }

      finalUsername = username.toLowerCase();
    } else {
      // Generate default username hash
      const tempId = uuidv4();
      defaultUsernameHash = `user_${tempId.substring(0, 8)}_${Date.now().toString(36)}`;
      
      // Ensure uniqueness of default username hash
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        const hashCheck = await pool.query(
          'SELECT id FROM users WHERE default_username_hash = $1',
          [defaultUsernameHash]
        );
        
        if (hashCheck.rows.length === 0) {
          isUnique = true;
        } else {
          attempts++;
          defaultUsernameHash = `user_${tempId.substring(0, 8)}_${Date.now().toString(36)}_${attempts}`;
        }
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique UID for compatibility
    const uid = uuidv4();

    // Create user with comprehensive fields
    const result = await pool.query(
      `INSERT INTO users (uid, email, password_hash, name, username, bio, phone_number, default_username_hash, auth_provider) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, uid, email, name, username, bio, phone_number, default_username_hash, profile_image_url, auth_provider, created_at`,
      [uid, email, passwordHash, name, finalUsername, bio || null, phoneNumber || null, defaultUsernameHash, 'email']
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        username: user.username,
        bio: user.bio,
        phoneNumber: user.phone_number,
        defaultUsernameHash: user.default_username_hash,
        profileImage: user.profile_image_url,
        authProvider: user.auth_provider,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login with email/password
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user from database
    const result = await pool.query(
      'SELECT id, uid, email, password_hash, name, profile_image_url, auth_provider FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user registered with email/password
    if (user.auth_provider !== 'email') {
      return res.status(400).json({ 
        error: 'This email is registered with Google. Please use Google Sign-In.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        profileImage: user.profile_image_url,
        authProvider: user.auth_provider
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Auth
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify Google ID token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists
    let result = await pool.query(
      'SELECT id, uid, email, name, profile_image_url, auth_provider FROM users WHERE uid = $1 OR email = $2',
      [uid, email]
    );

    let user;

    if (result.rows.length === 0) {
      // Create new user
      const insertResult = await pool.query(
        `INSERT INTO users (uid, email, name, profile_image_url, auth_provider) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, uid, email, name, profile_image_url, auth_provider`,
        [uid, email, name, picture, 'google']
      );
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
      
      // Update profile image if it's from Google and different
      if (user.auth_provider === 'google' && user.profile_image_url !== picture) {
        await pool.query(
          'UPDATE users SET profile_image_url = $1 WHERE id = $2',
          [picture, user.id]
        );
        user.profile_image_url = picture;
      }
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        profileImage: user.profile_image_url,
        authProvider: user.auth_provider
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'ID token expired' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    await blacklistToken(token);
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Get additional user stats
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = $1) as posts_count,
        (SELECT COUNT(*) FROM followers WHERE following_id = $1) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = $1) as following_count
    `, [user.id]);

    const stats = statsResult.rows[0];

    res.json({
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        profileImage: user.profile_image_url,
        authProvider: user.auth_provider,
        postsCount: parseInt(stats.posts_count),
        followersCount: parseInt(stats.followers_count),
        followingCount: parseInt(stats.following_count)
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;