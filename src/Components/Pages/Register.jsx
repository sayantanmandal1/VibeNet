import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../AppContext/AppContext';
import Button from './Button';
import Toast from './Toast';
import './Pages.css';
import ParticlesBackground from '../Background/ParticlesBackground';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const { registerWithEmailAndPassword, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required').min(6, 'Must be at least 6 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm your password'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await registerWithEmailAndPassword(values.name, values.email, values.password);
        setLoading(false);
        showToast('Registration successful! Redirecting...', 'success');
        setTimeout(() => navigate('/login'), 1200);
      } catch (error) {
        setLoading(false);
        showToast('Registration failed. Please try again.');
      }
    },
    validateOnChange: false,
    validateOnBlur: false,
  });

  // Show first error as toast on submit
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
      <div className="register-page">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
        <div className="auth-container glass-card">
          <h2 className="auth-title">Create Account</h2>
          <form onSubmit={handleFormSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Name"
                name="name"
                {...formik.getFieldProps('name')}
                autoComplete="off"
              />
            </div>
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
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="Confirm Password"
                name="confirmPassword"
                {...formik.getFieldProps('confirmPassword')}
                autoComplete="new-password"
              />
            </div>
            <Button
              label={loading ? 'Registering...' : 'Register'}
              type="submit"
              className="auth-button"
              disabled={loading}
            />
            {/* Google Register Button */}
            <button
              type="button"
              className="google-login-btn"
              onClick={async () => {
                setLoading(true);
                try {
                  await signInWithGoogle();
                  showToast('Registration successful! Redirecting...', 'success');
                  setTimeout(() => navigate("/"), 1200);
                } catch (error) {
                  setLoading(false);
                  showToast("Google registration failed. Please try again.");
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: 4, border: '1px solid #e0e0e0', background: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
              }}
            >
              <svg style={{marginRight: 8}} width="22" height="22" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.19 3.22l6.85-6.85C36.68 2.09 30.7 0 24 0 14.82 0 6.71 5.08 2.69 12.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.09 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.64c-1.01-2.9-1.01-6.04 0-8.94l-7.98-6.2C.99 17.68 0 20.74 0 24c0 3.26.99 6.32 2.69 9.5l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.7 0 12.68-2.21 16.98-6.01l-7.19-5.59c-2.01 1.35-4.59 2.15-7.79 2.15-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.92 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Sign up with Google
            </button>
          </form>
          <Link to="/login" className="auth-link">
            Already have an account? Sign in
          </Link>
          <Link to="/register-wizard" className="auth-link">
            Try our enhanced registration wizard
          </Link>
        </div>
      </div>
    </>
  );
};

export default Register;

