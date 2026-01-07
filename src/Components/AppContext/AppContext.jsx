import React, { createContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import apiClient from "../../config/api";

export const AuthContext = createContext();

const AppContext = ({ children }) => {
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const popup = await signInWithPopup(auth, provider);
      const idToken = await popup.user.getIdToken();
      
      // First check if user exists
      try {
        const response = await apiClient.googleAuth(idToken);
        
        // Check if user profile is complete
        if (!response.user.username || !response.user.country || !response.user.dateOfBirth) {
          // Profile incomplete, redirect to complete registration
          throw new Error('PROFILE_INCOMPLETE');
        }
        
        // Store token and user data
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        setUserData(response.user);
        
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
      
      // Check if user profile is complete
      if (!response.user.username || !response.user.country || !response.user.dateOfBirth) {
        // Profile incomplete, redirect to complete registration
        throw new Error('PROFILE_INCOMPLETE');
      }
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setUserData(response.user);
      
      return response.user;
    } catch (err) {
      throw err;
    }
  };

  const registerWithEmailAndPassword = async (name, email, password, username, bio, phoneNumber, country, dateOfBirth, gender, profileImage) => {
    try {
      const registrationData = {
        name,
        email,
        password,
        username,
        country,
        dateOfBirth,
        gender
      };

      // Add optional fields if provided
      if (bio) registrationData.bio = bio;
      if (phoneNumber) registrationData.phoneNumber = phoneNumber;
      if (profileImage) registrationData.profileImage = profileImage;

      const response = await apiClient.register(registrationData);
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setUserData(response.user);
      
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
      setUser(null);
      setUserData(null);
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
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('authToken');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
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
    user,
    userData,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export default AppContext;