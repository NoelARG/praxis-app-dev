/**
 * Gets appropriate greeting based on time of day in user's timezone
 */
export function getGreeting(date: Date = new Date(), timezone?: string): {
    greeting: string;
    subtitle: string;
  } {
    let hour: number;
  
    if (timezone) {
      try {
        // Get the hour in the user's timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          hour12: false
        });
        hour = parseInt(formatter.format(date));
      } catch (error) {
        // Fallback to local time if timezone is invalid
        hour = date.getHours();
      }
    } else {
      // Use local time if no timezone provided
      hour = date.getHours();
    }
  
    let greetingText: string;
  
    if (hour >= 5 && hour < 12) {
      greetingText = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      greetingText = 'Good afternoon';
    } else {
      greetingText = 'Good evening';
    }
  
    return {
      greeting: greetingText,
      subtitle: "Let's make today count."
    };
  }