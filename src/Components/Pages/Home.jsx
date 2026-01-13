import React, { useState, useContext } from "react";
import RealUsersSection from "../Main/RealUsersSection";
import Navbar from "../Navbar/Navbar";
import RightSide from "../RightSidebar/RightSide";
import Main from "../Main/Main";
import Footer from "../Footer/Footer";
import NotificationSystem from "./NotificationSystem";
import { AuthContext } from "../AppContext/AppContext";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiUser, FiX } from "react-icons/fi";
import { BiLogOut } from "react-icons/bi";
import "./Home.css";

const Home = () => {
  const [notification, setNotification] = useState(null);
  useContext(AuthContext); // Auth context for user state
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    window.location.href = "/login";
  };

  return (
    <div className="home-page">
      {/* Animated background */}
      <div className="home-bg-gradient"></div>
      <div className="home-bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>
      <div className="home-bg-grid"></div>

      <Navbar />

      {/* Quick action buttons */}
      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={() => navigate("/profile")}
          title="My Profile"
        >
          <FiUser size={20} />
        </button>
        <button
          className="quick-action-btn"
          onClick={() => navigate("/settings")}
          title="Settings"
        >
          <FiSettings size={20} />
        </button>
        <button
          className="quick-action-btn logout"
          onClick={() => setShowLogout(true)}
          title="Logout"
        >
          <BiLogOut size={20} />
        </button>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="logout-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLogout(false)}>
              <FiX size={20} />
            </button>
            <div className="modal-icon">
              <BiLogOut size={48} />
            </div>
            <h3>Ready to leave?</h3>
            <p>Are you sure you want to logout from VibeNet?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogout(false)}>
                Stay
              </button>
              <button className="btn-confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="home-content">
        <div className="feed-wrapper">
          {/* Left Sidebar */}
          <aside className="sidebar sidebar-left glass-card">
            <div className="sidebar-header">
              <h2>Discover People</h2>
              <span className="badge">New</span>
            </div>
            <RealUsersSection />
          </aside>

          {/* Main Feed */}
          <main className="feed-main">
            <Main />
          </main>

          {/* Right Sidebar */}
          <aside className="sidebar sidebar-right glass-card">
            <RightSide />
          </aside>
        </div>
      </div>

      <Footer />

      <NotificationSystem
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default Home;
