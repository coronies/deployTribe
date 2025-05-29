import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { FiMoon, FiSun, FiGlobe, FiBell, FiLock, FiMail, FiPhone } from 'react-icons/fi';
import '../styles/AccountSettings.css';

const AccountSettings = () => {
  const { currentUser, refreshUserData } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // General Settings State
  const [settings, setSettings] = useState({
    theme: isDarkMode ? 'dark' : 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      events: true,
      messages: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    }
  });

  // Account Details State
  const [accountDetails, setAccountDetails] = useState({
    email: currentUser?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });

  // Load user settings from Firestore
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.settings) {
            setSettings(prevSettings => ({
              ...prevSettings,
              ...data.settings
            }));
          }
          if (data.phone) {
            setAccountDetails(prev => ({
              ...prev,
              phone: data.phone
            }));
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setError('Failed to load settings');
      }
    };

    loadUserSettings();
  }, [currentUser]);

  // Handle theme toggle
  const handleThemeChange = async (theme) => {
    try {
      setSettings(prev => ({ ...prev, theme }));
      toggleTheme(); // This will trigger the ThemeContext to update
      document.documentElement.setAttribute('data-theme', theme);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'settings.theme': theme
      });
      
      setSuccess('Theme updated successfully');
    } catch (error) {
      setError('Failed to update theme');
    }
  };

  // Handle notification settings
  const handleNotificationChange = async (key) => {
    try {
      const newSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          [key]: !settings.notifications[key]
        }
      };
      
      setSettings(newSettings);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'settings.notifications': newSettings.notifications
      });
      
      setSuccess('Notification settings updated');
    } catch (error) {
      setError('Failed to update notification settings');
    }
  };

  // Handle privacy settings
  const handlePrivacyChange = async (key, value) => {
    try {
      const newSettings = {
        ...settings,
        privacy: {
          ...settings.privacy,
          [key]: value
        }
      };
      
      setSettings(newSettings);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'settings.privacy': newSettings.privacy
      });
      
      setSuccess('Privacy settings updated');
    } catch (error) {
      setError('Failed to update privacy settings');
    }
  };

  // Validate password as user types
  const validatePassword = (password, confirmPassword) => {
    setPasswordValidation({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      passwordsMatch: password === confirmPassword
    });
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setAccountDetails(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword' || name === 'confirmPassword') {
      validatePassword(
        name === 'newPassword' ? value : accountDetails.newPassword,
        name === 'confirmPassword' ? value : accountDetails.confirmPassword
      );
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!accountDetails.currentPassword) {
        throw new Error('Current password is required');
      }

      if (!accountDetails.newPassword) {
        throw new Error('New password is required');
      }

      // Check if all password requirements are met
      const validationFailed = Object.entries(passwordValidation)
        .filter(([key]) => key !== 'passwordsMatch')
        .some(([_, isValid]) => !isValid);

      if (validationFailed) {
        throw new Error('Password does not meet all requirements');
      }

      if (!passwordValidation.passwordsMatch) {
        throw new Error('New passwords do not match');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        accountDetails.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, accountDetails.newPassword);
      
      setAccountDetails(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setSuccess('Password updated successfully');
    } catch (error) {
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number update
  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        phone: accountDetails.phone
      });
      
      setSuccess('Phone number updated successfully');
    } catch (error) {
      setError('Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h1>Account Settings</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* General Settings Section */}
      <section className="settings-section">
        <h2>General Settings</h2>
        
        {/* Theme Settings */}
        <div className="setting-group">
          <h3><FiSun /> Appearance</h3>
          <div className="theme-toggle">
            <button
              className={settings.theme === 'light' ? 'active' : ''}
              onClick={() => handleThemeChange('light')}
            >
              <FiSun /> Light
            </button>
            <button
              className={settings.theme === 'dark' ? 'active' : ''}
              onClick={() => handleThemeChange('dark')}
            >
              <FiMoon /> Dark
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="setting-group">
          <h3><FiGlobe /> Language</h3>
          <select
            value={settings.language}
            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Notification Settings */}
        <div className="setting-group">
          <h3><FiBell /> Notifications</h3>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={() => handleNotificationChange('email')}
              />
              Email Notifications
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={() => handleNotificationChange('push')}
              />
              Push Notifications
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.events}
                onChange={() => handleNotificationChange('events')}
              />
              Event Updates
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.notifications.messages}
                onChange={() => handleNotificationChange('messages')}
              />
              Message Notifications
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="setting-group">
          <h3><FiLock /> Privacy</h3>
          <div className="privacy-settings">
            <div className="privacy-option">
              <label>Profile Visibility</label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              >
                <option value="public">Public</option>
                <option value="members">Members Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            <label>
              <input
                type="checkbox"
                checked={settings.privacy.showEmail}
                onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
              />
              Show email on profile
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.privacy.showPhone}
                onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
              />
              Show phone number on profile
            </label>
          </div>
        </div>
      </section>

      {/* Account Details Section */}
      <section className="settings-section">
        <h2>Account Details</h2>
        
        {/* Email Display */}
        <div className="setting-group">
          <h3><FiMail /> Email Address</h3>
          <div className="form-group">
            <input
              type="email"
              value={accountDetails.email}
              disabled
              className="readonly-input"
            />
            <p className="help-text">Contact support to change your email address</p>
          </div>
        </div>

        {/* Phone Settings */}
        <div className="setting-group">
          <h3><FiPhone /> Phone Number</h3>
          <form onSubmit={handlePhoneUpdate} className="detail-form">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={accountDetails.phone}
                onChange={(e) => setAccountDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <button type="submit" disabled={loading}>
              Update Phone
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="setting-group">
          <h3><FiLock /> Change Password</h3>
          <form onSubmit={handlePasswordUpdate} className="detail-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={accountDetails.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={accountDetails.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
              <div className="password-requirements">
                <p className={passwordValidation.hasMinLength ? 'valid' : ''}>
                  ✓ At least 8 characters
                </p>
                <p className={passwordValidation.hasUpperCase ? 'valid' : ''}>
                  ✓ At least one uppercase letter
                </p>
                <p className={passwordValidation.hasLowerCase ? 'valid' : ''}>
                  ✓ At least one lowercase letter
                </p>
                <p className={passwordValidation.hasNumber ? 'valid' : ''}>
                  ✓ At least one number
                </p>
                <p className={passwordValidation.hasSpecialChar ? 'valid' : ''}>
                  ✓ At least one special character
                </p>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={accountDetails.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
              {accountDetails.confirmPassword && (
                <p className={`password-match ${passwordValidation.passwordsMatch ? 'valid' : ''}`}>
                  {passwordValidation.passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
            <button 
              type="submit" 
              disabled={loading || !Object.values(passwordValidation).every(Boolean)}
              className={Object.values(passwordValidation).every(Boolean) ? 'ready' : ''}
            >
              Update Password
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AccountSettings; 