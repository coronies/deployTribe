import React from 'react';
import '../styles/About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About ConnectClub</h1>
        <p className="subtitle">Connecting Students with Their Perfect Club Match</p>
      </div>

      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            ConnectClub aims to revolutionize how university students discover and join clubs
            that align with their interests, skills, and aspirations. We believe that
            meaningful club involvement enhances the college experience and builds lasting
            relationships.
          </p>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo"></div>
              <h3>John Doe</h3>
              <p>Founder & CEO</p>
            </div>
            <div className="team-member">
              <div className="member-photo"></div>
              <h3>Jane Smith</h3>
              <p>Head of Product</p>
            </div>
            <div className="team-member">
              <div className="member-photo"></div>
              <h3>Mike Johnson</h3>
              <p>Lead Developer</p>
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Community</h3>
              <p>Building meaningful connections between students and clubs</p>
            </div>
            <div className="value-item">
              <h3>Innovation</h3>
              <p>Using technology to enhance the club discovery experience</p>
            </div>
            <div className="value-item">
              <h3>Inclusivity</h3>
              <p>Creating opportunities for all students to find their place</p>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h2>Contact Us</h2>
          <p>Have questions or suggestions? We'd love to hear from you!</p>
          <div className="contact-info">
            <p>Email: info@connectclub.com</p>
            <p>Phone: (555) 123-4567</p>
            <p>Address: 123 University Ave, Austin, TX 78712</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About; 