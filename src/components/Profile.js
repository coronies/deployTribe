import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage, db, auth } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { 
  FaCamera, 
  FaTrash, 
  FaLinkedin, 
  FaGithub, 
  FaTwitter, 
  FaInstagram, 
  FaFacebook, 
  FaYoutube, 
  FaTiktok, 
  FaSnapchat, 
  FaDiscord, 
  FaSlack, 
  FaTelegram, 
  FaWhatsapp, 
  FaGlobe,
  FaReddit,
  FaPinterest,
  FaTwitch,
  FaSpotify,
  FaFileUpload,
  FaFile,
  FaDownload
} from 'react-icons/fa';
import '../styles/Profile.css';

const Profile = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    major: '',
    graduationYear: '',
    interests: [],
    skills: [],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      tiktok: '',
      snapchat: '',
      discord: '',
      slack: '',
      telegram: '',
      whatsapp: '',
      reddit: '',
      pinterest: '',
      twitch: '',
      spotify: '',
      portfolio: ''
    },
    resume: null,
    profileImage: null,
    joinedClubs: []
  });
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfileData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData(prev => ({
          ...prev,
          ...data,
          socialLinks: {
            ...prev.socialLinks,
            ...(data.socialLinks || {})
          }
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Error loading profile data');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError('');
      setSuccess('');
      setUploadingImage(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Create a unique filename with timestamp to prevent caching
      const timestamp = Date.now();
      const filename = `profile_${currentUser.uid}_${timestamp}`;
      const storageRef = ref(storage, `profile_images/${currentUser.uid}/${filename}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Auth profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profileImage: downloadURL,
        lastUpdated: serverTimestamp()
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        profileImage: downloadURL
      }));

      // Refresh user data in context
      await refreshUserData(auth.currentUser);
      setSuccess('Profile picture updated successfully!');

    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!currentUser?.uid || !profileData.profileImage) {
      setError('You must be logged in to delete your profile image');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setUploadingImage(true);

      // Delete the image from storage if it exists
      if (profileData.profileImage && profileData.profileImage.includes('firebase')) {
        try {
          // Create a reference directly to the user's profile images folder
          const imageFileName = profileData.profileImage.split('/').pop().split('?')[0];
          const imageRef = ref(storage, `profile_images/${currentUser.uid}/${imageFileName}`);
          await deleteObject(imageRef);
        } catch (deleteError) {
          console.warn('Could not delete image from storage:', deleteError);
        }
      }

      // Update Firestore first
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profileImage: null,
        lastUpdated: serverTimestamp()
      });

      // Then update Auth profile
      try {
        await updateProfile(auth.currentUser, {
          photoURL: ''  // Use empty string instead of null
        });
      } catch (authError) {
        console.warn('Could not update auth profile:', authError);
      }

      // Update local state
      setProfileData(prev => ({
        ...prev,
        profileImage: null
      }));

      setSuccess('Profile picture removed successfully!');

    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err.message || 'Failed to delete image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Update Auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.fullName
      });

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...profileData,
        lastUpdated: serverTimestamp()
      });

      // Refresh user data
      await auth.currentUser.reload();
      await refreshUserData(auth.currentUser);
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const getDefaultAvatar = () => {
    return profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'T';
  };

  const getSocialIcon = (platform) => {
    const iconMap = {
      linkedin: <FaLinkedin />,
      github: <FaGithub />,
      twitter: <FaTwitter />,
      instagram: <FaInstagram />,
      facebook: <FaFacebook />,
      youtube: <FaYoutube />,
      tiktok: <FaTiktok />,
      snapchat: <FaSnapchat />,
      discord: <FaDiscord />,
      slack: <FaSlack />,
      telegram: <FaTelegram />,
      whatsapp: <FaWhatsapp />,
      reddit: <FaReddit />,
      pinterest: <FaPinterest />,
      twitch: <FaTwitch />,
      spotify: <FaSpotify />,
      portfolio: <FaGlobe />
    };
    return iconMap[platform] || <FaGlobe />;
  };

  const getSocialColor = (platform) => {
    const colorMap = {
      linkedin: '#0077b5',
      github: '#333',
      twitter: '#1da1f2',
      instagram: '#e4405f',
      facebook: '#1877f2',
      youtube: '#ff0000',
      tiktok: '#000000',
      snapchat: '#fffc00',
      discord: '#5865f2',
      slack: '#4a154b',
      telegram: '#0088cc',
      whatsapp: '#25d366',
      reddit: '#ff4500',
      pinterest: '#bd081c',
      twitch: '#9146ff',
      spotify: '#1db954',
      portfolio: '#4299e1'
    };
    return colorMap[platform] || '#4299e1';
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError('');
      setSuccess('');
      setUploadingImage(true); // Reuse the loading state

      // Validate file type
      if (!file.type.includes('pdf')) {
        throw new Error('Please upload a PDF file');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Resume size should be less than 10MB');
      }

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `resume_${currentUser.uid}_${timestamp}.pdf`;
      const storageRef = ref(storage, `resumes/${currentUser.uid}/${filename}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        resume: {
          url: downloadURL,
          name: file.name,
          uploadedAt: serverTimestamp()
        }
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        resume: {
          url: downloadURL,
          name: file.name
        }
      }));

      setSuccess('Resume uploaded successfully!');
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!currentUser?.uid || !profileData.resume?.url) return;

    try {
      setError('');
      setSuccess('');
      setUploadingImage(true);

      // Delete the file from storage
      if (profileData.resume.url.includes('firebase')) {
        try {
          const resumeFileName = profileData.resume.url.split('/').pop().split('?')[0];
          const resumeRef = ref(storage, `resumes/${currentUser.uid}/${resumeFileName}`);
          await deleteObject(resumeRef);
        } catch (deleteError) {
          console.warn('Could not delete resume from storage:', deleteError);
        }
      }

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        resume: null
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        resume: null
      }));

      setSuccess('Resume removed successfully!');
    } catch (err) {
      console.error('Error deleting resume:', err);
      setError(err.message || 'Failed to delete resume');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading profile...</p>
      </div>
    );
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              <button 
                onClick={handleDeleteImage} 
                className="delete-image-button"
                disabled={uploadingImage}
                title="Remove photo"
                aria-label="Remove profile photo"
              >
                <FaTrash />
              </button>
            </>
          ) : (
            <div className="default-avatar">
              {getDefaultAvatar()}
            </div>
          )}
          <div className="image-upload-container">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-upload"
              id="image-upload"
              disabled={uploadingImage}
            />
            <label 
              htmlFor="image-upload" 
              className={`image-upload-label ${uploadingImage ? 'uploading' : ''}`}
              aria-label={uploadingImage ? 'Uploading...' : 'Change profile photo'}
            >
              {uploadingImage ? (
                <>
                  <div className="spinner"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaCamera className="camera-icon" />
                  <span>Change Photo</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="profile-info">
          <h1>{profileData.fullName || 'Your Name'}</h1>
          <p className="major">
            {profileData.major} 
            {profileData.graduationYear && ` • Class of ${profileData.graduationYear}`}
          </p>
          {profileData.bio && <p className="bio">{profileData.bio}</p>}
          
          {/* Social Media Icons */}
          <div className="social-icons">
            {Object.entries(profileData.socialLinks).map(([platform, url]) => (
              url && (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  style={{ color: getSocialColor(platform) }}
                  title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                >
                  {getSocialIcon(platform)}
                </a>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Add this before the social media links section */}
      <div className="resume-section">
        <h3>Resume</h3>
        <div className="resume-container">
          {profileData.resume ? (
            <div className="resume-preview">
              <div className="resume-info">
                <FaFile className="resume-icon" />
                <span className="resume-name">{profileData.resume.name}</span>
              </div>
              <div className="resume-actions">
                <a 
                  href={profileData.resume.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resume-download-button"
                  title="Download Resume"
                >
                  <FaDownload />
                  <span>Download</span>
                </a>
                <button
                  onClick={handleDeleteResume}
                  className="resume-delete-button"
                  disabled={uploadingImage}
                  title="Delete Resume"
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="resume-upload">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="resume-input"
                id="resume-upload"
                disabled={uploadingImage}
              />
              <label 
                htmlFor="resume-upload" 
                className={`resume-upload-label ${uploadingImage ? 'uploading' : ''}`}
              >
                {uploadingImage ? (
                  <>
                    <div className="spinner"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FaFileUpload className="upload-icon" />
                    <span>Upload Resume (PDF)</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className="profile-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={profileData.fullName}
            onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="major">Major</label>
            <input
              type="text"
              id="major"
              value={profileData.major}
              onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
              placeholder="Your major"
            />
          </div>

          <div className="form-group">
            <label htmlFor="graduationYear">Graduation Year</label>
            <input
              type="number"
              id="graduationYear"
              value={profileData.graduationYear}
              onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: e.target.value }))}
              placeholder="2024"
              min="2020"
              max="2030"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="social-links-section">
          <h3>Social Media Links</h3>
          <div className="social-links-grid">
            {Object.entries(profileData.socialLinks).map(([platform, url]) => (
              <div key={platform} className="social-link-item">
                <div className="social-icon-label" style={{ color: getSocialColor(platform) }}>
                  {getSocialIcon(platform)}
                  <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                  }))}
                  placeholder={`Your ${platform} URL`}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile; 