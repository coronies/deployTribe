import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiList, FiSave, FiSend, FiImage, FiClock } from 'react-icons/fi';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/CreationForm.css';
import { checkDuplicateEvent } from '../utils/duplicateCheck';
import DuplicateWarning from './DuplicateWarning';
import TagSelector from './TagSelector';

// MUI Theme for our beautiful styling
const customTheme = {
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            border: 'none',
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: 'inset 3px 3px 7px rgba(136, 165, 191, 0.48), inset -3px -3px 7px rgba(255, 255, 255, 0.8)',
            padding: '1rem 1rem 1rem 3rem',
            '&:hover': {
              boxShadow: 'inset 6px 6px 10px rgba(163, 177, 198, 0.4), inset -6px -6px 10px rgba(255, 255, 255, 0.8)',
            },
            '&.Mui-focused': {
              boxShadow: 'inset 6px 6px 10px rgba(163, 177, 198, 0.4), inset -6px -6px 10px rgba(255, 255, 255, 0.8)',
            },
            '& fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputBase-input': {
            padding: '0',
            fontSize: '1rem',
            fontFamily: 'inherit',
            color: '#1E293B',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px !important',
          boxShadow: '12px 12px 24px rgba(163, 177, 198, 0.2), -12px -12px 24px rgba(255, 255, 255, 0.6)',
          border: 'none',
        },
      },
    },
  },
};

// Import the tag categories from the Quiz component
const CATEGORIES = {
  Technology: {
    label: 'Technology',
    subtags: [
      'Software Development',
      'Web Development',
      'AI',
      'Cybersecurity',
      'Data Science',
      'Mobile Development',
      'Game Development',
      'IoT'
    ]
  },
  Business: {
    label: 'Business',
    subtags: [
      'Entrepreneurship',
      'Marketing',
      'Finance',
      'Management',
      'Consulting',
      'Investment'
    ]
  },
  'Arts & Culture': {
    label: 'Arts & Culture',
    subtags: [
      'Music',
      'Dance',
      'Photography',
      'Painting',
      'Theater',
      'Film',
      'Design',
      'Creative Writing'
    ]
  },
  Science: {
    label: 'Science',
    subtags: [
      'Physics',
      'Chemistry',
      'Biology',
      'Environmental Science',
      'Astronomy',
      'Mathematics'
    ]
  },
  'Social Impact': {
    label: 'Social Impact',
    subtags: [
      'Community Service',
      'Environmental',
      'Social Justice',
      'Education',
      'Healthcare',
      'Mental Health'
    ]
  }
};

const getTagCategory = (tag) => {
  for (const [category, { subtags }] of Object.entries(CATEGORIES)) {
    if (subtags.includes(tag)) {
      return category;
    }
  }
  return null;
};

