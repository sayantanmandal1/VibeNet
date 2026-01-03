import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ to = '/', className = '', style = {} }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
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