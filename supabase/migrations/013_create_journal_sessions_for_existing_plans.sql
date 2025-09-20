-- Create journal sessions for existing daily plans
-- This migration fixes the issue where existing daily plans don't have journal sessions

-- Insert journal sessions for all existing daily plans that don't have one
-- Using a more compatible approach that works across different PostgreSQL versions
INSERT INTO public.journal_sessions (user_id, daily_plan_id)
SELECT 
  dp.user_id,
  dp.id
FROM public.daily_plans dp
WHERE NOT EXISTS (
  SELECT 1 FROM public.journal_sessions js 
  WHERE js.daily_plan_id = dp.id
);

-- Log how many sessions were created
DO $$
DECLARE
  sessions_created INTEGER;
BEGIN
  -- Count the sessions that were just created
  SELECT COUNT(*) INTO sessions_created 
  FROM public.journal_sessions js
  JOIN public.daily_plans dp ON js.daily_plan_id = dp.id
  WHERE js.created_at >= NOW() - INTERVAL '1 minute';
  
  RAISE NOTICE 'Created % journal sessions for existing daily plans', sessions_created;
END $$;
