import React from "react";
import "./Comment.css";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const Comment = ({ comment, currentUserId, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.id);
    }
  };

  const isOwnComment = currentUserId === comment.user.id;

  return (
    <div className="comment">
      <img 
        src={comment.user.profileImage || "/user-default.jpg"} 
        alt="" 
        className="comment-avatar" 
      />
      <div className="comment-content">
        <div className="comment-header">
          <h4 className="comment-author">{comment.user.name}</h4>
          <span className="comment-timestamp">
            {formatTimestamp(comment.createdAt)}
          </span>
          {isOwnComment && (
            <button 
              className="comment-delete"
              onClick={handleDelete}
              title="Delete comment"
            >
              ×
            </button>
          )}
        </div>
        <p className="comment-text">{comment.content}</p>
      </div>
    </div>
  );
};

export default Comment;