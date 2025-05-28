import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

// List of universities (you can expand this list)
const UNIVERSITIES = [
  { id: 'ut-austin', name: 'University of Texas at Austin' },
  { id: 'texas-am', name: 'Texas A&M University' },
  { id: 'rice', name: 'Rice University' },
  { id: 'uh', name: 'University of Houston' },
  { id: 'utsa', name: 'University of Texas at San Antonio' },
  { id: 'smu', name: 'Southern Methodist University' },
  { id: 'ttu', name: 'Texas Tech University' },
  { id: 'baylor', name: 'Baylor University' }
];

function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    clubName: '',
    description: '',
    university: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email) => {
    // Check if email ends with .edu or is a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // For development/testing, allow any valid email
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return true;
    }
    
    // In production, require .edu emails
    return email.toLowerCase().endsWith('.edu');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate university selection
      if (!formData.university) {
        throw new Error('Please select your university');
      }

      // Validate email
      if (!validateEmail(formData.email)) {
        const errorMsg = process.env.NODE_ENV === 'development' 
          ? 'Please enter a valid email address'
          : 'Please use your university email address (.edu)';
        throw new Error(errorMsg);
      }

      // Password validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // User type specific validation
      if (userType === 'student' && !formData.name.trim()) {
        throw new Error('Please enter your name');
      }

      if (userType === 'club') {
        if (!formData.clubName.trim()) {
          throw new Error('Please enter club name');
        }
        if (!formData.description.trim()) {
          throw new Error('Please enter club description');
        }
      }

      console.log('Starting registration process...', { userType, email: formData.email });

      // Attempt signup
      const result = await signup(formData.email, formData.password, userType, {
        name: formData.name,
        clubName: formData.clubName,
        description: formData.description,
        university: formData.university,
        universityName: UNIVERSITIES.find(u => u.id === formData.university)?.name
      });

      console.log('Registration successful:', result);

      // Navigate based on user type
      if (userType === 'student') {
        navigate('/quiz');
      } else {
        navigate('/club-setup');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Failed to create an account')) {
        errorMessage = error.message;
      } else {
        errorMessage = `Registration failed: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Account Type</label>
            <div className="user-type-toggle">
              <button
                type="button"
                className={`toggle-button ${userType === 'student' ? 'active' : ''}`}
                onClick={() => setUserType('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`toggle-button ${userType === 'club' ? 'active' : ''}`}
                onClick={() => setUserType('club')}
              >
                Club
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>University</label>
            <select
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              required
              className="form-input"
            >
              <option value="">Select your university</option>
              {UNIVERSITIES.map(uni => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>University Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="your.email@university.edu"
            />
          </div>

          {userType === 'student' ? (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Club Name</label>
                <input
                  type="text"
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter club name"
                />
              </div>
              <div className="form-group">
                <label>Club Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Brief description of your club"
                  rows="3"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register; 