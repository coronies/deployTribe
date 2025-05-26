import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

const FirebaseTest = () => {
  const { currentUser } = useAuth();
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Add auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth state changed - User logged in:', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        });
      } else {
        console.log('Auth state changed - User logged out');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setResult('Attempting to log in...');
      const userCredential = await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      console.log('Login successful:', {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email
        }
      });
      setResult('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      setError(`Login failed: ${error.message}`);
    }
  };

  const testFirestore = async () => {
    try {
      if (!auth.currentUser) {
        setError('Please log in first');
        return;
      }

      setResult('Testing Firestore connection...');
      
      // Get the current Firebase auth user
      const firebaseUser = auth.currentUser;
      
      // Try to write to a test collection
      const testData = {
        message: 'Test data',
        timestamp: new Date().toISOString(),
        userId: firebaseUser.uid,
        email: firebaseUser.email
      };

      console.log('Attempting to write test data:', testData);
      const docRef = await addDoc(collection(db, 'test_collection'), testData);
      setResult(`Success! Document written with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error('Test failed:', error);
      setError(`Test failed: ${error.message}`);
    }
  };

  const testPreferences = async () => {
    try {
      if (!auth.currentUser) {
        setError('Please log in first');
        return;
      }

      setResult('Testing preferences collection...');
      
      // Get the current Firebase auth user
      const firebaseUser = auth.currentUser;
      
      const testPreference = {
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        categories: [
          { name: "Programming:Web Development", selected: true },
          { name: "Programming:Mobile Development", selected: true }
        ],
        meetingTimes: {
          monday: ["9:00 AM - 10:00 AM"],
          tuesday: [],
          wednesday: ["2:00 PM - 3:00 PM"],
          thursday: [],
          friday: []
        },
        commitmentLevel: 3,
        experienceLevel: 2,
        university: "test-university",
        universityName: "Test University",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Attempting to save preferences:', testPreference);
      const docRef = await addDoc(collection(db, 'preferences'), testPreference);
      setResult(`Success! Preference document written with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error('Preferences test failed:', error);
      setError(`Preferences test failed: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Firebase Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current User Info:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {auth.currentUser ? JSON.stringify({
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            emailVerified: auth.currentUser.emailVerified
          }, null, 2) : 'Not logged in'}
        </pre>
      </div>

      {!auth.currentUser && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Login</h3>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              style={{ padding: '8px' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              style={{ padding: '8px' }}
            />
            <button 
              type="submit"
              style={{
                padding: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testFirestore}
          disabled={!auth.currentUser}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: auth.currentUser ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: auth.currentUser ? 'pointer' : 'not-allowed'
          }}
        >
          Test Firestore
        </button>

        <button 
          onClick={testPreferences}
          disabled={!auth.currentUser}
          style={{
            padding: '10px 20px',
            backgroundColor: auth.currentUser ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: auth.currentUser ? 'pointer' : 'not-allowed'
          }}
        >
          Test Preferences
        </button>
      </div>

      {result && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#4CAF50', 
          color: 'white',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          {result}
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f44336', 
          color: 'white',
          borderRadius: '5px' 
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest; 