import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AppContext/AppContext';
import apiClient from '../../config/api';
import './FriendRequests.css';

const FriendRequests = () => {
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getFriendRequests();
        setRequests(response);
      } catch (err) {
        console.error('Error fetching friend requests:', err);
        setError(err.message || 'Failed to load friend requests');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendRequests();
  }, [currentUser, navigate]);

  const handleAcceptRequest = async (requestId) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      await apiClient.acceptFriendRequest(requestId);
      
      // Remove the request from incoming requests
      setRequests(prev => ({
        ...prev,
        incoming: prev.incoming.filter(req => req.id !== requestId)
      }));
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError(err.message || 'Failed to accept friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      await apiClient.declineFriendRequest(requestId);
      
      // Remove the request from incoming requests
      setRequests(prev => ({
        ...prev,
        incoming: prev.incoming.filter(req => req.id !== requestId)
      }));
    } catch (err) {
      console.error('Error declining friend request:', err);
      setError(err.message || 'Failed to decline friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleCancelRequest = async (requestId) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      await apiClient.declineFriendRequest(requestId);
      
      // Remove the request from outgoing requests
      setRequests(prev => ({
        ...prev,
        outgoing: prev.outgoing.filter(req => req.id !== requestId)
      }));
    } catch (err) {
      console.error('Error canceling friend request:', err);
      setError(err.message || 'Failed to cancel friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const navigateToProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="friend-requests-container">
        <div className="friend-requests-header">
          <h2>Friend Requests</h2>
        </div>
        <div className="friend-requests-loading">
          <div className="loading-spinner"></div>
          <p>Loading friend requests...</p>
        </div>
      </div>
    );
  }

  const hasIncomingRequests = requests.incoming.length > 0;
  const hasOutgoingRequests = requests.outgoing.length > 0;

  return (
    <div className="friend-requests-container">
      <div className="friend-requests-header">
        <h2>Friend Requests</h2>
        {hasIncomingRequests && (
          <span className="requests-count">{requests.incoming.length}</span>
        )}
      </div>

      {error && (
        <div className="friend-requests-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-dismiss">
            Dismiss
          </button>
        </div>
      )}

      {/* Incoming Friend Requests */}
      {hasIncomingRequests && (
        <div className="requests-section">
          <h3 className="section-title">Incoming Requests</h3>
          <div className="requests-list">
            {requests.incoming.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-user-info">
                  <img 
                    src={request.requester.profileImage || '/default-avatar.png'}
                    alt={request.requester.name}
                    className="request-avatar"
                    onClick={() => navigateToProfile(request.requester.username)}
                  />
                  <div className="request-details">
                    <h4 
                      className="request-name"
                      onClick={() => navigateToProfile(request.requester.username)}
                    >
                      {request.requester.name}
                    </h4>
                    <p className="request-username">@{request.requester.username}</p>
                    <p className="request-time">{formatTimeAgo(request.requestedAt)}</p>
                  </div>
                </div>
                
                <div className="request-actions">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="btn-accept"
                    disabled={processingRequests.has(request.id)}
                  >
                    {processingRequests.has(request.id) ? (
                      <div className="btn-loading"></div>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Accept
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeclineRequest(request.id)}
                    className="btn-decline"
                    disabled={processingRequests.has(request.id)}
                  >
                    {processingRequests.has(request.id) ? (
                      <div className="btn-loading"></div>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        Decline
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Friend Requests */}
      {hasOutgoingRequests && (
        <div className="requests-section">
          <h3 className="section-title">Sent Requests</h3>
          <div className="requests-list">
            {requests.outgoing.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-user-info">
                  <img 
                    src={request.target.profileImage || '/default-avatar.png'}
                    alt={request.target.name}
                    className="request-avatar"
                    onClick={() => navigateToProfile(request.target.username)}
                  />
                  <div className="request-details">
                    <h4 
                      className="request-name"
                      onClick={() => navigateToProfile(request.target.username)}
                    >
                      {request.target.name}
                    </h4>
                    <p className="request-username">@{request.target.username}</p>
                    <p className="request-time">Sent {formatTimeAgo(request.requestedAt)}</p>
                  </div>
                </div>
                
                <div className="request-actions">
                  <button
                    onClick={() => handleCancelRequest(request.id)}
                    className="btn-cancel"
                    disabled={processingRequests.has(request.id)}
                  >
                    {processingRequests.has(request.id) ? (
                      <div className="btn-loading"></div>
                    ) : (
                      'Cancel'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasIncomingRequests && !hasOutgoingRequests && (
        <div className="requests-empty">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.996 2.996 0 0 0 17.06 7c-.8 0-1.54.37-2.01.97L12 11.5l-3.05-3.53A2.996 2.996 0 0 0 6.94 7c-.8 0-1.54.37-2.01.97L2.5 16H5v6h2v-6h2l2-2.5L13 16h2v6h4z"/>
            </svg>
          </div>
          <h3>No Friend Requests</h3>
          <p>When people send you friend requests, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

export default FriendRequests;