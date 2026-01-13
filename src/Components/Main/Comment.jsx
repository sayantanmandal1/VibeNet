import React from "react";
import { useNavigate } from "react-router-dom";
import "./Comment.css";
import { FiTrash2 } from "react-icons/fi";
import { getProfileImageUrl, handleImageError } from "../../utils/imageUtils";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Comment = ({ comment, currentUserId, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    if (window.confirm("Delete this comment?")) {
      onDelete(comment.id);
    }
  };

  const navigateToProfile = () => {
    if (comment.user.username) {
      navigate(`/profile/${comment.user.username}`);
    }
  };

  const isOwnComment = currentUserId === comment.user.id;

  return (
    <div className="comment-item">
      <div className="comment-avatar-container" onClick={navigateToProfile}>
        <img 
          src={getProfileImageUrl(comment.user)}
          alt={comment.user.name}
          className="comment-avatar"
          onError={(e) => handleImageError(e, "/user-default.jpg")}
        />
      </div>
      
      <div className="comment-body">
        <div className="comment-bubble">
          <div className="comment-header">
            <span className="comment-author" onClick={navigateToProfile}>
              {comment.user.name}
            </span>
            <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
          </div>
          <p className="comment-text">{comment.content}</p>
        </div>
        
        <div className="comment-actions">
          <button className="comment-action-btn">Like</button>
          <button className="comment-action-btn">Reply</button>
          {isOwnComment && (
            <button 
              className="comment-action-btn delete"
              onClick={handleDelete}
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
