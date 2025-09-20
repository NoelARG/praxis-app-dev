-- Add energy_level and mood_rating fields to daily_plans table

ALTER TABLE public.daily_plans
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  ADD COLUMN IF NOT EXISTS mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10);

-- Add indexes for performance if needed
CREATE INDEX IF NOT EXISTS idx_daily_plans_energy_level ON public.daily_plans(energy_level);
CREATE INDEX IF NOT EXISTS idx_daily_plans_mood_rating ON public.daily_plans(mood_rating);


