import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingState {
  isCompleted: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
  userPreferences: UserPreferences | null;
}

interface UserPreferences {
  daily_task_count: number;
  work_start_time: string;
  work_end_time: string;
  notification_preferences: {
    daily_reminder: boolean;
    completion_celebration: boolean;
    weekly_review: boolean;
  };
  productivity_preferences: {
    auto_archive_completed: boolean;
    show_time_estimates: boolean;
    motivational_quotes: boolean;
  };
}

export const useOnboarding = (): OnboardingState & { 
  completeOnboarding: () => void;
  fetchOnboardingStatus: () => Promise<void>;
} => {
  const { user, isAuthenticated } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  const fetchOnboardingStatus = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          onboarding_completed,
          daily_task_count,
          work_start_time,
          work_end_time,
          notification_preferences,
          productivity_preferences
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching onboarding status:', error);
        setIsCompleted(false);
        setUserPreferences(null);
      } else {
        setIsCompleted(profile?.onboarding_completed || false);
        
        if (profile) {
          setUserPreferences({
            daily_task_count: profile.daily_task_count || 6,
            work_start_time: profile.work_start_time || '09:00',
            work_end_time: profile.work_end_time || '17:00',
            notification_preferences: profile.notification_preferences || {
              daily_reminder: true,
              completion_celebration: true,
              weekly_review: true,
            },
            productivity_preferences: profile.productivity_preferences || {
              auto_archive_completed: true,
              show_time_estimates: true,
              motivational_quotes: true,
            },
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching onboarding status:', error);
      setIsCompleted(false);
      setUserPreferences(null);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = () => {
    setIsCompleted(true);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOnboardingStatus();
    } else {
      setIsLoading(false);
      setIsCompleted(false);
      setUserPreferences(null);
    }
  }, [isAuthenticated, user]);

  return {
    isCompleted,
    isLoading,
    needsOnboarding: isAuthenticated && !isCompleted && !isLoading,
    userPreferences,
    completeOnboarding,
    fetchOnboardingStatus,
  };
};