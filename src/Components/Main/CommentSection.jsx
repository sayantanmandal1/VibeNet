import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import Comment from "./Comment";
import "./CommentSection.css";

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
        
        // Add new comment to the beginning of the comments array
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
        alert(err.message);
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
    <div className="flex flex-col bg-white w-full py-2 rounded-b-3xl comment-section">
      <div className="flex items-center">
        <div className="mx-2">
          <img
            src={userData?.profileImage || user?.photoURL || "/user-default.jpg"}
            alt="User"
            className="comment-avatar"
          />
        </div>
        <div className="w-full pr-2">
          <form className="flex items-center w-full" onSubmit={addComment}>
            <input
              name="comment"
              type="text"
              placeholder="Write a comment..."
              className="w-full rounded-2xl outline-none border-0 p-2 bg-gray-100 comment-input"
              ref={comment}
              disabled={submitting}
            />
            <button 
              className="hidden" 
              type="submit"
              disabled={submitting}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading comments...</div>
      ) : (
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No comments yet</div>
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