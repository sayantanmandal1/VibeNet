import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../config/api';
import './EmailInput.css';

const EmailInput = ({ value, onChange, error, onValidationChange, prefilledEmail = '', className = '' }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [validationStatus, setValidationStatus] = useState(''); // 'success', 'error', 'checking'

  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || email.length < 3 || !/\S+@\S+\.\S+/.test(email)) {
      setValidationMessage('');
      setValidationStatus('');
      onValidationChange?.(false, '');
      return;
    }

    setIsChecking(true);
    setValidationStatus('checking');
    setValidationMessage('Checking email availability...');

    try {
      const response = await apiClient.checkEmailAvailability(email);
      
      if (response.available) {
        setValidationMessage('✓ Email is available');
        setValidationStatus('success');
        onValidationChange?.(true, '');
      } else {
        setValidationMessage('✗ Email is already registered');
        setValidationStatus('error');
        onValidationChange?.(false, 'Email is already registered');
      }
    } catch (error) {
      console.error('Email check error:', error);
      setValidationMessage('Unable to verify email availability');
      setValidationStatus('error');
      onValidationChange?.(false, 'Unable to verify email availability');
    } finally {
      setIsChecking(false);
    }
  }, [onValidationChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value && value !== prefilledEmail) {
        checkEmailAvailability(value);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, checkEmailAvailability, prefilledEmail]);

  // If there's a prefilled email, don't show validation for it initially
  useEffect(() => {
    if (prefilledEmail && value === prefilledEmail) {
      setValidationMessage('');
      setValidationStatus('');
      onValidationChange?.(true, '');
    }
  }, [prefilledEmail, value, onValidationChange]);

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