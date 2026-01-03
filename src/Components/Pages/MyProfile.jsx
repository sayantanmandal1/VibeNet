import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import ProfileEditModal from "./ProfileEditModal";
import BackButton from "../Common/BackButton";
import avatar from "../../assets/images/avatar.jpg";

const MyProfile = () => {
  const { user, userData } = useContext(AuthContext);
  const [showEdit, setShowEdit] = useState(false);
  const [profile, setProfile] = useState(userData || {});
  const [userPosts, setUserPosts] = useState([]);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);

  useEffect(() => {
    setProfile(userData || {});
  }, [userData]);

  // Fetch this user's posts
  useEffect(() => {
    if (!user?.uid) return;
    const fetchPosts = async () => {
      const q = query(collection(db, "posts"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      setUserPosts(snap.docs.map((d) => d.data()));
    };
    fetchPosts();
  }, [user?.uid]);

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

  const handleProfileSave = async (data) => {
    setProfile(data);
    if (user?.uid) {
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docSnap = await getDocs(q);
      const userRef = docSnap.docs[0]?.ref;
      if (userRef) {
        await updateDoc(userRef, {
          name: data.name,
          bio: data.bio,
          image: data.avatar,
        });
      }
    }
  };

  return (
    <div className="my-profile w-full">
      <BackButton to="/" className="light" />
      <div className="flex flex-col items-center bg-white p-8 rounded shadow mt-8 mx-auto max-w-2xl">
        <img
          src={profile?.image || avatar}
          alt="avatar"
          className="w-32 h-32 rounded-full mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">{profile?.name}</h2>
        <p className="text-gray-600 mb-2">{profile?.bio}</p>
        <button className="btn btn-primary mb-4" onClick={() => setShowEdit(true)}>
          Edit Profile
        </button>
        {/* User's posts */}
        <div className="user-posts mt-6 w-full">
          <h3 className="font-semibold mb-2">Your Posts</h3>
          {userPosts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            userPosts.map((post) => (
              <div key={post.documentId || post.id} className="mb-4 p-4 bg-gray-100 rounded shadow">
                {post.image && <img src={post.image} alt="post" className="w-full max-h-80 object-cover rounded mb-2" />}
                <p>{post.text}</p>
              </div>
            ))
          )}
        </div>
        {/* Followers/Following lists with names/avatars */}
        <div className="followers-list mt-4 w-full">
          <h3 className="font-semibold">Followers</h3>
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
        <div className="following-list mt-4 w-full">
          <h3 className="font-semibold">Following</h3>
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
      {showEdit && (
        <ProfileEditModal
          user={profile}
          onClose={() => setShowEdit(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
};

export default MyProfile; 