import React from 'react';
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="relative flex items-center">
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Ask Praxis"
        disabled={isSendingMessage}
        rows={1}
        className="w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-0 focus:ring-transparent focus:outline-none px-4 py-3 pr-12 min-h-[48px] max-h-[120px] overflow-y-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      />
      <style>{`
        textarea::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <Button
        onClick={onSendMessage}
        disabled={!newMessage.trim() || isSendingMessage}
        className="absolute right-2 w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 p-0 flex items-center justify-center shadow-sm border-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};