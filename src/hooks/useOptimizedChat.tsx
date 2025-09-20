import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { callClaude } from '@/api/claude';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface SystemPrompt {
  name: string;
  title: string;
  system_prompt: string;
  context_access: string[];
}

export const useOptimizedChat = (tasks: Task[], heroId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Process system prompt to replace template variables
  const processSystemPrompt = useCallback((prompt: string, tasks: Task[]): string => {
    if (!user) return prompt;

    const userMetadata = user.user_metadata || {};
    
    // Format current tasks
    const tasksText = tasks.length > 0 
      ? tasks.map(task => {
          const status = task.completed ? 'completed' : 'pending';
          return `- ${task.text} (${status})`;
        }).join('\n')
      : 'No tasks for today';
    
    return prompt
      .replace(/\{\{user_name\}\}/g, userMetadata.full_name || user.email || 'User')
      .replace(/\{\{timezone\}\}/g, userMetadata.timezone || 'UTC')
      .replace(/\{\{user_goals\}\}/g, 'No goals set yet')
      .replace(/\{\{current_tasks\}\}/g, tasksText)
      .replace(/\{\{recent_patterns\}\}/g, 'No patterns available yet');
  }, [user]);

  // Load hero system prompt
  useEffect(() => {
    const loadSystemPrompt = async () => {
      if (!heroId) {
        setIsLoadingPrompt(false);
        return;
      }

      try {
        setIsLoadingPrompt(true);
        console.log(`🔍 Loading system prompt for heroId: ${heroId}`);
        console.log(`🔍 Query URL will be: system_prompts?name=eq.${heroId}&is_active=eq.true`);
        
        const { data, error } = await supabase
          .from('system_prompts')
          .select('system_prompt')
          .eq('name', heroId)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error loading hero system prompt:', error);
          toast({
            title: "Error",
            description: "Failed to load hero system prompt.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setSystemPrompt(data.system_prompt);
          console.log(`✅ Hero system prompt loaded for ${heroId}`);
        }
      } catch (error) {
        console.error('Error in loadSystemPrompt:', error);
        toast({
          title: "Error",
          description: "Failed to load hero system prompt.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPrompt(false);
      }
    };

    loadSystemPrompt();
  }, [heroId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !systemPrompt) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage.trim();
    setNewMessage('');
    setIsSendingMessage(true);

    try {
      // Process system prompt to replace template variables
      const processedPrompt = processSystemPrompt(systemPrompt, tasks);
      console.log('🔧 Applying hero system prompt:', processedPrompt.substring(0, 200) + '...');
      
      // Call Claude with hero system prompt
      const claudeMessages = [
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: currentMessage }
      ];
      
      const response = await callClaude(claudeMessages, 'claude-3-5-sonnet-20241022', processedPrompt);

      if (response.content) {
        const aiResponse: Message = {
          id: crypto.randomUUID(),
          text: response.content,
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('No response content received');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      const errorResponse: Message = {
        id: crypto.randomUUID(),
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const clearChatSession = () => {
    setMessages([]);
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isSendingMessage,
    handleSendMessage,
    clearChatSession,
    isLoadingPrompt,
    systemPrompt,
    hasActiveSession: messages.length > 0,
    isInitializingContext: false
  };
}; 