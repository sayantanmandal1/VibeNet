import React, { useState, useEffect, useRef } from 'react';
import { countryCodes, validatePhoneNumber, formatPhoneNumber } from '../../utils/countryCodes';
import './PhoneInput.css';

const PhoneInput = ({ 
  value = '', 
  onChange, 
  countryCode = 'US', 
  onCountryChange,
  placeholder = 'Enter phone number',
  className = '',
  error = '',
  required = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneValue, setPhoneValue] = useState(value);
  const [validation, setValidation] = useState({ isValid: true, message: '' });
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedCountry = countryCodes.find(country => country.code === countryCode) || countryCodes[0];

  // Filter countries based on search term
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.phoneCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setPhoneValue(value);
  }, [value]);

  useEffect(() => {
    // Validate phone number when it changes
    const validationResult = validatePhoneNumber(phoneValue, countryCode);
    setValidation(validationResult);
  }, [phoneValue, countryCode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    if (onCountryChange) {
      onCountryChange(country.code);
    }
    
    // Format existing phone number with new country code
    if (phoneValue) {
      const formatted = formatPhoneNumber(phoneValue, country.code);
      setPhoneValue(formatted);
      if (onChange) {
        onChange(formatted);
      }
    }
    
    setIsDropdownOpen(false);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handlePhoneChange = (e) => {
    let inputValue = e.target.value;
    
    // Auto-format with country code if user starts typing without it
    if (inputValue && !inputValue.startsWith(selectedCountry.phoneCode)) {
      // Remove any existing country code attempts
      const cleanValue = inputValue.replace(/^\+?\d{1,4}/, '');
      if (cleanValue && /^\d/.test(cleanValue)) {
        inputValue = `${selectedCountry.phoneCode}${cleanValue}`;
      }
    }
    
    setPhoneValue(inputValue);
    if (onChange) {
      onChange(inputValue);
    }
  };

  const handleInputFocus = () => {
    // Auto-add country code if input is empty
    if (!phoneValue) {
      const newValue = selectedCountry.phoneCode;
      setPhoneValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  return (
    <div className={`phone-input-container ${className}`}>
      <div className="phone-input-wrapper">
        <div className="country-selector" ref={dropdownRef}>
          <button
            type="button"
            className="country-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="country-flag">{selectedCountry.flag}</span>
            <span className="country-code">{selectedCountry.phoneCode}</span>
            <svg 
              className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
              width="12" 
              height="12" 
              viewBox="0 0 12 12"
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="country-dropdown">
              <div className="country-search">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="country-search-input"
                />
              </div>
              <div className="country-list">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    className={`country-option ${country.code === countryCode ? 'selected' : ''}`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    <span className="country-flag">{country.flag}</span>
                    <span className="country-name">{country.name}</span>
                    <span className="country-phone-code">{country.phoneCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <input
          ref={inputRef}
          type="tel"
          value={phoneValue}
          onChange={handlePhoneChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`phone-number-input ${error || !validation.isValid ? 'error' : ''}`}
          required={required}
        />
      </div>
      
      {(error || !validation.isValid) && (
        <div className="phone-input-error">
          {error || validation.message}
        </div>
      )}
      
      {validation.isValid && phoneValue && !error && (
        <div className="phone-input-success">
          ✓ Valid phone number
        </div>
      )}
    </div>
  );
};

export default PhoneInput;