import React from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaGithub, 
  FaYoutube,
  FaHeart 
} from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-glass">
      <div className="footer-glow"></div>
      
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="brand-logo">
            <span className="logo-wave">🌊</span>
            <span className="logo-text">VibeNet</span>
          </div>
          <p className="brand-description">
            Connect with friends and share your moments in a vibrant social community. 
            Experience the future of social networking.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTwitter />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaGithub />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Links Sections */}
        <div className="footer-links-grid">
          <div className="footer-section">
            <h4 className="section-title">Features</h4>
            <ul className="section-links">
              <li><Link to="/home">Social Feed <FiArrowUpRight /></Link></li>
              <li><Link to="/friend-requests">Friend Connections <FiArrowUpRight /></Link></li>
              <li><Link to="/profile">Photo Sharing <FiArrowUpRight /></Link></li>
              <li><a href="#chat">Real-time Chat <FiArrowUpRight /></a></li>
              <li><a href="#privacy">Privacy Controls <FiArrowUpRight /></a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Support</h4>
            <ul className="section-links">
              <li><Link to="/customer-support">Help Center <FiArrowUpRight /></Link></li>
              <li><a href="#docs">Documentation <FiArrowUpRight /></a></li>
              <li><a href="#guidelines">Community Guidelines <FiArrowUpRight /></a></li>
              <li><a href="#contact">Contact Us <FiArrowUpRight /></a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Company</h4>
            <ul className="section-links">
              <li><a href="#about">About Us <FiArrowUpRight /></a></li>
              <li><a href="#blog">Blog <FiArrowUpRight /></a></li>
              <li><a href="#careers">Careers <FiArrowUpRight /></a></li>
              <li><a href="#press">Press Kit <FiArrowUpRight /></a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="section-title">Legal</h4>
            <ul className="section-links">
              <li><a href="#terms">Terms of Service <FiArrowUpRight /></a></li>
              <li><a href="#privacy">Privacy Policy <FiArrowUpRight /></a></li>
              <li><a href="#cookies">Cookie Policy <FiArrowUpRight /></a></li>
              <li><a href="#license">License <FiArrowUpRight /></a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © {currentYear} VibeNet, Inc. All rights reserved.
          </p>
          <p className="made-with">
            Made with <FaHeart className="heart-icon" /> by the VibeNet Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