const PreviewTag = ({ tag }) => {
  const category = getTagCategory(tag);
  return (
    <span className={`preview-tag ${category ? `preview-tag-${category.toLowerCase().replace(/\s+/g, '-')}` : ''}`}>
      {tag}
    </span>
  );
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    organizationLogo: '',
    description: '',
    startDate: null,
    endDate: null,
    startTime: '',
    endTime: '',
    location: '',
    mode: 'in-person',
    capacity: '',
    tags: [],
    requirements: [],
    registrationDeadline: null,
    registrationLink: '',
    ctaText: 'Register Now',
    imageUrl: ''
  });

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

  const handleRequirementKeyDown = (e) => {
    if (e.key === 'Enter' && requirementInput.trim()) {
      e.preventDefault();
      const newRequirement = requirementInput.trim();
      if (!requirements.includes(newRequirement)) {
        const updatedRequirements = [...requirements, newRequirement];
        setRequirements(updatedRequirements);
        setFormData(prev => ({
          ...prev,
          requirements: updatedRequirements
        }));
      }
      setRequirementInput('');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.organization || !formData.description) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Check for duplicates before submitting (only for published events)
      if (!isDraft) {
        const potentialDuplicates = await checkDuplicateEvent(formData);
        
        if (potentialDuplicates.length > 0) {
          setDuplicates(potentialDuplicates);
          setShowDuplicateWarning(true);
          setLoading(false);
          return;
        }
      }

      // Helper function to combine date and time
      const combineDateAndTime = (date, time) => {
        if (!date) return null;
        
        const combinedDate = new Date(date);
        if (time) {
          const [hours, minutes] = time.split(':').map(num => parseInt(num) || 0);
          combinedDate.setHours(hours);
          combinedDate.setMinutes(minutes);
        }
        return combinedDate;
      };

      // Clean and format the data for Firestore
      const cleanEventData = {
        title: formData.title || '',
        organization: formData.organization || '',
        organizationLogo: formData.organizationLogo || '',
        description: formData.description || '',
        location: formData.location || '',
        mode: formData.mode || 'in-person',
        capacity: parseInt(formData.capacity) || 0,
        registrationLink: formData.registrationLink || '',
        ctaText: formData.ctaText || 'Register Now',
        requirements: formData.requirements || [],
        tags: formData.tags || [],
        imageUrl: imageUrl || '',
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        registrationCount: 0,
        status: isDraft ? 'draft' : 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Handle dates with times
      if (formData.startDate) {
        const startDateTime = combineDateAndTime(formData.startDate, formData.startTime);
        if (startDateTime && !isNaN(startDateTime.getTime())) {
          cleanEventData.startDate = startDateTime;
        }
      }

      if (formData.endDate) {
        const endDateTime = combineDateAndTime(formData.endDate, formData.endTime);
        if (endDateTime && !isNaN(endDateTime.getTime())) {
          cleanEventData.endDate = endDateTime;
        }
      }

      if (formData.registrationDeadline) {
        const regDeadline = new Date(formData.registrationDeadline);
        if (!isNaN(regDeadline.getTime())) {
          cleanEventData.registrationDeadline = regDeadline;
        }
      }

      console.log('Submitting cleaned data:', cleanEventData);

      // Create the event in Firestore
      const docRef = await addDoc(collection(db, 'events'), cleanEventData);
      console.log('Event created with ID:', docRef.id);

      // Add event to user's created events (for dashboard tracking)
      try {
        await addDoc(collection(db, 'userEvents'), {
          userId: currentUser.uid,
          eventId: docRef.id,
          eventTitle: formData.title,
          role: 'creator',
          status: isDraft ? 'draft' : 'active',
          createdAt: new Date()
        });
        console.log('Added to user events tracking');
      } catch (userEventError) {
        console.error('Error adding to user events:', userEventError);
        // Don't fail the entire operation if this fails
      }
      
      // Show success message
      const message = isDraft ? 'Event saved as draft' : 'Event published successfully';
      console.log(message);
      
      // Navigate to events page
      navigate('/events');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(`Failed to create event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryTagChange = (category, selectedTags) => {
    setFormData(prev => {
      // Remove old tags from this category
      const otherTags = prev.tags.filter(tag => 
        !CATEGORIES[category].subtags.includes(tag)
      );
      
      // Add new selected tags
      return {
        ...prev,
        tags: [...otherTags, ...selectedTags]
      };
    });
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
          onClick={() => navigate('/events')}
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
            await handleSubmit(null, false);
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

      <form onSubmit={(e) => handleSubmit(e, false)} className="creation-form">
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

            <div className="datetime-wrapper">
              <div className="datetime-field">
                <label>Start Date & Time <span className="required">*</span></label>
                <div className="datetime-input-group">
                  <div className="date-input">
                    <FiCalendar className="input-icon" />
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date) => handleDateChange(date, 'startDate')}
                      dateFormat="MMMM d, yyyy"
                      placeholderText="Select start date"
                      required
                    />
                  </div>
                  <div className="time-input">
                    <div className="time-label">Start Time</div>
                    <div className="time-input-field">
                      <FiClock className="input-icon" />
                      <input
                        type="time"
                        value={formData.startTime}
                        placeholder="Select start time"
                        className="time-input-native"
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            startTime: e.target.value
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="datetime-field">
                <label>End Date & Time <span className="required">*</span></label>
                <div className="datetime-input-group">
                  <div className="date-input">
                    <FiCalendar className="input-icon" />
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date) => handleDateChange(date, 'endDate')}
                      dateFormat="MMMM d, yyyy"
                      placeholderText="Select end date"
                      minDate={formData.startDate}
                      required
                    />
                  </div>
                  <div className="time-input">
                    <div className="time-label">End Time</div>
                    <div className="time-input-field">
                      <FiClock className="input-icon" />
                      <input
                        type="time"
                        value={formData.endTime}
                        placeholder="Select end time"
                        className="time-input-native"
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            endTime: e.target.value
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="registration-deadline">
              <div className="datetime-field">
                <label>Registration Deadline <span className="required">*</span></label>
                <div className="date-input">
                  <FiCalendar className="input-icon" />
                  <DatePicker
                    selected={formData.registrationDeadline}
                    onChange={(date) => handleDateChange(date, 'registrationDeadline')}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select registration deadline"
                    maxDate={formData.startDate}
                    required
                  />
                </div>
              </div>
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
                  placeholder="Add requirements (Press Enter)"
                />
              </div>
              <div className="help-text">Add any specific requirements for participants</div>
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

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiImage />
              </div>
              <div>
                <h2>Event Image</h2>
                <p>Upload an image for your event (optional)</p>
              </div>
            </div>

            <div className="form-group">
              <label className="file-input-label" htmlFor="eventImage">
                <div className="file-input-icon">
                  <FiImage />
                </div>
                <span>Choose an image (Max 5MB)</span>
              </label>
              <input
                type="file"
                id="eventImage"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Event preview" />
                </div>
              )}
              <div className="help-text">Upload an image to make your event stand out</div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiList />
              </div>
              <div>
                <h2>Event Categories</h2>
                <p>Select up to 3 categories that best describe your event</p>
              </div>
            </div>

            <div className="categories-container">
              {Object.entries(CATEGORIES).map(([category, { label, subtags }]) => (
                <div key={category} className="category-card" data-category={category.toLowerCase().replace(/\s+/g, '-')}>
                  <div className="category-header">
                    <h3>{label}</h3>
                    <span className="tag-count">
                      {formData.tags.filter(tag => subtags.includes(tag)).length} / 3
                    </span>
                  </div>
                  <div className="tag-selector">
                    {subtags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`subtag ${formData.tags.includes(tag) ? 'selected' : ''}`}
                        onClick={() => {
                          const currentTags = formData.tags.filter(t => subtags.includes(t));
                          const isSelected = formData.tags.includes(tag);
                          
                          if (isSelected) {
                            // Remove tag
                            setFormData(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== tag)
                            }));
                          } else if (currentTags.length < 3) {
                            // Add tag if under limit
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag]
                            }));
                          }
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
                  <p>{formData.description || 'Event description will appear here'}</p>
                  {formData.tags.length > 0 && (
                    <div className="preview-tags">
                      {formData.tags.map((tag, index) => (
                        <PreviewTag key={index} tag={tag} />
                      ))}
                    </div>
                  )}
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
                  {loading ? 'Publishing...' : 'Publish Event'}
                </button>
                <button 
                  type="button" 
                  className="save-draft-button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                >
                  <FiSave />
                  {loading ? 'Saving...' : 'Save as Draft'}
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