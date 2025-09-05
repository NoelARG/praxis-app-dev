import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/useTasks';
import { useOptimizedChat } from '@/hooks/useOptimizedChat';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { JournalingSection } from '@/components/today/JournalingSection';
import { AuthDebug } from '@/components/debug/AuthDebug';

const Today = () => {
  const { tasks, isLoading, toggleTask } = useTasks();
  const { messages, newMessage, setNewMessage, isSendingMessage, handleSendMessage, isInitializingContext } = useOptimizedChat(tasks);
  const { state } = useSidebar();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Track which task we're currently viewing (0-5 for tasks 1-6)
  const [viewingTaskIndex, setViewingTaskIndex] = useState(0);

  // Redirect to login if not authenticated (after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
    
    // After toggling, find the next uncompleted task to show
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    const nextUncompletedIndex = updatedTasks.findIndex(task => !task.completed);
    if (nextUncompletedIndex !== -1) {
      setViewingTaskIndex(nextUncompletedIndex);
    }
  };

  // Show loading screen while auth is loading or user is not authenticated
  if (authLoading || !isAuthenticated) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            {authLoading ? 'Checking authentication...' : 'Redirecting to login...'}
          </span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Loading your day...</span>
        </div>
        <AuthDebug />
      </div>
    );
  }

  const completedCount = tasks.filter(task => task.completed).length;
  
  // Ensure viewing index is within bounds
  const safeViewingIndex = Math.max(0, Math.min(viewingTaskIndex, tasks.length - 1));
  const currentlyViewingTask = tasks[safeViewingIndex];
  
  // Check if all tasks are completed
  const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.completed);
  
  // Navigation logic
  const canGoNext = safeViewingIndex < tasks.length - 1;
  const canGoPrevious = safeViewingIndex > 0;

  const handleNextTask = () => {
    if (canGoNext) {
      setViewingTaskIndex(safeViewingIndex + 1);
    }
  };

  const handlePreviousTask = () => {
    if (canGoPrevious) {
      setViewingTaskIndex(safeViewingIndex - 1);
    }
  };

  // Get current date string
  const getCurrentDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determine left position based on sidebar state
  const headerLeftClass = state === 'collapsed' ? 'left-12' : 'left-64';

  return (
    <PageLayout>
      {/* FIXED HEADER - Positioned to respect sidebar */}
      <div className={`fixed top-0 ${headerLeftClass} right-0 z-10 bg-zinc-900 transition-[left,right,width] duration-200 ease-linear`}>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-4xl mx-auto px-8 pt-8 pb-3">
            <div className="mb-2">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                  {getCurrentDateString()}
                </h1>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <div className="flex items-center gap-12">
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Progress:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {tasks.map((task, index) => (
                            <div 
                              key={index}
                              className="relative flex items-center justify-center"
                            >
                              <div 
                                className={`rounded-full transition-all duration-300 ${
                                  task.completed ? "bg-emerald-500" : "bg-gray-600"
                                } ${
                                  index === safeViewingIndex && !allTasksCompleted ? "w-3 h-3" : "w-2 h-2"
                                }`} 
                              />
                            </div>
                          ))}
                        </div>
                        <span className="text-sm">
                          {completedCount}/{tasks.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Always show this container, show different content based on completion */}
                    <div className="flex items-center gap-2 min-h-[24px]">
                      <span className="text-sm">Next:</span>
                      <div className="flex items-center gap-2 min-h-[28px]">
                        {allTasksCompleted ? (
                          // Show "Reflect and plan tomorrow" when all tasks done - match the height of the task interface
                          <div className="px-2 py-0.5 rounded-md bg-transparent flex items-center gap-1">
                            <span className="text-sm text-gray-400">Reflect and plan tomorrow</span>
                            {/* Invisible spacer to match navigation arrows width */}
                            <div className="w-11 h-5 opacity-0"></div>
                          </div>
                        ) : currentlyViewingTask ? (
                          <>
                            <div 
                              className={`px-2 py-0.5 rounded-md cursor-pointer group transition-colors duration-300 ease-out focus:outline-none focus:ring-0 focus:border-transparent hover:border-transparent active:border-transparent ${
                                currentlyViewingTask.completed 
                                  ? 'bg-emerald-500/20 border border-emerald-500/30' 
                                  : 'bg-[#202022] hover:bg-[#2a2a2c] border border-transparent'
                              }`}
                              onClick={() => handleTaskToggle(currentlyViewingTask.id)}
                              tabIndex={-1}
                              style={{ 
                                boxShadow: 'none',
                                outline: 'none',
                                borderColor: currentlyViewingTask.completed ? 'rgb(52 211 153 / 0.3)' : 'transparent'
                              }}
                            >
                              <span className={`text-sm transition-colors ${
                                currentlyViewingTask.completed 
                                  ? 'text-emerald-300' 
                                  : 'group-hover:text-emerald-300'
                              }`}>
                                {currentlyViewingTask.text}
                              </span>
                            </div>
                            
                            {/* Navigation arrows */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handlePreviousTask}
                                className={`w-5 h-5 flex items-center justify-center rounded text-xs transition-colors ${
                                  canGoPrevious 
                                    ? 'text-gray-400 hover:text-gray-300 cursor-pointer'
                                    : 'text-gray-600 cursor-pointer'
                                }`}
                              >
                                ‹
                              </button>
                              <button
                                onClick={handleNextTask}
                                className={`w-5 h-5 flex items-center justify-center rounded text-xs transition-colors ${
                                  canGoNext
                                    ? 'text-gray-400 hover:text-gray-300 cursor-pointer'
                                    : 'text-gray-600 cursor-pointer'
                                }`}
                              >
                                ›
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="px-2 py-0.5 rounded-md bg-transparent">
                            <span className="text-sm opacity-0">placeholder</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT - Expand to fill available height */}
      <div className="min-h-screen overflow-y-auto" style={{ paddingTop: '124px' }}>
        <div className="opacity-100 transition-opacity duration-300">
          {tasks.length === 0 ? (
            <div className="px-8">
              <Card className="max-w-3xl mx-auto bg-[#1F1F1F] border-zinc-700/50">
                <CardHeader>
                  <CardTitle className="text-zinc-100">Welcome to your day</CardTitle>
                </CardHeader>
                <CardContent className="text-zinc-300 space-y-4">
                  <p>Let’s get you set up. Plan today’s or tomorrow’s top tasks, or jump into your Daily Chat to journal and reflect.</p>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/plan-tomorrow')} className="bg-emerald-600 hover:bg-emerald-700 text-white">Plan Tasks</Button>
                    <Button variant="outline" onClick={() => navigate('/praxis')} className="border-zinc-600 text-zinc-100">Open Daily Chat</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <JournalingSection
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              isSendingMessage={isSendingMessage}
              isInitializingContext={isInitializingContext}
            />
          )}
        </div>
      </div>

      {/* Fixed gradient overlay positioned right below the header */}
      <div className={`fixed ${headerLeftClass} right-0 h-8 bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none z-50 transition-[left,right,width] duration-200 ease-linear`} style={{ top: '124px' }}></div>
      
      {/* Debug Component - Only show in development */}
      <AuthDebug />
    </PageLayout>
  );
};

export default Today;