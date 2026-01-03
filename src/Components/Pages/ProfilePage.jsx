import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import Navbar from "../Navbar/Navbar";
import LeftSide from "../LeftSidebar/LeftSide";
import RightSide from "../RightSidebar/RightSide";
import EditProfileModal from "./EditProfileModal";
import FriendRequestButton from "./FriendRequestButton";
import BackButton from "../Common/BackButton";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUserData } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [canViewPosts, setCanViewPosts] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [restrictedContent, setRestrictedContent] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getUserProfileByUsername(username);
        setProfile(response.user);
        setPosts(response.posts || []);
        setIsOwnProfile(currentUser && response.user.id === currentUser.id);
        setCanViewPosts(response.canViewPosts || false);
        setIsAnonymous(!!response.anonymousAccess);
        setRestrictedContent(response.restrictedContent || false);
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.message.includes('404') || err.message.includes('not found')) {
          setError('Profile not found');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, currentUser]);

  const handleFriendStatusChange = (newStatus) => {
    // Update profile data based on friendship status change
    if (newStatus === 'friends') {
      setProfile(prev => ({
        ...prev,
        friendsCount: (prev.friendsCount || 0) + 1
      }));
      setCanViewPosts(true);
      setRestrictedContent(false);
      // Refresh posts when becoming friends
      window.location.reload();
    } else if (newStatus === 'none') {
      setProfile(prev => ({
        ...prev,
        friendsCount: Math.max((prev.friendsCount || 0) - 1, 0)
      }));
      setCanViewPosts(false);
      setRestrictedContent(true);
      setPosts([]);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await apiClient.updateProfile(updatedData);
      
      // Update profile with new data
      const updatedProfile = { ...profile, ...response.user };
      
      // If a new image was uploaded, use the immediate URL for display
      if (response.imageUploaded && response.newImageUrl) {
        updatedProfile.profileImage = response.newImageUrl;
      }
      
      setProfile(updatedProfile);
      setShowEditModal(false);
      
      // Update context if it's the current user's profile
      if (isOwnProfile) {
        updateUserData(updatedProfile);
        
        // If username changed, navigate to new URL
        if (updatedProfile.username !== username) {
          navigate(`/profile/${updatedProfile.username}`, { replace: true });
        }
      }
      
      // Show success message
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err; // Re-throw to let EditProfileModal handle the error display
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { returnTo: `/profile/${username}` } });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="fixed top-0 z-10 w-full bg-white">
          <Navbar />
        </div>
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="fixed top-0 z-10 w-full bg-white">
          <Navbar />
        </div>
        <div className="profile-error">
          {error === 'Profile not found' ? (
            <>
              <h2>Profile not found</h2>
              <p>The user @{username} doesn't exist or has been removed.</p>
            </>
          ) : (
            <>
              <h2>Error loading profile</h2>
              <p>There was an error loading this profile. Please try again later.</p>
            </>
          )}
          <button onClick={() => navigate('/home')} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const renderPostsSection = () => {
    if (isAnonymous && !isOwnProfile) {
      return (
        <div className="posts-private">
          <div className="private-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <h3>Login to View Posts</h3>
          <p>You need to be logged in to see {profile.name}'s posts.</p>
          <button onClick={handleLoginRedirect} className="btn-primary">
            Log In
          </button>
        </div>
      );
    }

    if (restrictedContent || (!canViewPosts && !isOwnProfile)) {
      return (
        <div className="posts-private">
          <div className="private-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <h3>This Account is Private</h3>
          <p>Only friends can see {profile.name}'s posts. Send a friend request to view their content.</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="posts-empty">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3.2"/>
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
          </div>
          <h3>No Posts Yet</h3>
          {isOwnProfile && <p>When you share posts, they'll appear here.</p>}
        </div>
      );
    }

    return (
      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-grid-item">
            {post.imageUrl ? (
              <img 
                src={post.imageUrl} 
                alt="Post"
                className="post-grid-image"
              />
            ) : (
              <div className="post-grid-text">
                <p>{post.content}</p>
              </div>
            )}
            
            <div className="post-grid-overlay">
              <div className="post-stats">
                <div className="post-stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>{post.likesCount || 0}</span>
                </div>
                <div className="post-stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M21 6h-2l-1.27-1.27c-.39-.39-.9-.73-1.46-.73H7.73c-.56 0-1.07.34-1.46.73L5 6H3c-.55 0-1 .45-1 1s.45 1 1 1h1l1.27 9.27c.23 1.67 1.65 2.73 3.32 2.73h7.82c1.67 0 3.09-1.06 3.32-2.73L21 8h1c.55 0 1-.45 1-1s-.45-1-1-1z"/>
                  </svg>
                  <span>{post.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="profile-page">
      <BackButton to="/" className="light" />
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar />
      </div>
      
      <div className="profile-layout">
        <div className="profile-sidebar-left">
          <LeftSide />
        </div>
        
        <div className="profile-main">
          <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-avatar-section">
                <img 
                  src={profile.profileImage || '/default-avatar.png'} 
                  alt={profile.name}
                  className="profile-avatar"
                />
              </div>
              
              <div className="profile-info-section">
                <div className="profile-username-row">
                  <h1 className="profile-username">@{profile.username}</h1>
                  
                  <div className="profile-actions">
                    {isOwnProfile ? (
                      <button 
                        onClick={handleEditProfile}
                        className="btn-edit-profile"
                      >
                        Edit Profile
                      </button>
                    ) : !isAnonymous ? (
                      <FriendRequestButton 
                        targetUserId={profile.id}
                        onStatusChange={handleFriendStatusChange}
                      />
                    ) : (
                      <button 
                        onClick={handleLoginRedirect}
                        className="btn-login-prompt"
                      >
                        Log In to Connect
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-number">{profile.postsCount || 0}</span>
                    <span className="stat-label">posts</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{profile.friendsCount || 0}</span>
                    <span className="stat-label">friends</span>
                  </div>
                </div>
                
                <div className="profile-bio-section">
                  <h2 className="profile-name">{profile.name}</h2>
                  {profile.bio && (
                    <p className="profile-bio">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Posts Grid */}
            <div className="profile-posts-section">
              <div className="posts-header">
                <div className="posts-tab active">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  <span>POSTS</span>
                </div>
              </div>
              
              {renderPostsSection()}
            </div>
          </div>
        </div>
        
        <div className="profile-sidebar-right">
          <RightSide />
        </div>
      </div>
      
      {showEditModal && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfilePage;