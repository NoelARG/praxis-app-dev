import React, { useState, useRef, useEffect } from 'react';
import { Users, MessageCircle, X, Send } from 'lucide-react';
import { useOptimizedChat } from '@/hooks/useOptimizedChat';
import { useTasks } from '@/hooks/useTasks';
import { PageShell } from '@/components/layout/PageShell';

interface Hero {
  id: string;
  name: string;
  title: string;
  era: string;
  expertise: string[];
  description: string;
  imageUrl: string;
  color: string;
  primaryColor: string;
  accentColor: string;
  quote: string;
  background: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Enhanced Hero Chat Component
interface EnhancedHeroChatProps {
  hero: Hero;
  onClose: () => void;
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isSendingMessage: boolean;
  onClearChat: () => void;
}

const EnhancedHeroChat: React.FC<EnhancedHeroChatProps> = ({ 
  hero, 
  onClose, 
  messages, 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  isSendingMessage,
  onClearChat
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Prevent background scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClearClick = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    onClearChat();
    setShowClearConfirm(false);
  };

  const handleCancelClear = () => {
    setShowClearConfirm(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-6xl h-[90vh] bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50">
        {/* Hero Chat Header */}
        <div 
          className="p-4 border-b border-zinc-700/50 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${hero.primaryColor}15 0%, ${hero.accentColor}10 100%)`
          }}
        >
          <div className="flex items-center gap-4 relative z-10">
            {/* Hero Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-600">
                <img 
                  src={hero.imageUrl} 
                  alt={hero.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const container = target.parentElement!;
                    container.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br ${hero.color} flex items-center justify-center text-white font-bold text-lg">
                        ${hero.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    `;
                  }}
                />
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-zinc-900 flex items-center justify-center"
                style={{ backgroundColor: hero.accentColor }}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Hero Info */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">{hero.name}</h3>
              <div className="flex items-center gap-2 text-zinc-300 text-sm">
                <span>{hero.title}</span>
                <span>•</span>
                <span>{hero.era}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Clear Chat Button */}
              {messages.length > 0 && (
                <button
                  onClick={handleClearClick}
                  className="px-3 py-1.5 text-xs bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-zinc-200 rounded-md transition-colors border border-zinc-600/30"
                >
                  Clear Chat
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-zinc-300" />
              </button>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, ${hero.accentColor} 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div 
          className="flex-1 p-4 overflow-y-auto bg-zinc-900 hero-chat-messages" 
          style={{ 
            height: 'calc(90vh - 180px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#52525b transparent',
            msOverflowStyle: 'scrollbar',
          }}
        >
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-zinc-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Begin Your Conversation with {hero.name}
              </h4>
              <p className="text-zinc-400 max-w-md mx-auto">
                {hero.background}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {hero.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs bg-zinc-700/50 text-zinc-300 rounded-full border border-zinc-600/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'assistant' && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-zinc-600">
                        <img 
                          src={hero.imageUrl} 
                          alt={hero.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const container = target.parentElement!;
                            container.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br ${hero.color} flex items-center justify-center text-white font-bold text-xs">
                                ${hero.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            `;
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-emerald-400">
                            {hero.name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="bg-zinc-800 rounded-2xl rounded-tl-md px-4 py-3 border border-zinc-600/30">
                          <div className="text-zinc-100 text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
                            {message.text.split('\n\n').map((paragraph, index) => (
                              <p key={index} className="mb-3 last:mb-0">
                                {paragraph.split('**').map((part, partIndex) => 
                                  partIndex % 2 === 1 ? (
                                    <strong key={partIndex} className="font-semibold text-zinc-50">{part}</strong>
                                  ) : (
                                    part
                                  )
                                )}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {message.sender === 'user' && (
                    <div className="max-w-[70%]">
                      <div className="bg-zinc-700 text-zinc-100 rounded-2xl rounded-tr-md px-4 py-3">
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-xs text-zinc-500">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isSendingMessage && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-zinc-600">
                      <img 
                        src={hero.imageUrl} 
                        alt={hero.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-zinc-800 rounded-2xl rounded-tl-md px-4 py-3 border border-zinc-600/30">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full animate-bounce bg-emerald-400" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full animate-bounce bg-emerald-400" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full animate-bounce bg-emerald-400" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-zinc-400">thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-zinc-700/50 bg-zinc-900">
          <div className="relative flex items-center">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={`Ask ${hero.name} for guidance...`}
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
              .hero-chat-messages::-webkit-scrollbar {
                display: block;
                width: 6px;
              }
              .hero-chat-messages::-webkit-scrollbar-track {
                background: transparent;
              }
              .hero-chat-messages::-webkit-scrollbar-thumb {
                background: #52525b;
                border-radius: 3px;
              }
              .hero-chat-messages::-webkit-scrollbar-thumb:hover {
                background: #71717a;
              }
            `}</style>
            <button
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isSendingMessage}
              className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 p-0 flex items-center justify-center shadow-sm border-0 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-sm mx-4 border border-zinc-600">
            <h3 className="text-lg font-semibold text-white mb-2">Clear Chat History?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              This will permanently delete your conversation with {hero.name}. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelClear}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Heroes = () => {
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const { tasks } = useTasks();
  const { messages, newMessage, setNewMessage, isSendingMessage, handleSendMessage, clearChatSession } = useOptimizedChat(tasks, selectedHero?.id);

  const handleHeroClick = (hero: Hero) => {
    setSelectedHero(hero);
    console.log('Selected hero:', hero.name, 'with ID:', hero.id);
  };

  const handleCloseChat = () => {
    setSelectedHero(null);
  };

  const handleClearChat = () => {
    clearChatSession();
  };

  return (
    <PageShell
      variant="wide"
      title="Heroes"
      subtitle="Your Personal Board of Directors"
      subtitleIcon={Users}
    >
      <div className="space-y-12">
            {/* Heroes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {HEROES.map((hero, index) => (
                <div
                  key={hero.id}
                  className="group cursor-pointer animate-fade-in transition-all duration-300 ease-out hover:-translate-y-1 will-change-transform"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleHeroClick(hero)}
                >
                  <div className="bg-sidebar border border-sidebar-border rounded-2xl overflow-hidden hover:border-zinc-600/60 hover:shadow-lg transition-all duration-300 h-full relative flex flex-col isolate">
                    {/* Subtle accent overlay for theme */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-3 transition-opacity duration-300 rounded-2xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${hero.primaryColor} 0%, ${hero.accentColor} 100%)` 
                      }}
                    ></div>

                    {/* Hero Image */}
                    <div className="aspect-square w-full relative bg-zinc-800 overflow-hidden rounded-t-2xl">
                      <div className="absolute inset-1 overflow-hidden rounded-t-2xl">
                        <img 
                          src={hero.imageUrl} 
                          alt={hero.name}
                          className="w-full h-full object-cover transition-all duration-300 ease-out group-hover:brightness-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const container = target.parentElement!;
                          container.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br ${hero.color} flex items-center justify-center text-white font-bold text-4xl rounded-t-2xl">
                              ${hero.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          `;
                        }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200 ease-out rounded-t-2xl"></div>
                      
                      {/* Floating chat indicator */}
                      <div className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Hero Info */}
                    <div className="p-6 relative z-10 flex flex-col h-full">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors mb-1">
                          {hero.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span>{hero.title}</span>
                          <span>•</span>
                          <span>{hero.era}</span>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                        {hero.description}
                      </p>

                      {/* Expertise Tags - Two rows max */}
                      <div className="flex flex-wrap gap-1 mb-2 max-h-14 overflow-hidden">
                        {hero.expertise.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-xs bg-zinc-700/50 text-zinc-300 rounded-md border border-zinc-600/30 transition-colors duration-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Chat CTA - Simplified */}
                      <div className="mt-auto pt-1">
                        <div className="text-xs text-zinc-400">
                          Chat with a digital recreation of <strong className="text-zinc-300">{hero.name}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon Section */}
            <div className="mt-16 text-center">
              <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">More Heroes Coming Soon</h3>
                <p className="text-zinc-400 text-sm">
                  We're continuously adding more legendary figures to your personal board of directors.
                </p>
              </div>
            </div>
          </div>

      {/* Enhanced Chat Modal */}
      {selectedHero && (
        <EnhancedHeroChat
          hero={selectedHero}
          onClose={handleCloseChat}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          isSendingMessage={isSendingMessage}
          onClearChat={handleClearChat}
        />
      )}
    </PageShell>
  );
};

const HEROES: Hero[] = [
  {
    id: 'charlie_munger',
    name: 'Charlie Munger',
    title: 'Investment Sage',
    era: '1924-2023',
    expertise: ['Mental Models', 'Investment Philosophy', 'Decision Making'],
    description: 'Vice Chairman of Berkshire Hathaway, known for his wisdom on mental models and rational thinking.',
    imageUrl: '/images/Heroes/charlie-munger.jpg.png',
    color: 'from-slate-600 to-slate-800',
    primaryColor: 'rgb(71, 85, 105)',
    accentColor: 'rgb(100, 116, 139)',
    quote: "The big money is not in the buying and selling, but in the waiting.",
    background: 'A legendary investor who emphasized the power of compound thinking and mental models. Digital recreation.'
  },
  {
    id: 'leonardo_davinci',
    name: 'Leonardo da Vinci',
    title: 'Renaissance Polymath',
    era: '1452-1519',
    expertise: ['Innovation', 'Art', 'Engineering', 'Science'],
    description: 'The ultimate Renaissance man who mastered art, science, and engineering.',
    imageUrl: '/images/Heroes/leonardo-davinci.jpg.png',
    color: 'from-slate-600 to-slate-800',
    primaryColor: 'rgb(71, 85, 105)',
    accentColor: 'rgb(100, 116, 139)',
    quote: "Learning never exhausts the mind.",
    background: 'The archetype of the Renaissance genius, blending art and science with boundless curiosity. Digital recreation.'
  },
  {
    id: 'marcus_aurelius',
    name: 'Marcus Aurelius',
    title: 'Philosopher Emperor',
    era: '121-180 AD',
    expertise: ['Stoicism', 'Leadership', 'Self-Discipline'],
    description: 'Roman Emperor and Stoic philosopher, author of Meditations.',
    imageUrl: '/images/Heroes/marcus-aurelius.jpg.png',
    color: 'from-slate-600 to-slate-800',
    primaryColor: 'rgb(71, 85, 105)',
    accentColor: 'rgb(100, 116, 139)',
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    background: 'The last of the Five Good Emperors, whose personal writings became a masterpiece of philosophy. Digital recreation.'
  },
  {
    id: 'andrew_carnegie',
    name: 'Andrew Carnegie',
    title: 'Steel Magnate',
    era: '1835-1919',
    expertise: ['Business Strategy', 'Philanthropy', 'Wealth Building'],
    description: 'Scottish-American industrialist who built a steel empire and pioneered philanthropy.',
    imageUrl: '/images/Heroes/andrew-carnegie.jpg.png',
    color: 'from-slate-600 to-slate-800',
    primaryColor: 'rgb(71, 85, 105)',
    accentColor: 'rgb(100, 116, 139)',
    quote: "The man who dies rich dies disgraced.",
    background: 'A self-made industrialist who revolutionized philanthropy and believed in giving back. Digital recreation.'
  },
  {
    id: 'steve_jobs',
    name: 'Steve Jobs',
    title: 'Innovation Visionary',
    era: '1955-2011',
    expertise: ['Product Design', 'Innovation', 'Marketing'],
    description: 'Co-founder of Apple who revolutionized personal computing and mobile technology.',
    imageUrl: '/images/Heroes/steve-jobs.jpg.png',
    color: 'from-slate-600 to-slate-800',
    primaryColor: 'rgb(71, 85, 105)',
    accentColor: 'rgb(100, 116, 139)',
    quote: "Innovation distinguishes between a leader and a follower.",
    background: 'A perfectionist who transformed multiple industries through elegant design and user experience. Digital recreation.'
  },
  {
    id: 'henry_ford',
    name: 'Henry Ford',
    title: 'Industrial Revolutionary',
    era: '1863-1947',
    expertise: ['Manufacturing', 'Efficiency', 'Mass Production'],
    description: 'Founder of Ford Motor Company who revolutionized manufacturing with the assembly line.',
    imageUrl: '/images/Heroes/henry-ford.jpg.png',
    color: 'from-slate-600 to-slate-800',
    primaryColor: 'rgb(71, 85, 105)',
    accentColor: 'rgb(100, 116, 139)',
    quote: "Whether you think you can or you think you can't, you're right.",
    background: 'An industrialist who democratized the automobile and pioneered modern manufacturing. Digital recreation.'
  }
];

export default Heroes;