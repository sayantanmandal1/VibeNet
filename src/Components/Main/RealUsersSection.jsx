import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import { getProfileImageUrl, handleImageError } from "../../utils/imageUtils";
import "./CardSection.css";
import { FiUserPlus } from "react-icons/fi";

const RealUsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getUserSuggestions(10);
        setUsers(response.suggestions || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleUserClick = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  if (loading) {
    return (
      <div className="users-section">
        <div className="loading-skeleton">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="users-section">
        <div className="empty-users">
          <span className="empty-icon">🌟</span>
          <p>No users to discover yet</p>
          <span className="empty-hint">Check back soon!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="users-section">
      <div className="users-grid">
        {users.map((userData) => (
          <div 
            key={userData.id} 
            className="user-card-item"
            onClick={() => handleUserClick(userData.username)}
          >
            <div className="user-card-avatar">
              <img
                src={getProfileImageUrl(userData)}
                alt={userData.name}
                onError={(e) => handleImageError(e, '/user-default.jpg')}
              />
              <div className={`user-status-indicator ${userData.isOnline ? 'online' : ''}`}></div>
            </div>
            <div className="user-card-info">
              <span className="user-card-name">{userData.name}</span>
              <span className="user-card-username">@{userData.username}</span>
            </div>
            <button 
              className="user-card-action"
              onClick={(e) => {
                e.stopPropagation();
                // Add friend logic here
              }}
            >
              <FiUserPlus size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealUsersSection;
