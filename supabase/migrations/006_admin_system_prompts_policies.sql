-- Admin System Prompts Policies
-- This adds the missing RLS policies for admins to manage system prompts

-- Add INSERT policy for admins to create system prompts
CREATE POLICY "Admins can insert system prompts" ON public.system_prompts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add UPDATE policy for admins to modify system prompts
CREATE POLICY "Admins can update system prompts" ON public.system_prompts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add DELETE policy for admins to remove system prompts
CREATE POLICY "Admins can delete system prompts" ON public.system_prompts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update the existing SELECT policy to allow admins to see all prompts (including inactive ones)
DROP POLICY IF EXISTS "Users can view active system prompts" ON public.system_prompts;
CREATE POLICY "Users can view active system prompts and admins can view all" ON public.system_prompts
  FOR SELECT USING (
    is_active = TRUE OR
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

