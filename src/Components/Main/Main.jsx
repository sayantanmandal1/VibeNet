import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { FiImage, FiVideo, FiSmile, FiSend, FiX, FiLoader } from "react-icons/fi";
import "./Main.css";
import PostCard from "./PostCard";
import apiClient from "../../config/api";
import { PostsReducer, postActions, postsStates } from "../AppContext/PostReducer";
import { getProfileImageUrl, handleImageError } from "../../utils/imageUtils";

const Main = () => {
  const { user, userData } = useContext(AuthContext);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [state, dispatch] = React.useReducer(PostsReducer, postsStates);
  const { SUBMIT_POST, HANDLE_ERROR } = postActions;
  const fileRef = useRef(null);
  const scrollRef = useRef(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (text.trim() !== "" && !isPosting) {
      setIsPosting(true);
      try {
        const postData = {
          content: text,
          image: image
        };

        const response = await apiClient.createPost(postData);
        
        dispatch({
          type: SUBMIT_POST,
          posts: [response.post, ...state.posts]
        });

        setText("");
        setImage(null);
        
        setNotification({
          show: true,
          message: "Post shared successfully! ✨",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        setNotification({ show: true, message: err.message, type: "error" });
        console.log(err.message);
      } finally {
        setIsPosting(false);
      }
    } else if (text.trim() === "") {
      setNotification({
        show: true,
        message: "Write something to share with your friends!",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(pageNum === 1);
      setLoadingMore(pageNum > 1);

      const response = await apiClient.getFeed(pageNum, 10);
      const newPosts = response.posts;

      if (reset || pageNum === 1) {
        dispatch({ type: SUBMIT_POST, posts: newPosts });
      } else {
        dispatch({
          type: SUBMIT_POST,
          posts: [...state.posts, ...newPosts]
        });
      }

      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (err) {
      dispatch({ type: HANDLE_ERROR });
      setNotification({ show: true, message: err.message, type: "error" });
      console.log(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchMorePosts = async () => {
    if (!hasMore || loadingMore) return;
    await fetchPosts(page + 1);
  };

  useEffect(() => {
    if (user) {
      fetchPosts(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!hasMore) return;
    
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          fetchMorePosts();
        }
      },
      { threshold: 1 }
    );
    
    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      observer.observe(currentScrollRef);
    }
    
    return () => {
      if (currentScrollRef) {
        observer.unobserve(currentScrollRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  return (
    <div className="main-feed">
      {/* Notification Toast */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            className="toast-close"
            onClick={() => setNotification(null)}
          >
            <FiX size={16} />
          </button>
        </div>
      )}
      
      {/* Create Post Card */}
      <div className="create-post-card glass-card">
        <div className="create-post-header">
          <div className="user-avatar-wrapper">
            <img
              src={getProfileImageUrl(user || userData)}
              alt="user"
              className="user-avatar"
              onError={(e) => handleImageError(e, "/user-default.jpg")}
            />
            <div className="avatar-ring"></div>
          </div>
          <div className="create-post-info">
            <span className="greeting">What's happening,</span>
            <span className="username">{userData?.name || user?.name || 'Friend'}?</span>
          </div>
        </div>

        <div className="create-post-body">
          <textarea
            className="post-textarea"
            placeholder="Share your thoughts with the world..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          
          {image && (
            <div className="image-preview-container">
              <img 
                src={URL.createObjectURL(image)} 
                alt="Preview" 
                className="preview-image"
              />
              <button 
                className="remove-preview"
                onClick={removeImage}
                type="button"
              >
                <FiX size={18} />
              </button>
            </div>
          )}
        </div>
        
        <div className="create-post-footer">
          <div className="post-attachments">
            <input
              type="file"
              hidden
              ref={fileRef}
              onChange={handleImageUpload}
              accept="image/*"
            />
            <button
              className="attachment-btn"
              onClick={() => fileRef.current.click()}
              type="button"
            >
              <FiImage size={20} />
              <span>Photo</span>
            </button>
            <button className="attachment-btn" type="button">
              <FiVideo size={20} />
              <span>Video</span>
            </button>
            <button className="attachment-btn" type="button">
              <FiSmile size={20} />
              <span>Feeling</span>
            </button>
          </div>
          <button 
            className={`post-submit-btn ${isPosting ? 'posting' : ''}`}
            onClick={handleSubmitPost}
            disabled={isPosting}
          >
            {isPosting ? (
              <>
                <FiLoader className="spin" size={18} />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <FiSend size={18} />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feed Section */}
      <div className="feed-section">
        {state?.error ? (
          <div className="feed-error glass-card">
            <div className="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>Please refresh the page and try again</p>
            <button onClick={() => fetchPosts(1, true)} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="feed-loading">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p>Loading your feed...</p>
          </div>
        ) : (
          <>
            {state?.posts?.length > 0 ? (
              state.posts.map((post, index) => (
                <PostCard
                  key={post.id || index}
                  post={post}
                  onPostUpdate={fetchPosts}
                />
              ))
            ) : (
              <div className="empty-feed glass-card">
                <div className="empty-icon">🌟</div>
                <h3>Welcome to VibeNet!</h3>
                <p>Your feed is waiting for some action.</p>
                <p className="sub-text">Start by adding friends or sharing your first post!</p>
              </div>
            )}
            
            {loadingMore && (
              <div className="loading-more">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            {!hasMore && state?.posts?.length > 0 && (
              <div className="end-of-feed">
                <div className="end-line"></div>
                <span>You're all caught up! ✨</span>
                <div className="end-line"></div>
              </div>
            )}
          </>
        )}
      </div>
      <div ref={scrollRef} style={{ height: 1 }} />
    </div>
  );
};

export default Main;
