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

const TIME_SLOTS = [
  { id: 1, time: '9:00 - 11:00', period: 'Morning' },
  { id: 2, time: '11:00 - 13:00', period: 'Morning' },
  { id: 3, time: '13:00 - 15:00', period: 'Afternoon' },
  { id: 4, time: '15:00 - 17:00', period: 'Afternoon' },
  { id: 5, time: '17:00 - 19:00', period: 'Evening' },
  { id: 6, time: '19:00 - 21:00', period: 'Evening' }
];

const DaySection = ({ day, selectedSlots, onSlotSelect }) => {
  return (
    <div className="time-day-section">
      <div className="time-day-header">
        <h3>{day}</h3>
      </div>
      <div className="time-slots-grid">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot.id}
            onClick={() => {
              const newSelected = selectedSlots.includes(slot.time)
                ? selectedSlots.filter(time => time !== slot.time)
                : [...selectedSlots, slot.time];
              onSlotSelect(day.toLowerCase(), newSelected);
            }}
            className={`time-slot-btn ${day.toLowerCase()} ${selectedSlots.includes(slot.time) ? 'selected' : ''}`}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};

const ClubSetup = () => {
  const navigate = useNavigate();
  const { currentUser, updateSetupProgress, completeSetup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});
  const [existingClub, setExistingClub] = useState(null);

  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    memberLimit: '',
    tags: {
      interests: [],
      commitment: '',
      experience: []
    },
    meetingTimes: {},
    profilePictureUrl: '',
    members: [],
    faqs: []
  });

  const [selectedDates, setSelectedDates] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' });
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [newOfficer, setNewOfficer] = useState({ name: '', role: '', email: '' });

  // Load existing club data if it exists
  useEffect(() => {
    const fetchExistingClub = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const clubsQuery = query(
          collection(db, 'clubs'),
          where('createdBy', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(clubsQuery);
        if (!querySnapshot.empty) {
          const clubDoc = querySnapshot.docs[0];
          const clubData = { id: clubDoc.id, ...clubDoc.data() };
          setExistingClub(clubData);
          setClubData(clubData);
          setSelectedTimeSlots(clubData.meetingTimes || {});
        }
      } catch (error) {
        console.error('Error fetching club:', error);
        setError('Failed to load club data');
      } finally {
        setLoading(false);
      }
    };

    fetchExistingClub();
  }, [currentUser]);

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

    // Only accept image files
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    try {
      setLoading(true);
      const storageRef = ref(storage, `clubProfilePictures/${currentUser.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setClubData(prev => ({
        ...prev,
        profilePictureUrl: downloadURL
      }));
      setIsDirty(true);
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
      meetingTimes: {
        ...prev.meetingTimes,
        [date.toISOString().split('T')[0]]: []
      }
    }));
  };

  const handleTimeSelection = (day, times) => {
    setSelectedTimeSlots(prev => ({
      ...prev,
      [day]: times
    }));
    
    setClubData(prev => ({
      ...prev,
      meetingTimes: {
        ...prev.meetingTimes,
        [day]: times
      }
    }));
    setIsDirty(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { progress } = calculateProgress();
      if (progress < 100) {
        throw new Error('Please complete all required fields');
      }

      if (existingClub) {
        // Update existing club
        const clubRef = doc(db, 'clubs', existingClub.id);
        await updateDoc(clubRef, {
          ...clubData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new club
        const clubRef = doc(collection(db, 'clubs'));
        await setDoc(clubRef, {
          ...clubData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid
        });
        await completeSetup();
      }

      setSuccess(true);
      setIsDirty(false);
      
      setTimeout(() => {
        navigate('/club-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving club:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const { progress, progressLevel } = calculateProgress();

  if (loading && !clubData.name) {
    return <div className="club-setup-container loading">Loading...</div>;
  }

  return (
    <div className="club-setup-container">
      <div className="setup-header">
        <h1>{existingClub ? 'Edit Club' : 'Create Your Club'}</h1>
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
      {success && (
        <div className="success-message">
          {existingClub ? 'Club updated successfully!' : 'Club created successfully!'} Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="setup-form">
        <div className="setup-section">
          <h2>Basic Information</h2>
          
          <div className="profile-section">
            <div className="profile-picture-upload">
              {clubData.profilePictureUrl ? (
                <img 
                  src={clubData.profilePictureUrl} 
                  alt="Club Profile" 
                  className="profile-preview"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-club-avatar.png';
                  }}
                />
              ) : (
                <div className="upload-placeholder">
                  <FaCamera className="icon" />
                  <span>Upload Club Picture</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="file-input"
                aria-label="Upload club picture"
              />
            </div>
            {clubData.profilePictureUrl && (
              <button
                type="button"
                className="remove-picture-button"
                onClick={() => {
                  setClubData(prev => ({
                    ...prev,
                    profilePictureUrl: ''
                  }));
                  setIsDirty(true);
                }}
              >
                Remove Picture
              </button>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="clubName">Club Name *</label>
            <input
              id="clubName"
              type="text"
              value={clubData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter club name"
              required
              className={!clubData.name ? 'error' : ''}
            />
            {!clubData.name && (
              <div className="field-error">Club name is required</div>
            )}
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
          <h2>Meeting Times</h2>
          <p className="section-description">Select when your club typically meets</p>
          <div className="time-grid">
            {DAYS_OF_WEEK.map(day => (
              <DaySection
                key={day}
                day={day}
                selectedSlots={selectedTimeSlots[day.toLowerCase()] || []}
                onSlotSelect={handleTimeSelection}
              />
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || progress < 100}
        >
          {loading ? (existingClub ? 'Saving...' : 'Creating...') : 
           progress < 100 ? 'Complete Required Fields' : 
           existingClub ? 'Save Changes' : 'Create Club'}
        </button>
      </form>
    </div>
  );
};

export default ClubSetup; 