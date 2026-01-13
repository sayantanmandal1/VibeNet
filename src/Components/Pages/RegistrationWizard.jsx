import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../AppContext/AppContext';
import Toast from './Toast';
import { countryCodes } from '../../utils/countryCodes';

// Inline styles to avoid CSS conflicts
const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  bg: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.6,
  },
  orb1: {
    width: '400px',
    height: '400px',
    background: '#7c3aed',
    top: '-100px',
    right: '-100px',
  },
  orb2: {
    width: '350px',
    height: '350px',
    background: '#06b6d4',
    bottom: '-80px',
    left: '-80px',
  },
  orb3: {
    width: '250px',
    height: '250px',
    background: '#10b981',
    top: '50%',
    left: '20%',
  },
  backBtn: {
    position: 'fixed',
    top: '24px',
    left: '24px',
    padding: '12px 20px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '40px 36px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    boxSizing: 'border-box',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  logoIcon: {
    fontSize: '36px',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
  },
  progress: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '32px',
    gap: '8px',
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  stepDot: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s ease',
  },
  stepDotActive: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    borderColor: 'transparent',
    color: '#ffffff',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
  },
  stepDotCompleted: {
    background: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    color: '#10b981',
  },
  stepText: {
    fontSize: '11px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  stepTextActive: {
    color: '#ffffff',
  },
  content: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    fontSize: '16px',
    zIndex: 2,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 50px 14px 48px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '14px 40px 14px 48px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '80px',
  },
  toggle: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    zIndex: 2,
  },
  hint: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    margin: '4px 0 0 4px',
  },
  uploadSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  previewBox: {
    position: 'relative',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid rgba(124, 58, 237, 0.5)',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  uploadLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  uploadText: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  nav: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  btnPrimary: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    color: '#ffffff',
  },
  btnSecondary: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.15)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '13px',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    margin: 0,
  },
  footerLink: {
    color: '#a855f7',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

const RegistrationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [hoverUpload, setHoverUpload] = useState(false);
  const { registerWithEmailAndPassword, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    name: '', email: prefilledEmail, password: '', confirmPassword: '',
    username: '', bio: '', phoneNumber: '', country: '', countryName: '',
    location: '', dateOfBirth: '', gender: '', profileImage: null
  });

  const [errors, setErrors] = useState({});
  const showToast = (message, type = 'error') => setToast({ message, type });

  const updateFormData = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'country') {
        const selectedCountry = countryCodes.find(c => c.code === value);
        if (selectedCountry) {
          newData.countryName = selectedCountry.name;
          newData.location = selectedCountry.name;
        }
      }
      return newData;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const stepErrors = {};
    if (!formData.name.trim()) stepErrors.name = 'Name is required';
    if (!formData.email.trim()) stepErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) stepErrors.email = 'Invalid email';
    if (!formData.password) stepErrors.password = 'Password is required';
    else if (formData.password.length < 6) stepErrors.password = 'Min 6 characters';
    if (!formData.confirmPassword) stepErrors.confirmPassword = 'Confirm password';
    else if (formData.password !== formData.confirmPassword) stepErrors.confirmPassword = 'Passwords do not match';
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) showToast(Object.values(stepErrors)[0]);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep2 = () => {
    const stepErrors = {};
    if (!formData.username.trim()) stepErrors.username = 'Username is required';
    else if (formData.username.length < 3 || formData.username.length > 30) stepErrors.username = '3-30 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) stepErrors.username = 'Letters, numbers, underscores only';
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) showToast(Object.values(stepErrors)[0]);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep3 = () => {
    const stepErrors = {};
    if (!formData.country.trim()) stepErrors.country = 'Country is required';
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) showToast(Object.values(stepErrors)[0]);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep4 = () => {
    const stepErrors = {};
    if (!formData.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
    else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 13) stepErrors.dateOfBirth = 'Must be at least 13 years old';
    }
    if (!formData.gender.trim()) stepErrors.gender = 'Gender is required';
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) showToast(Object.values(stepErrors)[0]);
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
    }
  };

  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async () => {
    if (!validateStep4()) return;
    setLoading(true);
    try {
      await registerWithEmailAndPassword(
        formData.name.trim(), formData.email.trim(), formData.password,
        formData.username.trim(), formData.bio.trim() || undefined,
        formData.phoneNumber.trim() || undefined,
        formData.location.trim() || formData.countryName || undefined,
        formData.country.trim(), formData.dateOfBirth, formData.gender.trim(),
        formData.profileImage
      );
      showToast('Registration successful!', 'success');
      setTimeout(() => navigate('/home'), 1200);
    } catch (error) {
      setLoading(false);
      showToast(error.message || 'Registration failed');
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Registration successful!', 'success');
      setTimeout(() => navigate('/home'), 1200);
    } catch (error) {
      setLoading(false);
      showToast('Google registration failed');
    }
  };

  const getStepDotStyle = (step) => {
    if (currentStep > step) return { ...styles.stepDot, ...styles.stepDotCompleted };
    if (currentStep >= step) return { ...styles.stepDot, ...styles.stepDotActive };
    return styles.stepDot;
  };

  const getStepTextStyle = (step) => {
    if (currentStep >= step) return { ...styles.stepText, ...styles.stepTextActive };
    return styles.stepText;
  };

  return (
    <div style={styles.container}>
      {/* Background Orbs */}
      <div style={styles.bg}>
        <div style={{ ...styles.orb, ...styles.orb1 }}></div>
        <div style={{ ...styles.orb, ...styles.orb2 }}></div>
        <div style={{ ...styles.orb, ...styles.orb3 }}></div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />

      <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🌊</span>
          <span style={styles.logoText}>VibeNet</span>
        </div>

        {/* Progress */}
        <div style={styles.progress}>
          {[1, 2, 3, 4].map((step) => (
            <div key={step} style={styles.progressStep}>
              <div style={getStepDotStyle(step)}>{currentStep > step ? '✓' : step}</div>
              <span style={getStepTextStyle(step)}>
                {step === 1 ? 'Account' : step === 2 ? 'Username' : step === 3 ? 'Details' : 'Finish'}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {currentStep === 1 && (
            <div>
              <h2 style={styles.title}>Create Account</h2>
              <p style={styles.subtitle}>Enter your basic information</p>
              <div style={styles.form}>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>👤</span>
                  <input style={styles.input} type="text" placeholder="Full Name" value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>✉️</span>
                  <input style={styles.input} type="email" placeholder="Email Address" value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)} />
                </div>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input style={styles.input} type={showPassword ? "text" : "password"} placeholder="Password"
                    value={formData.password} onChange={(e) => updateFormData('password', e.target.value)} />
                  <button type="button" style={styles.toggle} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input style={styles.input} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password"
                    value={formData.confirmPassword} onChange={(e) => updateFormData('confirmPassword', e.target.value)} />
                  <button type="button" style={styles.toggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 style={styles.title}>Choose Username</h2>
              <p style={styles.subtitle}>Pick a unique username</p>
              <div style={styles.form}>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>@</span>
                  <input style={styles.input} type="text" placeholder="username" value={formData.username}
                    onChange={(e) => updateFormData('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    maxLength={30} />
                </div>
                <p style={styles.hint}>3-30 characters, letters, numbers, underscores only</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 style={styles.title}>Personal Details</h2>
              <p style={styles.subtitle}>Tell us about yourself</p>
              <div style={styles.form}>
                <div style={styles.inputGroup}>
                  <textarea style={styles.textarea} placeholder="Write a short bio (optional)"
                    value={formData.bio} onChange={(e) => updateFormData('bio', e.target.value)}
                    rows={3} maxLength={500} />
                </div>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>🌍</span>
                  <select style={styles.select} value={formData.country}
                    onChange={(e) => updateFormData('country', e.target.value)}>
                    <option value="">Select Country</option>
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>{country.flag} {country.name}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>📱</span>
                  <input style={styles.input} type="tel" placeholder="Phone Number (optional)"
                    value={formData.phoneNumber} onChange={(e) => updateFormData('phoneNumber', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 style={styles.title}>Complete Profile</h2>
              <p style={styles.subtitle}>Final details</p>
              <div style={styles.form}>
                <div style={styles.uploadSection}>
                  <div style={styles.previewBox}
                    onMouseEnter={() => setHoverUpload(true)} onMouseLeave={() => setHoverUpload(false)}>
                    <img style={styles.previewImg}
                      src={formData.profileImage ? URL.createObjectURL(formData.profileImage) : "/user-default.jpg"} alt="Profile" />
                    <label style={{ ...styles.uploadLabel, opacity: hoverUpload ? 1 : 0 }}>
                      📷
                      <input type="file" accept="image/*" hidden
                        onChange={(e) => { const file = e.target.files[0]; if (file) updateFormData('profileImage', file); }} />
                    </label>
                  </div>
                  <span style={styles.uploadText}>Upload Photo</span>
                </div>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>📅</span>
                  <input style={styles.input} type="date" value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]} />
                </div>
                <div style={styles.inputGroup}>
                  <span style={styles.inputIcon}>⚧️</span>
                  <select style={styles.select} value={formData.gender}
                    onChange={(e) => updateFormData('gender', e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={styles.nav}>
          {currentStep > 1 && (
            <button style={styles.btnSecondary} onClick={handlePrevious} disabled={loading}>← Previous</button>
          )}
          <button style={styles.btnPrimary} onClick={handleNext} disabled={loading}>
            {loading ? 'Processing...' : currentStep === 4 ? 'Create Account' : 'Continue →'}
          </button>
        </div>

        {/* Google (Step 1 only) */}
        {currentStep === 1 && (
          <>
            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine}></div>
            </div>
            <button style={styles.googleBtn} onClick={handleGoogleSignUp} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.19 3.22l6.85-6.85C36.68 2.09 30.7 0 24 0 14.82 0 6.71 5.08 2.69 12.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.09 46.1 31.3 46.1 24.55z"/>
                <path fill="#FBBC05" d="M10.67 28.64c-1.01-2.9-1.01-6.04 0-8.94l-7.98-6.2C.99 17.68 0 20.74 0 24c0 3.26.99 6.32 2.69 9.5l7.98-6.2z"/>
                <path fill="#EA4335" d="M24 48c6.7 0 12.68-2.21 16.98-6.01l-7.19-5.59c-2.01 1.35-4.59 2.15-7.79 2.15-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.92 14.82 48 24 48z"/>
              </svg>
              Sign up with Google
            </button>
          </>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.footerLink}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationWizard;
