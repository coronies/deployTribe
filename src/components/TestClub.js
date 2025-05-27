import React from 'react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const TestClub = () => {
  const addTestClubs = async () => {
    try {
      const testClubs = [
        {
          name: "Tech Innovators Club",
          description: "A club for technology enthusiasts and innovators",
          categories: [
            { name: "Programming:Web Development", selected: true },
            { name: "Programming:Mobile Development", selected: true },
            { name: "Technology:AI/ML", selected: true }
          ],
          meetingTimes: {
            monday: ["9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM"],
            tuesday: [],
            wednesday: ["2:00 PM - 3:00 PM"],
            thursday: [],
            friday: ["4:00 PM - 5:00 PM"]
          },
          interests: ["programming", "technology", "innovation", "web development", "AI"],
          commitmentLevel: 3,
          experienceLevel: 2,
        },
        {
          name: "Data Science Society",
          description: "Explore the world of data science and analytics",
          categories: [
            { name: "Technology:Data Science", selected: true },
            { name: "Technology:AI/ML", selected: true },
            { name: "Programming:Python", selected: true }
          ],
          meetingTimes: {
            monday: [],
            tuesday: ["2:00 PM - 3:00 PM"],
            wednesday: [],
            thursday: ["3:00 PM - 4:00 PM"],
            friday: ["1:00 PM - 2:00 PM"]
          },
          interests: ["data science", "AI", "machine learning", "python", "analytics"],
          commitmentLevel: 2,
          experienceLevel: 1,
        },
        {
          name: "Creative Coders Club",
          description: "Where art meets technology",
          categories: [
            { name: "Programming:Creative Coding", selected: true },
            { name: "Arts:Digital Art", selected: true },
            { name: "Technology:Game Development", selected: true }
          ],
          meetingTimes: {
            monday: ["4:00 PM - 5:00 PM"],
            tuesday: [],
            wednesday: ["5:00 PM - 6:00 PM"],
            thursday: [],
            friday: []
          },
          interests: ["creative coding", "digital art", "game development", "design", "programming"],
          commitmentLevel: 2,
          experienceLevel: 1,
        }
      ];

      // Common properties for all clubs
      const commonProps = {
        university: "test-university",
        universityName: "Test University",
        isActive: true,
        memberCount: "0-50",
        timeCommitment: "Medium (3-5 hrs/week)",
        applicationRequired: false,
        acceptingMembers: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      for (const club of testClubs) {
        const clubData = {
          ...club,
          ...commonProps
        };
        const docRef = await addDoc(collection(db, 'clubs'), clubData);
        console.log(`Test club "${club.name}" added with ID: ${docRef.id}`);
      }
      
      alert("Test clubs added successfully!");
    } catch (error) {
      console.error("Error adding test clubs:", error);
      alert("Error adding test clubs: " + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add Test Clubs</h2>
      <p>This will create three test clubs with different interests and meeting times:</p>
      <ul>
        <li>Tech Innovators Club (Web Dev, Mobile Dev, AI/ML)</li>
        <li>Data Science Society (Data Science, AI/ML, Python)</li>
        <li>Creative Coders Club (Creative Coding, Digital Art, Game Dev)</li>
      </ul>
      <button 
        onClick={addTestClubs}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Add Test Clubs
      </button>
    </div>
  );
};

export default TestClub; 