-- Create deleted_tasks table for tracking discarded rollover tasks
CREATE TABLE IF NOT EXISTS public.deleted_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_task_id UUID, -- Reference to the original task if available
  task_title TEXT NOT NULL,
  original_plan_date DATE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deletion_reason TEXT DEFAULT 'user_deleted_rollover',
  notes TEXT -- Optional user notes about why they deleted it
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deleted_tasks_user_id ON public.deleted_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_tasks_deleted_at ON public.deleted_tasks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_deleted_tasks_original_plan_date ON public.deleted_tasks(original_plan_date);

-- Enable RLS
ALTER TABLE public.deleted_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own deleted tasks" ON public.deleted_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deleted tasks" ON public.deleted_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Optional: Create a view for user reflection on deleted tasks
CREATE OR REPLACE VIEW public.user_deleted_tasks_summary AS
SELECT 
  user_id,
  original_plan_date,
  COUNT(*) as tasks_deleted,
  STRING_AGG(task_title, '; ') as deleted_task_titles,
  MIN(deleted_at) as first_deletion,
  MAX(deleted_at) as last_deletion
FROM public.deleted_tasks
GROUP BY user_id, original_plan_date
ORDER BY original_plan_date DESC;

-- Grant access to the view
GRANT SELECT ON public.user_deleted_tasks_summary TO authenticated;
