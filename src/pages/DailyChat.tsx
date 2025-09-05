
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, RotateCcw, Loader2 } from 'lucide-react';
import { usePraxisChat } from '@/hooks/usePraxisChat';

const DailyChat = () => {
  const {
    messages,
    newMessage,
    setNewMessage,
    isSendingMessage,
    isLoadingSession,
    handleSendMessage,
    clearChatSession,
    hasActiveSession,
    currentDate
  } = usePraxisChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  if (isLoadingSession) {
    return (
      <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden">
        <div className="px-8 py-6 flex-shrink-0 bg-zinc-900">
          <h1 className="text-2xl font-medium title-gradient">Daily Chat</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading chat session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex-shrink-0 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium title-gradient">Daily Chat</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {currentDate} • {hasActiveSession ? 'Active session' : 'New session'}
            </p>
          </div>
          {hasActiveSession && (
            <Button
              onClick={clearChatSession}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-zinc-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 px-8 py-6 min-h-0">
        <Card className="h-full max-w-4xl mx-auto bg-[#1F1F1F] border-zinc-700/50 flex flex-col">
          <CardHeader className="flex-shrink-0 border-b border-zinc-800">
            <CardTitle className="text-zinc-100 flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
              Praxis - Daily Life Coach
            </CardTitle>
          </CardHeader>
          
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-medium text-zinc-100 mb-2">Welcome to your daily chat</h3>
                  <p className="text-zinc-400 max-w-md mx-auto">
                    I'm Praxis, your daily conversation partner for reflection and growth. 
                    What's on your mind today?
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isSendingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Praxis is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="flex-shrink-0 p-6 border-t border-zinc-800">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share your thoughts, experiences, or ask for guidance..."
                  className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500"
                  disabled={isSendingMessage}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isSendingMessage}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DailyChat;
