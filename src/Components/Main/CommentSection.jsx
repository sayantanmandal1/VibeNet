import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import Comment from "./Comment";
import "./CommentSection.css";
import { FiSend, FiLoader } from "react-icons/fi";
import { getProfileImageUrl, handleImageError } from "../../utils/imageUtils";

const CommentSection = ({ postId }) => {
  const comment = useRef("");
  const { user, userData } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addComment = async (e) => {
    e.preventDefault();
    if (comment.current.value.trim() !== "" && !submitting) {
      setSubmitting(true);
      try {
        const response = await apiClient.addComment(postId, comment.current.value.trim());
        setComments(prevComments => [response.comment, ...prevComments]);
        comment.current.value = "";
      } catch (err) {
        alert(err.message);
        console.log(err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getComments(postId);
        setComments(response.comments);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleDeleteComment = async (commentId) => {
    try {
      await apiClient.deleteComment(commentId);
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  return (
    <div className="comment-section">
      {/* Comment Input */}
      <div className="comment-input-wrapper">
        <div className="comment-avatar-wrapper">
          <img
            src={getProfileImageUrl(user || userData)}
            alt="User"
            className="comment-user-avatar"
            onError={(e) => handleImageError(e, "/user-default.jpg")}
          />
        </div>
        <form className="comment-form" onSubmit={addComment}>
          <input
            name="comment"
            type="text"
            placeholder="Write a comment..."
            className="comment-input"
            ref={comment}
            disabled={submitting}
          />
          <button 
            className={`comment-submit ${submitting ? 'submitting' : ''}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <FiLoader className="spin" size={18} />
            ) : (
              <FiSend size={18} />
            )}
          </button>
        </form>
      </div>
      
      {/* Comments List */}
      {loading ? (
        <div className="comments-loading">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      ) : (
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">
              <span className="no-comments-icon">💬</span>
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((commentData) => (
              <Comment
                key={commentData.id}
                comment={commentData}
                currentUserId={user?.id || userData?.id}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
