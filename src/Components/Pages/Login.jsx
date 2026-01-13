import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../AppContext/AppContext";
import Toast from "./Toast";
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
    <div className="login-page-container">
      {/* Background Effects */}
      <div className="login-bg">
        <div className="login-orb login-orb-1"></div>
        <div className="login-orb login-orb-2"></div>
        <div className="login-orb login-orb-3"></div>
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'error' })} 
      />

      {/* Back Button */}
      <button className="login-back-btn" onClick={() => navigate('/')}>
        ← Back
      </button>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🌊</span>
          <span className="login-logo-text">VibeNet</span>
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue to VibeNet</p>

        <form onSubmit={handleFormSubmit} className="login-form">
          {/* Email */}
          <div className="login-input-group">
            <span className="login-input-icon">✉️</span>
            <input
              type="email"
              className="login-input"
              placeholder="Email address"
              name="email"
              {...formik.getFieldProps('email')}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="login-input-group">
            <span className="login-input-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Password"
              name="password"
              {...formik.getFieldProps('password')}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="login-forgot">
            <Link to="/reset">Forgot password?</Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span>or</span>
          </div>

          {/* Google */}
          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.19 3.22l6.85-6.85C36.68 2.09 30.7 0 24 0 14.82 0 6.71 5.08 2.69 12.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.09 46.1 31.3 46.1 24.55z"/>
              <path fill="#FBBC05" d="M10.67 28.64c-1.01-2.9-1.01-6.04 0-8.94l-7.98-6.2C.99 17.68 0 20.74 0 24c0 3.26.99 6.32 2.69 9.5l7.98-6.2z"/>
              <path fill="#EA4335" d="M24 48c6.7 0 12.68-2.21 16.98-6.01l-7.19-5.59c-2.01 1.35-4.59 2.15-7.79 2.15-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.92 14.82 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
