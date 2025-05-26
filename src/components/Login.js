import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { testUserAuth } from '../firebase/test';
import '../styles/Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const user = await login(formData.email, formData.password);
      
      if (!user || !user.userType) {
        throw new Error('Failed to load user data');
      }

      // Navigate based on user type and setup status
      if (user.userType === 'club') {
        if (!user.isSetupComplete) {
          navigate('/club-setup', { replace: true });
        } else {
          navigate('/club-dashboard', { replace: true });
        }
      } else if (user.userType === 'student') {
        navigate('/student-dashboard', { replace: true });
      } else {
        throw new Error('Invalid user type');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to log in';
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Please check your credentials';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setLoading(true);
      const result = await testUserAuth(formData.email, formData.password);
      if (result.success) {
        setError('Test successful: ' + result.message);
      } else {
        setError('Test failed: ' + result.error);
      }
    } catch (error) {
      setError('Test error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button type="button" onClick={handleTest} disabled={loading}>
          Test Login
        </button>
      </form>

      <div className="auth-links">
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 