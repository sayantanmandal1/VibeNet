import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaGithub, FaYoutube } from "react-icons/fa";
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Left section with logo, description, and social icons */}
        <div className="footer-section">
          <div className="footer-logo">
            <span className="logo-icon">🌊</span>
            <span className="logo-text">VibeNet</span>
          </div>
          <p className="footer-description">
            Connect with friends and share your moments in a vibrant social community.
          </p>
          <div className="social-icons">
            <FaFacebook className="social-icon" />
            <FaInstagram className="social-icon" />
            <FaTwitter className="social-icon" />
            <FaGithub className="social-icon" />
            <FaYoutube className="social-icon" />
          </div>
        </div>

        {/* Solutions section */}
        <div className="footer-section">
          <h3 className="footer-title">Features</h3>
          <ul className="footer-list">
            <li>Social Feed</li>
            <li>Friend Connections</li>
            <li>Photo Sharing</li>
            <li>Real-time Chat</li>
            <li>Privacy Controls</li>
          </ul>
        </div>

        {/* Support section */}
        <div className="footer-section">
          <h3 className="footer-title">Support</h3>
          <ul className="footer-list">
            <li>Help Center</li>
            <li>Documentation</li>
            <li>Community Guidelines</li>
            <li>Contact Us</li>
          </ul>
        </div>

        {/* Company section */}
        <div className="footer-section">
          <h3 className="footer-title">Company</h3>
          <ul className="footer-list">
            <li>About Us</li>
            <li>Blog</li>
            <li>Careers</li>
            <li>Press Kit</li>
          </ul>
        </div>

        {/* Legal section */}
        <div className="footer-section">
          <h3 className="footer-title">Legal</h3>
          <ul className="footer-list">
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
            <li>Cookie Policy</li>
            <li>License</li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright section */}
      <div className="footer-bottom">
        <p>© 2024 VibeNet, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
