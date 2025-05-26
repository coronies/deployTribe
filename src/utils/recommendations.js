import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

// Extract keywords from text using simple NLP techniques
const extractKeywords = (text) => {
  if (!text) return [];
  
  // Convert to lowercase and remove special characters
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split into words
  const words = cleanText.split(/\s+/);
  
  // Remove common stop words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const keywords = words.filter(word => !stopWords.has(word) && word.length > 2);
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Calculate similarity score between two sets of keywords
const calculateKeywordSimilarity = (keywords1, keywords2) => {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

// Get user interests based on their applications and interactions
const getUserInterests = async (userId) => {
  const interests = {
    keywords: new Set(),
    organizations: new Set(),
    categories: new Set(),
    locations: new Set()
  };

  // Get user's applications
  const applicationsQuery = query(
    collection(db, 'applications'),
    where('userId', '==', userId)
  );
  const applicationsSnapshot = await getDocs(applicationsQuery);

  // Get user's saved items
  const savedItemsQuery = query(
    collection(db, 'savedItems'),
    where('userId', '==', userId)
  );
  const savedItemsSnapshot = await getDocs(savedItemsQuery);

  // Process applications
  for (const doc of applicationsSnapshot.docs) {
    const application = doc.data();
    if (application.opportunity) {
      interests.keywords = new Set([
        ...interests.keywords,
        ...extractKeywords(application.opportunity.title),
        ...extractKeywords(application.opportunity.description),
        ...(application.opportunity.tags || [])
      ]);
      interests.organizations.add(application.opportunity.organization);
      interests.categories.add(application.opportunity.category);
      if (application.opportunity.location) {
        interests.locations.add(application.opportunity.location);
      }
    }
  }

  // Process saved items
  for (const doc of savedItemsSnapshot.docs) {
    const savedItem = doc.data();
    if (savedItem.item) {
      interests.keywords = new Set([
        ...interests.keywords,
        ...extractKeywords(savedItem.item.title),
        ...extractKeywords(savedItem.item.description),
        ...(savedItem.item.tags || [])
      ]);
      interests.organizations.add(savedItem.item.organization);
      interests.categories.add(savedItem.item.category);
      if (savedItem.item.location) {
        interests.locations.add(savedItem.item.location);
      }
    }
  }

  return {
    keywords: Array.from(interests.keywords),
    organizations: Array.from(interests.organizations),
    categories: Array.from(interests.categories),
    locations: Array.from(interests.locations)
  };
};

// Get recommendations based on an item
export const getRecommendationsForItem = async (item, type = 'opportunity', limit = 5) => {
  const itemKeywords = [
    ...extractKeywords(item.title),
    ...extractKeywords(item.description),
    ...(item.tags || []),
    item.organization,
    item.category
  ];

  const collection_name = type === 'opportunity' ? 'opportunities' : 'events';
  const q = query(
    collection(db, collection_name),
    where('deadline', '>=', new Date()), // Only future opportunities/events
    orderBy('deadline'),
    limit(20) // Get more items than needed for filtering
  );

  const querySnapshot = await getDocs(q);
  const recommendations = [];

  querySnapshot.docs.forEach(doc => {
    const recommendedItem = doc.data();
    
    // Don't recommend the same item
    if (doc.id === item.id) return;

    const recommendedKeywords = [
      ...extractKeywords(recommendedItem.title),
      ...extractKeywords(recommendedItem.description),
      ...(recommendedItem.tags || []),
      recommendedItem.organization,
      recommendedItem.category
    ];

    const similarity = calculateKeywordSimilarity(itemKeywords, recommendedKeywords);

    if (similarity > 0.1) { // Minimum similarity threshold
      recommendations.push({
        id: doc.id,
        ...recommendedItem,
        similarityScore: similarity
      });
    }
  });

  // Sort by similarity score and return top N
  return recommendations
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
};

// Get personalized recommendations for a user
export const getPersonalizedRecommendations = async (userId, type = 'opportunity', limit = 5) => {
  const userInterests = await getUserInterests(userId);
  
  const collection_name = type === 'opportunity' ? 'opportunities' : 'events';
  const q = query(
    collection(db, collection_name),
    where('deadline', '>=', new Date()), // Only future opportunities/events
    orderBy('deadline'),
    limit(20) // Get more items than needed for filtering
  );

  const querySnapshot = await getDocs(q);
  const recommendations = [];

  querySnapshot.docs.forEach(doc => {
    const item = doc.data();
    const itemKeywords = [
      ...extractKeywords(item.title),
      ...extractKeywords(item.description),
      ...(item.tags || [])
    ];

    // Calculate different types of matches
    const keywordSimilarity = calculateKeywordSimilarity(userInterests.keywords, itemKeywords);
    const organizationMatch = userInterests.organizations.includes(item.organization) ? 0.3 : 0;
    const categoryMatch = userInterests.categories.includes(item.category) ? 0.2 : 0;
    const locationMatch = userInterests.locations.includes(item.location) ? 0.1 : 0;

    const totalScore = keywordSimilarity * 0.4 + organizationMatch + categoryMatch + locationMatch;

    if (totalScore > 0.2) { // Minimum relevance threshold
      recommendations.push({
        id: doc.id,
        ...item,
        relevanceScore: totalScore
      });
    }
  });

  // Sort by relevance score and return top N
  return recommendations
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}; 