import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileImageUrl, handleImageError } from '../../utils/imageUtils';
import './UserCard.css';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (user.username) {
      navigate(`/profile/${user.username}`);
    }
  };

  return (
    <div className="user-card" onClick={handleClick}>
      <div className="user-card-image">
        <img 
          src={getProfileImageUrl(user)} 
          alt={user.name}
          onError={(e) => handleImageError(e, '/user-default.jpg')}
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