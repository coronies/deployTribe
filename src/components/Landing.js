import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaClipboardList, FaRocket, FaHandshake, FaLightbulb } from 'react-icons/fa';
import '../styles/Landing.css';

const Landing = () => {
  const teamMembers = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      image: "https://source.unsplash.com/300x300/?portrait,man",
      bio: "Passionate about connecting students through meaningful communities."
    },
    {
      name: "Jane Smith",
      role: "Head of Community",
      image: "https://source.unsplash.com/300x300/?portrait,woman",
      bio: "Building bridges between students and clubs for better engagement."
    },
    {
      name: "Alex Johnson",
      role: "Technical Lead",
      image: "https://source.unsplash.com/300x300/?portrait,developer",
      bio: "Creating innovative solutions to help students find their perfect community."
    }
  ];

  const stats = [
    { number: "50+", label: "Active Clubs" },
    { number: "1000+", label: "Student Members" },
    { number: "100+", label: "Events Hosted" },
    { number: "90%", label: "Match Rate" }
  ];

  return (
    <div className="landing-container">
      <section className="landing-hero">
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

      <section className="landing-section">
        <h2>Our Mission</h2>
        <p className="section-description">
          At Tribe, we believe that every student deserves to find their community.
          We're building a platform that makes it easy to discover, join, and engage
          with clubs that match your interests, skills, and aspirations.
        </p>
        <div className="mission-values">
          <div className="value-item">
            <FaRocket className="value-icon" />
            <h3>Innovation</h3>
            <p>Pushing boundaries in community building</p>
          </div>
          <div className="value-item">
            <FaHandshake className="value-icon" />
            <h3>Connection</h3>
            <p>Fostering meaningful relationships</p>
          </div>
          <div className="value-item">
            <FaLightbulb className="value-icon" />
            <h3>Growth</h3>
            <p>Empowering personal development</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Discover</h3>
            <p>Browse through our curated collection of clubs across various categories</p>
          </div>
          <div className="feature">
            <h3>Match</h3>
            <p>Take our personality quiz to find clubs that align with your interests</p>
          </div>
          <div className="feature">
            <h3>Connect</h3>
            <p>Apply to clubs and start engaging with your new community</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Featured Categories</h2>
        <div className="categories-grid">
          <div className="category-card" data-category="Technology">
            <h3>Technology</h3>
            <p>Explore coding, AI, and innovation</p>
          </div>
          <div className="category-card" data-category="Skills">
            <h3>Skills</h3>
            <p>Develop professional abilities</p>
          </div>
          <div className="category-card" data-category="Interest">
            <h3>Interest</h3>
            <p>Pursue your passions</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <img src={member.image} alt={member.name} className="team-image" />
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section cta-section">
        <h2>Ready to Find Your Tribe?</h2>
        <p className="section-description">
          Join thousands of students who have found their perfect community through our platform.
        </p>
        <div className="hero-buttons">
          <Link to="/clubs" className="nav-button primary">
            Browse Clubs
          </Link>
          <Link to="/quiz" className="nav-button secondary">
            Take the Quiz
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing; 