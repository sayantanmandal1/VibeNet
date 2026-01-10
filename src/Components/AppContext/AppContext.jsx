import React, { createContext, useState, useEffect, useRef } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import apiClient from "../../config/api";

export const AuthContext = createContext();

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const AppContext = ({ children }) => {
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const sessionTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Session management functions
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('lastActivity', lastActivityRef.current.toString());
  };

  const checkSessionExpiry = () => {
    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    const now = Date.now();
    
    if (lastActivity && (now - lastActivity) > SESSION_TIMEOUT) {
      // Session expired due to inactivity
      handleSessionExpiry();
      return true;
    }
    return false;
  };

  const handleSessionExpiry = () => {
    setSessionExpired(true);
    localStorage.removeItem('authToken');
    localStorage.removeItem('lastActivity');
    setUser(null);
    setUserData(null);
    
    // Clear any existing timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
  };

  const resetSessionTimeout = () => {
    // Clear existing timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    // Set new timeout
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionExpiry();
    }, SESSION_TIMEOUT);

    updateActivity();
  };

  const signInWithGoogle = async () => {
    try {
      const popup = await signInWithPopup(auth, provider);
      const idToken = await popup.user.getIdToken();
      
      // First check if user exists
      try {
        const response = await apiClient.googleAuth(idToken);
        
        // Check if user profile is complete (only check essential fields)
        if (!response.user.username) {
          // Profile incomplete, redirect to complete registration
          throw new Error('PROFILE_INCOMPLETE');
        }
        
        // Store token and user data
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        setUserData(response.user);
        setSessionExpired(false);
        resetSessionTimeout();
        
        return response.user;
      } catch (error) {
        if (error.message === 'PROFILE_INCOMPLETE') {
          throw error;
        }
        
        // User doesn't exist, redirect to registration with email
        throw new Error(`NO_USER_FOUND:${popup.user.email}`);
      }
    } catch (err) {
      if (err.message.startsWith('NO_USER_FOUND:')) {
        const email = err.message.split(':')[1];
        throw new Error(`NO_USER_FOUND:${email}`);
      }
      throw err;
    }
  };

  const loginWithEmailAndPassword = async (email, password) => {
    try {
      const response = await apiClient.login({ email, password });
      
      // Check if user profile is complete (only check essential fields)
      if (!response.user.username) {
        // Profile incomplete, redirect to complete registration
        throw new Error('PROFILE_INCOMPLETE');
      }
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setUserData(response.user);
      setSessionExpired(false);
      resetSessionTimeout();
      
      return response.user;
    } catch (err) {
      throw err;
    }
  };

  const registerWithEmailAndPassword = async (name, email, password, username, bio, phoneNumber, location, country, dateOfBirth, gender, profileImage) => {
    try {
      const registrationData = {
        name,
        email,
        password,
        username
      };

      // Add optional fields if provided
      if (bio) registrationData.bio = bio;
      if (phoneNumber) registrationData.phoneNumber = phoneNumber;
      if (location) registrationData.location = location;
      if (country) registrationData.country = country;
      if (dateOfBirth) registrationData.dateOfBirth = dateOfBirth;
      if (gender) registrationData.gender = gender;
      if (profileImage) registrationData.profileImage = profileImage;

      const response = await apiClient.register(registrationData);
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setUserData(response.user);
      setSessionExpired(false);
      resetSessionTimeout();
      
      return response.user;
    } catch (err) {
      throw new Error(err.message || 'Registration failed');
    }
  };

  const sendPasswordToUser = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("New password sent to your email");
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const signOutUser = async () => {
    try {
      await apiClient.logout();
    } catch (err) {
      console.log('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('lastActivity');
      setUser(null);
      setUserData(null);
      setSessionExpired(false);
      
      // Clear session timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      
      navigate('/');
    }
  };

  const updateUserData = (newUserData) => {
    setUserData(prev => ({ ...prev, ...newUserData }));
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  const refreshUserProfile = async () => {
    try {
      const response = await apiClient.getCurrentUserProfile();
      setUserData(response.user);
      setUser(response.user);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          const response = await apiClient.getCurrentUser();
          setUser(response.user);
          setUserData(response.user);
          setSessionExpired(false);
          // Only set timeout, don't check expiry on init to avoid immediate logout
          resetSessionTimeout();
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('lastActivity');
          setSessionExpired(true);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Cleanup function
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  // Remove the automatic redirect - let route protection handle it
  // useEffect(() => {
  //   if (!loading && user) {
  //     navigate("/home");
  //   }
  // }, [loading, user, navigate]);

  const value = {
    signInWithGoogle,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordToUser,
    logout: signOutUser,
    signOutUser,
    updateUserData,
    refreshUserProfile,
    updateActivity,
    checkSessionExpiry,
    user,
    userData,
    loading,
    sessionExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export default AppContext;