import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AppContext/AppContext";
import apiClient from "../../config/api";
import ProfileEditModal from "./ProfileEditModal";
import BackButton from "../Common/BackButton";
import styled from "styled-components";
import { FiEdit3, FiMapPin, FiCalendar, FiMail, FiPhone } from "react-icons/fi";

const ProfileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const ProfileCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  text-align: center;
  color: white;
`;

const ProfileAvatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
  margin-bottom: 20px;
`;

const ProfileName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const ProfileUsername = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 16px;
`;

const ProfileBio = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
`;

const ProfileBody = styled.div`
  padding: 30px;
`;

const InfoSection = styled.div`
  margin-bottom: 30px;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
  
  svg {
    margin-right: 10px;
    color: #667eea;
  }
`;

const EditButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px auto;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  color: white;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const MyProfile = () => {
  const { user, userData } = useContext(AuthContext);
  const [showEdit, setShowEdit] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Get current user profile
        const response = await apiClient.getCurrentUser();
        setProfile(response.user);
        setStats({
          posts: response.user.postsCount || 0,
          followers: response.user.followersCount || 0,
          following: response.user.followingCount || 0
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to userData from context
        setProfile(userData || user);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, userData]);

  const handleProfileSave = async (updatedData) => {
    try {
      const response = await apiClient.updateProfile(updatedData);
      setProfile(response.user);
      setShowEdit(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', color: 'white', paddingTop: '100px' }}>
          <h2>Loading profile...</h2>
        </div>
      </ProfileContainer>
    );
  }

  if (!profile) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', color: 'white', paddingTop: '100px' }}>
          <h2>Profile not found</h2>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <BackButton />
      <ProfileCard>
        <ProfileHeader>
          <ProfileAvatar
            src={profile.profileImage || "/src/assets/user-default.jpg"}
            alt="Profile"
          />
          <ProfileName>{profile.name}</ProfileName>
          <ProfileUsername>@{profile.username}</ProfileUsername>
          {profile.bio && <ProfileBio>{profile.bio}</ProfileBio>}
          
          <StatsContainer>
            <StatItem>
              <StatNumber>{stats.posts}</StatNumber>
              <StatLabel>Posts</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{stats.followers}</StatNumber>
              <StatLabel>Followers</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{stats.following}</StatNumber>
              <StatLabel>Following</StatLabel>
            </StatItem>
          </StatsContainer>
        </ProfileHeader>

        <ProfileBody>
          <InfoSection>
            <InfoTitle>Personal Information</InfoTitle>
            <InfoItem>
              <FiMail />
              <span>{profile.email}</span>
            </InfoItem>
            {profile.phoneNumber && (
              <InfoItem>
                <FiPhone />
                <span>{profile.phoneNumber}</span>
              </InfoItem>
            )}
            <InfoItem>
              <FiMapPin />
              <span>{profile.country}</span>
            </InfoItem>
            <InfoItem>
              <FiCalendar />
              <span>Born {new Date(profile.dateOfBirth).toLocaleDateString()}</span>
            </InfoItem>
          </InfoSection>

          <EditButton onClick={() => setShowEdit(true)}>
            <FiEdit3 />
            Edit Profile
          </EditButton>
        </ProfileBody>
      </ProfileCard>

      {showEdit && (
        <ProfileEditModal
          user={profile}
          onClose={() => setShowEdit(false)}
          onSave={handleProfileSave}
        />
      )}
    </ProfileContainer>
  );
};

export default MyProfile;