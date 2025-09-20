-- Test the exact query that's failing
-- Run this in Supabase Dashboard SQL Editor

-- 1. Test basic daily_plans query
SELECT id, plan_date, morning_routine, evening_routine, notes, mood_rating, energy_rating, focus_rating, energy_level, mood_rating_old
FROM public.daily_plans 
WHERE user_id = '7c763041-07ca-4401-ab52-44fa2393b9c3' 
AND plan_date = '2025-09-19';

-- 2. Test daily_tasks query
SELECT id, title, task_order, completed, priority, estimated_minutes, actual_minutes, completed_at
FROM public.daily_tasks 
WHERE daily_plan_id = 'ab2f8bfa-001c-4998-95b2-eeb35ca4f12b';

-- 3. Test the join query (this is what's failing)
SELECT 
  dp.id,
  dp.plan_date,
  dp.morning_routine,
  dp.evening_routine,
  dp.notes,
  dp.mood_rating,
  dp.energy_rating,
  dp.focus_rating,
  dp.energy_level,
  dp.mood_rating_old,
  dt.id as task_id,
  dt.title,
  dt.task_order,
  dt.completed,
  dt.priority,
  dt.estimated_minutes,
  dt.actual_minutes,
  dt.completed_at
FROM public.daily_plans dp
LEFT JOIN public.daily_tasks dt ON dp.id = dt.daily_plan_id
WHERE dp.user_id = '7c763041-07ca-4401-ab52-44fa2393b9c3' 
AND dp.plan_date = '2025-09-19';

-- 4. Check if RLS is blocking the query
SELECT current_user, session_user;


