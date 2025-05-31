const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create or update a club
export async function createClub(clubData, logoFile) {
  try {
    const response = await fetch(`${API_URL}/clubs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...clubData,
        logo_url: logoFile ? logoFile.url : null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create club');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
}

// Get club details
export async function getClub(clubId) {
  try {
    const response = await fetch(`${API_URL}/clubs/${clubId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch club');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching club:', error);
    throw error;
  }
}

// Get all clubs
export async function getAllClubs() {
  try {
    const response = await fetch(`${API_URL}/clubs`);
    if (!response.ok) {
      throw new Error('Failed to fetch clubs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
}

// Join a club
export async function joinClub(clubId, userId) {
  try {
    const response = await fetch(`${API_URL}/clubs/${clubId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to join club');
    }
  } catch (error) {
    console.error('Error joining club:', error);
    throw error;
  }
}

// Leave a club
export async function leaveClub(clubId, userId) {
  try {
    const response = await fetch(`${API_URL}/clubs/${clubId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to leave club');
    }
  } catch (error) {
    console.error('Error leaving club:', error);
    throw error;
  }
}

// Create a club event
export async function createEvent(clubId, eventData) {
  try {
    const response = await fetch(`${API_URL}/clubs/${clubId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// Get club recommendations
export async function getRecommendedClubs(userInterests) {
  try {
    const response = await fetch(`${API_URL}/clubs/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interests: userInterests }),
    });

    if (!response.ok) {
      throw new Error('Failed to get recommendations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

// Get club analytics
export async function getClubAnalytics(clubId) {
  try {
    const response = await fetch(`${API_URL}/clubs/${clubId}/analytics`);
    if (!response.ok) {
      throw new Error('Failed to fetch club analytics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching club analytics:', error);
    throw error;
  }
}

// Update club analytics
export async function updateClubAnalytics(clubId, analyticsData) {
  try {
    const response = await fetch(`${API_URL}/clubs/${clubId}/analytics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
    });

    if (!response.ok) {
      throw new Error('Failed to update analytics');
    }
  } catch (error) {
    console.error('Error updating analytics:', error);
    throw error;
  }
}

// Get upcoming events
export async function getUpcomingEvents(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.isVirtual !== undefined) queryParams.append('isVirtual', filters.isVirtual);

    const response = await fetch(`${API_URL}/events/upcoming?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming events');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
}

// Get sponsorship opportunities
export async function getSponsorshipOpportunities() {
  try {
    const response = await fetch(`${API_URL}/sponsorships`);
    if (!response.ok) {
      throw new Error('Failed to fetch sponsorship opportunities');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sponsorship opportunities:', error);
    throw error;
  }
}

// Apply for sponsorship
export async function applyForSponsorship(clubId, sponsorshipId, applicationData) {
  try {
    const response = await fetch(`${API_URL}/sponsorships/${sponsorshipId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clubId,
        ...applicationData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply for sponsorship');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error applying for sponsorship:', error);
    throw error;
  }
}

// Apply to a club
export async function applyToClub(clubId, userId) {
  try {
    const response = await fetch(`${API_URL}/clubs/${clubId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply to club');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error applying to club:', error);
    throw error;
  }
} 