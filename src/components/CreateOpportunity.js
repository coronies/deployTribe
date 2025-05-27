import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FiArrowLeft, FiStar, FiMapPin, FiDollarSign, FiList, FiSave, FiSend, FiTarget, FiClock } from 'react-icons/fi';
import '../styles/CreationForm.css';
import { checkDuplicateOpportunity } from '../utils/duplicateCheck';
import DuplicateWarning from './DuplicateWarning';

const CreateOpportunity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    organizationLogo: '',
    description: '',
    deadline: '',
    location: '',
    mode: 'in-person',
    compensation: '',
    compensationType: 'paid',
    commitment: '',
    tags: [],
    requiredSkills: [],
    accessibilityInfo: [],
    ctaText: 'Apply Now',
    ctaLink: ''
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [accessibilityInfo, setAccessibilityInfo] = useState([]);
  const [accessibilityInput, setAccessibilityInput] = useState('');

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

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...skills, skillInput.trim()]
      }));
    }
  };

  const removeSkill = (indexToRemove) => {
    const newSkills = skills.filter((_, index) => index !== indexToRemove);
    setSkills(newSkills);
    setFormData(prev => ({
      ...prev,
      requiredSkills: newSkills
    }));
  };

  const handleAccessibilityKeyDown = (e) => {
    if (e.key === 'Enter' && accessibilityInput.trim()) {
      e.preventDefault();
      setAccessibilityInfo([...accessibilityInfo, accessibilityInput.trim()]);
      setAccessibilityInput('');
      setFormData(prev => ({
        ...prev,
        accessibilityInfo: [...accessibilityInfo, accessibilityInput.trim()]
      }));
    }
  };

  const removeAccessibilityInfo = (indexToRemove) => {
    const newInfo = accessibilityInfo.filter((_, index) => index !== indexToRemove);
    setAccessibilityInfo(newInfo);
    setFormData(prev => ({
      ...prev,
      accessibilityInfo: newInfo
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check for duplicates before submitting
      const potentialDuplicates = await checkDuplicateOpportunity(formData);
      
      if (potentialDuplicates.length > 0) {
        setDuplicates(potentialDuplicates);
        setShowDuplicateWarning(true);
        setLoading(false);
        return;
      }

      await submitOpportunity();
    } catch (err) {
      console.error('Error creating opportunity:', err);
      setError('Failed to create opportunity. Please try again.');
      setLoading(false);
    }
  };

  const submitOpportunity = async () => {
    try {
      const opportunityData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        applicantCount: 0
      };

      const docRef = await addDoc(collection(db, 'opportunities'), opportunityData);
      console.log('Opportunity created with ID:', docRef.id);
      navigate('/manage/opportunities');
    } catch (err) {
      console.error('Error creating opportunity:', err);
      setError('Failed to create opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="creation-page">
      <div className="creation-header">
        <div className="creation-header-content">
          <div className="creation-header-icon">
            <FiStar />
          </div>
          <div className="creation-header-text">
            <h1>Create New Opportunity</h1>
            <p>Share an opportunity with the community</p>
          </div>
        </div>
        <button 
          className="back-button"
          onClick={() => navigate('/manage/opportunities')}
        >
          <FiArrowLeft /> Back to Opportunities
        </button>
      </div>

      {showDuplicateWarning && (
        <DuplicateWarning
          duplicates={duplicates}
          type="Opportunity"
          onContinue={async () => {
            setShowDuplicateWarning(false);
            await submitOpportunity();
          }}
          onCancel={() => {
            setShowDuplicateWarning(false);
            setLoading(false);
          }}
        />
      )}

      {error && (
        <div className="error-message">
          <FiStar /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="creation-form">
        <div className="form-main">
          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiStar />
              </div>
              <div>
                <h2>Basic Information</h2>
                <p>Provide the main details about your opportunity</p>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Opportunity Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Summer Research Internship"
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
                placeholder="e.g., Research Lab"
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
                <h2>Opportunity Details</h2>
                <p>Describe the opportunity and what applicants can expect</p>
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
                placeholder="Describe the opportunity..."
                rows="4"
              />
              <div className="help-text">Provide a detailed description of the opportunity</div>
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
                <FiMapPin />
              </div>
              <div>
                <h2>Location & Mode</h2>
                <p>Specify where and how the opportunity will be conducted</p>
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
                placeholder="e.g., San Francisco, CA"
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
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiDollarSign />
              </div>
              <div>
                <h2>Compensation & Commitment</h2>
                <p>Specify the compensation and time commitment</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="compensation">Compensation *</label>
              <input
                type="text"
                id="compensation"
                name="compensation"
                value={formData.compensation}
                onChange={handleInputChange}
                required
                placeholder="e.g., $25/hr or $5000 stipend"
              />
            </div>

            <div className="form-group">
              <label htmlFor="compensationType">Compensation Type *</label>
              <select
                id="compensationType"
                name="compensationType"
                value={formData.compensationType}
                onChange={handleInputChange}
                required
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="commitment">Time Commitment *</label>
              <input
                type="text"
                id="commitment"
                name="commitment"
                value={formData.commitment}
                onChange={handleInputChange}
                required
                placeholder="e.g., 20 hrs/week"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiTarget />
              </div>
              <div>
                <h2>Requirements & Skills</h2>
                <p>Specify required skills and accessibility information</p>
              </div>
            </div>

            <div className="form-group">
              <label>Required Skills</label>
              <div className="tag-input">
                {skills.map((skill, index) => (
                  <span key={index} className="tag">
                    {skill}
                    <button type="button" onClick={() => removeSkill(index)}>&times;</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Press Enter to add skills"
                />
              </div>
              <div className="help-text">Press Enter to add each required skill</div>
            </div>

            <div className="form-group">
              <label>Accessibility Information</label>
              <div className="tag-input">
                {accessibilityInfo.map((info, index) => (
                  <span key={index} className="tag">
                    {info}
                    <button type="button" onClick={() => removeAccessibilityInfo(index)}>&times;</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={accessibilityInput}
                  onChange={(e) => setAccessibilityInput(e.target.value)}
                  onKeyDown={handleAccessibilityKeyDown}
                  placeholder="Press Enter to add accessibility info"
                />
              </div>
              <div className="help-text">Press Enter to add each accessibility detail</div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <div className="section-icon">
                <FiClock />
              </div>
              <div>
                <h2>Application Details</h2>
                <p>Set up the application process</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Application Deadline *</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ctaLink">Application Link *</label>
              <input
                type="url"
                id="ctaLink"
                name="ctaLink"
                value={formData.ctaLink}
                onChange={handleInputChange}
                required
                placeholder="https://example.com/apply"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ctaText">Application Button Text</label>
              <input
                type="text"
                id="ctaText"
                name="ctaText"
                value={formData.ctaText}
                onChange={handleInputChange}
                placeholder="e.g., Apply Now"
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
                  {formData.title || 'Opportunity Title'}
                </div>
                <div className="preview-body">
                  <div className="preview-placeholder">
                    Opportunity preview will appear here
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
                  {loading ? 'Creating...' : 'Publish Opportunity'}
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

export default CreateOpportunity; 