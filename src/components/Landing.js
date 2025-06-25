import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaClipboardList, FaRocket, FaHandshake, FaLightbulb } from 'react-icons/fa';
import '../styles/Landing.css';

const Landing = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);
  const currentSectionRef = useRef(0);

  const sections = [
    { id: 'hero', name: 'Welcome' },
    { id: 'mission', name: 'Mission' },
    { id: 'cta', name: 'Get Started' }
  ];

  // Manage overflow styles for landing page
  useEffect(() => {
    // Add class to enable landing page styles
    document.documentElement.classList.add('landing-page-active');
    
    return () => {
      // Remove class when component unmounts to restore normal scrolling
      document.documentElement.classList.remove('landing-page-active');
    };
  }, []);

  // Mouse tracking for cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = document.querySelector('.landing-container');
      if (container) {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        container.style.setProperty('--mouse-x', `${x}%`);
        container.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update refs when state changes
  useEffect(() => {
    isScrollingRef.current = isScrolling;
  }, [isScrolling]);

  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  const navigateToSection = useCallback((newSection) => {
    setIsScrolling(true);
    setCurrentSection(newSection);
    setTimeout(() => {
      setIsScrolling(false);
    }, 800);
  }, []);

  useEffect(() => {
    let timeoutId;
    let touchStartY = 0;
    let touchEndY = 0;

    const handleWheel = (e) => {
      if (isScrollingRef.current) return;

      e.preventDefault();
      
      // More sensitive scroll detection
      const scrollThreshold = 30;
      if (Math.abs(e.deltaY) < scrollThreshold) return;

      const current = currentSectionRef.current;

      if (e.deltaY > 0 && current < sections.length - 1) {
        // Scroll down
        navigateToSection(current + 1);
      } else if (e.deltaY < 0 && current > 0) {
        // Scroll up
        navigateToSection(current - 1);
      }
    };

    const handleKeyDown = (e) => {
      if (isScrollingRef.current) return;

      const current = currentSectionRef.current;

      if (e.key === 'ArrowDown' && current < sections.length - 1) {
        navigateToSection(current + 1);
      } else if (e.key === 'ArrowUp' && current > 0) {
        navigateToSection(current - 1);
      }
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrollingRef.current) return;
      
      touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      const minSwipeDistance = 50;
      const current = currentSectionRef.current;

      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && current < sections.length - 1) {
          // Swipe up - scroll down
          navigateToSection(current + 1);
        } else if (deltaY < 0 && current > 0) {
          // Swipe down - scroll up
          navigateToSection(current - 1);
        }
      }
    };

    // Use passive: false for wheel to prevent default scrolling
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sections.length, navigateToSection]);

  const scrollToSection = useCallback((index) => {
    if (!isScrollingRef.current && index !== currentSectionRef.current) {
      navigateToSection(index);
    }
  }, [navigateToSection]);

  const stats = [
    { number: "1000+", label: "Organizations" },
    { number: "10,000+", label: "Student Members" },
    { number: "500+", label: "Events Hosted" },
    { number: "95%", label: "Match Rate" }
  ];

  return (
    <div className="landing-container">
      {/* Page Indicator */}
      <div className="page-indicator">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`indicator-dot ${currentSection === index ? 'active' : ''}`}
            onClick={() => scrollToSection(index)}
            title={section.name}
          >
            <span className="indicator-label">{section.name}</span>
          </div>
        ))}
      </div>

      {/* Sections Container */}
      <div 
        className="sections-container"
        style={{ 
          transform: `translateY(-${currentSection * (window.innerHeight - 64)}px)`,
          transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {/* Hero Section */}
        <section className="landing-hero full-section">
          <h1>Welcome to Tribe</h1>
          <p className="hero-subtitle">
            Your Gateway to Meaningful Communities and Lifelong Connections
          </p>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="hero-buttons">
            <Link to="/clubs" className="nav-button primary">
              <FaUsers /> Explore Clubs
            </Link>
            <Link to="/events" className="nav-button secondary">
              <FaCalendarAlt /> Events
            </Link>
            <Link to="/quiz" className="nav-button secondary">
              <FaClipboardList /> Take Quiz
            </Link>
          </div>
        </section>

        {/* Mission Section */}
        <section className="landing-section full-section">
          <h2>Our Mission</h2>
          <p className="section-description">
            At Tribe, we believe that every student deserves to find their community.
            We're building a centralized platform for personalization and collaboration
            that makes it easy to discover, join, and engage with organizations
            that match your interests, skills, and aspirations.
          </p>
          <div className="mission-values">
            <div className="value-item">
              <FaRocket className="value-icon" />
              <h3>Personalization</h3>
              <p>Tailored experiences that match your unique interests and goals</p>
            </div>
            <div className="value-item">
              <FaHandshake className="value-icon" />
              <h3>Collaboration</h3>
              <p>Working together to build stronger communities and connections</p>
            </div>
            <div className="value-item">
              <FaLightbulb className="value-icon" />
              <h3>Centralization</h3>
              <p>One unified platform for all your community and networking needs</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="landing-section cta-section full-section">
          <div className="cta-content">
            <h2>Ready to Find Your Tribe?</h2>
            <p className="cta-subtitle">
              Join thousands of students who have found their perfect community through our platform.
            </p>
            
            <div className="cta-stats">
              <div className="cta-stat">
                <h3>1000+</h3>
                <p>Organizations</p>
              </div>
              <div className="cta-stat">
                <h3>10,000+</h3>
                <p>Student Members</p>
              </div>
              <div className="cta-stat">
                <h3>95%</h3>
                <p>Match Rate</p>
              </div>
            </div>

            <div className="cta-buttons">
              <Link to="/clubs" className="cta-button primary">
                <FaUsers />
                Browse Clubs
              </Link>
            </div>
            
            <div className="cta-features">
              <div className="cta-feature">
                <FaRocket />
                <span>Instant Matching</span>
              </div>
              <div className="cta-feature">
                <FaHandshake />
                <span>Direct Connect</span>
              </div>
              <div className="cta-feature">
                <FaLightbulb />
                <span>Smart Recommendations</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing; 