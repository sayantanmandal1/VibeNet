const express = require('express');
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'social_media',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// POST /api/friends/request/:userId - Send friend request
router.post('/request/:userId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { userId: targetUserId } = req.params;
    const requesterId = req.user.id;

    // Validate that target user exists
    const targetUserResult = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [targetUserId]
    );

    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is trying to send request to themselves
    if (requesterId === targetUserId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await client.query(
      `SELECT id, status, requested_by FROM friends 
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [requesterId, targetUserId]
    );

    if (existingFriendship.rows.length > 0) {
      const friendship = existingFriendship.rows[0];
      
      if (friendship.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends with this user' });
      }
      
      if (friendship.status === 'pending') {
        if (friendship.requested_by === requesterId) {
          return res.status(400).json({ error: 'Friend request already sent' });
        } else {
          return res.status(400).json({ error: 'This user has already sent you a friend request' });
        }
      }
      
      if (friendship.status === 'blocked') {
        return res.status(400).json({ error: 'Cannot send friend request to this user' });
      }
    }

    // Create friend request
    const result = await client.query(
      `INSERT INTO friends (user_id, friend_id, status, requested_by, requested_at)
       VALUES ($1, $2, 'pending', $1, CURRENT_TIMESTAMP)
       RETURNING id, requested_at`,
      [requesterId, targetUserId]
    );

    res.status(201).json({
      message: 'Friend request sent successfully',
      requestId: result.rows[0].id,
      requestedAt: result.rows[0].requested_at
    });

  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  } finally {
    client.release();
  }
});

// PUT /api/friends/accept/:requestId - Accept friend request
router.put('/accept/:requestId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { requestId } = req.params;
    const userId = req.user.id;

    // Find the friend request
    const requestResult = await client.query(
      `SELECT id, user_id, friend_id, status, requested_by 
       FROM friends 
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'`,
      [requestId, userId]
    );

    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Friend request not found or already processed' });
    }

    const request = requestResult.rows[0];

    // Update the existing request to accepted
    await client.query(
      `UPDATE friends 
       SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [requestId]
    );

    // Create the reciprocal friendship
    await client.query(
      `INSERT INTO friends (user_id, friend_id, status, requested_by, requested_at, accepted_at)
       VALUES ($1, $2, 'accepted', $3, $4, CURRENT_TIMESTAMP)`,
      [userId, request.user_id, request.requested_by, request.requested_at]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Friend request accepted successfully',
      friendshipId: requestId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  } finally {
    client.release();
  }
});

// PUT /api/friends/decline/:requestId - Decline friend request
router.put('/decline/:requestId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Find and delete the friend request
    const result = await client.query(
      `DELETE FROM friends 
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING id`,
      [requestId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found or already processed' });
    }

    res.json({
      message: 'Friend request declined successfully'
    });

  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ error: 'Failed to decline friend request' });
  } finally {
    client.release();
  }
});

// DELETE /api/friends/:friendId - Remove friend
router.delete('/:friendId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { friendId } = req.params;
    const userId = req.user.id;

    // Remove both directions of the friendship
    const result = await client.query(
      `DELETE FROM friends 
       WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
       AND status = 'accepted'
       RETURNING id`,
      [userId, friendId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Friendship not found' });
    }

    await client.query('COMMIT');

    res.json({
      message: 'Friend removed successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  } finally {
    client.release();
  }
});

// GET /api/friends/requests - Get pending friend requests
router.get('/requests', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;

    // Get incoming friend requests (where current user is the friend_id)
    const incomingRequests = await client.query(
      `SELECT f.id, f.requested_at, f.requested_by,
              u.id as requester_id, u.name as requester_name, 
              u.username as requester_username, u.profile_image_url as requester_image
       FROM friends f
       JOIN users u ON f.requested_by = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'
       ORDER BY f.requested_at DESC`,
      [userId]
    );

    // Get outgoing friend requests (where current user is the user_id)
    const outgoingRequests = await client.query(
      `SELECT f.id, f.requested_at, f.friend_id,
              u.id as target_id, u.name as target_name, 
              u.username as target_username, u.profile_image_url as target_image
       FROM friends f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = $1 AND f.status = 'pending'
       ORDER BY f.requested_at DESC`,
      [userId]
    );

    res.json({
      incoming: incomingRequests.rows.map(row => ({
        id: row.id,
        requestedAt: row.requested_at,
        requester: {
          id: row.requester_id,
          name: row.requester_name,
          username: row.requester_username,
          profileImage: row.requester_image
        }
      })),
      outgoing: outgoingRequests.rows.map(row => ({
        id: row.id,
        requestedAt: row.requested_at,
        target: {
          id: row.target_id,
          name: row.target_name,
          username: row.target_username,
          profileImage: row.target_image
        }
      }))
    });

  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  } finally {
    client.release();
  }
});

// GET /api/friends/list - Get user's friends list
router.get('/list', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;

    // Get all accepted friends
    const friendsResult = await client.query(
      `SELECT DISTINCT 
              CASE 
                WHEN f.user_id = $1 THEN f.friend_id 
                ELSE f.user_id 
              END as friend_id,
              u.name, u.username, u.profile_image_url, u.bio,
              f.accepted_at
       FROM friends f
       JOIN users u ON (
         CASE 
           WHEN f.user_id = $1 THEN f.friend_id 
           ELSE f.user_id 
         END = u.id
       )
       WHERE (f.user_id = $1 OR f.friend_id = $1) 
       AND f.status = 'accepted'
       ORDER BY f.accepted_at DESC`,
      [userId]
    );

    res.json({
      friends: friendsResult.rows.map(row => ({
        id: row.friend_id,
        name: row.name,
        username: row.username,
        profileImage: row.profile_image_url,
        bio: row.bio,
        friendsSince: row.accepted_at
      })),
      count: friendsResult.rows.length
    });

  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ error: 'Failed to fetch friends list' });
  } finally {
    client.release();
  }
});

// GET /api/friends/status/:userId - Check friendship status with specific user
router.get('/status/:userId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === targetUserId) {
      return res.json({ status: 'self' });
    }

    // Check friendship status
    const friendshipResult = await client.query(
      `SELECT status, requested_by, id
       FROM friends 
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [currentUserId, targetUserId]
    );

    if (friendshipResult.rows.length === 0) {
      return res.json({ status: 'none' });
    }

    const friendship = friendshipResult.rows[0];

    if (friendship.status === 'accepted') {
      return res.json({ status: 'friends' });
    }

    if (friendship.status === 'pending') {
      if (friendship.requested_by === currentUserId) {
        return res.json({ 
          status: 'request_sent',
          requestId: friendship.id
        });
      } else {
        return res.json({ 
          status: 'request_received',
          requestId: friendship.id
        });
      }
    }

    if (friendship.status === 'blocked') {
      return res.json({ status: 'blocked' });
    }

    res.json({ status: 'unknown' });

  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ error: 'Failed to check friendship status' });
  } finally {
    client.release();
  }
});

module.exports = router;