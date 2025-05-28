import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { FiAlertCircle } from 'react-icons/fi';

const Profile = () => {
  const { currentUser } = useAuth();
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleImageUpload = async (imageUrl) => {
    try {
      setUpdateError(null);
      setUpdateSuccess(false);

      if (!currentUser) {
        throw new Error('You must be logged in to update your profile');
      }

      // Update user profile with new image URL
      await updateProfile(currentUser, {
        photoURL: imageUrl
      });
      
      setUpdateSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(error.message || 'Failed to update profile picture');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-image-container">
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className="profile-image"
            />
          ) : (
            <div className="profile-image-placeholder">
              {currentUser?.displayName?.[0] || 'T'}
            </div>
          )}
          <ProfileImageUpload 
            userId={currentUser?.uid} 
            onImageUpload={handleImageUpload}
          />
          
          {updateError && (
            <div className="error-message">
              <FiAlertCircle />
              <span>{updateError}</span>
            </div>
          )}
          
          {updateSuccess && (
            <div className="success-message">
              Profile picture updated successfully!
            </div>
          )}
        </div>
      </div>

      {/* Rest of your profile form */}

      <style jsx>{`
        .profile-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .profile-header {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .profile-image-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .profile-image,
        .profile-image-placeholder {
          width: 128px;
          height: 128px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-image-placeholder {
          background: #4299e1;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e53e3e;
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
          background: #fff5f5;
          border-radius: 6px;
        }

        .success-message {
          color: #2f855a;
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
          background: #f0fff4;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default Profile; 