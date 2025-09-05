
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex animate-fade-in ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] message-bubble ${
          message.sender === 'user'
            ? 'bg-zinc-100 text-zinc-900 shadow-sm'
            : 'bg-[#1F1F1F] text-zinc-100 border border-zinc-700/50'
        } rounded-lg px-4 py-3`}
      >
        <div className="text-sm leading-relaxed">
          {message.sender === 'assistant' ? (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown 
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0 text-zinc-100">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-zinc-50">{children}</strong>,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            message.text
          )}
          <span className={`message-timestamp ${message.sender === 'user' ? 'user-timestamp' : 'assistant-timestamp'}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

interface LoadingMessageProps {
  message?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({ message = "Thinking..." }) => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-[#1F1F1F] text-zinc-100 border border-zinc-700/50 rounded-lg px-4 py-3">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-sm">{message}</span>
        </div>
      </div>
    </div>
  );
};
