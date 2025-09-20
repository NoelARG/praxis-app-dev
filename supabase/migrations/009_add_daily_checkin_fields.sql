-- Add daily check-in quiz fields to daily_plans table
ALTER TABLE public.daily_plans
  ADD COLUMN IF NOT EXISTS mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  ADD COLUMN IF NOT EXISTS energy_rating INTEGER CHECK (energy_rating >= 1 AND energy_rating <= 5),
  ADD COLUMN IF NOT EXISTS focus_rating INTEGER CHECK (focus_rating >= 1 AND focus_rating <= 5);


