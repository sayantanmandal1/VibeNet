import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import "./RightSide.css";
import { FiSearch, FiUserPlus, FiUserMinus, FiUsers, FiChevronRight } from "react-icons/fi";
import { getProfileImageUrl, handleImageError } from "../../utils/imageUtils";

const RightSide = () => {
  const [input, setInput] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFriendsAndSuggestions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const friendsResponse = await apiClient.getFriendsList();
        setFriends(friendsResponse.friends || []);
        
        const suggestionsResponse = await apiClient.getUserSuggestions(5);
        setSuggestions(suggestionsResponse.suggestions || []);
      } catch (error) {
        console.error('Error fetching friends and suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsAndSuggestions();
  }, [user]);

  const searchFriends = (data) => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(input.toLowerCase())
    );
  };

  const removeFriend = async (friendId, friendName) => {
    if (!window.confirm(`Remove ${friendName} from friends?`)) {
      return;
    }

    try {
      await apiClient.removeFriend(friendId);
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await apiClient.sendFriendRequest(userId);
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const navigateToProfile = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  if (!user) return null;

  return (
    <div className="right-sidebar-content">
      {/* Friends Section */}
      <div className="sidebar-section">
        <div className="section-header">
          <div className="section-title">
            <FiUsers className="section-icon" />
            <h3>Friends</h3>
            <span className="count-badge">{friends.length}</span>
          </div>
          <button 
            className="see-all-btn"
            onClick={() => navigate('/friend-requests')}
          >
            See All
            <FiChevronRight size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search friends..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Friends List */}
        <div className="friends-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : friends.length > 0 ? (
            searchFriends(friends).slice(0, 5).map((friend) => (
              <div className="friend-item" key={friend.id}>
                <div 
                  className="friend-info"
                  onClick={() => navigateToProfile(friend.username)}
                >
                  <div className="friend-avatar-wrapper">
                    <img
                      src={getProfileImageUrl(friend)}
                      alt={friend.name}
                      className="friend-avatar"
                      onError={(e) => handleImageError(e, "/user-default.jpg")}
                    />
                    <div className={`status-dot ${friend.isOnline ? 'online' : ''}`}></div>
                  </div>
                  <div className="friend-details">
                    <span className="friend-name">{friend.name}</span>
                    <span className="friend-status">
                      {friend.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFriend(friend.id, friend.name)}
                  title="Remove friend"
                >
                  <FiUserMinus size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>No friends yet</p>
              <span className="empty-hint">Start connecting with people!</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="sidebar-section">
        <div className="section-header">
          <div className="section-title">
            <FiUserPlus className="section-icon" />
            <h3>Suggestions</h3>
          </div>
        </div>

        <div className="suggestions-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div className="suggestion-item" key={suggestion.id}>
                <div 
                  className="suggestion-info"
                  onClick={() => navigateToProfile(suggestion.username)}
                >
                  <img
                    src={getProfileImageUrl(suggestion)}
                    alt={suggestion.name}
                    className="suggestion-avatar"
                    onError={(e) => handleImageError(e, "/user-default.jpg")}
                  />
                  <div className="suggestion-details">
                    <span className="suggestion-name">{suggestion.name}</span>
                    <span className="suggestion-username">@{suggestion.username}</span>
                  </div>
                </div>
                <button
                  className="add-friend-btn"
                  onClick={() => sendFriendRequest(suggestion.id)}
                >
                  <FiUserPlus size={16} />
                  <span>Add</span>
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state small">
              <p>No suggestions available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSide;
