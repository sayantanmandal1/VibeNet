import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Land from "./Land";
import Login from "./Login";
import RegistrationWizard from "./RegistrationWizard";
import Reset from "./Reset";
import Home from "./Home";
import ProfilePage from "./ProfilePage";
import ProfileView from "./ProfileView";
import ProfileEdit from "./ProfileEdit";
import FriendRequests from "./FriendRequests";
import Support from "./Support";
import { AuthContext } from "../AppContext/AppContext";
import Settings from "./Settings";

const Pages = ({ darkMode, setDarkMode }) => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Land />} />

      {/* Home page */}
      <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />

      {/* Login, Register, and Reset pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegistrationWizard />} />
      <Route path="/reset" element={<Reset />} />

      {/* Profile pages */}
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/profile" element={user ? <ProfileView /> : <Navigate to="/login" />} />
      <Route path="/profile/edit" element={user ? <ProfileEdit /> : <Navigate to="/login" />} />

      {/* Friend requests page */}
      <Route path="/friend-requests" element={user ? <FriendRequests /> : <Navigate to="/login" />} />

      {/* Customer support page */}
      <Route path="/customer-support" element={<Support />} />

      {/* Settings page */}
      <Route path="/settings" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
    </Routes>
  );
};

export default Pages;
