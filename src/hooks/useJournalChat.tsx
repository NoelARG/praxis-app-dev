import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { callClaude } from '@/api/claude';
import {
  startJournalSession,
  saveJournalMessage,
  getJournalMessages,
  getJournalSessionByPlan,
  getTodaysJournalSession,
  type JournalMessage,
  type JournalSession
} from '@/lib/journalHelpers';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface SystemPrompt {
  name: string;
  title: string;
  system_prompt: string;
  context_access: string[];
}

export const useJournalChat = (tasks: any[] = [], dailyPlanId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentJournalSession, setCurrentJournalSession] = useState<JournalSession | null>(null);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load journal session and system prompt
  useEffect(() => {
    const loadSession = async () => {
      if (!user) return;

      try {
        setIsLoadingSession(true);

        // 1. Get Praxis system prompt
        const { data: promptData, error: promptError } = await supabase
          .from('system_prompts')
          .select('*')
          .eq('name', 'praxis')
          .eq('is_active', true)
          .single();

        if (promptError) {
          console.error('Error loading system prompt:', promptError);
          toast({
            title: "Error",
            description: "Failed to load chat system. Please try again.",
            variant: "destructive",
          });
          return;
        }

        console.log('✅ System prompt loaded:', promptData.system_prompt.substring(0, 100) + '...');
        setSystemPrompt(promptData.system_prompt);

        // 2. Load journal session
        let journalSession: JournalSession | null = null;

        if (dailyPlanId) {
          // If we have a specific daily plan ID, get that session
          journalSession = await getJournalSessionByPlan(user.id, dailyPlanId);
        } else {
          // Otherwise, try to get today's session
          journalSession = await getTodaysJournalSession(user.id);
        }

        if (journalSession) {
          console.log('📖 Loading existing journal session:', journalSession.id);
          setSessionId(journalSession.id);
          setCurrentJournalSession(journalSession);
          
          // Load messages for this session
          const journalMessages = await getJournalMessages(journalSession.id);
          const formattedMessages = journalMessages.map((msg: JournalMessage) => ({
            id: msg.id,
            role: msg.sender as 'user' | 'assistant',
            content: msg.message_text, // Use correct property name
            timestamp: new Date(msg.created_at)
          }));
          
          setMessages(formattedMessages);
        } else if (dailyPlanId) {
          // We have a daily plan ID but no journal session - this shouldn't happen
          // but can occur if the trigger failed or for existing plans
          console.log('⚠️ Daily plan exists but no journal session found, creating one...');
          try {
            const newSessionId = await startJournalSession(user.id, dailyPlanId);
            const newSession = await getJournalSessionByPlan(user.id, dailyPlanId);
            
            if (newSession) {
              setSessionId(newSession.id);
              setCurrentJournalSession(newSession);
              setMessages([]);
              console.log('✅ Created missing journal session:', newSession.id);
            }
          } catch (error) {
            console.error('❌ Failed to create missing journal session:', error);
            setSessionId(null);
            setCurrentJournalSession(null);
            setMessages([]);
          }
        } else {
          // No session exists and no daily plan ID - this means no daily plan exists for today
          console.log('📝 No journal session found - no daily plan exists');
          setSessionId(null);
          setCurrentJournalSession(null);
          setMessages([]);
        }

      } catch (error) {
        console.error('Error in loadSession:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          user: user?.id,
          dailyPlanId
        });
        toast({
          title: "Error",
          description: "Failed to load journal session. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSession();
  }, [user, dailyPlanId, toast]);

  // Process dynamic variables in system prompt
  const processSystemPrompt = useCallback((prompt: string, tasks: any[] = []): string => {
    if (!user) return prompt;

    const userMetadata = user.user_metadata || {};
    
    // Format current tasks with rollover information
    const tasksText = tasks.length > 0 
      ? tasks.map(task => {
          const status = task.completed ? 'completed' : 'pending';
          const rolloverInfo = task.rollover ? ` [rolled over from ${task.original_plan_date}]` : '';
          return `- ${task.text} (${status}${rolloverInfo})`;
        }).join('\n')
      : 'No tasks for today';
    
    return prompt
      .replace(/\{\{user_name\}\}/g, userMetadata.first_name || 'User')
      .replace(/\{\{timezone\}\}/g, userMetadata.timezone || 'UTC')
      .replace(/\{\{user_goals\}\}/g, 'No goals set yet')
      .replace(/\{\{current_tasks\}\}/g, tasksText)
      .replace(/\{\{recent_patterns\}\}/g, 'No patterns available yet');
  }, [user]);

  // Send message to Claude API
  const sendMessageToClaude = async (userMessage: string, conversationHistory: Message[], tasks: any[] = []): Promise<string> => {
    try {
      // Prepare messages for Claude API
      const claudeMessages = [];

      // Always apply system prompt to ensure Praxis persona is maintained
      const processedPrompt = processSystemPrompt(systemPrompt, tasks);
      console.log('🔧 Applying system prompt:', processedPrompt.substring(0, 200) + '...');
      claudeMessages.push({
        role: 'system',
        content: processedPrompt
      });

      // Add conversation history (last 10 messages to stay within limits)
      // Filter out any existing system messages to avoid duplication
      const recentMessages = conversationHistory
        .slice(-10)
        .filter(msg => msg.role !== 'system');
      claudeMessages.push(...recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));

      // Add current user message
      claudeMessages.push({
        role: 'user',
        content: userMessage
      });

      // Call Claude API
      console.log('📤 Sending to Claude:', claudeMessages.length, 'messages');
      const result = await callClaude(claudeMessages, 'claude-3-5-sonnet-20241022', processedPrompt);
      return result.content;

    } catch (error) {
      console.error('❌ Error calling Claude API:', error);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !sessionId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage('');
    setIsSendingMessage(true);

    try {
      // Save user message to journal
      await saveJournalMessage(sessionId, 'user', userMessage.content);

      // Get AI response
      const aiResponse = await sendMessageToClaude(userMessage.content, messages, tasks);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save assistant message to journal
      await saveJournalMessage(sessionId, 'assistant', aiResponse);

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      
      // Revert the messages on error
      setMessages(messages);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Clear the current journal session
  const clearJournalSession = async () => {
    if (!sessionId) return;

    try {
      // Delete all messages for this session
      const { error } = await supabase
        .from('journal_messages')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error clearing journal messages:', error);
        return;
      }

      setMessages([]);
      toast({
        title: "Journal Cleared",
        description: "Today's journal session has been cleared.",
      });

    } catch (error) {
      console.error('Error in clearJournalSession:', error);
    }
  };

  // Refresh the current session (useful when a new plan is created)
  const refreshSession = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoadingSession(true);
      
      // Reload the session based on current context
      let journalSession: JournalSession | null = null;

      if (dailyPlanId) {
        journalSession = await getJournalSessionByPlan(user.id, dailyPlanId);
      } else {
        journalSession = await getTodaysJournalSession(user.id);
      }

      if (journalSession) {
        setSessionId(journalSession.id);
        setCurrentJournalSession(journalSession);
        
        // Load messages for this session
        const journalMessages = await getJournalMessages(journalSession.id);
          const formattedMessages = journalMessages.map((msg: JournalMessage) => ({
            id: msg.id,
            role: msg.sender as 'user' | 'assistant',
            content: msg.message_text, // Use correct property name
            timestamp: new Date(msg.created_at)
          }));
        
        setMessages(formattedMessages);
      } else if (dailyPlanId) {
        // We have a daily plan ID but no journal session - create one
        console.log('⚠️ Daily plan exists but no journal session found during refresh, creating one...');
        try {
          const newSessionId = await startJournalSession(user.id, dailyPlanId);
          const newSession = await getJournalSessionByPlan(user.id, dailyPlanId);
          
          if (newSession) {
            setSessionId(newSession.id);
            setCurrentJournalSession(newSession);
            setMessages([]);
            console.log('✅ Created missing journal session during refresh:', newSession.id);
          }
        } catch (error) {
          console.error('❌ Failed to create missing journal session during refresh:', error);
          setSessionId(null);
          setCurrentJournalSession(null);
          setMessages([]);
        }
      } else {
        setSessionId(null);
        setCurrentJournalSession(null);
        setMessages([]);
      }

    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoadingSession(false);
    }
  }, [user, dailyPlanId]);

  return {
    messages,
    newMessage,
    setNewMessage,
    isSendingMessage,
    isLoadingSession,
    handleSendMessage,
    clearJournalSession,
    refreshSession,
    hasActiveSession: sessionId !== null,
    currentDate,
    currentJournalSession,
    sessionId
  };
};
