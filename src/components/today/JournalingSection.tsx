
import React, { useEffect, useRef } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { ChatMessage, LoadingMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { EmptyChat } from '@/components/chat/EmptyChat';
import { useSidebar } from '@/components/ui/sidebar';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface JournalingSectionProps {
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isSendingMessage: boolean;
  isInitializingContext?: boolean;
}

export const JournalingSection: React.FC<JournalingSectionProps> = ({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  isSendingMessage,
  isInitializingContext = false
}) => {
  const { state } = useSidebar();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine left position based on sidebar state
  const chatInputLeftClass = state === 'collapsed' ? 'left-12' : 'left-64';

  return (
    <div className="flex-1 flex flex-col">
      {/* Section Header */}
      <div className="mb-8" style={{ marginTop: '-8px' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-semibold">Active Journaling Session</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent"></div>
        </div>

        {/* Messages Area - Natural flow, allow full height expansion */}
        <div className="pb-6">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <EmptyChat />
            ) : (
              messages.map((message) => (
                <div key={message.id}>
                  {message.sender === 'user' ? (
                    // User message - show in bubble (right-aligned) without timestamp
                    <div className="flex justify-end animate-fade-in">
                      <div className="max-w-[70%] bg-zinc-700 text-zinc-100 rounded-2xl px-4 py-3">
                        <div className="text-[15px] leading-relaxed">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // AI message - with name and timestamp
                    <div className="flex justify-start animate-fade-in">
                      <div className="max-w-[85%]">
                        {/* AI Name and Timestamp */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-medium text-emerald-400">Praxis</span>
                          <span className="text-xs text-zinc-500">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {/* Message Content */}
                        <div className="text-zinc-100 message-bubble group cursor-pointer">
                          <div className="text-[15px] leading-relaxed prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown 
                              components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0 text-zinc-100">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-zinc-50">{children}</strong>,
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {isSendingMessage && (
              <LoadingMessage 
                message={isInitializingContext ? "Gathering context..." : "Thinking..."} 
              />
            )}
            
            {/* Show disclaimer under the last AI message */}
            {messages.length > 0 && messages[messages.length - 1].sender === 'assistant' && (
              <div className="text-xs text-zinc-500 mt-2 ml-1">
                Praxis can make mistakes, so double-check responses.
              </div>
            )}
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* FIXED CHAT INPUT - Bottom of screen, no divider, reduced padding */}
      <div className={`fixed bottom-0 ${chatInputLeftClass} right-0 z-20 bg-zinc-900 transition-[left,right,width] duration-200 ease-linear`}>
        <div className="w-full max-w-4xl mx-auto px-8 py-2">
          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={onSendMessage}
            isSendingMessage={isSendingMessage}
          />
        </div>
      </div>
    </div>
  );
};
