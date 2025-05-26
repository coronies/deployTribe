import { db } from '../firebase/config';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';

export const fetchOpportunities = async (filters = {}) => {
  try {
    // Start with a basic query
    let q = collection(db, 'opportunities');

    // Apply a single filter to avoid composite index requirements
    if (filters.category && filters.category !== 'All') {
      q = query(q, where('tags', 'array-contains', filters.category));
    } else if (filters.type && filters.type !== 'All') {
      q = query(q, where('mode', '==', filters.type.toLowerCase()));
    } else if (filters.compensation && filters.compensation !== 'All') {
      q = query(q, where('compensationType', '==', filters.compensation.toLowerCase()));
    }

    const querySnapshot = await getDocs(q);
    let opportunities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply remaining filters in memory
    if (filters.type && filters.type !== 'All' && !q._query.filters?.some(f => f.field.segments.includes('mode'))) {
      opportunities = opportunities.filter(opp => opp.mode === filters.type.toLowerCase());
    }
    if (filters.compensation && filters.compensation !== 'All' && !q._query.filters?.some(f => f.field.segments.includes('compensationType'))) {
      opportunities = opportunities.filter(opp => opp.compensationType === filters.compensation.toLowerCase());
    }

    // Sort by deadline
    opportunities.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    return opportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

export const searchOpportunities = async (searchTerm) => {
  try {
    const q = collection(db, 'opportunities');
    const querySnapshot = await getDocs(q);
    
    const opportunities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter in memory for search
    return opportunities.filter(opp => 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching opportunities:', error);
    throw error;
  }
}; 