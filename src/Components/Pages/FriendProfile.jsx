import React, { useState, useEffect } from "react";
import LeftSide from "../LeftSidebar/LeftSide";
import Navbar from "../Navbar/Navbar";
import RightSide from "../RightSidebar/RightSide";
import BackButton from "../Common/BackButton";
import profilePic from "../../assets/images/profilePic.jpg";
import avatar from "../../assets/images/avatar.jpg";
import { collection, where, query, onSnapshot, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AppContext/AppContext";
import "./Pages.css";

const FriendProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const { user } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);

  useEffect(() => {
    const getUserProfile = async () => {
      const q = query(collection(db, "users"), where("uid", "==", id));
      await onSnapshot(q, (doc) => {
        setProfile(doc.docs[0].data());
      });
    };
    getUserProfile();
  }, [id]);

  useEffect(() => {
    // Check if current user is following this profile
    const checkFollowing = async () => {
      if (!user || !id || user.uid === id) return;
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docSnap = await getDocs(q);
      const userDoc = docSnap.docs[0]?.data();
      setIsFollowing(userDoc?.following?.includes(id));
    };
    checkFollowing();
  }, [user, id]);

  // Fetch this user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "posts"), where("uid", "==", id));
      const snap = await getDocs(q);
      setUserPosts(snap.docs.map((d) => d.data()));
    };
    fetchPosts();
  }, [id]);

  // Fetch followers/following user data
  useEffect(() => {
    const fetchUsers = async (uids, setter) => {
      if (!uids || uids.length === 0) { setter([]); return; }
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map((doc) => doc.data());
      const filtered = users.filter((u) => uids.includes(u.uid));
      setter(filtered);
    };
    fetchUsers(profile?.followers, setFollowersData);
    fetchUsers(profile?.following, setFollowingData);
  }, [profile]);

  const handleFollow = async () => {
    if (!user || !id || user.uid === id) return;
    // Add to following for current user
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docSnap = await getDocs(q);
    const userRef = docSnap.docs[0]?.ref;
    // Add to followers for profile user
    const q2 = query(collection(db, "users"), where("uid", "==", id));
    const docSnap2 = await getDocs(q2);
    const profileRef = docSnap2.docs[0]?.ref;
    try {
      await updateDoc(userRef, { following: arrayUnion(id) });
      await updateDoc(profileRef, { followers: arrayUnion(user.uid) });
      setIsFollowing(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !id || user.uid === id) return;
    // Remove from following for current user
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docSnap = await getDocs(q);
    const userRef = docSnap.docs[0]?.ref;
    // Remove from followers for profile user
    const q2 = query(collection(db, "users"), where("uid", "==", id));
    const docSnap2 = await getDocs(q2);
    const profileRef = docSnap2.docs[0]?.ref;
    try {
      await updateDoc(userRef, { following: arrayRemove(id) });
      await updateDoc(profileRef, { followers: arrayRemove(user.uid) });
      setIsFollowing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  console.log(profile);

  return (
    <div className="friend-profile w-full">
      <BackButton to="/" className="light" />
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar></Navbar>
      </div>
      <div className="flex bg-gray-100">
        <div className="flex-auto w-[20%] fixed top-12">
          <LeftSide></LeftSide>
        </div>
        <div className="flex-auto w-[60%] absolute left-[20%] top-14 bg-gray-100 rounded-xl">
          <div className="w-[80%] mx-auto">
            <div>
              <div className="relative py-4">
                <img
                  className="h-96 w-full rounded-md"
                  src={profilePic}
                  alt="profilePic"
                ></img>
                <div className="absolute bottom-10 left-6">
                  <img
                    src={profile?.image || avatar}
                    alt="avatar"
                    className="profile-avatar"
                    style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}
                  />
                  <p className="py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                    {profile?.email}
                  </p>
                  <p className="py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                    {profile?.name}
                  </p>
                </div>
                <div className="flex flex-col absolute right-6 bottom-10">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="#fff"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>

                    <span className="ml-2 py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                      From Tokyo, Japan
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="#fff"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
                      />
                    </svg>

                    <span className="ml-2 py-2 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                      Lives in New York
                    </span>
                  </div>
                </div>
                {user?.uid !== id && (
                  <button
                    className="btn btn-primary mt-2"
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </div>
            {/* User's posts */}
            <div className="user-posts mt-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <h3 style={{ gridColumn: '1/-1', fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem' }}>Posts</h3>
              {userPosts.length === 0 ? (
                <p style={{ gridColumn: '1/-1' }}>No posts yet.</p>
              ) : (
                userPosts.map((post) => (
                  <div key={post.documentId || post.id} className="bg-white rounded shadow p-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {post.image && <img src={post.image} alt="post" className="profile-post-image" style={{ width: '100%', aspectRatio: '1/1', maxWidth: 320, maxHeight: 320, objectFit: 'cover', borderRadius: 12, marginBottom: 12, background: '#f0f0f0' }} />}
                    <p style={{ fontSize: '1.05rem', color: '#333', textAlign: 'center' }}>{post.text}</p>
                  </div>
                ))
              )}
            </div>
            {/* Followers/Following lists with names/avatars */}
            <div className="followers-list mt-4">
              <h3>Followers</h3>
              <ul>
                {followersData.length > 0 ? (
                  followersData.map((f) => (
                    <li key={f.uid} className="flex items-center my-2">
                      <img src={f.image || "/default-avatar.png"} alt="avatar" className="w-8 h-8 rounded-full mr-2" />
                      <a href={`/profile/${f.uid}`}>{f.name}</a>
                    </li>
                  ))
                ) : (
                  <li>No followers yet.</li>
                )}
              </ul>
            </div>
            <div className="following-list mt-4">
              <h3>Following</h3>
              <ul>
                {followingData.length > 0 ? (
                  followingData.map((f) => (
                    <li key={f.uid} className="flex items-center my-2">
                      <img src={f.image || "/default-avatar.png"} alt="avatar" className="w-8 h-8 rounded-full mr-2" />
                      <a href={`/profile/${f.uid}`}>{f.name}</a>
                    </li>
                  ))
                ) : (
                  <li>Not following anyone yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex-auto w-[20%] fixed right-0 top-12">
          <RightSide></RightSide>
        </div>
      </div>
    </div>
  );
};

export default FriendProfile;
