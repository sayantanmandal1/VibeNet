import React, { useState, useContext, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../AppContext/AppContext';
import UsernameSelector from './UsernameSelector';
import Toast from './Toast';
import { countryCodes, getPhoneCodeByCountry } from '../../utils/countryCodes';
import { FiArrowLeft, FiArrowRight, FiCheck, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiCamera, FiMapPin, FiPhone, FiCalendar } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './RegistrationWizard.css';

const RegistrationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const { registerWithEmailAndPassword, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const prefilledEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    name: '',
    email: prefilledEmail,
    password: '',
    confirmPassword: '',
    username: '',
    bio: '',
    phoneNumber: '',
    country: '',
    countryName: '',
    location: '',
    dateOfBirth: '',
    gender: '',
    profileImage: null
  });

  const [errors, setErrors] = useState({});
  const [emailValidation, setEmailValidation] = useState({ isValid: false, message: '' });

  const handleEmailValidation = useCallback((isValid, message) => {
    setEmailValidation({ isValid, message });
    if (!isValid && message) {
      setErrors(prev => ({ ...prev, email: message }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, []);

  const handleUsernameValidation = useCallback((isValid, message) => {
    if (!isValid && message) {
      setErrors(prev => ({ ...prev, username: message }));
    } else {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const updateFormData = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'country') {
        const selectedCountry = countryCodes.find(c => c.code === value);
        if (selectedCountry) {
          newData.countryName = selectedCountry.name;
          newData.location = selectedCountry.name;
          const phoneCode = selectedCountry.phoneCode;
          if (!newData.phoneNumber || !newData.phoneNumber.startsWith(phoneCode)) {
            const localNumber = newData.phoneNumber.replace(/^\+?\d{1,4}\s*/, '');
            newData.phoneNumber = localNumber ? `${phoneCode} ${localNumber}` : phoneCode;
          }
        }
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const stepErrors = {};
    if (!formData.name.trim()) stepErrors.name = 'Name is required';
    if (!formData.email.trim()) stepErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) stepErrors.email = 'Invalid email address';
    if (!formData.password) stepErrors.password = 'Password is required';
    else if (formData.password.length < 6) stepErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) stepErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = 'Passwords do not match';
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep2 = () => {
    const stepErrors = {};
    if (!formData.username.trim()) stepErrors.username = 'Username is required';
    else if (formData.username.length < 3 || formData.username.length > 30) stepErrors.username = 'Username must be 3-30 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) stepErrors.username = 'Username can only contain letters, numbers, and underscores';
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep3 = () => {
    const stepErrors = {};
    if (formData.bio && formData.bio.length > 500) stepErrors.bio = 'Bio must be less than 500 characters';
    if (!formData.country.trim()) stepErrors.country = 'Country is required';
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep4 = () => {
    const stepErrors = {};
    if (!formData.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
    else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) stepErrors.dateOfBirth = 'You must be at least 13 years old';
    }
    if (!formData.gender.trim()) stepErrors.gender = 'Gender is required';
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    switch (currentStep) {
      case 1: isValid = validateStep1(); break;
      case 2: isValid = validateStep2(); break;
      case 3: isValid = validateStep3(); break;
      case 4: isValid = validateStep4(); break;
      default: isValid = true;
    }
    
    if (isValid) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
      else handleSubmit();
    } else {
      const firstError = Object.values(errors)[0];
      if (firstError) showToast(firstError);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    setLoading(true);
    try {
      await registerWithEmailAndPassword(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.username.trim(),
        formData.bio.trim() || undefined,
        formData.phoneNumber.trim() || undefined,
        formData.location.trim() || formData.countryName || undefined,
        formData.country.trim(),
        formData.dateOfBirth,
        formData.gender.trim(),
        formData.profileImage
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

  const steps = [
    { num: 1, label: 'Account', icon: FiUser },
    { num: 2, label: 'Username', icon: FiMail },
    { num: 3, label: 'Details', icon: FiMapPin },
    { num: 4, label: 'Complete', icon: FiCheck }
  ];

  return (
    <div className="register-page">
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

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />

      <div className="register-container">
        <div className="register-card glass-card">
          {/* Logo */}
          <div className="auth-logo">
            <span className="logo-wave">🌊</span>
            <span className="logo-text">VibeNet</span>
          </div>

          {/* Progress Steps */}
          <div className="progress-container">
            <div className="progress-steps">
              {steps.map((step, index) => (
                <React.Fragment key={step.num}>
                  <div className={`step ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
                    <div className="step-circle">
                      {currentStep > step.num ? <FiCheck size={18} /> : <step.icon size={18} />}
                    </div>
                    <span className="step-label">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`step-line ${currentStep > step.num ? 'active' : ''}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="step-content">
            {/* Step 1: Account Info */}
            {currentStep === 1 && (
              <div className="step-panel">
                <h2 className="step-title">Create Your Account</h2>
                <p className="step-subtitle">Let's start with your basic information</p>

                <div className="form-fields">
                  <div className="input-group">
                    <div className="input-icon"><FiUser size={20} /></div>
                    <input
                      type="text"
                      className={`register-input ${errors.name ? 'error' : ''}`}
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <div className="input-icon"><FiMail size={20} /></div>
                    <input
                      type="email"
                      className={`register-input ${errors.email ? 'error' : ''}`}
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <div className="input-icon"><FiLock size={20} /></div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`register-input ${errors.password ? 'error' : ''}`}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>

                  <div className="input-group">
                    <div className="input-icon"><FiLock size={20} /></div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`register-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Username */}
            {currentStep === 2 && (
              <div className="step-panel">
                <h2 className="step-title">Choose Your Username</h2>
                <p className="step-subtitle">Pick a unique username for your profile</p>

                <div className="form-fields">
                  <UsernameSelector
                    value={formData.username}
                    onChange={(username) => updateFormData('username', username)}
                    error={errors.username}
                    onValidationChange={handleUsernameValidation}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Personal Details */}
            {currentStep === 3 && (
              <div className="step-panel">
                <h2 className="step-title">Personal Details</h2>
                <p className="step-subtitle">Tell us a bit more about yourself</p>

                <div className="form-fields">
                  <div className="input-group textarea-group">
                    <textarea
                      className="register-textarea"
                      placeholder="Write a short bio (optional)"
                      value={formData.bio}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <span className="char-count">{formData.bio.length}/500</span>
                  </div>

                  <div className="input-group">
                    <div className="input-icon"><FiMapPin size={20} /></div>
                    <select
                      className={`register-select ${errors.country ? 'error' : ''}`}
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                    >
                      <option value="">Select your country</option>
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <div className="input-icon"><FiPhone size={20} /></div>
                    <div className="phone-code">{formData.country ? getPhoneCodeByCountry(formData.country) : '+1'}</div>
                    <input
                      type="tel"
                      className="register-input phone-input"
                      placeholder="Phone Number (optional)"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Complete Profile */}
            {currentStep === 4 && (
              <div className="step-panel">
                <h2 className="step-title">Complete Your Profile</h2>
                <p className="step-subtitle">Final details to get you started</p>

                <div className="form-fields">
                  {/* Profile Image Upload */}
                  <div className="profile-upload">
                    <div className="profile-preview">
                      <img
                        src={formData.profileImage ? URL.createObjectURL(formData.profileImage) : "/user-default.jpg"}
                        alt="Profile"
                      />
                      <label className="upload-overlay">
                        <FiCamera size={24} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) updateFormData('profileImage', file);
                          }}
                          hidden
                        />
                      </label>
                    </div>
                    <span className="upload-hint">Click to upload photo</span>
                  </div>

                  <div className="input-group">
                    <div className="input-icon"><FiCalendar size={20} /></div>
                    <input
                      type="date"
                      className={`register-input ${errors.dateOfBirth ? 'error' : ''}`}
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="input-group">
                    <div className="input-icon"><FiUser size={20} /></div>
                    <select
                      className={`register-select ${errors.gender ? 'error' : ''}`}
                      value={formData.gender}
                      onChange={(e) => updateFormData('gender', e.target.value)}
                    >
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="nav-buttons">
            {currentStep > 1 && (
              <button className="nav-btn secondary" onClick={handlePrevious} disabled={loading}>
                <FiArrowLeft size={18} />
                <span>Previous</span>
              </button>
            )}
            
            <button
              className={`nav-btn primary ${loading ? 'loading' : ''}`}
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader className="spin" size={18} />
                  <span>Processing...</span>
                </>
              ) : currentStep === 4 ? (
                <>
                  <span>Create Account</span>
                  <FiCheck size={18} />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Google Sign Up (Step 1 only) */}
          {currentStep === 1 && (
            <>
              <div className="auth-divider">
                <span>or continue with</span>
              </div>
              
              <button className="google-btn" onClick={handleGoogleSignUp} disabled={loading}>
                <FcGoogle size={24} />
                <span>Google</span>
              </button>
            </>
          )}

          {/* Login Link */}
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationWizard;
