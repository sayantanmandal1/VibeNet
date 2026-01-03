import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AppContext/AppContext';
import UsernameSelector from './UsernameSelector';
import EmailInput from '../Common/EmailInput';
import Button from './Button';
import Toast from './Toast';
import BackButton from '../Common/BackButton';
import PasswordInput from '../Common/PasswordInput';
import { countries } from '../../utils/countries';
import './RegistrationWizard.css';
import './InputOverrides.css';
import ParticlesBackground from '../Background/ParticlesBackground';

const RegistrationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const { registerWithEmailAndPassword, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get pre-filled email from location state (for Google login redirects)
  const prefilledEmail = location.state?.email || '';

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: prefilledEmail,
    password: '',
    confirmPassword: '',
    
    // Step 2: Username Selection
    username: '',
    
    // Step 3: Personal Info
    bio: '',
    phoneNumber: '',
    country: '',
    
    // Step 4: Profile Completion
    dateOfBirth: '',
    gender: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Email validation state
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    message: ''
  });

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const stepErrors = {};
    
    if (!formData.name.trim()) {
      stepErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      stepErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      stepErrors.email = 'Invalid email address';
    } else if (!emailValidation.isValid) {
      stepErrors.email = emailValidation.message || 'Please verify email availability';
    }
    
    if (!formData.password) {
      stepErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      stepErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      stepErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      stepErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep2 = () => {
    const stepErrors = {};
    
    if (!formData.username.trim()) {
      stepErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      stepErrors.username = 'Username must be 3-30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      stepErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep3 = () => {
    const stepErrors = {};
    
    if (formData.bio && formData.bio.length > 500) {
      stepErrors.bio = 'Bio must be less than 500 characters';
    }
    
    if (formData.phoneNumber && !/^[+]?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      stepErrors.phoneNumber = 'Invalid phone number format';
    }
    
    if (!formData.country.trim()) {
      stepErrors.country = 'Country is required';
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep4 = () => {
    const stepErrors = {};
    
    if (!formData.dateOfBirth) {
      stepErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        stepErrors.dateOfBirth = 'You must be at least 13 years old to register';
      }
    }
    
    if (!formData.gender.trim()) {
      stepErrors.gender = 'Gender is required';
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0];
        showToast(firstError);
        return;
      }
      
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      const firstError = Object.values(errors)[0];
      showToast(firstError);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep4()) {
      const firstError = Object.values(errors)[0];
      showToast(firstError);
      return;
    }

    setLoading(true);
    try {
      // Prepare registration data
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username.trim(),
        bio: formData.bio.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        country: formData.country.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender.trim()
      };

      await registerWithEmailAndPassword(
        registrationData.name,
        registrationData.email,
        registrationData.password,
        registrationData.username,
        registrationData.bio,
        registrationData.phoneNumber,
        registrationData.country,
        registrationData.dateOfBirth,
        registrationData.gender
      );
      
      showToast('Registration successful! Redirecting...', 'success');
      setTimeout(() => navigate('/home'), 1200);
    } catch (error) {
      setLoading(false);
      showToast(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Registration successful! Redirecting...', 'success');
      setTimeout(() => navigate('/home'), 1200);
    } catch (error) {
      setLoading(false);
      showToast('Google registration failed. Please try again.');
    }
  };

  const renderStep1 = () => (
    <div className="wizard-step">
      <h3 className="step-title">Basic Information</h3>
      <p className="step-description">Let's start with your basic details</p>
      
      <div className="form-group">
        <input
          type="text"
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="Full Name *"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          autoComplete="name"
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <EmailInput
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          error={errors.email}
          onValidationChange={(isValid, message) => {
            setEmailValidation({ isValid, message });
            if (!isValid && message) {
              setErrors(prev => ({ ...prev, email: message }));
            } else {
              setErrors(prev => ({ ...prev, email: '' }));
            }
          }}
          prefilledEmail={prefilledEmail}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <PasswordInput
          placeholder="Password *"
          name="password"
          value={formData.password}
          onChange={(e) => updateFormData('password', e.target.value)}
          autoComplete="new-password"
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      <div className="form-group">
        <PasswordInput
          placeholder="Confirm Password *"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => updateFormData('confirmPassword', e.target.value)}
          autoComplete="new-password"
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step">
      <h3 className="step-title">Choose Your Username</h3>
      <p className="step-description">Pick a unique username for your profile</p>
      
      <UsernameSelector
        value={formData.username}
        onChange={(username) => updateFormData('username', username)}
        error={errors.username}
        onValidationChange={(isValid, message) => {
          if (!isValid && message) {
            setErrors(prev => ({ ...prev, username: message }));
          } else {
            setErrors(prev => ({ ...prev, username: '' }));
          }
        }}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-step">
      <h3 className="step-title">Personal Information</h3>
      <p className="step-description">Tell us more about yourself</p>
      
      <div className="form-group">
        <textarea
          className={`form-input form-textarea ${errors.bio ? 'error' : ''}`}
          placeholder="Tell us about yourself (optional)"
          value={formData.bio}
          onChange={(e) => updateFormData('bio', e.target.value)}
          rows={4}
          maxLength={500}
        />
        <div className="char-count">{formData.bio.length}/500</div>
        {errors.bio && <span className="error-text">{errors.bio}</span>}
      </div>

      <div className="form-group">
        <input
          type="tel"
          className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
          placeholder="Phone Number (optional)"
          value={formData.phoneNumber}
          onChange={(e) => updateFormData('phoneNumber', e.target.value)}
          autoComplete="tel"
        />
        {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
      </div>

      <div className="form-group">
        <select
          className={`form-input ${errors.country ? 'error' : ''}`}
          value={formData.country}
          onChange={(e) => updateFormData('country', e.target.value)}
        >
          <option value="">Select your country *</option>
          {countries.map((country) => (
            <option key={country.code} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.country && <span className="error-text">{errors.country}</span>}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="wizard-step">
      <h3 className="step-title">Complete Your Profile</h3>
      <p className="step-description">Final details to complete your registration</p>
      
      <div className="form-group">
        <input
          type="date"
          className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
        />
        <label className="form-label">Date of Birth *</label>
        {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
      </div>

      <div className="form-group">
        <select
          className={`form-input ${errors.gender ? 'error' : ''}`}
          value={formData.gender}
          onChange={(e) => updateFormData('gender', e.target.value)}
        >
          <option value="">Select your gender *</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <span className="error-text">{errors.gender}</span>}
      </div>
    </div>
  );

  return (
    <>
      <ParticlesBackground />
      <BackButton />
      <div className="registration-wizard">
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'error' })} 
        />
        
        <div className="wizard-container glass-card">
          {/* Progress indicator */}
          <div className="wizard-progress">
            <div className="progress-steps">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                >
                  <div className="step-number">{step}</div>
                  <div className="step-label">
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Username'}
                    {step === 3 && 'Personal'}
                    {step === 4 && 'Complete'}
                  </div>
                </div>
              ))}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="wizard-content">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation buttons */}
          <div className="wizard-navigation">
            {currentStep > 1 && (
              <Button
                label="Previous"
                onClick={handlePrevious}
                className="wizard-btn wizard-btn-secondary"
                disabled={loading}
              />
            )}
            
            <Button
              label={
                loading 
                  ? 'Processing...' 
                  : currentStep === 4 
                    ? 'Create Account' 
                    : 'Next'
              }
              onClick={handleNext}
              className="wizard-btn wizard-btn-primary"
              disabled={loading}
            />
          </div>

          {/* Google signup option (only on first step) */}
          {currentStep === 1 && (
            <>
              <div className="wizard-divider">
                <span>or</span>
              </div>
              
              <button
                type="button"
                className="google-signup-btn"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.19 3.22l6.85-6.85C36.68 2.09 30.7 0 24 0 14.82 0 6.71 5.08 2.69 12.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.09 46.1 31.3 46.1 24.55z"/>
                    <path fill="#FBBC05" d="M10.67 28.64c-1.01-2.9-1.01-6.04 0-8.94l-7.98-6.2C.99 17.68 0 20.74 0 24c0 3.26.99 6.32 2.69 9.5l7.98-6.2z"/>
                    <path fill="#EA4335" d="M24 48c6.7 0 12.68-2.21 16.98-6.01l-7.19-5.59c-2.01 1.35-4.59 2.15-7.79 2.15-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.92 14.82 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </g>
                </svg>
                Sign up with Google
              </button>
            </>
          )}

          {/* Login link */}
          <div className="wizard-footer">
            <p>Already have an account? <a href="/login" className="auth-link">Sign in</a></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationWizard;