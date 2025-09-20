-- Add plan_id linkage to chat_sessions for event-driven chat resets

-- Add plan_id column to chat_sessions table
ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.daily_plans(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_plan_id ON public.chat_sessions(plan_id);

-- Add unique constraint to ensure one session per plan (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_session_per_plan'
    ) THEN
        ALTER TABLE public.chat_sessions
        ADD CONSTRAINT unique_session_per_plan UNIQUE (user_id, persona_name, plan_id);
    END IF;
END $$;

-- Backfill existing sessions with plan_id where possible
-- Match sessions to plans by user_id and session_date = plan_date
UPDATE public.chat_sessions 
SET plan_id = dp.id
FROM public.daily_plans dp
WHERE chat_sessions.user_id = dp.user_id 
  AND chat_sessions.session_date = dp.plan_date
  AND chat_sessions.plan_id IS NULL;
