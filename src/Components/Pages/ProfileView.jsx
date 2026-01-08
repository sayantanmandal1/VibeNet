import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import BackButton from "../Common/BackButton";
import { FiEdit3, FiMapPin, FiCalendar, FiMail, FiPhone } from "react-icons/fi";
import "./ProfileView.css";

const ProfileView = () => {
  const navigate = useNavigate();
  const { user, userData } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getCurrentUserProfile();
        setProfile(response.user || userData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        // Fallback to userData if API fails
        setProfile(userData);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, userData]);

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="profile-view">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-view">
        <Navbar />
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={handleBackToHome} className="back-button">
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-view">
      <Navbar />
      <div className="profile-content">
        <div className="profile-header-actions">
          <BackButton onClick={handleBackToHome} />
          <button onClick={handleEditProfile} className="edit-profile-btn">
            <FiEdit3 className="edit-icon" />
            Edit Profile
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-section">
              <img
                src={(() => {
                  const imageUrl = profile?.profileImage || profile?.photoURL;
                  if (imageUrl) {
                    // Handle different types of image URLs
                    if (imageUrl.startsWith('http')) {
                      // External URL (like Google profile images)
                      return imageUrl;
                    } else if (imageUrl.startsWith('/')) {
                      // Local server URL
                      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                      const cacheBuster = `?t=${Date.now()}`;
                      return `${baseUrl}${imageUrl}${cacheBuster}`;
                    } else {
                      // Relative path
                      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                      const cacheBuster = `?t=${Date.now()}`;
                      return `${baseUrl}/${imageUrl}${cacheBuster}`;
                    }
                  }
                  return "/user-default.jpg";
                })()}
                alt="Profile"
                className="profile-avatar"
                onError={(e) => {
                  console.log('Profile image failed to load:', e.target.src);
                  e.target.src = "/user-default.jpg";
                }}
              />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{profile?.name || "No name set"}</h1>
              <p className="profile-username">@{profile?.username || "No username"}</p>
              <p className="profile-bio">{profile?.bio || "No bio available"}</p>
            </div>
          </div>

          <div className="profile-details">
            <h2 className="section-title">Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <FiMail className="info-icon" />
                <span className="info-label">Email:</span>
                <span className="info-value">{profile?.email || "Not provided"}</span>
              </div>
              <div className="info-item">
                <FiPhone className="info-icon" />
                <span className="info-label">Phone:</span>
                <span className="info-value">{profile?.phoneNumber || "Not provided"}</span>
              </div>
              <div className="info-item">
                <FiMapPin className="info-icon" />
                <span className="info-label">Location:</span>
                <span className="info-value">{profile?.location || "Not provided"}</span>
              </div>
              <div className="info-item">
                <FiCalendar className="info-icon" />
                <span className="info-label">Joined:</span>
                <span className="info-value">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileView;