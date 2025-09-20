-- Journal System Migration
-- Creates journal_sessions and journal_messages tables tied to daily_plans

-- Create journal_sessions table
CREATE TABLE IF NOT EXISTS public.journal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_plan_id UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(daily_plan_id) -- One session per daily plan
);

-- Create journal_messages table
CREATE TABLE IF NOT EXISTS public.journal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.journal_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- For storing additional message data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_sessions_user_id ON public.journal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_sessions_daily_plan_id ON public.journal_sessions(daily_plan_id);
CREATE INDEX IF NOT EXISTS idx_journal_sessions_created_at ON public.journal_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_journal_messages_session_id ON public.journal_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_messages_created_at ON public.journal_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_messages_sender ON public.journal_messages(sender);

-- Enable Row Level Security
ALTER TABLE public.journal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journal_sessions
CREATE POLICY "Users can view their own journal sessions" ON public.journal_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal sessions" ON public.journal_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal sessions" ON public.journal_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for journal_messages
CREATE POLICY "Users can view messages in their journal sessions" ON public.journal_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journal_sessions 
      WHERE journal_sessions.id = journal_messages.session_id 
      AND journal_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their journal sessions" ON public.journal_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journal_sessions 
      WHERE journal_sessions.id = journal_messages.session_id 
      AND journal_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their journal sessions" ON public.journal_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journal_sessions 
      WHERE journal_sessions.id = journal_messages.session_id 
      AND journal_sessions.user_id = auth.uid()
    )
  );

-- Function to automatically create journal session when daily plan is created
CREATE OR REPLACE FUNCTION public.create_journal_session_for_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a new journal session for the new daily plan
  INSERT INTO public.journal_sessions (user_id, daily_plan_id)
  VALUES (NEW.user_id, NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create journal session when daily_plan is created
DROP TRIGGER IF EXISTS on_daily_plan_created ON public.daily_plans;
CREATE TRIGGER on_daily_plan_created
  AFTER INSERT ON public.daily_plans
  FOR EACH ROW EXECUTE FUNCTION public.create_journal_session_for_plan();

-- Helper function to start a journal session (for manual creation if needed)
CREATE OR REPLACE FUNCTION public.start_journal_session(user_id_param UUID, daily_plan_id_param UUID)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Insert new journal session
  INSERT INTO public.journal_sessions (user_id, daily_plan_id)
  VALUES (user_id_param, daily_plan_id_param)
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to save a journal message
CREATE OR REPLACE FUNCTION public.save_journal_message(
  session_id_param UUID,
  sender_param TEXT,
  content_param TEXT,
  metadata_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  message_id UUID;
BEGIN
  -- Validate sender
  IF sender_param NOT IN ('user', 'assistant') THEN
    RAISE EXCEPTION 'Invalid sender: %', sender_param;
  END IF;
  
  -- Insert the message
  INSERT INTO public.journal_messages (session_id, sender, content, metadata)
  VALUES (session_id_param, sender_param, content_param, metadata_param)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get journal messages for a session
CREATE OR REPLACE FUNCTION public.get_journal_messages(session_id_param UUID)
RETURNS TABLE (
  id UUID,
  sender TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jm.id,
    jm.sender,
    jm.content,
    jm.metadata,
    jm.created_at
  FROM public.journal_messages jm
  WHERE jm.session_id = session_id_param
  ORDER BY jm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.start_journal_session(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_journal_message(UUID, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_journal_messages(UUID) TO authenticated;
