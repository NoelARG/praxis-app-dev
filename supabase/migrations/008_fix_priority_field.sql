-- Fix priority field to be TEXT instead of INTEGER for better semantics

-- First, drop the existing priority column if it exists as INTEGER
ALTER TABLE public.daily_tasks DROP COLUMN IF EXISTS priority;

-- Add the priority column as TEXT with proper constraints
ALTER TABLE public.daily_tasks 
  ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_daily_tasks_priority ON public.daily_tasks(priority);


