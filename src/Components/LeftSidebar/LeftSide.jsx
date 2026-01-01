import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../AppContext/AppContext";
import { socialImages } from '../../assets/images/social';
import nature from "../../assets/images/nature.jpg";
import './LeftSide.css';
import { FaAppStore, FaLaptop, FaPhotoVideo, FaTiktok, FaFacebook, FaTwitter } from 'react-icons/fa';

const LeftSide = () => {
  const count = useRef(0);
  const { user, userData } = useContext(AuthContext);

  const userProfile = {
    avatar: '/path-to-default-avatar.jpg', // Add default avatar path
    job: 'Software Developer', // Add default job title
  };

  useEffect(() => {
    let countAds = 0;
    let startAds = setInterval(() => {
      countAds++;
      count.current = countAds;
      if (countAds === 5) {
        clearInterval(startAds);
      }
    }, 2000);

    return () => {
      clearInterval(startAds);
    };
  }, []);

  // Menu items array
  const menuItems = [
    { icon: <FaLaptop />, text: 'Desktop' },
    { icon: <FaPhotoVideo />, text: 'Media' },
    { icon: <FaAppStore />, text: 'Apps' },
    { icon: <FaTiktok />, text: 'TikTok' },
  ];

  return (
    <div className="left-sidebar">
      <div className="profile-header">
        <img
          className="cover-image"
          src={nature}
          alt="nature"
        />
        <div className="profile-avatar-container">
          <img 
            className="profile-avatar"
            src={user?.photoURL || socialImages.avatar} 
            alt="avatar"
          />
        </div>
      </div>

      <div className="flex flex-col items-center pt-6">
        <p className="font-roboto font-medium text-md text-white no-underline tracking-normal leading-none">
          {user?.email || userData?.email}
        </p>
        <p className="font-roboto font-medium text-xs text-white no-underline tracking-normal leading-none">
          Go to Profile
        </p>
        <p className="font-roboto font-medium text-sm text-white no-underline tracking-normal leading-none py-2">
          Try premium for free
        </p>
      </div>
      <div className="flex flex-col pl-2">
        <div className="flex items-center pb-4">
          <img className="h-10" src={socialImages.location} alt="location"></img>
          <p className="font-roboto font-bold text-lg no-underline tracking-normal leading-none text-white">
            India
          </p>
        </div>
        <div className="flex items-center">
          <img className="h-10" src={socialImages.job} alt="job"></img>
          <p className="font-roboto font-bold text-lg no-underline tracking-normal leading-none text-white">
            Student at VIT-AP
          </p>
        </div>
        <div className="flex justify-center items-center pt-4">
          <p className="font-roboto font-bold text-md text-[#0177b7] no-underline tracking-normal leading-none">
            Events
          </p>
          <p className="font-roboto font-bold text-md text-[#0177b7] no-underline tracking-normal leading-none mx-2">
            Groups
          </p>
          <p className="font-roboto font-bold text-md text-[#0177b7] no-underline tracking-normal leading-none">
            Follow
          </p>
          <p className="font-roboto font-bold text-md text-[#0177b7] no-underline tracking-normal leading-none mx-2">
            More
          </p>
        </div>
      </div>
      <div className="ml-2 mt-4 mb-4"> {/* Spacing before Social Profiles */}
        
        <p className="font-roboto font-bold text-lg no-underline tracking-normal leading-none py-2 text-white">
          Social Profiles
        </p>
        <div className="flex items-center mb-1"> {/* Spacing after Facebook */}
          <img className="h-10 mb-3 mr-2" src={socialImages.facebook} alt="facebook"></img>
          <p className="font-roboto font-bold text-lg text-white no-underline tracking-normal leading-none py-2">
            Facebook
          </p>
        </div>
        <div className="flex items-center mb-4"> {/* Spacing after Twitter */}
          <img className="h-10 mb-3 mr-2" src={socialImages.twitter} alt="twitter"></img>
          <p className="font-roboto font-bold text-lg text-white no-underline tracking-normal leading-none py-2">
            X
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center pt-4">
        {/* You can add more content here if needed */}
      </div>
      <nav className="nav-menu">
        {menuItems.map((item, index) => (
          <button key={index} className="nav-item">
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.text}</span>
          </button>
        ))}
      </nav>

      <div className="profile-section">
        <div className="profile-info" title="Profile">
          <img 
            src={userProfile.avatar}
            alt="Profile" 
            className="profile-avatar"
          />
          <div className="profile-details">
            <h3 className="profile-name">User Name</h3>
            <p className="profile-title">{userProfile.job}</p>
          </div>
        </div>
      </div>

      <div className="social-links">
        <button className="social-button" onClick={() => window.open('https://facebook.com', '_blank')}>
          <FaFacebook className="social-icon" />
          <span>Facebook</span>
        </button>
        <button className="social-button" onClick={() => window.open('https://twitter.com', '_blank')}>
          <FaTwitter className="social-icon" />
          <span>Twitter</span>
        </button>
      </div>
    </div>
  );
};



export default LeftSide;
