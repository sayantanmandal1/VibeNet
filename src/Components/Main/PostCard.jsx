import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./PostCard.css";
import avatar from "../../assets/images/avatar.jpg";
import like from "../../assets/images/like.png";
import comment from "../../assets/images/comment.png";
import remove from "../../assets/images/delete.png";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import CommentSection from "./CommentSection";
import FriendRequestButton from "../Pages/FriendRequestButton";
import { getProfileImageUrl, getPostImageUrl, handleImageError } from "../../utils/imageUtils";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const PostCard = ({ post, onPostUpdate }) => {
  const { user, userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [loading, setLoading] = useState(false);

  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await apiClient.likePost(post.id);
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    if (user?.id !== post.user.id && userData?.id !== post.user.id) {
      alert("You can't delete other users' posts!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this post?")) {
      setLoading(true);
      try {
        await apiClient.deletePost(post.id);
        if (onPostUpdate) {
          onPostUpdate(1, true); // Refresh posts
        }
      } catch (err) {
        alert(err.message);
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Remove unused functions - these are handled by FriendRequestButton component
  // const handleFollow = async () => { ... }
  // const addUser = async () => { ... }

  const navigateToProfile = () => {
    if (post.user.username) {
      navigate(`/profile/${post.user.username}`);
    }
  };

  const isOwnPost = user?.id === post.user.id || userData?.id === post.user.id;

  return (
    <div className="post-card mb-4">
      <div className="post-header">
        <img
          src={getProfileImageUrl(post.user)}
          alt="avatar"
          className="post-avatar cursor-pointer"
          onClick={navigateToProfile}
          onError={(e) => handleImageError(e, avatar)}
        />
        <div className="flex flex-col ml-4">
          <p 
            className="py-2 font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none cursor-pointer hover:underline"
            onClick={navigateToProfile}
          >
            {post.user.name}
          </p>
          <p className="font-roboto font-medium text-sm text-gray-700 no-underline tracking-normal leading-none">
            Published: {formatTimestamp(post.createdAt)}
          </p>
        </div>
        {!isOwnPost && (
          <div className="w-full flex justify-end mr-4">
            <FriendRequestButton 
              targetUserId={post.user.id}
              onStatusChange={() => {
                // Optionally refresh posts when friendship status changes
                if (onPostUpdate) {
                  onPostUpdate(1, true);
                }
              }}
            />
          </div>
        )}
      </div>
      
      <div className="post-content">
        <p className="ml-0 pb-4 font-roboto font-medium text-base text-gray-800 no-underline tracking-normal leading-normal">
          {post.content}
        </p>
        {post.imageUrl && (
          <img 
            className="post-image" 
            src={getPostImageUrl(post.imageUrl)} 
            alt="postImage"
            onError={(e) => {
              console.log('Post image failed to load:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
        )}
      </div>
      
      <div className="post-actions">
        <button
          className={`post-action-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={loading}
        >
          <img className="h-8 mr-2" src={like} alt="like" />
          {likesCount > 0 && likesCount}
        </button>
        
        <button
          className="post-action-button"
          onClick={handleOpen}
        >
          <img className="h-8 mr-2" src={comment} alt="comment" />
          Comments ({post.commentsCount})
        </button>
        
        {isOwnPost && (
          <button
            className="post-action-button"
            onClick={deletePost}
            disabled={loading}
          >
            <img className="h-8 mr-2" src={remove} alt="delete" />
            Delete
          </button>
        )}
      </div>
      
      {open && <CommentSection postId={post.id} />}
    </div>
  );
};

export default PostCard;