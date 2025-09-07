-- Add onboarding and preference fields to user_profiles table
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS daily_task_count INTEGER DEFAULT 6;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS work_start_time TIME DEFAULT '09:00';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS work_end_time TIME DEFAULT '17:00';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"daily_reminder": true, "completion_celebration": true, "weekly_review": true}';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS productivity_preferences JSONB DEFAULT '{"auto_archive_completed": true, "show_time_estimates": true, "motivational_quotes": true}';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON public.user_profiles(onboarding_completed);



