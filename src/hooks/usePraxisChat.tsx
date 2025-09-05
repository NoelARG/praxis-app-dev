import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { callClaude } from '@/api/claude';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  persona_name: string;
  session_date: string;
  messages: Message[];
  context_snapshot: any;
}

interface SystemPrompt {
  name: string;
  title: string;
  system_prompt: string;
  context_access: string[];
}

export const usePraxisChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load today's chat session and system prompt
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

        setSystemPrompt(promptData.system_prompt);

        // 2. Load behavior: do NOT reset chat until a plan for today exists.
        // If a daily plan exists for today, use today's chat session; otherwise, continue the latest session.

        // Check if a daily plan exists for today
        const { data: todaysPlan, error: planError } = await supabase
          .from('daily_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('plan_date', currentDate)
          .maybeSingle();

        if (planError && planError.code !== 'PGRST116') {
          console.error('Error checking today\'s plan:', planError);
        }

        if (todaysPlan) {
          // Ensure we load/create today's chat session
          const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('persona_name', 'praxis')
            .eq('session_date', currentDate)
            .maybeSingle();

          if (sessionError && sessionError.code !== 'PGRST116') {
            console.error('Error loading today\'s chat session:', sessionError);
            return;
          }

          if (sessionData) {
            setSessionId(sessionData.id);
            setMessages(sessionData.messages || []);
          } else {
            const { data: newSession, error: createError } = await supabase
              .from('chat_sessions')
              .insert({
                user_id: user.id,
                persona_name: 'praxis',
                session_date: currentDate,
                messages: [],
                context_snapshot: {
                  user_name: user.user_metadata?.first_name || 'User',
                  timezone: user.user_metadata?.timezone || 'UTC',
                  user_goals: 'No goals set yet',
                  current_tasks: 'No tasks for today',
                  recent_patterns: 'No patterns available yet'
                }
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating today\'s chat session:', createError);
              return;
            }

            setSessionId(newSession.id);
            setMessages([]);
          }
        } else {
          // No plan for today yet: continue the most recent chat session (do not reset)
          const { data: latestSession, error: latestError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('persona_name', 'praxis')
            .order('session_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestError && latestError.code !== 'PGRST116') {
            console.error('Error loading latest chat session:', latestError);
          }

          if (latestSession) {
            setSessionId(latestSession.id);
            setMessages(latestSession.messages || []);
          } else {
            // First-time: create a session for today
            const { data: newSession, error: createError } = await supabase
              .from('chat_sessions')
              .insert({
                user_id: user.id,
                persona_name: 'praxis',
                session_date: currentDate,
                messages: [],
                context_snapshot: {
                  user_name: user.user_metadata?.first_name || 'User',
                  timezone: user.user_metadata?.timezone || 'UTC',
                  user_goals: 'No goals set yet',
                  current_tasks: 'No tasks for today',
                  recent_patterns: 'No patterns available yet'
                }
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating initial chat session:', createError);
              return;
            }

            setSessionId(newSession.id);
            setMessages([]);
          }
        }

      } catch (error) {
        console.error('Error in loadSession:', error);
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSession();
  }, [user, currentDate, toast]);

  // Save messages to database
  const saveMessages = useCallback(async (updatedMessages: Message[]) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error saving messages:', error);
      }
    } catch (error) {
      console.error('Error in saveMessages:', error);
    }
  }, [sessionId]);

  // Process dynamic variables in system prompt
  const processSystemPrompt = useCallback((prompt: string): string => {
    if (!user) return prompt;

    const userMetadata = user.user_metadata || {};
    
    return prompt
      .replace(/\{\{user_name\}\}/g, userMetadata.first_name || 'User')
      .replace(/\{\{timezone\}\}/g, userMetadata.timezone || 'UTC')
      .replace(/\{\{user_goals\}\}/g, 'No goals set yet')
      .replace(/\{\{current_tasks\}\}/g, 'No tasks for today')
      .replace(/\{\{recent_patterns\}\}/g, 'No patterns available yet');
  }, [user]);

  // Send message to Claude API
  const sendMessageToClaude = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    try {
      // Prepare messages for Claude API
      const claudeMessages = [];

      // Add system message only if this is the first message of the day
      if (conversationHistory.length === 0) {
        const processedPrompt = processSystemPrompt(systemPrompt);
        claudeMessages.push({
          role: 'system',
          content: processedPrompt
        });
      }

      // Add conversation history (last 10 messages to stay within limits)
      const recentMessages = conversationHistory.slice(-10);
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
      const result = await callClaude(claudeMessages);
      return result.content;

    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

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
      // Save user message immediately
      await saveMessages(updatedMessages);

      // Get AI response
      const aiResponse = await sendMessageToClaude(userMessage.content, messages);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save assistant message
      await saveMessages(finalMessages);

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Clear today's chat session
  const clearChatSession = async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          messages: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error clearing chat session:', error);
        return;
      }

      setMessages([]);
      toast({
        title: "Chat Cleared",
        description: "Today's chat session has been cleared.",
      });

    } catch (error) {
      console.error('Error in clearChatSession:', error);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isSendingMessage,
    isLoadingSession,
    handleSendMessage,
    clearChatSession,
    hasActiveSession: messages.length > 0,
    currentDate
  };
}; 