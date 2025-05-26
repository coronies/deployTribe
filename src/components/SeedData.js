import React from 'react';
import { addSampleClubs } from '../utils/sampleClubs';

const SeedData = () => {
  const handleSeedData = async () => {
    try {
      await addSampleClubs();
      alert('Sample data added successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error adding sample data. Check console for details.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Seed Data</h2>
      <button onClick={handleSeedData}>Add Sample Data</button>
    </div>
  );
};

export default SeedData; 