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
    
    // Get user from database
    const userResult = await pool.query(
      'SELECT id, uid, email, name, profile_image_url, auth_provider FROM users WHERE id = $1',
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

module.exports = { authenticateToken };