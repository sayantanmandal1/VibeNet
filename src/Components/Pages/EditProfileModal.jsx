import React, { useState, useEffect } from "react";
import apiClient from "../../config/api";
import { validateUsername } from "../../utils/profileUtils";
import PhoneInput from "../Common/PhoneInput";
import LocationInput from "../Common/LocationInput";
import "./EditProfileModal.css";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
    location: user?.location || "",
    country: user?.country || "US" // Default to US if not set
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(() => {
    const imageUrl = user?.profileImage;
    if (imageUrl) {
      return imageUrl.startsWith('/') 
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`
        : imageUrl;
    }
    return "/default-avatar.png";
  });
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Debounced username checking
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username === user?.username) {
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
  }, [formData.username, user?.username]);

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

      // Validate file size (2MB limit to match backend)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image must be less than 2MB" }));
        return;
      }

      setProfileImage(file);
      setErrors(prev => ({ ...prev, image: "" }));

      // Create immediate preview for better UX
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

    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.message;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (formData.location && formData.location.trim().length > 0) {
      if (formData.location.trim().length < 2) {
        newErrors.location = "Location must be at least 2 characters";
      } else if (!/^[a-zA-Z\s,.\-'()]+$/.test(formData.location.trim())) {
        newErrors.location = "Location contains invalid characters";
      }
    }

    if (usernameStatus.available === false && formData.username !== user?.username) {
      newErrors.username = "Username is not available";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        location: formData.location,
        country: formData.country
      };

      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      await onSave(updateData);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrors({ general: err.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={handleOverlayClick}>
      <div className="edit-profile-modal">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="form-section">
            <div className="profile-image-section">
              <img 
                src={previewImage} 
                alt="Profile preview"
                className="profile-preview"
              />
              <div className="image-upload-section">
                <label htmlFor="profile-image" className="image-upload-label">
                  Change Profile Photo
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-upload-input"
                />
                {errors.image && (
                  <div className="error-message">{errors.image}</div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                className={errors.username ? 'error' : ''}
                placeholder="Enter your username"
              />
              {usernameStatus.message && (
                <div className={`username-status ${usernameStatus.available ? 'available' : 'unavailable'}`}>
                  {usernameStatus.checking ? (
                    <span className="checking">Checking...</span>
                  ) : (
                    <>
                      {usernameStatus.available ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="green">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="red">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      )}
                      <span>{usernameStatus.message}</span>
                    </>
                  )}
                </div>
              )}
              {errors.username && (
                <div className="error-message">{errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
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
              <label htmlFor="location">Location (Optional)</label>
              <LocationInput
                value={formData.location}
                onChange={(value) => handleInputChange('location', value)}
                countryCode={formData.country}
                placeholder="Enter your location"
                error={errors.location}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio (Optional)</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows="3"
                maxLength="150"
              />
              <div className="character-count">
                {formData.bio.length}/150
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn-save" 
            onClick={handleSave}
            disabled={loading || usernameStatus.checking || (usernameStatus.available === false && formData.username !== user?.username)}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;