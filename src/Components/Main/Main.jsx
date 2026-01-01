import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { FaImage, FaVideo, FaSmile } from "react-icons/fa";
import "./Main.css";
import PostCard from "./PostCard";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { PostsReducer, postActions, postsStates } from "../AppContext/PostReducer";

const POSTS_PAGE_SIZE = 5;

const Main = () => {
  const { user, userData, collectionRef } = useContext(AuthContext);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [notification, setNotification] = useState(null); // For custom notifications
  const postRef = doc(collection(db, "posts"));
  const document = postRef.id;
  const [state, dispatch] = React.useReducer(PostsReducer, postsStates);
  const { SUBMIT_POST, HANDLE_ERROR } = postActions;
  const fileRef = useRef(null);
  const scrollRef = useRef(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [following, setFollowing] = useState([]);

  // Fetch following list
  useEffect(() => {
    if (userData?.following) {
      setFollowing(userData.following);
    } else {
      setFollowing([]);
    }
  }, [userData]);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (text !== "") {
      try {
        await setDoc(postRef, {
          documentId: document,
          uid: user?.uid || userData?.uid,
          logo: user?.photoURL,
          name: user?.displayName || userData?.name,
          email: user?.email || userData?.email,
          text: text,
          image: image,
          timestamp: serverTimestamp(),
        });
        setText("");
        // Show success notification
        setNotification({
          show: true,
          message: "Post submitted successfully!",
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000); // Remove notification after 3 seconds
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        setNotification({ show: true, message: err.message, type: "error" });
        console.log(err.message);
      }
    } else {
      dispatch({ type: HANDLE_ERROR });
      setNotification({
        show: true,
        message: "Please enter some text to post.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    let unsubscribe = null;
    if (collectionRef) {
      try {
        const q = query(collectionRef, orderBy("timestamp", "desc"), limit(POSTS_PAGE_SIZE));
        unsubscribe = onSnapshot(q, (docSnap) => {
          let posts = docSnap.docs.map((item) => item.data());
          // Personalize: only show posts from following or self
          if (user?.uid && following.length > 0) {
            posts = posts.filter(
              (p) => following.includes(p.uid) || p.uid === user.uid
            );
          } else if (user?.uid) {
            posts = posts.filter((p) => p.uid === user.uid);
          }
          dispatch({ type: SUBMIT_POST, posts });
          setImage(null);
          setLastVisible(docSnap.docs[docSnap.docs.length - 1]);
          setHasMore(docSnap.docs.length === POSTS_PAGE_SIZE);
        });
      } catch (err) {
        dispatch({ type: HANDLE_ERROR });
        setNotification({ show: true, message: err.message, type: "error" });
        console.log(err.message);
      }
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [SUBMIT_POST, collectionRef, user?.uid, following]);

  const fetchMorePosts = async () => {
    if (!collectionRef || !lastVisible || !hasMore) return;
    setLoadingMore(true);
    try {
      const q = query(
        collectionRef,
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(POSTS_PAGE_SIZE)
      );
      const docSnap = await getDocs(q);
      const morePosts = docSnap.docs.map((item) => item.data());
      if (morePosts.length > 0) {
        dispatch({
          type: SUBMIT_POST,
          posts: [...state.posts, ...morePosts],
        });
        setLastVisible(docSnap.docs[docSnap.docs.length - 1]);
        setHasMore(docSnap.docs.length === POSTS_PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setNotification({ show: true, message: err.message, type: "error" });
      setHasMore(false);
    }
    setLoadingMore(false);
  };

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
    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }
    return () => {
      if (scrollRef.current) observer.unobserve(scrollRef.current);
    };
    // eslint-disable-next-line
  }, [scrollRef, lastVisible, hasMore, loadingMore]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
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
            src={user?.photoURL || "/default-avatar.png"}
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
        <div className="post-actions">
          <input
            type="file"
            hidden
            ref={fileRef}
            onChange={handleImageUpload}
          />
          <button
            className="action-button"
            onClick={() => fileRef.current.click()}
          >
            <FaImage /> Add Image
          </button>
          <button className="action-button">
            <FaVideo /> Live Video
          </button>
          <button className="action-button">
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
        ) : (
          <div>
            {(state?.posts?.length > 0
              ? state?.posts
              : [
                  {
                    logo: "/default-avatar.png",
                    id: "demo1",
                    uid: "demo-uid-1",
                    name: "Demo User 1",
                    email: "demo1@vibenet.com",
                    image: "/assets/images/1.webp",
                    text: "Welcome to VibeNet! This is a demo post.",
                    timestamp: new Date().toUTCString(),
                  },
                  {
                    logo: "/default-avatar.png",
                    id: "demo2",
                    uid: "demo-uid-2",
                    name: "Demo User 2",
                    email: "demo2@vibenet.com",
                    image: "/assets/images/2.webp",
                    text: "Share your first post and connect with friends!",
                    timestamp: new Date().toUTCString(),
                  },
                ]
            ).map((post, index) => {
              return (
                <PostCard
                  key={index}
                  logo={post?.logo}
                  id={post?.documentId || post?.id}
                  uid={post?.uid}
                  name={post?.name}
                  email={post?.email}
                  image={post?.image}
                  text={post?.text}
                  timestamp={post?.timestamp}
                ></PostCard>
              );
            })}
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