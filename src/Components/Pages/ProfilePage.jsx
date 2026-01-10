import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import Navbar from "../Navbar/Navbar";
import LeftSide from "../LeftSidebar/LeftSide";
import RightSide from "../RightSidebar/RightSide";
import Footer from "../Footer/Footer";
import EditProfileModal from "./EditProfileModal";
import FriendRequestButton from "./FriendRequestButton";
import BackButton from "../Common/BackButton";
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiUser, 
  FiHeart, 
  FiMessageCircle, 
  FiShare2,
  FiEdit3,
  FiUserPlus,
  FiLock,
  FiCamera,
  FiGlobe,
  FiStar,
  FiAward,
  FiTrendingUp
} from "react-icons/fi";
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
    if (newStatus === 'friends') {
      setProfile(prev => ({
        ...prev,
        friendsCount: (prev.friendsCount || 0) + 1
      }));
      setCanViewPosts(true);
      setRestrictedContent(false);
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
      
      const updatedProfile = { ...profile, ...response.user };
      
      if (response.imageUploaded && response.newImageUrl) {
        updatedProfile.profileImage = response.newImageUrl;
      }
      
      setProfile(updatedProfile);
      setShowEditModal(false);
      
      if (isOwnProfile) {
        updateUserData(updatedProfile);
        
        if (updatedProfile.username !== username) {
          navigate(`/profile/${updatedProfile.username}`, { replace: true });
        }
      }
      
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { returnTo: `/profile/${username}` } });
  };

  const handleSmartBack = () => {
    // Simple check: if user exists, go to home, otherwise go to landing
    if (currentUser) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getProfileImageUrl = () => {
    const imageUrl = profile?.profileImage;
    if (!imageUrl) return '/user-default.jpg';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else if (imageUrl.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}?t=${Date.now()}`;
    } else if (imageUrl.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}?t=${Date.now()}`;
    } else {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${imageUrl}?t=${Date.now()}`;
    }
  };

  if (loading) {
    return (
      <div className="profile-page-new">
        <div className="navbar-container">
          <Navbar />
        </div>
        <div className="profile-loading-new">
          <div className="loading-glass-card">
            <div className="loading-spinner-new"></div>
            <h3>Loading Profile</h3>
            <p>Please wait while we fetch the profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page-new">
        <div className="navbar-container">
          <Navbar />
        </div>
        <div className="profile-error-new">
          <div className="error-glass-card">
            <div className="error-icon">
              <FiUser size={48} />
            </div>
            <h2>{error === 'Profile not found' ? 'Profile Not Found' : 'Error Loading Profile'}</h2>
            <p>
              {error === 'Profile not found' 
                ? `The user @${username} doesn't exist or has been removed.`
                : 'There was an error loading this profile. Please try again later.'
              }
            </p>
            <button onClick={() => navigate('/home')} className="btn-primary-new">
              <FiTrendingUp size={16} />
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContactInfo = () => (
    <div className="contact-info-section">
      <h3 className="section-title-new">
        <FiMail size={20} />
        Contact Information
      </h3>
      <div className="contact-grid">
        <div className="contact-item">
          <div className="contact-icon">
            <FiMail size={18} />
          </div>
          <div className="contact-details">
            <span className="contact-label">Email Address</span>
            <span className="contact-value">{profile?.email || 'Not provided'}</span>
          </div>
        </div>
        
        <div className="contact-item">
          <div className="contact-icon">
            <FiPhone size={18} />
          </div>
          <div className="contact-details">
            <span className="contact-label">Phone Number</span>
            <span className="contact-value">{profile?.phoneNumber || 'Not provided'}</span>
          </div>
        </div>
        
        <div className="contact-item">
          <div className="contact-icon">
            <FiMapPin size={18} />
          </div>
          <div className="contact-details">
            <span className="contact-label">Location</span>
            <span className="contact-value">{profile?.location || 'Not provided'}</span>
          </div>
        </div>
        
        <div className="contact-item">
          <div className="contact-icon">
            <FiCalendar size={18} />
          </div>
          <div className="contact-details">
            <span className="contact-label">Member Since</span>
            <span className="contact-value">{formatDate(profile?.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="personal-info-section">
      <h3 className="section-title-new">
        <FiUser size={20} />
        Personal Information
      </h3>
      <div className="personal-grid">
        <div className="personal-item">
          <span className="personal-label">Full Name</span>
          <span className="personal-value">{profile?.name || 'Not provided'}</span>
        </div>
        
        <div className="personal-item">
          <span className="personal-label">Username</span>
          <span className="personal-value">@{profile?.username || 'Not provided'}</span>
        </div>
        
        <div className="personal-item">
          <span className="personal-label">Bio</span>
          <span className="personal-value bio-text">{profile?.bio || 'No bio available'}</span>
        </div>
        
        <div className="personal-item">
          <span className="personal-label">Profile Status</span>
          <span className="personal-value">
            <span className={`status-badge ${restrictedContent ? 'private' : 'public'}`}>
              {restrictedContent ? (
                <>
                  <FiLock size={14} />
                  Private
                </>
              ) : (
                <>
                  <FiGlobe size={14} />
                  Public
                </>
              )}
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  const renderStatsSection = () => (
    <div className="stats-section">
      <h3 className="section-title-new">
        <FiTrendingUp size={20} />
        Profile Statistics
      </h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiCamera size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{profile?.postsCount || 0}</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiUser size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{profile?.friendsCount || 0}</span>
            <span className="stat-label">Friends</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiHeart size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{profile?.likesReceived || 0}</span>
            <span className="stat-label">Likes</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiStar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{profile?.profileViews || 0}</span>
            <span className="stat-label">Views</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPostsSection = () => {
    if (isAnonymous && !isOwnProfile) {
      return (
        <div className="posts-restricted">
          <div className="restricted-icon">
            <FiLock size={48} />
          </div>
          <h3>Login Required</h3>
          <p>You need to be logged in to see {profile.name}'s posts.</p>
          <button onClick={handleLoginRedirect} className="btn-primary-new">
            <FiUser size={16} />
            Log In
          </button>
        </div>
      );
    }

    if (restrictedContent || (!canViewPosts && !isOwnProfile)) {
      return (
        <div className="posts-restricted">
          <div className="restricted-icon">
            <FiLock size={48} />
          </div>
          <h3>Private Account</h3>
          <p>Only friends can see {profile.name}'s posts. Send a friend request to view their content.</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="posts-empty-new">
          <div className="empty-icon">
            <FiCamera size={48} />
          </div>
          <h3>No Posts Yet</h3>
          <p>{isOwnProfile ? "When you share posts, they'll appear here." : `${profile.name} hasn't shared any posts yet.`}</p>
        </div>
      );
    }

    return (
      <div className="posts-grid-new">
        {posts.map((post) => (
          <div key={post.id} className="post-card-new">
            {post.imageUrl ? (
              <div className="post-image-container">
                <img 
                  src={post.imageUrl} 
                  alt="Post"
                  className="post-image-new"
                />
                <div className="post-overlay">
                  <div className="post-stats-new">
                    <div className="post-stat">
                      <FiHeart size={16} />
                      <span>{post.likesCount || 0}</span>
                    </div>
                    <div className="post-stat">
                      <FiMessageCircle size={16} />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="post-text-container">
                <p className="post-text-content">{post.content}</p>
                <div className="post-overlay">
                  <div className="post-stats-new">
                    <div className="post-stat">
                      <FiHeart size={16} />
                      <span>{post.likesCount || 0}</span>
                    </div>
                    <div className="post-stat">
                      <FiMessageCircle size={16} />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="profile-page-new">
      <BackButton onClick={handleSmartBack} className="back-btn-new" />
      <div className="navbar-container">
        <Navbar />
      </div>
      
      <div className="profile-layout-new">
        <div className="profile-sidebar-left-new">
          <LeftSide />
        </div>
        
        <div className="profile-main-new">
          <div className="profile-container-new">
            {/* Hero Section */}
            <div className="profile-hero">
              <div className="hero-background"></div>
              <div className="hero-content">
                <div className="profile-avatar-container">
                  <div className="avatar-wrapper">
                    <img 
                      src={getProfileImageUrl()} 
                      alt={profile.name}
                      className="profile-avatar-new"
                      onError={(e) => {
                        e.target.src = "/user-default.jpg";
                      }}
                    />
                    <div className="avatar-ring"></div>
                  </div>
                </div>
                
                <div className="profile-header-info">
                  <div className="profile-name-section">
                    <h1 className="profile-display-name">{profile.name || 'Unknown User'}</h1>
                    <p className="profile-username-new">@{profile.username}</p>
                  </div>
                  
                  <div className="profile-actions-new">
                    {isOwnProfile ? (
                      <button 
                        onClick={handleEditProfile}
                        className="btn-edit-new"
                      >
                        <FiEdit3 size={16} />
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
                        className="btn-login-new"
                      >
                        <FiUserPlus size={16} />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="profile-content-new">
              {/* Personal Information */}
              <div className="info-card">
                {renderPersonalInfo()}
              </div>

              {/* Contact Information */}
              <div className="info-card">
                {renderContactInfo()}
              </div>

              {/* Statistics */}
              <div className="info-card">
                {renderStatsSection()}
              </div>

              {/* Posts Section */}
              <div className="posts-card">
                <h3 className="section-title-new">
                  <FiCamera size={20} />
                  Posts & Content
                </h3>
                {renderPostsSection()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-sidebar-right-new">
          <RightSide />
        </div>
      </div>
      
      <Footer />
      
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