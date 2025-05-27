import React, { useState, useEffect } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaCamera, FaPlus, FaTimes, FaUserPlus, FaQuestionCircle } from 'react-icons/fa';
import Calendar from 'react-calendar';
import TagSelector from '../components/TagSelector';
import '../styles/ClubSetup.css';
import 'react-calendar/dist/Calendar.css';

// Import the tag categories from the Quiz component
const { INTERESTS, COMMITMENT_LEVELS, EXPERIENCE_LEVELS } = {
  INTERESTS: [
    'Applied Innovation', 'Build', 'Research', 'Leadership & Innovation',
    'Technology', 'Business', 'Arts', 'Social Impact', 'Entrepreneurship',
    'Science', 'Cultural'
  ],
  COMMITMENT_LEVELS: [
    'Low (1-2 hrs/week)',
    'Medium (3-5 hrs/week)',
    'High (6+ hrs/week)'
  ],
  EXPERIENCE_LEVELS: [
    'Beginner Friendly',
    'Some Experience Required',
    'Advanced Skills Needed'
  ]
};

const MEMBER_LIMIT_OPTIONS = [
  { value: 10, label: '10 members' },
  { value: 25, label: '25 members' },
  { value: 50, label: '50 members' },
  { value: 100, label: '100 members' },
  { value: 500, label: '500+ members' }
];

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const ClubSetup = () => {
  const navigate = useNavigate();
  const { currentUser, updateSetupProgress, completeSetup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    memberLimit: '',
    tags: {
      interests: [],
      commitment: '',
      experience: []
    },
    meetingDays: [],
    profilePictureUrl: '',
    members: [],
    faqs: []
  });

  const [selectedDates, setSelectedDates] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' });
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [newOfficer, setNewOfficer] = useState({ name: '', role: '', email: '' });

  // Add beforeunload event listener
  useBeforeUnload(
    React.useCallback(
      (e) => {
        if (isDirty) {
          e.preventDefault();
          return (e.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
        }
      },
      [isDirty]
    )
  );

  // Calculate setup progress
  const calculateProgress = () => {
    let completedRequirements = 0;
    const totalRequirements = 5; // name, memberLimit, interests, commitment, experience

    // Check each required field
    if (clubData.name) completedRequirements++;
    if (clubData.memberLimit) completedRequirements++;
    if (clubData.tags.interests.length >= 1 && clubData.tags.interests.length <= 5) completedRequirements++;
    if (clubData.tags.commitment) completedRequirements++;
    if (clubData.tags.experience.length > 0) completedRequirements++;

    const progress = Math.round((completedRequirements / totalRequirements) * 100);
    
    // Return progress level for styling
    let progressLevel = 'low';
    if (progress >= 66) progressLevel = 'high';
    else if (progress >= 33) progressLevel = 'medium';
    
    return { progress, progressLevel };
  };

  // Update progress whenever club data changes
  useEffect(() => {
    if (isDirty) {
      const { progress } = calculateProgress();
      updateSetupProgress(progress);
    }
  }, [clubData, isDirty, updateSetupProgress]);

  const handleInputChange = (field, value) => {
    setClubData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `clubProfilePictures/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setClubData(prev => ({
        ...prev,
        profilePictureUrl: downloadURL
      }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError('Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (category, value) => {
    setClubData(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        [category]: value
      }
    }));
    setIsDirty(true);
  };

  const handleDateChange = (date) => {
    setSelectedDates(prev => {
      const dateStr = date.toISOString().split('T')[0];
      const exists = prev.find(d => d.split('T')[0] === dateStr);
      
      if (exists) {
        return prev.filter(d => d.split('T')[0] !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });

    setClubData(prev => ({
      ...prev,
      meetingDays: selectedDates
    }));
  };

  const handleAddMember = async () => {
    if (!newMember.email) {
      setError('Please enter member email');
      return;
    }

    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', newMember.email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        setError('User not found');
        return;
      }

      const userData = userSnapshot.docs[0].data();
      const userId = userSnapshot.docs[0].id;

      setClubData(prev => ({
        ...prev,
        members: [...prev.members, { id: userId, ...userData, role: newMember.role }]
      }));

      setNewMember({ name: '', email: '', role: 'member' });
      setShowAddMember(false);
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member');
    }
  };

  const handleRemoveMember = (memberId) => {
    setClubData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId)
    }));
  };

  const handleAddOfficer = () => {
    if (!newOfficer.name || !newOfficer.role || !newOfficer.email) {
      setError('Please fill all officer fields');
      return;
    }

    setClubData(prev => ({
      ...prev,
      officers: [...prev.officers, { ...newOfficer, id: Date.now() }]
    }));

    setNewOfficer({ name: '', role: '', email: '' });
    setShowAddOfficer(false);
  };

  const handleRemoveOfficer = (officerId) => {
    setClubData(prev => ({
      ...prev,
      officers: prev.officers.filter(officer => officer.id !== officerId)
    }));
  };

  const handleAddFAQ = () => {
    setClubData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const handleFAQChange = (index, field, value) => {
    setClubData(prev => {
      const newFAQs = [...prev.faqs];
      newFAQs[index] = { ...newFAQs[index], [field]: value };
      return { ...prev, faqs: newFAQs };
    });
  };

  const handleRemoveFAQ = (index) => {
    setClubData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const toggleMeetingDay = (day) => {
    setClubData(prev => ({
      ...prev,
      meetingDays: prev.meetingDays.includes(day)
        ? prev.meetingDays.filter(d => d !== day)
        : [...prev.meetingDays, day]
    }));
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { progress } = calculateProgress();
      if (progress < 100) {
        throw new Error('Please complete all required fields');
      }

      // Create club document
      const clubRef = doc(collection(db, 'clubs'));
      await setDoc(clubRef, {
        ...clubData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid
      });

      await completeSetup();
      setSuccess(true);
      setIsDirty(false);
      
      setTimeout(() => {
        navigate('/club-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating club:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const { progress, progressLevel } = calculateProgress();

  return (
    <div className="club-setup-container">
      <div className="setup-header">
        <h1>Create Your Club</h1>
        <div className="setup-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
              data-progress={progressLevel}
            />
          </div>
          <span>{progress}%</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Club created successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="setup-form">
        <div className="setup-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Club Name *</label>
            <input
              type="text"
              value={clubData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter club name"
              required
            />
          </div>

          <div className="form-group">
            <label>Member Limit *</label>
            <select
              value={clubData.memberLimit}
              onChange={(e) => handleInputChange('memberLimit', e.target.value)}
              required
            >
              <option value="">Select member limit</option>
              {MEMBER_LIMIT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Club Description (Optional)</label>
            <textarea
              value={clubData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter club description"
              rows={5}
            />
          </div>
        </div>

        <div className="setup-section">
          <h2>Club Tags</h2>
          <div className="tags-section">
            <div className="tag-category">
              <h3>Interests * (1-5 tags)</h3>
              <TagSelector
                options={INTERESTS}
                selected={clubData.tags.interests}
                onChange={(values) => handleTagChange('interests', values)}
                multiple
                max={5}
                required
              />
            </div>

            <div className="tag-category">
              <h3>Time Commitment *</h3>
              <TagSelector
                options={COMMITMENT_LEVELS}
                selected={clubData.tags.commitment}
                onChange={(value) => handleTagChange('commitment', value)}
                required
              />
            </div>

            <div className="tag-category">
              <h3>Experience Level *</h3>
              <TagSelector
                options={EXPERIENCE_LEVELS}
                selected={clubData.tags.experience}
                onChange={(values) => handleTagChange('experience', values)}
                multiple
                required
              />
            </div>
          </div>
        </div>

        <div className="setup-section">
          <h2>Meeting Days (Optional)</h2>
          <div className="meeting-days">
            {DAYS_OF_WEEK.map(day => (
              <label key={day} className="day-checkbox">
                <input
                  type="checkbox"
                  checked={clubData.meetingDays.includes(day)}
                  onChange={() => toggleMeetingDay(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || progress < 100}
        >
          {loading ? 'Creating...' : progress < 100 ? 'Complete Required Fields' : 'Create Club'}
        </button>
      </form>
    </div>
  );
};

export default ClubSetup; 