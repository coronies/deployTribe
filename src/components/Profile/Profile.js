import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storage, db, auth } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    major: '',
    graduationYear: '',
    profileImage: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get first letter of name for default avatar
  const getDefaultAvatar = () => {
    if (profileData.fullName) {
      return profileData.fullName.charAt(0).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U'; // Default to 'U' for User if no name or email
  };

  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  const loadProfileData = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!currentUser || !profileData.profileImage) return;

    try {
      setError('');
      setLoading(true);

      // Get the storage reference from the profile image URL
      const imageRef = ref(storage, profileData.profileImage);
      
      // Delete the image from storage
      await deleteObject(imageRef);

      // Update Auth profile
      await updateProfile(currentUser, {
        photoURL: null
      });

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profileImage: null
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        profileImage: null
      }));

    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err.message || 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError('');
      setLoading(true);
      setUploadProgress(0);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Delete existing image if there is one
      if (profileData.profileImage) {
        const oldImageRef = ref(storage, profileData.profileImage);
        try {
          await deleteObject(oldImageRef);
        } catch (err) {
          console.warn('Failed to delete old image:', err);
        }
      }

      // Create a unique filename
      const filename = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `profile_images/${currentUser.uid}/${filename}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Auth profile
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profileImage: downloadURL
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        profileImage: downloadURL
      }));

    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-image-container">
          {profileData.profileImage ? (
            <>
              <img 
                src={profileData.profileImage}
                alt={profileData.fullName || 'Profile'} 
                className="profile-image"
              />
              <button 
                onClick={handleDeleteImage} 
                className="delete-image-button"
                disabled={loading}
                title="Remove photo"
              >
                ×
              </button>
            </>
          ) : (
            <div className="default-avatar">
              {getDefaultAvatar()}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="image-upload"
            id="image-upload"
            disabled={loading}
          />
          <label htmlFor="image-upload" className="image-upload-label">
            {loading ? 'Uploading...' : 'Change Photo'}
          </label>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              Uploading: {Math.round(uploadProgress)}%
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1>{profileData.fullName || 'Your Name'}</h1>
          <p className="major">
            {profileData.major} 
            {profileData.graduationYear && ` • Class of ${profileData.graduationYear}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default Profile; 