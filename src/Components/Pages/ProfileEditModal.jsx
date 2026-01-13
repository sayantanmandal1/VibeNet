import React, { useState } from "react";
import styled from "styled-components";
import { FiCamera, FiX } from "react-icons/fi";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
`;

const Modal = styled.div`
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  
  &:hover {
    color: #ffffff;
  }
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  color: #ffffff;
  font-weight: 700;
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f0f0;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FormGroup = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    
    &:hover {
      background: rgba(255, 255, 255, 0.12);
    }
  `}
`;

const ProfileEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    phoneNumber: user?.phoneNumber || "",
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState(user?.profileImage || "/src/assets/user-default.jpg");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FiX />
        </CloseButton>
        
        <Title>Edit Profile</Title>
        
        <AvatarContainer>
          <Avatar src={previewImage} alt="Profile" />
          <AvatarOverlay onClick={() => document.getElementById('avatar-input').click()}>
            <FiCamera size={24} color="white" />
          </AvatarOverlay>
          <HiddenInput
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </AvatarContainer>
        
        <FormGroup>
          <Label>Name</Label>
          <Input
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder="Enter your name"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Bio</Label>
          <TextArea
            value={formData.bio}
            onChange={e => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            maxLength={500}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Phone Number</Label>
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={e => handleInputChange('phoneNumber', e.target.value)}
            placeholder="Enter your phone number"
          />
        </FormGroup>
        
        <ButtonGroup>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button primary onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default ProfileEditModal;