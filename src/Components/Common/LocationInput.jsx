import React, { useState, useEffect, useRef } from 'react';
import { 
  getLocationSuggestions, 
  validateLocation, 
  formatLocation, 
  isKnownLocation 
} from '../../utils/locationUtils';
import './LocationInput.css';

const LocationInput = ({ 
  value = '', 
  onChange, 
  countryCode = 'US',
  placeholder = 'Enter your location',
  className = '',
  error = '',
  required = false 
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, message: '' });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    // Validate location when it changes
    const validationResult = validateLocation(inputValue, countryCode);
    setValidation(validationResult);
  }, [inputValue, countryCode]);

  useEffect(() => {
    // Get suggestions when input changes
    if (inputValue && inputValue.length >= 2) {
      const locationSuggestions = getLocationSuggestions(inputValue, countryCode, 8);
      setSuggestions(locationSuggestions);
      setShowSuggestions(locationSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [inputValue, countryCode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const formattedLocation = formatLocation(suggestion.fullLocation);
    setInputValue(formattedLocation);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onChange) {
      onChange(formattedLocation);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleBlur = () => {
    // Format the location when user leaves the input
    if (inputValue) {
      const formatted = formatLocation(inputValue);
      if (formatted !== inputValue) {
        setInputValue(formatted);
        if (onChange) {
          onChange(formatted);
        }
      }
    }
  };

  const isLocationKnown = inputValue ? isKnownLocation(inputValue, countryCode) : false;

  return (
    <div className={`location-input-container ${className}`}>
      <div className="location-input-wrapper" ref={suggestionsRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`location-input ${error || !validation.isValid ? 'error' : ''} ${isLocationKnown ? 'verified' : ''}`}
          required={required}
          autoComplete="address-level2"
        />
        
        {isLocationKnown && (
          <div className="location-verified-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          </div>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="location-suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.fullLocation}-${index}`}
                type="button"
                className={`location-suggestion ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="suggestion-content">
                  <div className="suggestion-icon">
                    {suggestion.type === 'city' ? '🏙️' : '🌍'}
                  </div>
                  <div className="suggestion-text">
                    <div className="suggestion-main">{suggestion.fullLocation}</div>
                    <div className="suggestion-type">
                      {suggestion.type === 'city' ? 'City' : 'Country'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {(error || !validation.isValid) && (
        <div className="location-input-error">
          {error || validation.message}
        </div>
      )}
      
      {validation.isValid && inputValue && !error && (
        <div className="location-input-info">
          {isLocationKnown ? (
            <span className="location-verified">✓ Verified location</span>
          ) : (
            <span className="location-custom">Custom location</span>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;