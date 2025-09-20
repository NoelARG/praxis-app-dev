-- Admin Interface Schema
-- This adds admin functionality and user management capabilities

-- Add admin role to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Add user status and moderation fields
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended', 'pending'));

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.user_profiles(user_id);

-- Add admin activity log table
CREATE TABLE IF NOT EXISTS public.admin_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'ban', 'unban', 'suspend', 'help', 'promote', 'demote'
  reason TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_user_id ON public.admin_activity(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target_user_id ON public.admin_activity(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON public.admin_activity(created_at);

-- Enable RLS for admin_activity
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_activity (only admins can access)
CREATE POLICY "Admins can view all admin activity" ON public.admin_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert admin activity" ON public.admin_activity
  FOR INSERT WITH CHECK (
    admin_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update RLS policies to allow admins to view all users
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile and admins can view all" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update user profiles (for moderation)
CREATE POLICY "Admins can update user profiles" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Make you (Noel) an admin - replace with your actual user ID
-- You'll need to run this SQL manually in Supabase with your user ID
-- UPDATE public.user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';

