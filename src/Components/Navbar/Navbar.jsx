import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AppContext/AppContext";
import { FiUser, FiHome, FiUsers, FiBell, FiSearch, FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-glass">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <span className="logo-wave">🌊</span>
          </div>
          <span className="logo-text">VibeNet</span>
        </Link>

        {/* Search Bar */}
        <div className={`navbar-search ${searchFocused ? 'focused' : ''}`}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search VibeNet..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Navigation Links */}
        <div className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <Link 
            to="/home" 
            className={`nav-item ${isActive('/home') ? 'active' : ''}`}
          >
            <FiHome className="nav-icon" />
            <span>Home</span>
            {isActive('/home') && <div className="nav-indicator"></div>}
          </Link>

          {user && (
            <>
              <Link 
                to="/friend-requests" 
                className={`nav-item ${isActive('/friend-requests') ? 'active' : ''}`}
              >
                <FiUsers className="nav-icon" />
                <span>Friends</span>
                {isActive('/friend-requests') && <div className="nav-indicator"></div>}
              </Link>

              <button className="nav-item notification-btn">
                <FiBell className="nav-icon" />
                <span className="notification-badge">3</span>
              </button>

              <Link 
                to="/profile" 
                className={`nav-item profile-nav ${isActive('/profile') ? 'active' : ''}`}
              >
                <div className="nav-avatar">
                  <FiUser />
                </div>
                <span>Profile</span>
              </Link>
            </>
          )}

          {user ? (
            <button className="nav-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="nav-btn login-btn">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
