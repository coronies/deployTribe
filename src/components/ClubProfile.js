import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import Calendar from 'react-calendar';
import '../styles/ClubProfile.css';
import 'react-calendar/dist/Calendar.css';

// Demographics data visualization component
const DemographicChart = ({ data, title }) => {
  return (
    <div className="demographic-chart">
      <h3>{title}</h3>
      <div className="pie-chart">
        {Object.entries(data).map(([key, value], index) => (
          <div
            key={key}
            className="pie-segment"
            style={{
              '--percentage': `${value}%`,
              '--rotation': `${index * (360 / Object.keys(data).length)}deg`,
              '--color': `var(--chart-color-${index + 1})`
            }}
          >
            <span className="segment-label">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function ClubProfile({ clubId }) {
  const { currentUser } = useAuth();
  const [clubData, setClubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample demographics data
  const demographics = {
    major: {
      'Computer Science': 35,
      'Business': 25,
      'Engineering': 20,
      'Arts': 15,
      'Others': 5
    },
    year: {
      'Freshman': 30,
      'Sophomore': 25,
      'Junior': 25,
      'Senior': 20
    },
    race: {
      'Asian': 40,
      'White': 30,
      'Hispanic': 20,
      'Other': 10
    },
    gender: {
      'Male': 55,
      'Female': 40,
      'Other': 5
    }
  };

  useEffect(() => {
    const loadClubData = async () => {
      try {
        const clubDoc = await getDoc(doc(db, 'clubs', clubId));
        setClubData(clubDoc.data());
      } catch (error) {
        console.error('Error loading club data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClubData();
  }, [clubId]);

  if (loading) {
    return <div className="loading-spinner" />;
  }

  return (
    <div className="club-profile-container">
      <div className="club-header">
        <img src={clubData?.logo || '/default-club-logo.png'} alt="Club Logo" className="club-logo" />
        <h1>Texas Convergent</h1>
        <div className="club-tags">
          <span className="tag">Applied Innovation</span>
          <span className="tag">Build</span>
          <span className="tag">Research</span>
          <span className="tag">Leadership & Innovation</span>
        </div>
      </div>

      <div className="club-content">
        <div className="left-column">
          <section className="basic-info">
            <h2>Basic Information</h2>
            <div className="info-item">
              <span className="icon">👥</span>
              <span>300+ Members</span>
            </div>
            <div className="info-item">
              <span className="icon">📅</span>
              <span>Application needed: Yes</span>
            </div>
            <div className="info-item">
              <span className="icon">🕒</span>
              <span>Average time commitment: 2-4 hrs a week</span>
            </div>
            <div className="info-item">
              <span className="icon">🌟</span>
              <span>Not taking new members currently</span>
            </div>
          </section>

          <section className="overview">
            <h2>Overview</h2>
            <p>Fill your dreams with possibilities in a click. Get the perfect match from the list below. The perfect match is just a click away.</p>
            <ol>
              <li>Estimate 1 week ahead to fit your next team.</li>
              <li>Fix any break work. The perfect image must fit.</li>
              <li>Maintain always high data also such as parties.</li>
            </ol>
            <p>Auto-generate:</p>
            <p>The system will automatically fill the created forms with the perfect amount of Lorem ipsum.</p>
          </section>

          <section className="faq">
            <h2>FAQ</h2>
            <div className="faq-item">
              <h3>Q: Lorem ipsum?</h3>
              <p>A: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="faq-item">
              <h3>Q: Lorem ipsum?</h3>
              <p>A: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="calendar-section">
            <h2>February 2024</h2>
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              className="custom-calendar"
            />
          </section>

          <section className="demographics">
            <h2>Demographics</h2>
            <div className="charts-grid">
              <DemographicChart data={demographics.major} title="Major" />
              <DemographicChart data={demographics.year} title="Year" />
              <DemographicChart data={demographics.race} title="Race" />
              <DemographicChart data={demographics.gender} title="Gender" />
            </div>
          </section>

          <section className="officers">
            <h2>Officers</h2>
            <div className="officers-grid">
              <div className="officer-card">
                <img src="/officer1.jpg" alt="President" />
                <h3>President</h3>
              </div>
              <div className="officer-card">
                <img src="/officer2.jpg" alt="Vice President" />
                <h3>Vice President</h3>
              </div>
              <div className="officer-card">
                <img src="/officer3.jpg" alt="Secretary" />
                <h3>Secretary</h3>
              </div>
              <div className="officer-card">
                <img src="/officer4.jpg" alt="Treasurer" />
                <h3>Treasurer</h3>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ClubProfile; 