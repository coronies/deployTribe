import React, { useState } from 'react';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiUpload, FiAlertCircle } from 'react-icons/fi';

const ProfileImageUpload = ({ userId, onImageUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset states
    setUploading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile_images/${userId}/${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Call the callback with the URL
      onImageUpload(downloadURL);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-image-upload">
      <label className={`upload-button ${uploading ? 'uploading' : ''}`}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploading}
        />
        <FiUpload className="upload-icon" />
        <span>{uploading ? 'Uploading...' : 'Change Profile Picture'}</span>
      </label>

      {error && (
        <div className="error-message">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .profile-image-upload {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #4299e1;
          color: white;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-button:hover {
          background: #3182ce;
        }

        .upload-button.uploading {
          background: #90cdf4;
          cursor: not-allowed;
        }

        .upload-button input {
          display: none;
        }

        .upload-icon {
          font-size: 1.25rem;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e53e3e;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default ProfileImageUpload; 