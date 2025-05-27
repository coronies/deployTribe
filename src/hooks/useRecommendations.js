import { useState, useEffect } from 'react';
import { getRecommendationsForItem, getPersonalizedRecommendations } from '../utils/recommendations';

export const useRecommendations = (userId, currentItem = null, type = 'opportunity') => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        let results;
        if (currentItem) {
          // Get similar items based on the current item
          results = await getRecommendationsForItem(currentItem, type);
        } else if (userId) {
          // Get personalized recommendations based on user's history
          results = await getPersonalizedRecommendations(userId, type);
        } else {
          setRecommendations([]);
          return;
        }

        setRecommendations(results);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, currentItem, type]);

  return { recommendations, loading, error };
}; 