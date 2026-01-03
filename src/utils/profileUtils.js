// Profile utility functions

/**
 * Generate profile URL for a user
 * @param {Object} user - User object with username or id
 * @returns {string} Profile URL
 */
export const getProfileUrl = (user) => {
  if (user.username) {
    return `/profile/${user.username}`;
  }
  // Fallback to ID-based URL for legacy support
  return `/profile/${user.id}`;
};

/**
 * Navigate to user profile
 * @param {Function} navigate - React Router navigate function
 * @param {Object} user - User object
 */
export const navigateToProfile = (navigate, user) => {
  const url = getProfileUrl(user);
  navigate(url);
};

/**
 * Check if current URL matches user's profile
 * @param {string} currentPath - Current URL path
 * @param {Object} user - User object
 * @returns {boolean} True if current path is user's profile
 */
export const isCurrentUserProfile = (currentPath, user) => {
  if (!user) return false;
  
  const profileUrl = getProfileUrl(user);
  return currentPath === profileUrl;
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, message: "Username is required" };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: "Username must be at least 3 characters" };
  }
  
  if (username.length > 30) {
    return { isValid: false, message: "Username must be less than 30 characters" };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: "Username can only contain letters, numbers, and underscores" };
  }
  
  return { isValid: true, message: "" };
};