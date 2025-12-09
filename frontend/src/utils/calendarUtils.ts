// Utility functions for calendar integration

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm (optional, will calculate 1 hour later if not provided)
  timezone?: string;
  attendeeEmail?: string;
  organizer?: {
    name: string;
    email: string;
  };
}

// Format date/time to ICS format (YYYYMMDDTHHMMSS)
function formatICSDateTime(date: string, time: string, timezone?: string): string {
  const [year, month, day] = date.split('-');
  const [hours, minutes] = time.split(':');
  
  // Format: YYYYMMDDTHHMMSS
  const dateTimeStr = `${year}${month}${day}T${hours}${minutes}00`;
  
  return dateTimeStr;
}

// Calculate end time (1 hour after start if not provided)
function calculateEndTime(startTime: string, durationMinutes: number = 60): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

// Generate ICS file content
export function generateICSFile(event: CalendarEvent): string {
  const startDateTime = formatICSDateTime(event.startDate, event.startTime, event.timezone);
  const endTime = event.endTime || calculateEndTime(event.startTime, 60);
  const endDateTime = formatICSDateTime(event.startDate, endTime, event.timezone);
  
  // Generate unique ID
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@voiceai.com`;
  
  // Current timestamp for DTSTAMP
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  // Escape special characters in text fields
  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  // Build ICS content
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VoiceAI//Partnership Call//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'PRIORITY:5',
  ];

  // Add organizer
  if (event.organizer) {
    icsContent.push(`ORGANIZER;CN=${escapeText(event.organizer.name)}:mailto:${event.organizer.email}`);
  }

  // Add attendee
  if (event.attendeeEmail) {
    icsContent.push(`ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${event.attendeeEmail}`);
  }

  // Add alarm (reminder 15 minutes before)
  icsContent.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Partnership call in 15 minutes',
    'END:VALARM'
  );

  icsContent.push(
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\r\n');
}

// Download ICS file
export function downloadICSFile(icsContent: string, filename: string = 'voiceai-call.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(link.href);
}

// Generate calendar URLs for different providers
export function getCalendarUrls(event: CalendarEvent) {
  const startDateTime = new Date(`${event.startDate}T${event.startTime}`);
  const endTime = event.endTime || calculateEndTime(event.startTime, 60);
  const endDateTime = new Date(`${event.startDate}T${endTime}`);
  
  // Format for URL parameters
  const formatForURL = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startFormatted = formatForURL(startDateTime);
  const endFormatted = formatForURL(endDateTime);
  
  // Google Calendar URL
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
  
  // Outlook.com URL
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${startFormatted}&enddt=${endFormatted}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
  
  // Yahoo Calendar URL
  const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(event.title)}&st=${startFormatted}&et=${endFormatted}&desc=${encodeURIComponent(event.description)}&in_loc=${encodeURIComponent(event.location)}`;
  
  return {
    google: googleUrl,
    outlook: outlookUrl,
    yahoo: yahooUrl,
  };
}

// Add to calendar with provider selection
export function addToCalendar(event: CalendarEvent, provider: 'google' | 'outlook' | 'yahoo' | 'ics' = 'ics'): void {
  if (provider === 'ics') {
    // Generate and download ICS file
    const icsContent = generateICSFile(event);
    const filename = `voiceai-call-${event.startDate}.ics`;
    downloadICSFile(icsContent, filename);
  } else {
    // Open calendar provider URL
    const urls = getCalendarUrls(event);
    window.open(urls[provider], '_blank', 'noopener,noreferrer');
  }
}
