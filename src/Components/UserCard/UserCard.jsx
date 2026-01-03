import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCard.css';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (user.username) {
      navigate(`/profile/${user.username}`);
    }
  };

  const getProfileImage = () => {
    if (user.profileImage) {
      // Handle both full URLs and relative paths
      if (user.profileImage.startsWith('http')) {
        return user.profileImage;
      }
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profileImage}`;
    }
    // Default avatar fallback
    return '/src/assets/images/avatar.jpg';
  };

  return (
    <div className="user-card" onClick={handleClick}>
      <div className="user-card-image">
        <img 
          src={getProfileImage()} 
          alt={user.name}
          onError={(e) => {
            e.target.src = '/src/assets/images/avatar.jpg';
          }}
        />
      </div>
      <div className="user-card-info">
        <h4 className="user-card-name">{user.name}</h4>
        <p className="user-card-username">@{user.username || 'user'}</p>
        <div className="user-card-stats">
          <span className="user-card-stat">
            <strong>{user.friendsCount || 0}</strong> friends
          </span>
          <span className="user-card-stat">
            <strong>{user.postsCount || 0}</strong> posts
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;