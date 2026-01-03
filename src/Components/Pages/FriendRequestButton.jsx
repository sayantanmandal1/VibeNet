import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AppContext/AppContext';
import apiClient from '../../config/api';
import './FriendRequestButton.css';

const FriendRequestButton = ({ targetUserId, onStatusChange }) => {
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [friendshipStatus, setFriendshipStatus] = useState('none');
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriendshipStatus = async () => {
      if (!currentUser || !targetUserId || currentUser.id === targetUserId) {
        return;
      }

      try {
        const response = await apiClient.getFriendshipStatus(targetUserId);
        setFriendshipStatus(response.status);
        setRequestId(response.requestId || null);
      } catch (err) {
        console.error('Error fetching friendship status:', err);
        setError('Failed to load friendship status');
      }
    };

    fetchFriendshipStatus();
  }, [currentUser, targetUserId]);

  const handleSendFriendRequest = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendFriendRequest(targetUserId);
      setFriendshipStatus('request_sent');
      setRequestId(response.requestId);
      
      if (onStatusChange) {
        onStatusChange('request_sent');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError(err.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      await apiClient.acceptFriendRequest(requestId);
      setFriendshipStatus('friends');
      setRequestId(null);
      
      if (onStatusChange) {
        onStatusChange('friends');
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError(err.message || 'Failed to accept friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineFriendRequest = async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      await apiClient.declineFriendRequest(requestId);
      setFriendshipStatus('none');
      setRequestId(null);
      
      if (onStatusChange) {
        onStatusChange('none');
      }
    } catch (err) {
      console.error('Error declining friend request:', err);
      setError(err.message || 'Failed to decline friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.removeFriend(targetUserId);
      setFriendshipStatus('none');
      setRequestId(null);
      
      if (onStatusChange) {
        onStatusChange('none');
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      setError(err.message || 'Failed to remove friend');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if it's the user's own profile
  if (!currentUser || currentUser.id === targetUserId) {
    return null;
  }

  // Show login prompt for non-authenticated users
  if (!currentUser) {
    return (
      <button 
        onClick={() => navigate('/login')}
        className="friend-request-btn login-prompt"
      >
        Login to Connect
      </button>
    );
  }

  const renderButton = () => {
    switch (friendshipStatus) {
      case 'friends':
        return (
          <div className="friend-actions">
            <button className="friend-request-btn friends">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Friends
            </button>
            <button 
              onClick={handleRemoveFriend}
              className="friend-request-btn remove"
              disabled={loading}
              title="Remove friend"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
          </div>
        );

      case 'request_sent':
        return (
          <button 
            className="friend-request-btn sent"
            disabled={true}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Request Sent
          </button>
        );

      case 'request_received':
        return (
          <div className="friend-actions">
            <button 
              onClick={handleAcceptFriendRequest}
              className="friend-request-btn accept"
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Accept
            </button>
            <button 
              onClick={handleDeclineFriendRequest}
              className="friend-request-btn decline"
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              Decline
            </button>
          </div>
        );

      case 'blocked':
        return (
          <button className="friend-request-btn blocked" disabled={true}>
            Blocked
          </button>
        );

      case 'none':
      default:
        return (
          <button 
            onClick={handleSendFriendRequest}
            className="friend-request-btn add"
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Add Friend
          </button>
        );
    }
  };

  return (
    <div className="friend-request-button-container">
      {renderButton()}
      {error && (
        <div className="friend-request-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default FriendRequestButton;