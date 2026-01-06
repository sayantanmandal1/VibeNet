import React, { useState } from 'react';
import './PasswordInput.css';

const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "Password", 
  name = "password",
  className = "",
  autoComplete = "current-password",
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`password-input-container ${className}`}>
      <input
        type={showPassword ? "text" : "password"}
        className="form-input password-input"
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        {...props}
      />
      <button
        type="button"
        className={`password-toggle ${showPassword ? 'visible' : 'hidden'}`}
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <div className="eye-icon">
          <div className="eye-outer">
            <div className="eye-inner">
              {!showPassword && <div className="eye-slash"></div>}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default PasswordInput;