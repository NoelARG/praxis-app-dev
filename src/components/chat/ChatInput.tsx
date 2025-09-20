import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isSendingMessage: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  isSendingMessage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const minHeight = 48; // min-h-[48px]
    const maxHeight = 200; // max-h-[200px]
    
    // Reset height first to get accurate scrollHeight
    target.style.height = 'auto';
    
    // Check if content requires expansion AFTER reset
    const contentRequiresExpansion = target.scrollHeight > minHeight;
    const needsScrollbar = target.scrollHeight > maxHeight;
    
    // Set expanded state immediately based on accurate content size
    setIsExpanded(contentRequiresExpansion || needsScrollbar);
    
    // Set final height
    const newHeight = Math.min(Math.max(target.scrollHeight, minHeight), maxHeight);
    target.style.height = newHeight + 'px';
  };

  // Reset height when message is sent
  useEffect(() => {
    if (!newMessage.trim() && textareaRef.current) {
      textareaRef.current.style.height = '48px';
      setIsExpanded(false);
    }
  }, [newMessage]);

  return (
    <div className="relative flex items-center">
      <textarea
        ref={textareaRef}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Ask Praxis"
        disabled={isSendingMessage}
        rows={1}
        className={`w-full resize-none border border-zinc-800 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-800 focus:ring-0 focus:ring-transparent focus:outline-none px-4 py-3 pr-12 min-h-[48px] max-h-[200px] transition-[height] duration-200 ease-out ${
          isExpanded 
            ? 'rounded-2xl overflow-y-auto' 
            : 'rounded-full overflow-hidden'
        }`}
        style={isExpanded ? {
          scrollbarWidth: 'thin',
          scrollbarColor: '#52525b transparent',
          msOverflowStyle: 'scrollbar',
        } : {
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      />
      <style>{`
        textarea::-webkit-scrollbar {
          ${isExpanded ? 'display: block; width: 6px;' : 'display: none;'}
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: #52525b;
          border-radius: 3px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: #71717a;
        }
      `}</style>
      <Button
        onClick={onSendMessage}
        disabled={!newMessage.trim() || isSendingMessage}
        className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 p-0 flex items-center justify-center shadow-sm border-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};