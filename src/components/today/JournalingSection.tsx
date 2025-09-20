import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { ChatMessage, LoadingMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { EmptyChat } from '@/components/chat/EmptyChat';
import { OldJournalBanner } from '@/components/chat/OldJournalBanner';
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
  planDate?: string;
  hasActiveSession?: boolean;
}

export const JournalingSection: React.FC<JournalingSectionProps> = ({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  isSendingMessage,
  isInitializingContext = false,
  planDate,
  hasActiveSession = true
}) => {
  const { state } = useSidebar();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine left position based on sidebar state
  const chatInputLeftClass = state === 'collapsed' ? 'left-12' : 'left-64';

  // Check if we're viewing an old journal (not today's plan)
  const isOldJournal = () => {
    if (!planDate) return false;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return planDate < today;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area - Natural flow, allow full height expansion with bottom padding for fixed input */}
      <div className="pb-20">
        <div className="space-y-4">
          {!hasActiveSession ? (
            // No daily plan exists - show message to create one first
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-8">
              <div className="max-w-md mx-auto">
                <MessageSquare className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">No Journal Session</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Create a daily plan to start your journal session. Your journal will be tied to each day's plan, creating a personal diary of your daily journey.
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
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

      {/* FIXED CHAT INPUT - Bottom of screen, no divider, increased padding */}
      {hasActiveSession && (
        <div className={`fixed bottom-0 ${chatInputLeftClass} right-0 z-20 bg-zinc-900 transition-[left,right,width] duration-200 ease-linear`}>
          <div className="w-full max-w-4xl mx-auto px-8 py-4">
            <div className="max-w-3xl mx-auto">
              {/* Old Journal Banner - shown above chat input when viewing old journal */}
              {isOldJournal() && planDate && (
                <div className="px-7">
                  <OldJournalBanner planDate={planDate} />
                </div>
              )}
              <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={onSendMessage}
                isSendingMessage={isSendingMessage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};