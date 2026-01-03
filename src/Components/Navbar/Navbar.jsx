import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getProfileUrl = () => {
    if (userData?.username) {
      return `/profile/${userData.username}`;
    }
    return '/profile';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="logo">
            VibeNet
          </Link>
        </div>
        <div className="nav-menu">
          <Link to="/home" className="nav-link">
            Home
          </Link>
          {user && (
            <>
              <Link to={getProfileUrl()} className="nav-link">
                Profile
              </Link>
              <Link to="/friend-requests" className="nav-link">
                Friend Requests
              </Link>
            </>
          )}
          {user ? (
            <button className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="nav-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;