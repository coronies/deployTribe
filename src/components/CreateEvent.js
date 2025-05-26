import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiList, FiSave, FiSend } from 'react-icons/fi';
import '../styles/CreationForm.css';
import { checkDuplicateEvent } from '../utils/duplicateCheck';
import DuplicateWarning from './DuplicateWarning';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    organizationLogo: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    mode: 'in-person',
    capacity: '',
    tags: [],
    requirements: [],
    registrationDeadline: '',
    registrationLink: '',
    ctaText: 'Register Now'
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setFormData(prev => ({
        ...prev,
        tags: [...tags, tagInput.trim()]
      }));
    }
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleRequirementKeyDown = (e) => {
    if (e.key === 'Enter' && requirementInput.trim()) {
      e.preventDefault();
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
      setFormData(prev => ({
        ...prev,
        requirements: [...requirements, requirementInput.trim()]
      }));
    }
  };

  const removeRequirement = (indexToRemove) => {
    const newRequirements = requirements.filter((_, index) => index !== indexToRemove);
    setRequirements(newRequirements);
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check for duplicates before submitting
      const potentialDuplicates = await checkDuplicateEvent(formData);
      
      if (potentialDuplicates.length > 0) {
        setDuplicates(potentialDuplicates);
        setShowDuplicateWarning(true);
        setLoading(false);
        return;
      }

      await submitEvent();
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
      setLoading(false);
    }
  };

  const submitEvent = async () => {
    try {
      const eventData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        registrationCount: 0
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log('Event created with ID:', docRef.id);
      navigate('/manage/events');
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="creation-page">
      <div className="creation-header">
        <div className="creation-header-content">
          <div className="creation-header-icon">
            <FiCalendar />
          </div>
          <div className="creation-header-text">
            <h1>Create New Event</h1>
            <p>Share your event with the community</p>
          </div>
        </div>
        <button 
          className="back-button"
          onClick={() => navigate('/manage/events')}
        >
          <FiArrowLeft /> Back to Events
        </button>
      </div>

      {showDuplicateWarning && (
        <DuplicateWarning
          duplicates={duplicates}
          type="Event"
          onContinue={async () => {
            setShowDuplicateWarning(false);
            await submitEvent();
          }}
          onCancel={() => {
            setShowDuplicateWarning(false);
            setLoading(false);
          }}
        />
      )}

      {error && (
        <div className="error-message">
          <FiCalendar /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="creation-form">
        <div className="form-main">
          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiCalendar />
              </div>
              <div>
                <h2>Basic Information</h2>
                <p>Provide the main details about your event</p>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Tech Workshop Series"
              />
              <div className="help-text">Choose a clear and descriptive title</div>
            </div>

            <div className="form-group">
              <label htmlFor="organization">Organization *</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                required
                placeholder="e.g., Tech Labs"
              />
            </div>

            <div className="form-group">
              <label htmlFor="organizationLogo">Organization Logo URL</label>
              <input
                type="url"
                id="organizationLogo"
                name="organizationLogo"
                value={formData.organizationLogo}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
              />
              <div className="help-text">Provide a URL to your organization's logo</div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiList />
              </div>
              <div>
                <h2>Event Details</h2>
                <p>Describe your event and what participants can expect</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe the event..."
                rows="4"
              />
              <div className="help-text">Provide a detailed description of your event</div>
            </div>

            <div className="form-group">
              <label>Tags *</label>
              <div className="tag-input">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(index)}>&times;</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Press Enter to add tags"
                />
              </div>
              <div className="help-text">Press Enter to add each tag</div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiCalendar />
              </div>
              <div>
                <h2>Date & Time</h2>
                <p>Set when your event will take place</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiMapPin />
              </div>
              <div>
                <h2>Location & Mode</h2>
                <p>Specify where and how the event will be conducted</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., Tech Hub, Room 101"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mode">Mode *</label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                required
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity *</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                placeholder="e.g., 50"
                min="1"
              />
              <div className="help-text">Maximum number of participants</div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiUsers />
              </div>
              <div>
                <h2>Requirements & Registration</h2>
                <p>Set up the registration process and requirements</p>
              </div>
            </div>

            <div className="form-group">
              <label>Requirements</label>
              <div className="tag-input">
                {requirements.map((req, index) => (
                  <span key={index} className="tag">
                    {req}
                    <button type="button" onClick={() => removeRequirement(index)}>&times;</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyDown={handleRequirementKeyDown}
                  placeholder="Press Enter to add requirements"
                />
              </div>
              <div className="help-text">Press Enter to add each requirement</div>
            </div>

            <div className="form-group">
              <label htmlFor="registrationDeadline">Registration Deadline *</label>
              <input
                type="date"
                id="registrationDeadline"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="registrationLink">Registration Link *</label>
              <input
                type="url"
                id="registrationLink"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleInputChange}
                required
                placeholder="https://example.com/register"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ctaText">Registration Button Text</label>
              <input
                type="text"
                id="ctaText"
                name="ctaText"
                value={formData.ctaText}
                onChange={handleInputChange}
                placeholder="e.g., Register Now"
              />
            </div>
          </div>
        </div>

        <div className="form-sidebar">
          <div className="form-sidebar-content">
            <div className="sidebar-section">
              <h3>Preview</h3>
              <div className="preview-card">
                <div className="preview-header">
                  {formData.title || 'Event Title'}
                </div>
                <div className="preview-body">
                  <div className="preview-placeholder">
                    Event preview will appear here
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Actions</h3>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  <FiSend />
                  {loading ? 'Creating...' : 'Publish Event'}
                </button>
                <button 
                  type="button" 
                  className="save-draft-button"
                  onClick={() => {/* TODO: Implement draft saving */}}
                >
                  <FiSave />
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent; 