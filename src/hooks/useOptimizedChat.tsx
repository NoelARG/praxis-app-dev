import { useState } from 'react';

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

export const useOptimizedChat = (tasks: Task[], heroId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSendingMessage(true);

    // Placeholder response for now
    setTimeout(() => {
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        text: "Chat functionality is being rebuilt. Please check back soon!",
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsSendingMessage(false);
    }, 1000);
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
    hasActiveSession: messages.length > 0,
    isInitializingContext: false
  };
}; 