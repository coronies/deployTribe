import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/QuizNew.css';
import { addDoc, collection } from 'firebase/firestore';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

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

const COMMITMENT_LEVELS = [
  { short: 'Light', desc: '2-4 hours per week' },
  { short: 'Moderate', desc: '4-6 hours per week' },
  { short: 'Standard', desc: '6-8 hours per week' },
  { short: 'Dedicated', desc: '8-10 hours per week' },
  { short: 'Intensive', desc: '10+ hours per week' }
];

const EXPERIENCE_LEVELS = [
  { short: 'Beginner', desc: 'No prior experience needed' },
  { short: 'Intermediate', desc: 'Some experience helpful' },
  { short: 'Advanced', desc: 'Significant experience required' }
];

const TIME_SLOTS = [
  { id: 1, time: '9:00 - 11:00', period: 'Morning' },
  { id: 2, time: '11:00 - 13:00', period: 'Morning' },
  { id: 3, time: '13:00 - 15:00', period: 'Afternoon' },
  { id: 4, time: '15:00 - 17:00', period: 'Afternoon' },
  { id: 5, time: '17:00 - 19:00', period: 'Evening' },
  { id: 6, time: '19:00 - 21:00', period: 'Evening' }
];

const Slider = ({ value, min, max, labels, onChange, type }) => {
  const handleSliderChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newValue = Math.round((percentage / 100) * (max - min) + min);
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  const handleDrag = (e) => {
    if (e.buttons === 1) { // Left mouse button is pressed
      handleSliderChange(e);
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const style = { ['--slider-percentage']: percentage + '%' };

  return (
    <div className={`slider-wrapper ${type}-slider`} style={style}>
      <div 
        className="slider-track"
        onClick={handleSliderChange}
        onMouseMove={handleDrag}
      >
        <div 
          className="slider-handle"
          style={{ left: `${percentage}%` }}
        >
          <span className="slider-value">{labels[value - 1]?.short || value}</span>
        </div>
      </div>
      <div className="slider-labels">
        {labels.map((label, index) => (
          <div
            key={index}
            className={`slider-label ${value === index + 1 ? 'active' : ''}`}
            onClick={() => onChange(index + 1)}
          >
            {label.short}
            <span className="label-desc">{label.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DaySection = ({ day, slots, selectedSlots, onSlotSelect }) => {
  return (
    <div className="time-day-section">
      <div className="time-day-header">
        <span className="time-day-icon" />
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
            className={`time-slot-btn ${selectedSlots.includes(slot.time) ? 'selected' : ''} ${day.toLowerCase()}`}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};

const Quiz = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitmentLevel, setCommitmentLevel] = useState(3);
  const [experienceLevel, setExperienceLevel] = useState(2);

  useEffect(() => {
    if (!currentUser) {
      console.log('No user detected, redirecting to login');
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [currentUser, navigate]);

  const handleInterestSelection = (tag) => {
    setSelectedInterests(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const handleTimeSelection = (day, times) => {
    setSelectedTimeSlots(prev => ({
      ...prev,
      [day.toLowerCase()]: times
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setError('Please log in to submit your preferences');
      return;
    }

    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const quizResults = {
        tags: selectedInterests,
        commitmentLevel: COMMITMENT_LEVELS[commitmentLevel - 1].short,
        experienceLevel: EXPERIENCE_LEVELS[experienceLevel - 1].short,
        availability: Object.keys(selectedTimeSlots).reduce((acc, day) => {
          if (selectedTimeSlots[day] && selectedTimeSlots[day].length > 0) {
            acc[day] = selectedTimeSlots[day];
          }
          return acc;
        }, {}),
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'preferences'), quizResults);
      navigate('/matching', { 
        state: { 
          quizResults,
          preferenceId: docRef.id
        }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return selectedInterests.length > 0;
      case 2:
        return commitmentLevel > 0;
      case 3:
        return experienceLevel > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (loading) {
    return <div className="quiz-container loading">Loading...</div>;
  }

  if (error) {
    return <div className="quiz-container error">Error: {error}</div>;
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>Find Your Perfect Club Match</h1>
        <p className="subtitle">Tell us about your interests and availability to discover clubs that align with your passions</p>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
        <div className="step-indicators">
          {[1, 2, 3, 4].map(num => (
            <div 
              key={num} 
              className={`step-dot ${step >= num ? 'active' : ''}`}
              onClick={() => setStep(num)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>

      <div className="quiz-content">
        {step === 1 && (
          <div className="quiz-step">
            <h2>What interests you?</h2>
            <p className="step-description">
              Select the topics you're passionate about. This helps us find the perfect clubs for you.
            </p>
            <div className="categories-grid">
              {Object.entries(CATEGORIES).map(([category, { label, subtags }]) => (
                <div key={category} className="category-card" data-category={category}>
                  <div className="category-header">
                    <h3>{label}</h3>
                    <div className="selected-count">
                      Selected: <span>{selectedInterests.filter(tag => subtags.includes(tag)).length}</span>
                    </div>
                  </div>
                  <div className="subtags">
                    {subtags.map(tag => (
                      <button
                        key={tag}
                        className={`subtag ${selectedInterests.includes(tag) ? 'selected' : ''}`}
                        data-category={category}
                        onClick={() => handleInterestSelection(tag)}
                      >
                        {tag}
                        {selectedInterests.includes(tag) && (
                          <span className="check-icon">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="quiz-step">
            <h2>How much time can you commit?</h2>
            <p className="step-description">
              Let us know your weekly availability for club activities
            </p>
            <div className="slider-container">
              <Slider
                value={commitmentLevel}
                min={1}
                max={5}
                labels={COMMITMENT_LEVELS}
                onChange={setCommitmentLevel}
                type="commitment"
              />
              <p className="selected-description">
                {COMMITMENT_LEVELS[commitmentLevel - 1]?.desc}
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="quiz-step">
            <h2>What's your experience level?</h2>
            <p className="step-description">
              This helps us match you with clubs that align with your expertise
            </p>
            <div className="slider-container">
              <Slider
                value={experienceLevel}
                min={1}
                max={3}
                labels={EXPERIENCE_LEVELS}
                onChange={setExperienceLevel}
                type="experience"
              />
              <p className="selected-description">
                {EXPERIENCE_LEVELS[experienceLevel - 1]?.desc}
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="quiz-step">
            <h2>When are you available?</h2>
            <p className="step-description">
              Select your preferred meeting times (optional)
            </p>
            <div className="time-grid">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                <DaySection
                  key={day}
                  day={day}
                  slots={TIME_SLOTS}
                  selectedSlots={selectedTimeSlots[day.toLowerCase()] || []}
                  onSlotSelect={handleTimeSelection}
                />
              ))}
            </div>
          </div>
        )}

        <div className="quiz-navigation">
          {step > 1 && (
            <button
              className="nav-button back"
              onClick={() => setStep(prev => prev - 1)}
            >
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              className="nav-button continue"
              onClick={() => setStep(prev => prev + 1)}
              disabled={!validateStep()}
            >
              Continue
            </button>
          ) : (
            <button
              className="nav-button submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Finding matches...' : 'Find My Clubs'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz; 