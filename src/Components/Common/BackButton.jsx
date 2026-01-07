import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ to = '/', onClick, className = '', style = {} }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <button 
      className={`back-button ${className}`}
      onClick={handleClick}
      style={style}
    >
      <span className="back-button-icon">←</span>
      <span className="back-button-text">Back</span>
    </button>
  );
};

export default BackButton;