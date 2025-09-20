-- Diagnostic script to check database state
-- Run this in Supabase Dashboard SQL Editor

-- 1. Check if tables exist
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_plans', 'daily_tasks', 'chat_sessions')
ORDER BY table_name;

-- 2. Check daily_plans table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_plans' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check daily_tasks table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('daily_plans', 'daily_tasks')
ORDER BY tablename, policyname;

-- 5. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('daily_plans', 'daily_tasks');

-- 6. Check if there are any existing records
SELECT COUNT(*) as daily_plans_count FROM public.daily_plans;
SELECT COUNT(*) as daily_tasks_count FROM public.daily_tasks;


