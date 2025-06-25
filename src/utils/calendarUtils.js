// Google Calendar utility functions

export const formatDateForCalendar = (date) => {
  if (!date) return '';
  
  let formattedDate;
  try {
    // Handle Firestore timestamp objects
    if (date.toDate && typeof date.toDate === 'function') {
      formattedDate = date.toDate();
    } else if (date.seconds) {
      // Firestore timestamp with seconds
      formattedDate = new Date(date.seconds * 1000);
    } else {
      formattedDate = new Date(date);
    }
    
    // Check if date is valid
    if (isNaN(formattedDate.getTime())) {
      formattedDate = new Date();
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    formattedDate = new Date();
  }
  
  // Format as YYYYMMDDTHHMMSSZ for Google Calendar
  return formattedDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

export const generateGoogleCalendarEventUrl = (event) => {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  
  // Handle both date and startDate fields for compatibility
  const eventDate = event.startDate || event.date;
  const startDate = formatDateForCalendar(eventDate);
  
  // Calculate end date (assume 2 hours duration if not specified)
  let endDate;
  if (event.endDate) {
    endDate = formatDateForCalendar(event.endDate);
  } else {
    const start = new Date(eventDate);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
    endDate = formatDateForCalendar(end);
  }
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Event',
    dates: `${startDate}/${endDate}`,
    details: `${event.description || 'No description available'}\n\nOrganizer: ${event.organization || event.clubName || 'Unknown'}\n\nMode: ${event.mode || 'TBD'}\n\nRegistration: ${event.registrationLink || 'Contact organizer'}`,
    location: event.location || 'Location TBD',
    sprop: 'website:tribe-app'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const generateGoogleCalendarOpportunityUrl = (opportunity) => {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  
  // Use deadline as the event date
  const deadlineDate = formatDateForCalendar(opportunity.deadline);
  // Set reminder for day before deadline
  const reminderDate = new Date(opportunity.deadline);
  reminderDate.setDate(reminderDate.getDate() - 1);
  const formattedReminderDate = formatDateForCalendar(reminderDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Deadline: ${opportunity.title}`,
    dates: `${formattedReminderDate}/${deadlineDate}`,
    details: `${opportunity.description || 'No description available'}\n\nOrganization: ${opportunity.organization || 'Unknown'}\n\nLocation: ${opportunity.location || 'Remote/TBD'}\n\nType: ${opportunity.mode || 'TBD'}\n\nCompensation: ${opportunity.compensationType || 'TBD'}\n\nApplication Link: ${opportunity.applicationLink || 'Contact organization'}\n\nTags: ${opportunity.tags ? opportunity.tags.join(', ') : 'None'}`,
    location: opportunity.location || 'Remote/TBD',
    sprop: 'website:tribe-app'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const addToGoogleCalendar = (item, type = 'event') => {
  try {
    let calendarUrl;
    
    if (type === 'event') {
      calendarUrl = generateGoogleCalendarEventUrl(item);
    } else if (type === 'opportunity') {
      calendarUrl = generateGoogleCalendarOpportunityUrl(item);
    } else {
      throw new Error('Invalid calendar item type');
    }
    
    // Open Google Calendar in new tab
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Error adding to Google Calendar:', error);
    alert('Failed to add to Google Calendar. Please try again.');
  }
}; 