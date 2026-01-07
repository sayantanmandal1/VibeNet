import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../config/api';
import './EmailInput.css';

const EmailInput = ({ value, onChange, error, onValidationChange, prefilledEmail = '', className = '' }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [validationStatus, setValidationStatus] = useState(''); // 'success', 'error', 'checking'
  const lastCheckedEmail = useRef('');
  const timeoutRef = useRef(null);

  const checkEmailAvailability = useCallback(async (email) => {
    console.log('🔍 Checking email availability for:', email);
    
    if (!email || email.length < 3 || !/\S+@\S+\.\S+/.test(email)) {
      console.log('❌ Email validation failed:', { email, length: email?.length });
      setValidationMessage('');
      setValidationStatus('');
      onValidationChange?.(false, '');
      lastCheckedEmail.current = '';
      return;
    }

    // Don't check if we already checked this email
    if (lastCheckedEmail.current === email) {
      console.log('⏭️ Skipping - already checked:', email);
      return;
    }

    console.log('🚀 Making API request for email:', email);
    setIsChecking(true);
    setValidationStatus('checking');
    setValidationMessage('Checking email availability...');
    lastCheckedEmail.current = email;

    try {
      const response = await apiClient.checkEmailAvailability(email);
      console.log('✅ API response:', response);
      
      // Only update if this is still the current email
      if (lastCheckedEmail.current === email) {
        if (response.available) {
          setValidationMessage('✓ Email is available');
          setValidationStatus('success');
          onValidationChange?.(true, '');
        } else {
          setValidationMessage('✗ Email is already registered');
          setValidationStatus('error');
          onValidationChange?.(false, 'Email is already registered');
        }
      }
    } catch (error) {
      console.error('❌ Email check error:', error);
      if (lastCheckedEmail.current === email) {
        setValidationMessage('Unable to verify email availability');
        setValidationStatus('error');
        onValidationChange?.(false, 'Unable to verify email availability');
      }
    } finally {
      if (lastCheckedEmail.current === email) {
        setIsChecking(false);
      }
    }
  }, [onValidationChange]);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If there's a prefilled email and it matches current value, don't validate
    if (prefilledEmail && value === prefilledEmail) {
      setValidationMessage('');
      setValidationStatus('');
      onValidationChange?.(true, '');
      return;
    }

    // Set new timeout for validation
    timeoutRef.current = setTimeout(() => {
      if (value && value !== prefilledEmail) {
        checkEmailAvailability(value);
      } else {
        setValidationMessage('');
        setValidationStatus('');
        lastCheckedEmail.current = '';
        onValidationChange?.(false, '');
      }
    }, 800); // Increased debounce time

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, checkEmailAvailability, prefilledEmail, onValidationChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`email-input ${className}`}>
      <div className={`email-input-container ${validationStatus} ${error ? 'error' : ''}`}>
        <input
          type="email"
          className="form-input email-field"
          placeholder="Email Address *"
          value={value}
          onChange={onChange}
          autoComplete="email"
        />
        
        {(isChecking || validationStatus) && (
          <div className={`status-icon ${validationStatus}`}>
            {isChecking ? (
              <div className="spinner"></div>
            ) : validationStatus === 'success' ? (
              '✓'
            ) : validationStatus === 'error' ? (
              '✗'
            ) : null}
          </div>
        )}
      </div>

      {validationMessage && (
        <div className={`status-message ${validationStatus}`}>
          {validationMessage}
        </div>
      )}

      {validationStatus === 'error' && value && (
        <div className="email-help">
          <p>This email is already registered. You can:</p>
          <ul>
            <li>Try <a href="/login">logging in</a> instead</li>
            <li>Use a different email address</li>
            <li>Reset your password if you forgot it</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmailInput;