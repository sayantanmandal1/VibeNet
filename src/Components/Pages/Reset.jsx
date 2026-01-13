import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Toast from "./Toast";
import './Reset.css';
import emailjs from '@emailjs/browser';

const Reset = () => {
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      setToast({ message: '', type: 'error' });
      try {
        await emailjs.send(
          'service_demo123',
          'template_reset123',
          { user_email: values.email },
          'user_demoAPIKEY'
        );
        setLoading(false);
        showToast('A password reset link has been sent to your email.', 'success');
      } catch (err) {
        setLoading(false);
        showToast('Failed to send reset email. Please try again.');
      }
      setSubmitting(false);
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
    <div className="reset-page-container">
      {/* Background Effects */}
      <div className="reset-bg">
        <div className="reset-orb reset-orb-1"></div>
        <div className="reset-orb reset-orb-2"></div>
        <div className="reset-orb reset-orb-3"></div>
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'error' })} 
      />

      {/* Back Button */}
      <button className="reset-back-btn" onClick={() => navigate('/login')}>
        ← Back
      </button>

      {/* Reset Card */}
      <div className="reset-card">
        {/* Logo */}
        <div className="reset-logo">
          <span className="reset-logo-icon">🌊</span>
          <span className="reset-logo-text">VibeNet</span>
        </div>

        <h1 className="reset-title">Reset Password</h1>
        <p className="reset-subtitle">Enter your email and we'll send you a reset link</p>

        <form onSubmit={handleFormSubmit} className="reset-form">
          {/* Email */}
          <div className="reset-input-group">
            <span className="reset-input-icon">✉️</span>
            <input
              type="email"
              className="reset-input"
              placeholder="Email address"
              name="email"
              {...formik.getFieldProps('email')}
              autoComplete="email"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="reset-submit-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Footer */}
        <div className="reset-footer">
          <p>Remember your password? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Reset;
