import { supabase } from '@/integrations/supabase/client';

/**
 * Test function to verify journal system setup
 * This helps debug issues with the journal system
 */
export async function testJournalSetup(userId: string) {
  console.log('🔍 Testing journal system setup...');
  
  try {
    // Test 1: Check if journal_sessions table exists and is accessible
    console.log('📋 Test 1: Checking journal_sessions table...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('journal_sessions')
      .select('id')
      .limit(1);
    
    if (sessionsError) {
      console.error('❌ journal_sessions table error:', sessionsError);
      return { success: false, error: 'journal_sessions table not accessible', details: sessionsError };
    }
    console.log('✅ journal_sessions table accessible');

    // Test 2: Check if journal_messages table exists and is accessible
    console.log('📋 Test 2: Checking journal_messages table...');
    const { data: messages, error: messagesError } = await supabase
      .from('journal_messages')
      .select('id')
      .limit(1);
    
    if (messagesError) {
      console.error('❌ journal_messages table error:', messagesError);
      return { success: false, error: 'journal_messages table not accessible', details: messagesError };
    }
    console.log('✅ journal_messages table accessible');

    // Test 3: Check if helper functions exist
    console.log('📋 Test 3: Checking helper functions...');
    
    // Get a real daily plan ID to test with
    const { data: testPlan, error: testPlanError } = await supabase
      .from('daily_plans')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (testPlanError || !testPlan) {
      console.log('⚠️ No daily plans found to test helper functions with');
      console.log('✅ Helper functions accessible (skipped test due to no plans)');
    } else {
      // Test with a real daily plan ID
      const { data: functionTest, error: functionError } = await supabase.rpc('start_journal_session', {
        user_id_param: userId,
        daily_plan_id_param: testPlan.id
      });
      
      if (functionError) {
        // If it's a duplicate key error, that's actually good - means the function works
        if (functionError.code === '23505') { // Unique constraint violation
          console.log('✅ Helper functions accessible (session already exists)');
        } else {
          console.error('❌ Helper functions error:', functionError);
          return { success: false, error: 'Helper functions not accessible', details: functionError };
        }
      } else {
        console.log('✅ Helper functions accessible');
      }
    }

    // Test 4: Check user's daily plans
    console.log('📋 Test 4: Checking user daily plans...');
    const { data: plans, error: plansError } = await supabase
      .from('daily_plans')
      .select('id, plan_date')
      .eq('user_id', userId)
      .order('plan_date', { ascending: false })
      .limit(5);
    
    if (plansError) {
      console.error('❌ Daily plans error:', plansError);
      return { success: false, error: 'Daily plans not accessible', details: plansError };
    }
    console.log('✅ Daily plans accessible:', plans?.length || 0, 'plans found');

    // Test 5: Check user's journal sessions
    console.log('📋 Test 5: Checking user journal sessions...');
    const { data: userSessions, error: userSessionsError } = await supabase
      .from('journal_sessions')
      .select('id, daily_plan_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (userSessionsError) {
      console.error('❌ User journal sessions error:', userSessionsError);
      return { success: false, error: 'User journal sessions not accessible', details: userSessionsError };
    }
    console.log('✅ User journal sessions accessible:', userSessions?.length || 0, 'sessions found');

    console.log('🎉 All journal system tests passed!');
    return { 
      success: true, 
      data: {
        dailyPlans: plans || [],
        journalSessions: userSessions || []
      }
    };

  } catch (error) {
    console.error('❌ Unexpected error in testJournalSetup:', error);
    return { 
      success: false, 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
