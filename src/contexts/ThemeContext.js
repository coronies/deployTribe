import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage and document class when theme changes
    const theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.body.setAttribute('data-theme', theme);

    // If user is logged in, update their settings in Firestore
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      updateDoc(userRef, {
        'settings.theme': theme
      }).catch(error => {
        console.error('Error updating theme in Firestore:', error);
      });
    }
  }, [isDarkMode, currentUser]);

  // Load user's theme preference from Firestore when they log in
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const loadUserTheme = async () => {
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists() && docSnap.data().settings?.theme) {
            setIsDarkMode(docSnap.data().settings.theme === 'dark');
          }
        } catch (error) {
          console.error('Error loading theme from Firestore:', error);
        }
      };
      loadUserTheme();
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 