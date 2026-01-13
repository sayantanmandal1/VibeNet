import React, { useState } from "react";
import RealUsersSection from "../Main/RealUsersSection";
import Navbar from "../Navbar/Navbar";
import RightSide from "../RightSidebar/RightSide";
import Main from "../Main/Main";
import Footer from "../Footer/Footer";
import NotificationSystem from "./NotificationSystem";
import "./Home.css";

const Home = () => {
  const [notification, setNotification] = useState(null);

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
