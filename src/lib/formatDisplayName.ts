/**
 * Formats a display name from user profile data
 * Priority: first_name + last_name > email prefix > fallback
 */
export function formatDisplayName(
    firstName?: string | null,
    lastName?: string | null,
    email?: string | null
  ): string {
    // If first_name exists
    if (firstName?.trim()) {
      // If last_name exists -> First L.
      if (lastName?.trim()) {
        return `${firstName.trim()} ${lastName.trim().charAt(0).toUpperCase()}.`;
      }
      // Else -> First
      return firstName.trim();
    }
  
    // Fallback to email prefix (before @)
    if (email?.includes('@')) {
      const emailPrefix = email.split('@')[0];
      
      // Split on common separators and capitalize first token
      const tokens = emailPrefix.split(/[._-]/);
      if (tokens.length > 0 && tokens[0]) {
        return tokens[0].charAt(0).toUpperCase() + tokens[0].slice(1).toLowerCase();
      }
    }
  
    // Final fallback
    return 'User';
  }
  