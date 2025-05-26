import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Normalize text for comparison
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
};

// Normalize URL for comparison by removing protocol, www, and trailing slashes
const normalizeUrl = (url) => {
  if (!url) return '';
  return url
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
    .trim();
};

// Extract domain from URL
const getDomain = (url) => {
  if (!url) return '';
  try {
    const normalized = url.toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    return normalized.split('/')[0];
  } catch (error) {
    return '';
  }
};

// Check if two URLs point to the same content
const areUrlsRelated = (url1, url2) => {
  if (!url1 || !url2) return false;
  
  const norm1 = normalizeUrl(url1);
  const norm2 = normalizeUrl(url2);
  
  // Check for exact match after normalization
  if (norm1 === norm2) return true;
  
  // Check if URLs are from the same domain and have similar paths
  const domain1 = getDomain(url1);
  const domain2 = getDomain(url2);
  
  if (domain1 === domain2) {
    const path1 = norm1.replace(domain1, '');
    const path2 = norm2.replace(domain2, '');
    
    // If paths are similar (allowing for tracking parameters, etc.)
    const similarity = calculateSimilarity(path1, path2);
    return similarity > 0.8;
  }
  
  return false;
};

// Calculate similarity between two strings (using Levenshtein distance)
const calculateSimilarity = (str1, str2) => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return 1 - (track[str2.length][str1.length] / Math.max(str1.length, str2.length));
};

// Check if an opportunity is potentially a duplicate
export const checkDuplicateOpportunity = async (opportunity) => {
  const duplicates = [];

  // Create a query to find potential duplicates within the time range
  const q = query(
    collection(db, 'opportunities'),
    where('deadline', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Past 30 days
  );

  const querySnapshot = await getDocs(q);
  
  querySnapshot.forEach((doc) => {
    const existingOpp = doc.data();
    
    // Check if any of the links match
    const linksMatch = areUrlsRelated(opportunity.ctaLink, existingOpp.ctaLink);
    
    // If the links match, it's definitely a duplicate
    if (linksMatch) {
      // Calculate title similarity for display purposes
      const titleSimilarity = calculateSimilarity(
        normalizeText(opportunity.title),
        normalizeText(existingOpp.title)
      );
      
      duplicates.push({
        id: doc.id,
        ...existingOpp,
        similarityScore: titleSimilarity,
        isDuplicateLink: true
      });
    }
  });

  return duplicates;
};

// Check if an event is potentially a duplicate
export const checkDuplicateEvent = async (event) => {
  const duplicates = [];

  // Create a query to find potential duplicates
  const q = query(
    collection(db, 'events'),
    where('startDate', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Past week
  );

  const querySnapshot = await getDocs(q);
  
  querySnapshot.forEach((doc) => {
    const existingEvent = doc.data();
    
    // Check if registration links match
    const linksMatch = areUrlsRelated(event.registrationLink, existingEvent.registrationLink);
    
    // If the links match, it's definitely a duplicate
    if (linksMatch) {
      // Calculate title similarity for display purposes
      const titleSimilarity = calculateSimilarity(
        normalizeText(event.title),
        normalizeText(existingEvent.title)
      );
      
      duplicates.push({
        id: doc.id,
        ...existingEvent,
        similarityScore: titleSimilarity,
        isDuplicateLink: true
      });
    }
  });

  return duplicates;
}; 