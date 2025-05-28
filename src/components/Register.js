import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    university: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when field is updated
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    if (!email.includes('@')) {
      return 'Invalid email format';
    }
    if (!email.toLowerCase().endsWith('.edu')) {
      return 'Please use your university email address (.edu)';
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};

    // Common validations
    if (!formData.university) {
      errors.university = 'Please select your university';
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // User type specific validations
    if (userType === 'student') {
      if (!formData.name) {
        errors.name = 'Full name is required';
      }
    } else if (userType === 'club') {
      if (!formData.clubName) {
        errors.clubName = 'Club name is required';
      } else if (formData.clubName.length < 3) {
        errors.clubName = 'Club name must be at least 3 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await signup(formData.email, formData.password, userType, {
        name: formData.name,
        clubName: formData.clubName,
        university: formData.university,
        universityName: UNIVERSITIES.find(u => u.id === formData.university)?.name
      });

      // Navigate based on user type
      if (userType === 'student') {
        navigate('/quiz');
      } else {
        navigate('/club-setup');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create an account';
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Account creation is currently disabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message || 'Failed to create account';
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
        
        {Object.keys(validationErrors).length > 0 && (
          <div className="validation-errors">
            <h3>Please fix the following errors:</h3>
            <ul>
              {Object.entries(validationErrors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
            <label htmlFor="university">University</label>
            <select
              id="university"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              required
              className={`form-input ${validationErrors.university ? 'error' : ''}`}
              aria-required="true"
            >
              <option value="">Select your university</option>
              {UNIVERSITIES.map(uni => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
            {validationErrors.university && (
              <div className="field-error">{validationErrors.university}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">University Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={`form-input ${validationErrors.email ? 'error' : ''}`}
              placeholder="your.email@university.edu"
              aria-required="true"
            />
            {validationErrors.email && (
              <div className="field-error">{validationErrors.email}</div>
            )}
          </div>

          {userType === 'student' ? (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`form-input ${validationErrors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                aria-required="true"
              />
              {validationErrors.name && (
                <div className="field-error">{validationErrors.name}</div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="clubName">Club Name</label>
              <input
                id="clubName"
                type="text"
                name="clubName"
                value={formData.clubName}
                onChange={handleInputChange}
                required
                className={`form-input ${validationErrors.clubName ? 'error' : ''}`}
                placeholder="Enter club name"
                aria-required="true"
              />
              {validationErrors.clubName && (
                <div className="field-error">{validationErrors.clubName}</div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={`form-input ${validationErrors.password ? 'error' : ''}`}
              placeholder="Create a password"
              aria-required="true"
            />
            {validationErrors.password && (
              <div className="field-error">{validationErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              aria-required="true"
            />
            {validationErrors.confirmPassword && (
              <div className="field-error">{validationErrors.confirmPassword}</div>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || Object.keys(validationErrors).length > 0}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register; 