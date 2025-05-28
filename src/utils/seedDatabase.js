import { seedEvents } from './seedEvents';

export const seedDatabase = async () => {
  try {
    await seedEvents();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// For development/testing purposes only
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to seed the database
  // seedDatabase();
} 