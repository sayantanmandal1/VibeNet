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

  const registerWithEmailAndPassword = async (name, email, password) => {
    try {
      const response = await apiClient.register({ name, email, password });
      
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

  useEffect(() => {
    if (!loading && user) {
      navigate("/home");
    }
  }, [loading, user, navigate]);

  const value = {
    signInWithGoogle,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    sendPasswordToUser,
    signOutUser,
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