import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage, db, auth } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaGlobe } from 'react-icons/fa';
import '../styles/Profile.css';

const MAX_IMAGE_SIZE = 300; // Maximum width/height for profile images

const resizeImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_IMAGE_SIZE) {
            height = Math.round((height * MAX_IMAGE_SIZE) / width);
            width = MAX_IMAGE_SIZE;
          }
        } else {
          if (height > MAX_IMAGE_SIZE) {
            width = Math.round((width * MAX_IMAGE_SIZE) / height);
            height = MAX_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          }));
        }, 'image/jpeg', 0.8); // 0.8 quality for good balance of size and quality
      };
    };
  });
};

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
      portfolio: ''
    },
    resume: null,
    profileImage: null,
    joinedClubs: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Error loading profile data');
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
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

      // Force refresh the auth token to get updated user data
      await auth.currentUser.reload();
      
      // Refresh the user data in context
      await refreshUserData(auth.currentUser);
      
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setMessage('Processing image...');

      // Resize image before upload
      const resizedImage = await resizeImage(file);
      
      setMessage('Uploading image...');

      // Create a reference with a fixed name (overwrite existing)
      const storageRef = ref(storage, `profile_images/${currentUser.uid}/profile-image`);
      
      // Upload the resized file
      const uploadResult = await uploadBytes(storageRef, resizedImage);
      console.log('Upload successful:', uploadResult);

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL:', downloadURL);

      // Update Firebase Auth profile
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

      // Refresh the user data in context
      await refreshUserData(auth.currentUser);

      setMessage('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage(`Upload failed: ${error.message}`);
    }
  };

  // Cleanup function for temporary URLs
  useEffect(() => {
    return () => {
      if (profileData.profileImage && profileData.profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.profileImage);
      }
    };
  }, [profileData.profileImage]);

  // Update the useEffect to handle image loading
  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadUserProfile = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfileData(prev => ({
            ...prev,
            ...userData
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [currentUser]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setMessage('Uploading resume...');

      // Create a reference with a fixed name (overwrite existing)
      const storageRef = ref(storage, `resumes/${currentUser.uid}/current-resume`);
      
      // Upload the file
      const uploadResult = await uploadBytes(storageRef, file);
      console.log('Resume upload successful:', uploadResult);

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Resume URL:', downloadURL);

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        resume: downloadURL,
        resumeFileName: file.name,
        lastUpdated: serverTimestamp()
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        resume: downloadURL,
        resumeFileName: file.name
      }));

      setMessage('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessage(`Resume upload failed: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card neomorphic">
        <div className="profile-header neomorphic-inset">
          <div className="profile-image-container">
            <img 
              src={profileData.profileImage || currentUser?.photoURL || '/default-avatar.png'} 
              alt={profileData.fullName || 'Profile'} 
              className="profile-image neomorphic"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-upload"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="image-upload-label neomorphic-button">
              Change Photo
            </label>
            {message && <div className="upload-message">{message}</div>}
          </div>
          <div className="profile-info">
            <h1>{profileData.fullName || 'Your Name'}</h1>
            <p className="major">
              {profileData.major ? `${profileData.major}${profileData.graduationYear ? ` • Class of ${profileData.graduationYear}` : ''}` : 'Add your major and graduation year'}
            </p>
            <div className="social-links">
              {Object.entries(profileData.socialLinks).map(([platform, url]) => {
                if (!url) return null;
                const Icon = {
                  linkedin: FaLinkedin,
                  github: FaGithub,
                  twitter: FaTwitter,
                  instagram: FaInstagram,
                  portfolio: FaGlobe
                }[platform];
                return Icon ? (
                  <a 
                    key={platform}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon neomorphic"
                  >
                    <Icon />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>

        <div className="profile-body">
          <form onSubmit={handleProfileUpdate}>
            <div className="form-section neomorphic">
              <h2>Basic Information</h2>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Full Name"
                className="neomorphic-input"
              />
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Bio"
                className="neomorphic-input"
              />
              <input
                type="text"
                value={profileData.major}
                onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                placeholder="Major"
                className="neomorphic-input"
              />
              <input
                type="number"
                value={profileData.graduationYear}
                onChange={(e) => setProfileData(prev => ({ ...prev, graduationYear: e.target.value }))}
                placeholder="Graduation Year"
                className="neomorphic-input"
              />
            </div>

            <div className="form-section neomorphic">
              <h2>Social Links</h2>
              {Object.keys(profileData.socialLinks).map(platform => (
                <input
                  key={platform}
                  type="url"
                  value={profileData.socialLinks[platform]}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                  }))}
                  placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                  className="neomorphic-input"
                />
              ))}
            </div>

            <div className="form-section neomorphic">
              <h2>Resume</h2>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="resume-upload"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="resume-upload-label neomorphic-button">
                {profileData.resume ? 'Update Resume' : 'Upload Resume'}
              </label>
              {profileData.resume && (
                <div className="resume-info">
                  <a 
                    href={profileData.resume} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="view-resume neomorphic-button"
                  >
                    View Current Resume
                  </a>
                  <span className="resume-filename">
                    {profileData.resumeFileName || 'Resume'}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="save-button neomorphic-button">Save Changes</button>
          </form>
        </div>

        {profileData.joinedClubs?.length > 0 && (
          <div className="clubs-section neomorphic">
            <h2>Club Memberships</h2>
            <div className="clubs-grid">
              {profileData.joinedClubs.map((club, index) => (
                <div key={index} className="club-card neomorphic">
                  <img src={club.clubLogo || 'default-club.png'} alt={club.clubName} className="neomorphic" />
                  <h3>{club.clubName}</h3>
                  <p>Joined: {new Date(club.joinDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && <div className="message neomorphic">{message}</div>}
      </div>
    </div>
  );
};

export default Profile; 