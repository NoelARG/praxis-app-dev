-- Link daily_tasks to daily_plans and add useful fields

ALTER TABLE public.daily_tasks
  ADD COLUMN IF NOT EXISTS daily_plan_id UUID REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS task_order INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS actual_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_tasks_plan_id ON public.daily_tasks(daily_plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_plan ON public.daily_tasks(user_id, daily_plan_id);
