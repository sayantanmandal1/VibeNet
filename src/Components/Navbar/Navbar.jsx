import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import { FiUser } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
              <Link to="/friend-requests" className="nav-link">
                Friend Requests
              </Link>
              <div className="profile-dropdown">
                <Link to="/profile" className="profile-button">
                  <FiUser className="profile-icon" />
                  View Profile
                </Link>
              </div>
            </>
          )}
          {user ? (
            <button className="nav-button logout-btn" onClick={handleLogout}>
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