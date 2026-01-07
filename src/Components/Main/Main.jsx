import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { FaImage, FaVideo, FaSmile } from "react-icons/fa";
import "./Main.css";
import PostCard from "./PostCard";
import apiClient from "../../config/api";
import { PostsReducer, postActions, postsStates } from "../AppContext/PostReducer";

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

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (text.trim() !== "") {
      try {
        const postData = {
          content: text,
          image: image // This will be a File object, not base64
        };

        const response = await apiClient.createPost(postData);
        
        // Add new post to the beginning of the posts array
        dispatch({
          type: SUBMIT_POST,
          posts: [response.post, ...state.posts]
        });

        setText("");
        setImage(null);
        
        setNotification({
          show: true,
          message: "Post submitted successfully!",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        setNotification({ show: true, message: err.message, type: "error" });
        console.log(err.message);
      }
    } else {
      setNotification({
        show: true,
        message: "Please enter some text to post.",
        type: "error",
      });
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
      // Store the actual File object, not base64
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
    <div className="main-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="post-form">
        <div className="user-profile">
          <img
            src={userData?.profileImage || user?.photoURL || "/user-default.jpg"}
            alt="user"
            className="user-avatar"
          />
        </div>
        <textarea
          className="post-input"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        {image && (
          <div className="image-preview">
            <img 
              src={URL.createObjectURL(image)} 
              alt="Preview" 
              className="preview-image"
            />
            <button 
              className="remove-image"
              onClick={removeImage}
              type="button"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="post-actions">
          <input
            type="file"
            hidden
            ref={fileRef}
            onChange={handleImageUpload}
            accept="image/*"
          />
          <button
            className="action-button"
            onClick={() => fileRef.current.click()}
            type="button"
          >
            <FaImage /> Add Image
          </button>
          <button className="action-button" type="button">
            <FaVideo /> Live Video
          </button>
          <button className="action-button" type="button">
            <FaSmile /> Feeling/Activity
          </button>
          <button className="post-submit" onClick={handleSubmitPost}>
            Post
          </button>
        </div>
      </div>

      <div className="flex flex-col py-4 w-full">
        {state?.error ? (
          <div className="notification error">
            Something went wrong, refresh and try again...
          </div>
        ) : loading ? (
          <div>Loading posts...</div>
        ) : (
          <div>
            {state?.posts?.length > 0 ? (
              state.posts.map((post, index) => (
                <PostCard
                  key={post.id || index}
                  post={post}
                  onPostUpdate={fetchPosts}
                />
              ))
            ) : (
              <div className="empty-feed">
                <div className="empty-feed-content">
                  <h3>Welcome to VibeNet!</h3>
                  <p>Your feed will show posts from your friends.</p>
                  <p>Start by adding friends to see their posts here.</p>
                </div>
              </div>
            )}
            {loadingMore && <div>Loading more posts...</div>}
            {!hasMore && state?.posts?.length > 0 && <div>No more posts.</div>}
          </div>
        )}
      </div>
      <div ref={scrollRef} style={{ height: 1 }} />
    </div>
  );
};

export default Main;