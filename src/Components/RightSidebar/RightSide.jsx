import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import waterslide from "../../assets/images/waterslide.jpg";
import remove from "../../assets/images/delete.png";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import "./RightSide.css";
import styled from "styled-components";

const SidebarContainer = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(26,115,232,0.06);
  padding: 24px 18px;
  margin-top: 24px;
  min-width: 260px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24px;
`;

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
        
        // Fetch friends list
        const friendsResponse = await apiClient.getFriendsList();
        setFriends(friendsResponse.friends || []);
        
        // Fetch user suggestions
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
    if (!window.confirm(`Are you sure you want to remove ${friendName} as a friend?`)) {
      return;
    }

    try {
      await apiClient.removeFriend(friendId);
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend. Please try again.');
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await apiClient.sendFriendRequest(userId);
      setSuggestions(prev => prev.filter(s => s.id !== userId));
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  const navigateToProfile = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  return (
    <SidebarContainer>
      <div className="flex flex-col items-center relative pt-10">
        <img className="h-48 rounded-md" src={waterslide} alt="nature"></img>
      </div>
      <p className="font-roboto font-normal text-sm text-white max-w-fit no-underline tracking-normal leading-tight py-2 mx-2">
        Through photography, the beauty of Mother Nature can be frozen in time.
        This category celebrates the magic of our planet and beyond — from the
        immensity of the great outdoors, to miraculous moments in your own
        backyard.
      </p>
      
      {user && (
        <div className="mx-2 mt-10">
          <p className="font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
            Friends ({friends.length}):
          </p>
          <input
            className="border-2 border-gray-600 outline-none mt-4 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
            name="input"
            value={input}
            type="text"
            placeholder="Search friends"
            onChange={(e) => setInput(e.target.value)}
          />
          {loading ? (
            <p className="mt-4 text-white text-sm">Loading friends...</p>
          ) : friends.length > 0 ? (
            searchFriends(friends).map((friend) => (
              <div
                className="flex items-center justify-between bg-gray-600 hover:bg-gray-500 rounded-md p-2 my-2 transition duration-300 ease-in-out"
                key={friend.id}
              >
                <div 
                  className="flex items-center cursor-pointer flex-1"
                  onClick={() => navigateToProfile(friend.username)}
                >
                  <img
                    src={friend.profileImage || "/default-avatar.jpg"}
                    alt="User avatar"
                    className="suggestion-avatar w-8 h-8 rounded-full"
                  />
                  <p className="ml-4 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
                    {friend.name}
                  </p>
                </div>
                <div className="mr-2">
                  <img
                    onClick={() => removeFriend(friend.id, friend.name)}
                    className="cursor-pointer w-5 h-5 hover:opacity-70"
                    src={remove}
                    alt="removeFriend"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="mt-4 font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
              No friends yet. Send friend requests to connect!
            </p>
          )}
        </div>
      )}
      
      {user && (
        <div className="mx-2 mt-6">
          <p className="font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none">
            Friend Suggestions:
          </p>
          <div className="mt-4">
            {loading ? (
              <p className="text-white text-sm">Loading suggestions...</p>
            ) : suggestions.length === 0 ? (
              <p className="text-white text-sm opacity-70">No suggestions available</p>
            ) : (
              suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-center justify-between bg-gray-600 hover:bg-gray-500 rounded-md p-2 my-2 transition duration-300">
                  <div 
                    className="flex items-center cursor-pointer flex-1"
                    onClick={() => navigateToProfile(suggestion.username)}
                  >
                    <img 
                      src={suggestion.profileImage || "/default-avatar.png"} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-white text-sm font-medium">{suggestion.name}</p>
                      <p className="text-gray-300 text-xs">@{suggestion.username}</p>
                    </div>
                  </div>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md transition duration-200"
                    onClick={() => sendFriendRequest(suggestion.id)}
                  >
                    Add Friend
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </SidebarContainer>
  );
};

export default RightSide;

