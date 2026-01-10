// Image utility functions for consistent image handling across the app

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Get the correct image URL for display
 * @param {string} imageUrl - The image URL from the API
 * @param {string} fallback - Fallback image path (default: '/user-default.jpg')
 * @returns {string} - The correct image URL to display
 */
export const getImageUrl = (imageUrl, fallback = '/user-default.jpg') => {
  // If no image URL provided, return fallback
  if (!imageUrl || imageUrl === '' || imageUrl === 'null' || imageUrl === 'undefined') {
    return fallback;
  }

  // If it's already a full HTTP URL (like Google profile images), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it starts with /uploads/, it's a server upload
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imageUrl}?t=${Date.now()}`;
  }

  // If it starts with /, it's a server path
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}?t=${Date.now()}`;
  }

  // If it's a relative path, prepend server URL
  return `${API_BASE_URL}/${imageUrl}?t=${Date.now()}`;
};

/**
 * Get profile image URL with proper fallback
 * @param {object} user - User object with profileImage or photoURL
 * @returns {string} - The correct profile image URL
 */
export const getProfileImageUrl = (user) => {
  if (!user) return '/user-default.jpg';
  
  // Try profileImage first, then photoURL (for Google auth users)
  const imageUrl = user.profileImage || user.photoURL || user.image;
  return getImageUrl(imageUrl, '/user-default.jpg');
};

/**
 * Get post image URL with proper fallback
 * @param {string} imageUrl - Post image URL
 * @returns {string} - The correct post image URL
 */
export const getPostImageUrl = (imageUrl) => {
  return getImageUrl(imageUrl, null); // No fallback for post images
};

/**
 * Handle image load error by setting fallback
 * @param {Event} event - Image error event
 * @param {string} fallback - Fallback image path
 */
export const handleImageError = (event, fallback = '/user-default.jpg') => {
  if (event.target.src !== fallback) {
    console.log('Image failed to load:', event.target.src);
    event.target.src = fallback;
  }
};

/**
 * Preload an image to check if it exists
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} - Promise that resolves to true if image loads
 */
export const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

export default {
  getImageUrl,
  getProfileImageUrl,
  getPostImageUrl,
  handleImageError,
  preloadImage
};