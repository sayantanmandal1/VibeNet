import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClipLoader from "react-spinners/ClipLoader";
import { AuthContext } from "../AppContext/AppContext";
import { auth, onAuthStateChanged } from "../firebase/firebase";
import Button from "./Button";
import Toast from "./Toast";
import './Auth.css';
import './Pages.css';
import ParticlesBackground from '../Background/ParticlesBackground';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const { loginWithEmailAndPassword, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    // Remove automatic redirect - let users access login page
    // Only redirect after successful login, not on page load
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
        showToast("Login failed. Please check your credentials.");
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

  return (
    <>
      <ParticlesBackground />
      <div className="login-page flex items-center justify-center min-h-screen">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
        {loading ? (
          <div className="grid grid-cols-1 justify-items-center items-center">
            <ClipLoader color="#ffffff" size={90} speedMultiplier={0.5} />
          </div>
        ) : (
          <div className="auth-container glass-card">
            <h2 className="auth-title">Sign In</h2>
            <form onSubmit={handleFormSubmit} className="auth-form">
              <div className="form-group">
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  name="email"
                  {...formik.getFieldProps('email')}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  name="password"
                  {...formik.getFieldProps('password')}
                  autoComplete="current-password"
                />
              </div>
              <Button
                label={loading ? "Signing in..." : "Sign In"}
                type="submit"
                className="auth-button"
                disabled={loading}
              />
              {/* Google Login Button */}
              <button
                type="button"
                className="google-login-btn"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await signInWithGoogle();
                    showToast('Login successful! Redirecting...', 'success');
                    setTimeout(() => navigate("/home"), 1200);
                  } catch (error) {
                    setLoading(false);
                    showToast("Google login failed. Please try again.");
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: 4, border: '1px solid #e0e0e0', background: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                }}
              >
                <svg style={{marginRight: 8}} width="22" height="22" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.19 3.22l6.85-6.85C36.68 2.09 30.7 0 24 0 14.82 0 6.71 5.08 2.69 12.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.09 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.64c-1.01-2.9-1.01-6.04 0-8.94l-7.98-6.2C.99 17.68 0 20.74 0 24c0 3.26.99 6.32 2.69 9.5l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.7 0 12.68-2.21 16.98-6.01l-7.19-5.59c-2.01 1.35-4.59 2.15-7.79 2.15-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.92 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                Sign in with Google
              </button>
            </form>
            <div className="auth-links">
              <Link to="/reset" className="auth-link">Forgot password?</Link>
              <Link to="/register" className="auth-link">Don't have an account? Register</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
