import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, TrendingUp, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/useTasks';
import { useJournalChat } from '@/hooks/useJournalChat';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { JournalingSection } from '@/components/today/JournalingSection';
import { useSidebar } from '@/components/ui/sidebar';

// Format rollover date for tooltip display
const formatRolloverDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If it's within the last 7 days, show weekday
  if (diffDays <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // If it's older, show full date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const Today = () => {
  const { tasks, isLoading, toggleTask, dailyPlan } = useTasks();
  const {
    messages,
    newMessage,
    setNewMessage,
    isSendingMessage,
    handleSendMessage,
    isLoadingSession,
    refreshSession,
    hasActiveSession,
  } = useJournalChat(tasks, dailyPlan?.id);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();

  // Task navigation index - start with first unfinished task
  const [viewingTaskIndex, setViewingTaskIndex] = useState(0);

  // Update viewingTaskIndex to point to first unfinished task when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const firstUnfinishedIndex = tasks.findIndex(task => !task.completed);
      if (firstUnfinishedIndex !== -1) {
        setViewingTaskIndex(firstUnfinishedIndex);
      } else {
        // All tasks completed, show first task
        setViewingTaskIndex(0);
      }
    }
  }, [tasks]);

  // Refresh journal session when a new daily plan is created
  useEffect(() => {
    const handlePlanCreated = () => {
      console.log('🔄 New daily plan created, refreshing journal session');
      refreshSession();
    };

    // Set up global handler for plan creation
    (window as any).handlePlanCreated = handlePlanCreated;

    // Cleanup
    return () => {
      delete (window as any).handlePlanCreated;
    };
  }, [refreshSession]);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Compute a reliable plan date for the banner + JournalingSection
  const effectivePlanDate = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const firstTaskPlan = tasks?.[0]?.plan_date;
    // Prefer dailyPlan.plan_date (if set), else first task plan_date, else today
    const plan =
      (dailyPlan?.plan_date && String(dailyPlan.plan_date)) ||
      (firstTaskPlan && String(firstTaskPlan)) ||
      todayStr;
    return plan.slice(0, 10); // normalize to YYYY-MM-DD
  }, [dailyPlan?.plan_date, tasks]);

  const isPastJournal = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return effectivePlanDate < todayStr;
  }, [effectivePlanDate]);

  // Redirect to login if not authenticated (after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);

    // Predict next uncompleted task locally
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    const next = updatedTasks
      .map((task, index) => ({ task, index }))
      .filter(({ task }) => !task.completed)
      .sort((a, b) => a.task.task_order - b.task.task_order);

    if (next.length > 0) setViewingTaskIndex(next[0].index);
  };

  const handlePreviousTask = () => {
    if (!tasks.length) return;
    setViewingTaskIndex(prev => (prev === 0 ? tasks.length - 1 : prev - 1));
  };

  const handleNextTask = () => {
    if (!tasks.length) return;
    setViewingTaskIndex(prev => (prev + 1) % tasks.length);
  };

  const handlePlanTasks = () => navigate('/ledger');

  if (authLoading || !isAuthenticated) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            {authLoading ? 'Loading...' : 'Redirecting...'}
          </span>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const displayedTask = tasks[viewingTaskIndex];

  // Debug
  console.log('🔍 effectivePlanDate:', effectivePlanDate, 'isPastJournal:', isPastJournal);
  console.log('🔍 tasks:', tasks);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Header */}
      <div
        className="fixed top-0 z-30 bg-background transition-[left,right] duration-200 ease-linear"
        style={{ left: state === 'collapsed' ? '3rem' : '16rem', right: '0' }}
      >
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-4 md:px-8 pt-8 pb-4 relative">
            <div className="mb-0">
              <div className="flex items-start justify-between mb-0">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    <span className="font-mono">
                      <span className="font-sans">Active Journal</span>{' '}
                      <span className="text-muted-foreground font-light text-4xl">
                        <span className="text-2xl">/</span>
                        <span className="text-3xl"> {getCurrentDate()}</span>
                      </span>
                    </span>
                  </h1>


                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <div className="flex items-center gap-12">
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Progress:</span>
                        {!isLoading && (
                          <>
                            {/* Progress Dots */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 6 }).map((_, index) => {
                                const taskAtPosition = tasks.find(
                                  t => t.task_order === index + 1
                                );
                                const isCompleted = taskAtPosition?.completed || false;
                                const isCurrent =
                                  taskAtPosition?.id === displayedTask?.id;
                                return (
                                  <div
                                    key={index}
                                    className={`rounded-full transition-all duration-300 ${
                                      isCompleted
                                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                                        : 'bg-zinc-600'
                                    } ${isCurrent ? 'w-3 h-3' : 'w-2 h-2'}`}
                                  />
                                );
                              })}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">
                              {completedCount}/{tasks.length}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Next Task */}
                      {!isLoading && (
                        <div className="flex items-center gap-2 min-h-[24px] pr-24">
                          <span className="text-sm">Next:</span>
                          <div className="flex items-center gap-2 min-h-[28px]">
                            {tasks.length === 0 ? (
                              <div
                                className="flex items-center gap-2 cursor-pointer group bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1 transition-all duration-300 hover:bg-zinc-700/50"
                                onClick={handlePlanTasks}
                              >
                                <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">
                                  Plan next tasks
                                </span>
                              </div>
                            ) : displayedTask ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex items-center gap-2 cursor-pointer group transition-all duration-300 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1 hover:bg-zinc-700/50 ${
                                    displayedTask.completed
                                      ? 'bg-emerald-500/20 border-emerald-500'
                                      : ''
                                  }`}
                                  onClick={() => handleTaskToggle(displayedTask.id)}
                                >
                                   <span
                                     className={`text-xs transition-colors max-w-xs truncate ${
                                       displayedTask.completed
                                         ? 'text-emerald-300'
                                         : displayedTask.rollover
                                           ? 'text-muted-foreground italic opacity-75'
                                           : 'text-muted-foreground group-hover:text-white'
                                     }`}
                                   >
                                     {displayedTask.text}
                                   </span>
                                   {displayedTask.rollover && (
                                     <span 
                                       className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                       title={`Rolled over from ${formatRolloverDate(displayedTask.original_plan_date || displayedTask.plan_date || new Date().toISOString().split('T')[0])}`}
                                     >
                                       RO
                                     </span>
                                   )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={handlePreviousTask}
                                    className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                  >
                                    <ChevronLeft className="w-3 h-3 text-gray-400 hover:text-white" />
                                  </button>
                                  <button
                                    onClick={handleNextTask}
                                    className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                  >
                                    <ChevronRight className="w-3 h-3 text-gray-400 hover:text-white" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1">
                                <span className="text-xs text-emerald-400">
                                  All tasks completed!
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header fade */}
        <div
          className="absolute left-0 right-0 h-4 bg-gradient-to-b from-zinc-900 via-zinc-900/40 to-transparent pointer-events-none"
          style={{
            left: state === 'collapsed' ? '3rem' : '16rem',
            right: '0',
            top: '100%',
          }}
        />
      </div>

      {/* Content */}
      <div className="pt-36 flex-1 flex justify-center">
        <div className="w-full max-w-3xl px-4 md:px-8">
          {isLoading || isLoadingSession ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  {isLoading ? 'Loading your tasks...' : 'Initializing chat...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              

              {/* Journaling Section – pass the effective plan date */}
              <JournalingSection
                messages={messages.map(msg => ({
                  id: msg.id,
                  text: msg.content,
                  sender: msg.role === 'user' ? 'user' : 'assistant',
                  timestamp:
                    msg.timestamp instanceof Date
                      ? msg.timestamp
                      : new Date(msg.timestamp),
                }))}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={handleSendMessage}
                isSendingMessage={isSendingMessage}
                isInitializingContext={false}
                planDate={effectivePlanDate}
                hasActiveSession={hasActiveSession}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Today;
