import { supabase } from '@/integrations/supabase/client';

export interface JournalMessage {
  id: string;
  sender: 'user' | 'assistant';
  message_text: string; // Updated to match database column name
  metadata?: Record<string, any>;
  created_at: string;
}

export interface JournalSession {
  id: string;
  user_id: string;
  daily_plan_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Start a new journal session for a user and daily plan
 * @param userId - The user's ID
 * @param dailyPlanId - The daily plan's ID
 * @returns The session ID of the created session
 */
export async function startJournalSession(userId: string, dailyPlanId: string): Promise<string> {
  try {
    // Use direct insert instead of RPC function to avoid issues
    const { data, error } = await supabase
      .from('journal_sessions')
      .insert({
        user_id: userId,
        daily_plan_id: dailyPlanId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error starting journal session:', error);
      throw new Error(`Failed to start journal session: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('Error in startJournalSession:', error);
    throw error;
  }
}

/**
 * Save a message to a journal session
 * @param sessionId - The journal session ID
 * @param sender - Who sent the message ('user' or 'assistant')
 * @param text - The message content
 * @param metadata - Optional metadata for the message
 * @returns The message ID of the created message
 */
export async function saveJournalMessage(
  sessionId: string,
  sender: 'user' | 'assistant',
  text: string,
  metadata?: Record<string, any>
): Promise<string> {
  try {
    // Use direct insert instead of RPC function to avoid issues
    const { data, error } = await supabase
      .from('journal_messages')
      .insert({
        session_id: sessionId,
        sender: sender,
        message_text: text, // Use correct column name
        metadata: metadata || {}
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving journal message:', error);
      throw new Error(`Failed to save journal message: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('Error in saveJournalMessage:', error);
    throw error;
  }
}

/**
 * Get all messages for a journal session
 * @param sessionId - The journal session ID
 * @returns Array of journal messages
 */
export async function getJournalMessages(sessionId: string): Promise<JournalMessage[]> {
  try {
    // Use direct query instead of RPC function to avoid column reference issues
    const { data, error } = await supabase
      .from('journal_messages')
      .select('id, sender, message_text, metadata, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting journal messages:', error);
      throw new Error(`Failed to get journal messages: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJournalMessages:', error);
    throw error;
  }
}

/**
 * Get the journal session for a specific daily plan
 * @param userId - The user's ID
 * @param dailyPlanId - The daily plan's ID
 * @returns The journal session or null if not found
 */
export async function getJournalSessionByPlan(userId: string, dailyPlanId: string): Promise<JournalSession | null> {
  try {
    const { data, error } = await supabase
      .from('journal_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('daily_plan_id', dailyPlanId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error getting journal session by plan:', error);
      throw new Error(`Failed to get journal session: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error('Error in getJournalSessionByPlan:', error);
    throw error;
  }
}

/**
 * Get the most recent journal session for a user
 * @param userId - The user's ID
 * @returns The most recent journal session or null if none found
 */
export async function getMostRecentJournalSession(userId: string): Promise<JournalSession | null> {
  try {
    const { data, error } = await supabase
      .from('journal_sessions')
      .select(`
        *,
        daily_plans!inner(plan_date)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting most recent journal session:', error);
      throw new Error(`Failed to get most recent journal session: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error('Error in getMostRecentJournalSession:', error);
    throw error;
  }
}

/**
 * Get today's journal session for a user (if a daily plan exists for today)
 * @param userId - The user's ID
 * @returns Today's journal session or null if no plan exists for today
 */
export async function getTodaysJournalSession(userId: string): Promise<JournalSession | null> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // First, get today's daily plan
    const { data: dailyPlan, error: planError } = await supabase
      .from('daily_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('plan_date', today)
      .single();

    if (planError && planError.code !== 'PGRST116') {
      console.error('Error getting today\'s daily plan:', planError);
      throw new Error(`Failed to get today's daily plan: ${planError.message}`);
    }

    if (!dailyPlan) {
      return null; // No daily plan for today
    }

    // Then get the journal session for that plan
    const { data: journalSession, error: sessionError } = await supabase
      .from('journal_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('daily_plan_id', dailyPlan.id)
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('Error getting journal session:', sessionError);
      throw new Error(`Failed to get journal session: ${sessionError.message}`);
    }

    return journalSession || null;
  } catch (error) {
    console.error('Error in getTodaysJournalSession:', error);
    throw error;
  }
}

/**
 * Create journal sessions for all existing daily plans that don't have one
 * This is a utility function to fix the issue where existing plans don't have journal sessions
 * @param userId - The user's ID (optional, if not provided will create for all users)
 * @returns Number of sessions created
 */
export async function createMissingJournalSessions(userId?: string): Promise<number> {
  try {
    let query = supabase
      .from('daily_plans')
      .select('id, user_id');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: plans, error: plansError } = await query;
    
    if (plansError) {
      console.error('Error fetching daily plans:', plansError);
      throw new Error(`Failed to fetch daily plans: ${plansError.message}`);
    }
    
    if (!plans || plans.length === 0) {
      return 0;
    }
    
    // Get existing journal sessions for these plans
    const { data: existingSessions, error: sessionsError } = await supabase
      .from('journal_sessions')
      .select('daily_plan_id')
      .in('daily_plan_id', plans.map(p => p.id));
    
    if (sessionsError) {
      console.error('Error fetching existing journal sessions:', sessionsError);
      throw new Error(`Failed to fetch existing journal sessions: ${sessionsError.message}`);
    }
    
    const existingPlanIds = new Set(existingSessions?.map(s => s.daily_plan_id) || []);
    const missingPlans = plans.filter(plan => !existingPlanIds.has(plan.id));
    
    if (missingPlans.length === 0) {
      return 0;
    }
    
    // Create journal sessions for missing plans
    const sessionsToCreate = missingPlans.map(plan => ({
      user_id: plan.user_id,
      daily_plan_id: plan.id
    }));
    
    const { error: insertError } = await supabase
      .from('journal_sessions')
      .insert(sessionsToCreate);
    
    if (insertError) {
      console.error('Error creating journal sessions:', insertError);
      throw new Error(`Failed to create journal sessions: ${insertError.message}`);
    }
    
    console.log(`✅ Created ${missingPlans.length} missing journal sessions`);
    return missingPlans.length;
    
  } catch (error) {
    console.error('Error in createMissingJournalSessions:', error);
    throw error;
  }
}
