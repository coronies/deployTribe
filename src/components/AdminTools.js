import React, { useState } from 'react';
import { addSampleClubs } from '../utils/sampleClubs';
import { seedOpportunities } from '../utils/seedOpportunities';
import '../styles/AdminTools.css';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const AdminTools = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddSampleClubs = async () => {
    try {
      await addSampleClubs();
      alert('Sample clubs added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding sample clubs. Check console for details.');
    }
  };

  const handleSeedOpportunities = async () => {
    try {
      setLoading(true);
      setMessage('Seeding opportunities data...');
      await seedOpportunities();
      setMessage('Successfully seeded opportunities data!');
    } catch (error) {
      setMessage('Error seeding opportunities: ' + error.message);
      console.error('Error seeding opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleOpportunities = async () => {
    try {
      setLoading(true);
      setMessage('Adding sample opportunities...');

      const sampleOpportunities = [
        {
          title: "Summer Research Assistant",
          description: "Join our research team for a summer project in AI and Machine Learning. Work with leading researchers in the field and gain hands-on experience with cutting-edge technology.",
          mode: "remote",
          compensationType: "paid",
          tags: ["Research", "AI", "Computer Science"],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          organization: "Tech University Lab",
          location: "Remote",
          requirements: ["Programming experience", "Basic ML knowledge"],
          applicationLink: "https://example.com/apply"
        },
        {
          title: "Marketing Intern",
          description: "Help develop and execute marketing strategies for a growing startup. Perfect opportunity for students interested in digital marketing and social media management.",
          mode: "hybrid",
          compensationType: "paid",
          tags: ["Marketing", "Business", "Social Media"],
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          organization: "StartUp Co",
          location: "New York, NY",
          requirements: ["Marketing knowledge", "Social media experience"],
          applicationLink: "https://example.com/apply"
        },
        {
          title: "Volunteer Teaching Assistant",
          description: "Help teach coding to high school students. Make a difference in your community while gaining valuable teaching experience.",
          mode: "in-person",
          compensationType: "unpaid",
          tags: ["Education", "Programming", "Volunteering"],
          deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          organization: "Code4Kids",
          location: "San Francisco, CA",
          requirements: ["Teaching experience", "Programming skills"],
          applicationLink: "https://example.com/apply"
        },
        {
          title: "Data Science Intern",
          description: "Work on real-world data analysis projects. Great opportunity to apply your statistical knowledge and learn from experienced data scientists.",
          mode: "hybrid",
          compensationType: "paid",
          tags: ["Data Science", "Analytics", "Statistics"],
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          organization: "DataCorp Analytics",
          location: "Boston, MA",
          requirements: ["Statistics knowledge", "Python or R experience"],
          applicationLink: "https://example.com/apply"
        },
        {
          title: "UI/UX Design Fellowship",
          description: "Join our design team to create beautiful and intuitive user interfaces. Perfect for aspiring designers looking to build their portfolio.",
          mode: "remote",
          compensationType: "paid",
          tags: ["Design", "UI/UX", "Creative"],
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          organization: "DesignLab Studios",
          location: "Remote",
          requirements: ["Design portfolio", "Figma proficiency"],
          applicationLink: "https://example.com/apply"
        }
      ];

      for (const opportunity of sampleOpportunities) {
        await addDoc(collection(db, 'opportunities'), opportunity);
      }

      setMessage('Sample opportunities added successfully!');
    } catch (error) {
      console.error('Error adding sample opportunities:', error);
      setMessage('Error adding sample opportunities: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-tools">
      <h1>Admin Tools</h1>
      
      <section className="admin-section">
        <h2>Data Management</h2>
        
        <div className="admin-action">
          <h3>Opportunities</h3>
          <button 
            onClick={handleSeedOpportunities}
            disabled={loading}
            className="admin-button"
          >
            {loading ? 'Seeding...' : 'Seed Opportunities Data'}
          </button>
          {message && (
            <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </p>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2>Opportunities Management</h2>
        <div className="admin-action">
          <button 
            onClick={handleAddSampleOpportunities}
            disabled={loading}
            className="admin-button primary"
          >
            {loading ? 'Adding Sample Opportunities...' : 'Add Sample Opportunities'}
          </button>
          {message && (
            <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminTools; 