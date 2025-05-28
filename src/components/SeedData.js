import React, { useState } from 'react';
import { addSampleClubs } from '../utils/sampleClubs';
import { seedClubs, seedOpportunities, seedAllData } from '../utils/seedData';

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeedClubs = async () => {
    setLoading(true);
    setMessage('');
    try {
      await seedClubs();
      setMessage('Sample clubs added successfully!');
    } catch (error) {
      console.error('Error seeding clubs:', error);
      setMessage('Error adding sample clubs. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedOpportunities = async () => {
    setLoading(true);
    setMessage('');
    try {
      await seedOpportunities();
      setMessage('Sample opportunities added successfully!');
    } catch (error) {
      console.error('Error seeding opportunities:', error);
      setMessage('Error adding sample opportunities. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAllData = async () => {
    setLoading(true);
    setMessage('');
    try {
      await seedAllData();
      setMessage('All sample data added successfully!');
    } catch (error) {
      console.error('Error seeding all data:', error);
      setMessage('Error adding sample data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLegacyData = async () => {
    setLoading(true);
    setMessage('');
    try {
      await addSampleClubs();
      setMessage('Legacy sample data added successfully!');
    } catch (error) {
      console.error('Error seeding legacy data:', error);
      setMessage('Error adding legacy sample data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Seed Data for Emulator</h2>
      <p>Add sample data to your Firebase emulator for testing purposes.</p>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e8',
          color: message.includes('Error') ? '#c62828' : '#2e7d32',
          borderRadius: '4px',
          border: `1px solid ${message.includes('Error') ? '#ef5350' : '#4caf50'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={handleSeedClubs}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Adding...' : 'Add Sample Clubs'}
        </button>

        <button 
          onClick={handleSeedOpportunities}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Adding...' : 'Add Sample Opportunities'}
        </button>

        <button 
          onClick={handleSeedAllData}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Adding...' : 'Add All Sample Data'}
        </button>

        <button 
          onClick={handleSeedLegacyData}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Adding...' : 'Add Legacy Sample Data'}
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Note:</strong> Make sure your Firebase emulators are running before seeding data.</p>
        <p>You can access the emulator UI at: <a href="http://127.0.0.1:4090" target="_blank" rel="noopener noreferrer">http://127.0.0.1:4090</a></p>
      </div>
    </div>
  );
};

export default SeedData; 