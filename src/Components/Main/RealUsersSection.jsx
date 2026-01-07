import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import "./CardSection.css";

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
        // Fetch recent users or friends
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
      <div className="card-section-scroll">
        <div className="loading-users">
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="card-section-scroll">
        <div className="no-users">
          <p>No users to show</p>
          <p className="text-sm opacity-70">Users will appear here as they join</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-section-scroll">
      {users.map((userData) => (
        <div 
          key={userData.id} 
          className="card-section-item user-card-clickable"
          onClick={() => handleUserClick(userData.username)}
        >
          <div className="user-card">
            <div className="user-avatar-container">
              <img
                src={userData.profileImage || "/src/assets/user-default.jpg"}
                alt={userData.name}
                className="user-avatar"
              />
              <div className={`status-indicator ${userData.isOnline ? 'online' : 'offline'}`}></div>
            </div>
            <div className="user-info">
              <h4 className="user-name">{userData.name}</h4>
              <p className="user-username">@{userData.username}</p>
              <p className="user-status">{userData.isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealUsersSection;