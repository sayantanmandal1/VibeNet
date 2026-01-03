import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "./Button";
import Toast from "./Toast";
import './Pages.css';
import './InputOverrides.css';
// import emailjs for frontend email sending
import emailjs from '@emailjs/browser';
import ParticlesBackground from '../Background/ParticlesBackground';

const Reset = () => {
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [loading, setLoading] = useState(false);

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
        // EmailJS integration (replace with your own serviceId, templateId, userId for production)
        await emailjs.send(
          'service_demo123', // serviceId (placeholder)
          'template_reset123', // templateId (placeholder)
          { user_email: values.email },
          'user_demoAPIKEY' // public key (placeholder)
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
    <>
      <ParticlesBackground />
      <div className="reset-page">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
        <div className="auth-container glass-card">
          <h2 className="auth-title">Reset Your Password</h2>
          <p className="auth-subtitle">Enter your email and we'll send you a password reset link.</p>
          <form className="auth-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                name="email"
                {...formik.getFieldProps("email")}
                autoComplete="off"
                required
              />
            </div>
            <Button
              label={loading ? "Sending..." : "Send Reset Link"}
              type="submit"
              className="auth-button"
              disabled={loading}
            />
          </form>
          <div className="auth-links">
            <Link to="/login" className="auth-link">Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reset;
