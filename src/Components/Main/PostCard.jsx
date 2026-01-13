import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./PostCard.css";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import CommentSection from "./CommentSection";
import FriendRequestButton from "../Pages/FriendRequestButton";
import { getProfileImageUrl, getPostImageUrl, handleImageError } from "../../utils/imageUtils";
import { FiHeart, FiMessageCircle, FiTrash2, FiMoreHorizontal, FiShare2, FiBookmark } from "react-icons/fi";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const PostCard = ({ post, onPostUpdate }) => {
  const { user, userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    setLoading(true);
    try {
      const response = await apiClient.likePost(post.id);
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);
    } catch (err) {
      // Revert on error
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    if (user?.id !== post.user.id && userData?.id !== post.user.id) {
      return;
    }

    if (window.confirm("Are you sure you want to delete this post?")) {
      setLoading(true);
      try {
        await apiClient.deletePost(post.id);
        if (onPostUpdate) {
          onPostUpdate(1, true);
        }
      } catch (err) {
        alert(err.message);
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const navigateToProfile = () => {
    if (post.user.username) {
      navigate(`/profile/${post.user.username}`);
    }
  };

  const isOwnPost = user?.id === post.user.id || userData?.id === post.user.id;

  return (
    <article className="post-card glass-card">
      {/* Post Header */}
      <header className="post-header">
        <div className="post-author" onClick={navigateToProfile}>
          <div className="author-avatar-wrapper">
            <img
              src={getProfileImageUrl(post.user)}
              alt={post.user.name}
              className="author-avatar"
              onError={(e) => handleImageError(e, "/user-default.jpg")}
            />
            <div className="online-indicator"></div>
          </div>
          <div className="author-info">
            <span className="author-name">{post.user.name}</span>
            <span className="post-time">{formatTimestamp(post.createdAt)}</span>
          </div>
        </div>
        
        <div className="post-header-actions">
          {!isOwnPost && (
            <FriendRequestButton 
              targetUserId={post.user.id}
              onStatusChange={() => {
                if (onPostUpdate) {
                  onPostUpdate(1, true);
                }
              }}
            />
          )}
          
          <div className="menu-wrapper">
            <button 
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              <FiMoreHorizontal size={20} />
            </button>
            
            {showMenu && (
              <div className="dropdown-menu">
                <button className="dropdown-item">
                  <FiBookmark size={16} />
                  <span>Save Post</span>
                </button>
                <button className="dropdown-item">
                  <FiShare2 size={16} />
                  <span>Share</span>
                </button>
                {isOwnPost && (
                  <button 
                    className="dropdown-item danger"
                    onClick={deletePost}
                  >
                    <FiTrash2 size={16} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Post Content */}
      <div className="post-content">
        <p className="post-text">{post.content}</p>
        
        {post.imageUrl && (
          <div className="post-image-wrapper">
            <img 
              className="post-image" 
              src={getPostImageUrl(post.imageUrl)} 
              alt="Post content"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Post Stats */}
      {(likesCount > 0 || post.commentsCount > 0) && (
        <div className="post-stats">
          {likesCount > 0 && (
            <span className="stat-item">
              <span className="stat-icon like-icon">❤️</span>
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </span>
          )}
          {post.commentsCount > 0 && (
            <span className="stat-item">
              {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>
      )}
      
      {/* Post Actions */}
      <div className="post-actions">
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={loading}
        >
          <FiHeart className={`action-icon ${isLiked ? 'filled' : ''}`} />
          <span>Like</span>
        </button>
        
        <button
          className={`action-btn ${open ? 'active' : ''}`}
          onClick={handleOpen}
        >
          <FiMessageCircle className="action-icon" />
          <span>Comment</span>
        </button>
        
        <button className="action-btn">
          <FiShare2 className="action-icon" />
          <span>Share</span>
        </button>
      </div>
      
      {/* Comments Section */}
      {open && (
        <div className="comments-wrapper">
          <CommentSection postId={post.id} />
        </div>
      )}
    </article>
  );
};

export default PostCard;
