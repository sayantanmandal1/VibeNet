const jwt = require('jsonwebtoken');
const { client } = require('../config/redis');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Check if token is blacklisted in Redis
    const isBlacklisted = await client.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been invalidated' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database with enhanced fields
    const userResult = await pool.query(
      'SELECT id, uid, email, name, username, profile_image_url, auth_provider FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Optional authentication middleware - allows anonymous access
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue as anonymous user
    req.user = null;
    return next();
  }

  try {
    // Check if token is blacklisted in Redis
    const isBlacklisted = await client.get(`blacklist:${token}`);
    if (isBlacklisted) {
      // Invalid token, continue as anonymous user
      req.user = null;
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await pool.query(
      'SELECT id, uid, email, name, username, profile_image_url, auth_provider FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      // User not found, continue as anonymous
      req.user = null;
      return next();
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    // Any token verification error, continue as anonymous user
    req.user = null;
    next();
  }
};

// Privacy checking middleware for profile access
const checkProfileAccess = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    // Get profile user
    const profileResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileUserId = profileResult.rows[0].id;

    // Set profile access context
    req.profileAccess = {
      profileUserId,
      currentUserId,
      isOwnProfile: currentUserId === profileUserId,
      isAuthenticated: !!currentUserId,
      canViewPosts: false,
      isFriend: false,
      friendRequestStatus: null
    };

    // Check friendship status if authenticated
    if (currentUserId) {
      if (currentUserId === profileUserId) {
        // Own profile - can view everything
        req.profileAccess.canViewPosts = true;
      } else {
        // Check friendship
        const friendResult = await pool.query(`
          SELECT 
            status,
            requested_by
          FROM friends 
          WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
        `, [currentUserId, profileUserId]);

        if (friendResult.rows.length > 0) {
          const friendship = friendResult.rows[0];
          if (friendship.status === 'accepted') {
            req.profileAccess.isFriend = true;
            req.profileAccess.canViewPosts = true;
          } else if (friendship.status === 'pending') {
            req.profileAccess.friendRequestStatus = 
              friendship.requested_by === currentUserId ? 'sent' : 'received';
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error('Profile access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Friend-based privacy middleware for posts
const checkFriendAccess = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Add friend checking utility to request
    req.checkFriendship = async (targetUserId) => {
      if (currentUserId === targetUserId) {
        return { isFriend: true, canAccess: true };
      }

      const friendResult = await pool.query(`
        SELECT status FROM friends 
        WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
        AND status = 'accepted'
      `, [currentUserId, targetUserId]);

      const isFriend = friendResult.rows.length > 0;
      return { isFriend, canAccess: isFriend };
    };

    next();
  } catch (error) {
    console.error('Friend access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Anonymous access control middleware
const allowAnonymous = (req, res, next) => {
  // This middleware allows anonymous access to public endpoints
  // It sets up the request context for anonymous users
  if (!req.user) {
    req.isAnonymous = true;
    req.anonymousAccess = {
      canViewPublicProfiles: true,
      canViewPosts: false,
      canInteract: false,
      requiresLogin: true
    };
  } else {
    req.isAnonymous = false;
  }
  next();
};

module.exports = { 
  authenticateToken, 
  optionalAuth, 
  checkProfileAccess, 
  checkFriendAccess,
  allowAnonymous 
};