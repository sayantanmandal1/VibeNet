import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import BackButton from "../Common/BackButton";
import PhoneInput from "../Common/PhoneInput";
import LocationInput from "../Common/LocationInput";
import { FiSave, FiCamera } from "react-icons/fi";
import "./ProfileEdit.css";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, userData, updateUserData } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    bio: "",
    location: "",
    country: "US" // Default country for phone/location
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getCurrentUserProfile();
        const profile = response.user || userData;
        
        setFormData({
          name: profile?.name || "",
          username: profile?.username || "",
          email: profile?.email || "",
          phoneNumber: profile?.phoneNumber || "",
          bio: profile?.bio || "",
          location: profile?.location || "",
          country: profile?.country || "US" // Default to US if not set
        });
        
        // Set profile image with proper fallback and full URL handling
        const imageUrl = profile?.profileImage || profile?.photoURL;
        if (imageUrl) {
          // If it's a relative path, make it absolute
          const fullImageUrl = imageUrl.startsWith('/') 
            ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`
            : imageUrl;
          setPreviewImage(fullImageUrl);
        } else {
          setPreviewImage("/default-avatar.png");
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Fallback to userData
        if (userData) {
          setFormData({
            name: userData.name || "",
            username: userData.username || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            bio: userData.bio || "",
            location: userData.location || "",
            country: userData.country || "US" // Default to US if not set
          });
          
          const imageUrl = userData.profileImage || userData.photoURL;
          if (imageUrl) {
            const fullImageUrl = imageUrl.startsWith('/') 
              ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`
              : imageUrl;
            setPreviewImage(fullImageUrl);
          } else {
            setPreviewImage("/default-avatar.png");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, userData]);

  // Debounced username checking
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username === userData?.username) {
        setUsernameStatus({ checking: false, available: null, message: "" });
        return;
      }

      if (formData.username.length < 3) {
        setUsernameStatus({ 
          checking: false, 
          available: false, 
          message: "Username must be at least 3 characters" 
        });
        return;
      }

      setUsernameStatus({ checking: true, available: null, message: "Checking..." });

      try {
        const response = await apiClient.request('/users/check-username', {
          method: 'POST',
          body: JSON.stringify({ username: formData.username })
        });

        setUsernameStatus({
          checking: false,
          available: response.available,
          message: response.available ? "Username is available!" : "Username is already taken"
        });
      } catch (err) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: "Error checking username"
        });
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, userData?.username]);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Enhanced file validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: "Please select a valid image file (JPEG, PNG, or WebP)" }));
        return;
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image must be less than 2MB" }));
        return;
      }

      setProfileImage(file);
      setErrors(prev => ({ ...prev, image: "" }));

      // Create immediate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (usernameStatus.available === false && formData.username !== userData?.username) {
      newErrors.username = "Username is already taken";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const profileDataToSend = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        location: formData.location,
        country: formData.country
      };
      
      // Only send username if it has changed
      if (formData.username !== userData?.username) {
        profileDataToSend.username = formData.username;
      }
      
      if (profileImage) {
        profileDataToSend.profileImage = profileImage;
      }

      const response = await apiClient.updateProfile(profileDataToSend);
      
      // Update context with new data
      if (updateUserData) {
        updateUserData(response.user);
      }
      
      // Navigate back to profile view
      navigate('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors({ general: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="profile-edit">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="profile-edit">
      <Navbar />
      <div className="edit-content">
        <div className="edit-header">
          <BackButton onClick={handleBack} />
          <h1 className="edit-title">Edit Profile</h1>
          <button 
            onClick={handleSave} 
            disabled={saving || usernameStatus.checking}
            className="save-button"
          >
            <FiSave className="save-icon" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <div className="edit-form">
          {/* Profile Image Section */}
          <div className="image-section">
            <div className="image-preview">
              <img src={previewImage} alt="Profile Preview" className="preview-avatar" />
              <label htmlFor="image-upload" className="image-upload-btn">
                <FiCamera className="camera-icon" />
                Change Photo
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
              />
            </div>
            {errors.image && <span className="error-text">{errors.image}</span>}
          </div>

          {/* Form Fields */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Enter your username"
              />
              {usernameStatus.message && (
                <span className={`status-text ${usernameStatus.available ? 'success' : 'error'}`}>
                  {usernameStatus.message}
                </span>
              )}
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <PhoneInput
                value={formData.phoneNumber}
                onChange={(value) => handleInputChange('phoneNumber', value)}
                countryCode={formData.country}
                onCountryChange={(countryCode) => handleInputChange('country', countryCode)}
                placeholder="Enter your phone number"
                error={errors.phoneNumber}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <LocationInput
                value={formData.location}
                onChange={(value) => handleInputChange('location', value)}
                countryCode={formData.country}
                placeholder="Enter your location"
                error={errors.location}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="form-textarea"
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileEdit;