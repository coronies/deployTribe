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
    // Check if email ends with .edu
    if (!email.toLowerCase().endsWith('.edu')) {
      return false;
    }
    // Additional university-specific email validation could be added here
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate university selection
    if (!formData.university) {
      setError('Please select your university');
      return;
    }

    // Validate .edu email
    if (!validateEmail(formData.email)) {
      setError('Please use your university email address (.edu)');
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // User type specific validation
    if (userType === 'student' && !formData.name) {
      setError('Please enter your name');
      return;
    }

    if (userType === 'club') {
      if (!formData.clubName) {
        setError('Please enter club name');
        return;
      }
      if (!formData.description) {
        setError('Please enter club description');
        return;
      }
    }

    try {
      setLoading(true);
      await signup(formData.email, formData.password, userType, {
        name: formData.name,
        clubName: formData.clubName,
        description: formData.description,
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
      setError('Failed to create an account: ' + error.message);
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