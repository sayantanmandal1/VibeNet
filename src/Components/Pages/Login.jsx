import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../AppContext/AppContext";
import Toast from "./Toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiLoader } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const { loginWithEmailAndPassword, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(6, "Must be at least 6 characters long"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await loginWithEmailAndPassword(values.email, values.password);
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => navigate("/home"), 1200);
      } catch (error) {
        setLoading(false);
        if (error.message === 'PROFILE_INCOMPLETE') {
          showToast('Please complete your registration first.', 'error');
          setTimeout(() => navigate("/register", { state: { email: values.email } }), 1500);
        } else {
          showToast("Login failed. Please check your credentials.");
        }
      }
    },
    validateOnChange: false,
    validateOnBlur: false,
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();
    if (Object.keys(formik.errors).length > 0) {
      const firstError = Object.values(formik.errors)[0];
      showToast(firstError);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => navigate("/home"), 1200);
    } catch (error) {
      setLoading(false);
      if (error.message.startsWith('NO_USER_FOUND:')) {
        const email = error.message.split(':')[1];
        showToast('No account found. Please register first.', 'error');
        setTimeout(() => navigate("/register", { state: { email } }), 1500);
      } else if (error.message === 'PROFILE_INCOMPLETE') {
        showToast('Please complete your registration first.', 'error');
        setTimeout(() => navigate("/register"), 1500);
      } else {
        showToast("Google login failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg-gradient"></div>
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>
      <div className="auth-bg-grid"></div>

      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft size={20} />
        <span>Back</span>
      </button>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'error' })} 
      />

      <div className="auth-container">
        <div className="auth-card glass-card">
          {/* Logo */}
          <div className="auth-logo">
            <span className="logo-wave">🌊</span>
            <span className="logo-text">VibeNet</span>
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to VibeNet</p>

          <form onSubmit={handleFormSubmit} className="auth-form">
            {/* Email Input */}
            <div className="input-group">
              <div className="input-icon">
                <FiMail size={20} />
              </div>
              <input
                type="email"
                className="auth-input"
                placeholder="Email address"
                name="email"
                {...formik.getFieldProps('email')}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="input-icon">
                <FiLock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Password"
                name="password"
                {...formik.getFieldProps('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password">
              <Link to="/reset">Forgot password?</Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`auth-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader className="spin" size={20} />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FcGoogle size={24} />
              <span>Google</span>
            </button>
          </form>

          {/* Register Link */}
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
