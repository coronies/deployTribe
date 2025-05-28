import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SAMPLE_EVENTS = [
  {
    title: 'Tech Startup Workshop',
    clubId: 'club1',
    clubName: 'Entrepreneurship Society',
    date: new Date('2024-04-15T14:00:00').toISOString(),
    location: 'Innovation Hub - Room 201',
    description: 'Join us for an intensive workshop on launching your tech startup. Learn from successful founders and industry experts.',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
    category: 'Workshop',
    capacity: 50,
    attendees: [],
    requirements: 'Laptop recommended',
    price: 'Free',
    mode: 'in-person',
    tags: ['Technology', 'Entrepreneurship', 'Workshop']
  },
  {
    title: 'Annual Hackathon 2024',
    clubId: 'club2',
    clubName: 'Code Club',
    date: new Date('2024-04-20T09:00:00').toISOString(),
    location: 'Computer Science Building',
    description: 'A 24-hour coding competition where you can build amazing projects, learn new technologies, and win exciting prizes!',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    category: 'Competition',
    capacity: 200,
    attendees: [],
    requirements: 'Laptop, Student ID',
    price: 'Free',
    mode: 'hybrid',
    tags: ['Technology', 'Programming', 'Competition']
  },
  {
    title: 'Design Thinking Workshop',
    clubId: 'club3',
    clubName: 'UX Design Club',
    date: new Date('2024-04-25T15:00:00').toISOString(),
    location: 'Design Studio - Room 302',
    description: 'Learn the principles of design thinking and how to apply them to solve real-world problems.',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12',
    category: 'Workshop',
    capacity: 30,
    attendees: [],
    requirements: 'Notebook, Design tools if available',
    price: '$10',
    mode: 'in-person',
    tags: ['Design', 'UX/UI', 'Workshop']
  }
];

export const seedEvents = async () => {
  try {
    console.log('Starting to seed events...');
    const eventsCollection = collection(db, 'events');
    
    for (const event of SAMPLE_EVENTS) {
      const docRef = await addDoc(eventsCollection, {
        ...event,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added event: ${event.title} with ID: ${docRef.id}`);
    }
    
    console.log('Successfully seeded all events!');
  } catch (error) {
    console.error('Error seeding events:', error);
    throw error;
  }
};

export default seedEvents; 