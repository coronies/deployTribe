import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

const ClubSetup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [clubData, setClubData] = useState({
    name: '',
    description: '',
    tags: {
      interests: [],
      commitment: '',
      experience: ''
    },
    profilePicture: null,
    profilePictureUrl: '',
    memberLimit: '',
    requiresApplication: false,
    acceptingMembers: true,
    meetingTimes: {},
    officers: [],
    members: [],
    faqs: [{ question: '', answer: '' }],
    president: currentUser?.uid,
    createdAt: new Date().toISOString()
  });

  const [selectedDates, setSelectedDates] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' });
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [newOfficer, setNewOfficer] = useState({ name: '', role: '', email: '' });

  useEffect(() => {
    if (currentUser?.uid) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setClubData(prev => ({
          ...prev,
          presidentName: userData.name,
          presidentEmail: userData.email,
          members: [{ id: currentUser.uid, ...userData, role: 'president' }]
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
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
        profilePicture: file,
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
        [category]: Array.isArray(value) ? value : [value]
      }
    }));
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
      meetingTimes: selectedDates
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!clubData.name || !clubData.description) {
        throw new Error('Please fill in all required fields');
      }

      if (!clubData.tags.interests.length) {
        throw new Error('Please select at least one interest tag');
      }

      const clubRef = doc(collection(db, 'clubs'));
      await setDoc(clubRef, {
        ...clubData,
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/club/${clubRef.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating club:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="club-setup-container">
      <div className="setup-header">
        <h1>Create Your Club</h1>
        <button 
          className="save-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Club'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Club created successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="setup-form">
        <div className="setup-section profile-section">
          <h2>Profile Picture</h2>
          <div className="profile-picture-upload">
            {clubData.profilePictureUrl ? (
              <img src={clubData.profilePictureUrl} alt="Club profile" />
            ) : (
              <div className="upload-placeholder">
                <FaCamera className="icon" />
                <span>Upload Picture</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="file-input"
            />
          </div>
        </div>

        <div className="setup-section">
          <h2>Basic Information</h2>
          <div className="basic-info-grid">
            <div className="info-item">
              <label>Club Name</label>
              <input
                type="text"
                value={clubData.name}
                onChange={(e) => setClubData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter club name"
                required
              />
            </div>

            <div className="info-item">
              <label>Member Limit</label>
              <input
                type="number"
                value={clubData.memberLimit}
                onChange={(e) => setClubData(prev => ({ ...prev, memberLimit: e.target.value }))}
                placeholder="Enter member limit"
                min="1"
              />
            </div>

            <div className="info-item">
              <label>Application Required?</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    checked={clubData.requiresApplication}
                    onChange={() => setClubData(prev => ({ ...prev, requiresApplication: true }))}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    checked={!clubData.requiresApplication}
                    onChange={() => setClubData(prev => ({ ...prev, requiresApplication: false }))}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="info-item">
              <label>Accepting New Members?</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    checked={clubData.acceptingMembers}
                    onChange={() => setClubData(prev => ({ ...prev, acceptingMembers: true }))}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    checked={!clubData.acceptingMembers}
                    onChange={() => setClubData(prev => ({ ...prev, acceptingMembers: false }))}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          <div className="info-item">
            <label>Club Description</label>
            <textarea
              value={clubData.description}
              onChange={(e) => setClubData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter club description"
              required
              rows={5}
            />
          </div>
        </div>

        <div className="setup-section">
          <h2>Club Tags</h2>
          <div className="tags-section">
            <div className="tag-category">
              <h3>Interests</h3>
              <TagSelector
                options={INTERESTS}
                selected={clubData.tags.interests}
                onChange={(values) => handleTagChange('interests', values)}
                multiple
                max={5}
              />
            </div>

            <div className="tag-category">
              <h3>Time Commitment</h3>
              <TagSelector
                options={COMMITMENT_LEVELS}
                selected={clubData.tags.commitment}
                onChange={(value) => handleTagChange('commitment', value)}
              />
            </div>

            <div className="tag-category">
              <h3>Experience Level</h3>
              <TagSelector
                options={EXPERIENCE_LEVELS}
                selected={clubData.tags.experience}
                onChange={(value) => handleTagChange('experience', value)}
              />
            </div>
          </div>
        </div>

        <div className="setup-section">
          <h2>Meeting Times</h2>
          <div className="calendar-section">
            <Calendar
              onChange={handleDateChange}
              value={selectedDates.map(date => new Date(date))}
              selectRange={false}
              className="meeting-calendar"
              tileClassName={({ date }) => {
                const dateStr = date.toISOString().split('T')[0];
                return selectedDates.includes(dateStr) ? 'selected-date' : '';
              }}
            />
          </div>
        </div>

        <div className="setup-section">
          <h2>Members & Officers</h2>
          <div className="members-section">
            <div className="members-list">
              {clubData.members.map(member => (
                <div key={member.id} className="member-card">
                  <img
                    src={member.photoUrl || '/default-avatar.png'}
                    alt={member.name}
                    className="member-avatar"
                  />
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p>{member.email}</p>
                    <p className="member-role">{member.role}</p>
                  </div>
                  {member.id !== currentUser.uid && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <FaTimes /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="add-member-section">
              <button
                type="button"
                className="add-button"
                onClick={() => setShowAddMember(true)}
              >
                <FaUserPlus /> Add Member
              </button>

              {showAddMember && (
                <div className="add-member-form">
                  <input
                    type="email"
                    placeholder="Member Email"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="member">Member</option>
                    <option value="officer">Officer</option>
                  </select>
                  <div className="form-actions">
                    <button type="button" onClick={handleAddMember}>Add</button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowAddMember(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="setup-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faqs-section">
            {clubData.faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-header">
                  <FaQuestionCircle className="faq-icon" />
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => handleRemoveFAQ(index)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                  className="faq-input"
                />
                <textarea
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                  className="faq-answer"
                  rows={3}
                />
              </div>
            ))}
            <button
              type="button"
              className="add-button"
              onClick={handleAddFAQ}
            >
              <FaPlus /> Add FAQ
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClubSetup; 