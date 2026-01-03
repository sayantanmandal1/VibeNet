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
      
      const response = await apiClient.googleAuth(idToken);
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setUserData(response.user);
      
      navigate('/home');
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const loginWithEmailAndPassword = async (email, password) => {
    try {
      const response = await apiClient.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setUserData(response.user);
      
      navigate('/home');
    } catch (err) {
      alert(err.message);
      console.log(err.message);
    }
  };

  const registerWithEmailAndPassword = async (name, email, password, username, bio, phoneNumber) => {
    try {
      const registrationData = {
        name,
        email,
        password
      };

      // Add optional fields if provided
      if (username) registrationData.username = username;
      if (bio) registrationData.bio = bio;
      if (phoneNumber) registrationData.phoneNumber = phoneNumber;

      const response = await apiClient.register(registrationData);
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      setUserData(response.user);
      
      navigate('/home');
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