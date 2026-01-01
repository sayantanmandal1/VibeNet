const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Check if post exists
    const postResult = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const result = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.name as user_name,
        u.profile_image_url as user_profile_image
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [postId, limit, offset]);

    const comments = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        profileImage: row.user_profile_image
      }
    }));

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to post
router.post('/post/:postId', authenticateToken, [
  body('content').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Check if post exists
    const postResult = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, content, created_at`,
      [userId, postId, content]
    );

    const comment = result.rows[0];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        user: {
          id: req.user.id,
          name: req.user.name,
          profileImage: req.user.profile_image_url
        }
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Check if comment exists and belongs to user
    const commentResult = await pool.query(
      'SELECT id, user_id FROM comments WHERE id = $1',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = commentResult.rows[0];
    if (comment.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;