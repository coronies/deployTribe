import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="icon-container">
        {/* Sun Icon */}
        <svg 
          className="sun" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 12L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M22 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M19.7778 4.22217L17.5558 6.44418" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6.44415 17.5557L4.22214 19.7777" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M19.7778 19.7778L17.5558 17.5558" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6.44415 6.44434L4.22214 4.22233" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        
        {/* Moon Icon */}
        <svg 
          className="moon" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.7491 15.0821 8.91792 11.2509 8.91792 6.52485C8.91792 5.06986 9.28105 3.69968 9.92163 2.5C5.66765 3.49698 2.5 7.31513 2.5 11.8731C2.5 17.1899 6.8101 21.5 12.1269 21.5C16.6849 21.5 20.503 18.3324 21.5 14.0784Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
};

export default ThemeToggle; 