import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../config/api';
import './UsernameSelector.css';

const UsernameSelector = ({ value, onChange, error, onValidationChange }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate username suggestions
  const generateSuggestions = useCallback((baseUsername) => {
    const suggestions = [];
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    // Different suggestion patterns
    suggestions.push(`${baseUsername}${currentYear}`);
    suggestions.push(`${baseUsername}_${randomNum}`);
    suggestions.push(`${baseUsername}${randomNum}`);
    suggestions.push(`the_${baseUsername}`);
    suggestions.push(`${baseUsername}_official`);
    
    // Add some creative variations
    if (baseUsername.length > 6) {
      suggestions.push(`${baseUsername.slice(0, 6)}${randomNum}`);
    }
    
    setSuggestions(suggestions.slice(0, 4)); // Show max 4 suggestions
    setShowSuggestions(true);
  }, []);

  // Username checking function
  const checkUsername = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setAvailability(null);
      setIsChecking(false);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsChecking(true);
    try {
      const response = await apiClient.checkUsernameAvailability(username);
      setAvailability(response);
      
      // If username is taken, generate suggestions
      if (!response.available) {
        generateSuggestions(username);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      
      // Notify parent component about validation status
      if (onValidationChange) {
        onValidationChange(response.available, response.message);
      }
    } catch (error) {
      console.error('Username check error:', error);
      setAvailability({
        available: false,
        error: 'Unable to check username availability'
      });
      
      if (onValidationChange) {
        onValidationChange(false, 'Unable to check username availability');
      }
    } finally {
      setIsChecking(false);
    }
  }, [onValidationChange, generateSuggestions]);

  // Effect to check username when value changes with debouncing
  useEffect(() => {
    if (!value) {
      setAvailability(null);
      setSuggestions([]);
      setShowSuggestions(false);
      setIsChecking(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkUsername(value);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, checkUsername]);

  const handleInputChange = (e) => {
    const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const getInputClassName = () => {
    let className = 'username-input';
    
    if (error) {
      className += ' error';
    } else if (availability) {
      className += availability.available ? ' success' : ' error';
    }
    
    return className;
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <div className="status-icon checking">⏳</div>;
    }
    
    if (availability) {
      if (availability.available) {
        return <div className="status-icon success">✓</div>;
      } else {
        return <div className="status-icon error">✗</div>;
      }
    }
    
    return null;
  };

  const getStatusMessage = () => {
    if (error) {
      return <div className="status-message error">{error}</div>;
    }
    
    if (isChecking) {
      return <div className="status-message checking">Checking availability...</div>;
    }
    
    if (availability) {
      return (
        <div className={`status-message ${availability.available ? 'success' : 'error'}`}>
          {availability.message || availability.error}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="username-selector">
      <div className="username-input-container">
        <div className="username-prefix">@</div>
        <input
          type="text"
          className={getInputClassName()}
          placeholder="username"
          value={value}
          onChange={handleInputChange}
          maxLength={30}
          autoComplete="username"
        />
        {getStatusIcon()}
      </div>
      
      {getStatusMessage()}
      
      <div className="username-rules">
        <p>Username must be 3-30 characters and can only contain letters, numbers, and underscores.</p>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="username-suggestions">
          <h4>Suggestions:</h4>
          <div className="suggestions-grid">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="suggestion-btn"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                @{suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsernameSelector;