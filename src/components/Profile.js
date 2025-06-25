import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase/config';
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Check localStorage for profile image first
      const profileKey = `profile_image_${currentUser.uid}`;
      const localProfileImage = localStorage.getItem(profileKey);
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData(prev => ({
          ...prev,
          ...data,
          // Prioritize localStorage image, then Firestore, then Auth
          profileImage: localProfileImage || (data.profileImage && data.profileImage !== 'stored_locally' ? data.profileImage : null) || currentUser.photoURL || null,
          socialLinks: {
            ...prev.socialLinks,
            ...(data.socialLinks || {})
          }
        }));
      } else {
        // If no Firestore document exists, use data from Firebase Auth or localStorage
        setProfileData(prev => ({
          ...prev,
          fullName: currentUser.displayName || '',
          profileImage: localProfileImage || currentUser.photoURL || null
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
        throw new Error('Please select an image file (JPEG, PNG, etc.)');
      }

      // Validate file size (max 1MB for better performance)
      if (file.size > 1024 * 1024) {
        throw new Error('Image size should be less than 1MB for demo purposes');
      }

      // Convert to base64 for local storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64URL = event.target.result;
          
          // Store in localStorage for immediate persistence
          const profileKey = `profile_image_${currentUser.uid}`;
          localStorage.setItem(profileKey, base64URL);
          
          // Update local state immediately for instant feedback
          setProfileData(prev => ({
            ...prev,
            profileImage: base64URL
          }));

          // Store in Firestore (but don't rely on it for display)
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            profileImage: 'stored_locally', // Just a flag that image exists
            lastUpdated: serverTimestamp()
          });
          
          console.log('Profile image stored locally and flag saved to Firestore');
          
          // Dispatch custom event to update header profile image
          window.dispatchEvent(new CustomEvent('profileImageUpdated'));
          
          setSuccess('Profile picture updated successfully!');
        } catch (err) {
          console.error('Error updating profile:', err);
          setError(err.message || 'Failed to update profile picture. Please try again.');
          
          // Reset on error
          setProfileData(prev => ({
            ...prev,
            profileImage: currentUser.photoURL || null
          }));
        } finally {
          setUploadingImage(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read the image file. Please try again.');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setError('');
      setSuccess('');

      // Remove from localStorage
      const profileKey = `profile_image_${currentUser.uid}`;
      localStorage.removeItem(profileKey);

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        profileImage: null,
        lastUpdated: serverTimestamp()
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        profileImage: null
      }));

      // Dispatch custom event to update header profile image
      window.dispatchEvent(new CustomEvent('profileImageUpdated'));
      
      setSuccess('Profile picture removed successfully!');
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image. Please try again.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Prepare enhanced profile data for member cards
      const enhancedProfileData = {
        ...profileData,
        // Ensure we have the localStorage profile image
        profileImage: profileData.profileImage || localStorage.getItem(`profile_image_${currentUser.uid}`) || null,
        // Add metadata for member display
        email: currentUser.email,
        uid: currentUser.uid,
        displayName: profileData.fullName || currentUser.displayName,
        // Add fields useful for member cards
        isProfileComplete: !!(profileData.fullName && profileData.major && profileData.bio),
        memberSince: profileData.memberSince || serverTimestamp(),
        lastActive: serverTimestamp(),
        // Social links count for member card display
        socialLinksCount: Object.values(profileData.socialLinks).filter(link => link && link.trim()).length,
        // Resume status
        hasResume: !!(profileData.resume && profileData.resume.url)
      };

      // Update Auth profile with display name and photo URL
      await updateProfile(auth.currentUser, {
        displayName: enhancedProfileData.fullName,
        photoURL: enhancedProfileData.profileImage
      });

      // Update Firestore with enhanced profile data
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...enhancedProfileData,
        lastUpdated: serverTimestamp()
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        ...enhancedProfileData
      }));

      // Refresh user data
      await auth.currentUser.reload();
      await refreshUserData(auth.currentUser);
      
      setSuccess('Profile updated successfully! Your information is now available for club member displays.');
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

      // Convert PDF to data URL for local storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dataURL = event.target.result;

          // Update Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            resume: {
              url: dataURL,
              name: file.name,
              uploadedAt: serverTimestamp()
            }
          });

          // Update local state
          setProfileData(prev => ({
            ...prev,
            resume: {
              url: dataURL,
              name: file.name
            }
          }));

          setSuccess('Resume uploaded successfully!');
        } catch (err) {
          console.error('Error updating resume:', err);
          setError(err.message || 'Failed to upload resume. Please try again.');
        } finally {
          setUploadingImage(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read the resume file.');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError(err.message || 'Failed to upload resume');
      setUploadingImage(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!currentUser?.uid || !profileData.resume?.url) return;

    try {
      setError('');
      setSuccess('');
      setUploadingImage(true);

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

  // Auto-save functionality
  const autoSaveProfile = useCallback(async (data) => {
    if (!currentUser || isAutoSaving) return;
    
    try {
      setIsAutoSaving(true);
      
      // Prepare enhanced profile data for auto-save
      const enhancedProfileData = {
        ...data,
        profileImage: data.profileImage || localStorage.getItem(`profile_image_${currentUser.uid}`) || null,
        email: currentUser.email,
        uid: currentUser.uid,
        displayName: data.fullName || currentUser.displayName,
        isProfileComplete: !!(data.fullName && data.major && data.bio),
        memberSince: data.memberSince || serverTimestamp(),
        lastActive: serverTimestamp(),
        socialLinksCount: Object.values(data.socialLinks).filter(link => link && link.trim()).length,
        hasResume: !!(data.resume && data.resume.url)
      };

      // Update Firestore with enhanced profile data
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...enhancedProfileData,
        lastUpdated: serverTimestamp()
      });

      setHasUnsavedChanges(false);
      console.log('Profile auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [currentUser, isAutoSaving]);

  // Debounced auto-save (save 2 seconds after user stops typing)
  useEffect(() => {
    if (!hasUnsavedChanges || !currentUser) return;
    
    const timeoutId = setTimeout(() => {
      autoSaveProfile(profileData);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [profileData, hasUnsavedChanges, autoSaveProfile, currentUser]);

  // Save before leaving the page
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (hasUnsavedChanges && currentUser) {
        // Try to save immediately
        await autoSaveProfile(profileData);
        
        // Show browser warning
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnsavedChanges && currentUser) {
        // Save when tab becomes hidden
        autoSaveProfile(profileData);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasUnsavedChanges, profileData, autoSaveProfile, currentUser]);

  // Updated setProfileData to track changes
  const updateProfileData = useCallback((updater) => {
    setProfileData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      setHasUnsavedChanges(true);
      return newData;
    });
  }, []);

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
              />
              <button 
                onClick={handleDeleteImage} 
                className="delete-image-button"
                disabled={uploadingImage}
                title="Remove photo"
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

      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="autosave-indicator">
          <div className="spinner"></div>
          <span>Auto-saving...</span>
        </div>
      )}

      {hasUnsavedChanges && !isAutoSaving && (
        <div className="unsaved-changes-indicator">
          <span>⚠️ You have unsaved changes. They will be saved automatically.</span>
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className="profile-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={profileData.fullName}
            onChange={(e) => updateProfileData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => updateProfileData(prev => ({ ...prev, bio: e.target.value }))}
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
              onChange={(e) => updateProfileData(prev => ({ ...prev, major: e.target.value }))}
              placeholder="Your major"
            />
          </div>

          <div className="form-group">
            <label htmlFor="graduationYear">Graduation Year</label>
            <input
              type="number"
              id="graduationYear"
              value={profileData.graduationYear}
              onChange={(e) => updateProfileData(prev => ({ ...prev, graduationYear: e.target.value }))}
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
                  onChange={(e) => updateProfileData(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                  }))}
                  placeholder={`Your ${platform} URL`}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={isAutoSaving}>
          {isAutoSaving ? (
            <>
              <div className="spinner"></div>
              Auto-saving...
            </>
          ) : hasUnsavedChanges ? (
            'Save Profile Now'
          ) : (
            '✓ Profile Saved'
          )}
        </button>
      </form>
    </div>
  );
};

export default Profile; 