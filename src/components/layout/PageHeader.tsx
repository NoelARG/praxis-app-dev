
import React, { useState, useEffect } from 'react';
import { Clock, ArrowLeft, TrendingUp, ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title?: string;
  showProgressInline?: boolean;
  completedCount?: number;
  totalTasks?: number;
  nextTask?: string;
  onTaskToggle?: (taskId: string) => void;
  nextTaskId?: string;
  tasks?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showProgressInline,
  completedCount = 0,
  totalTasks = 0,
  nextTask,
  onTaskToggle,
  nextTaskId,
  tasks = []
}) => {
  const [showPrevious, setShowPrevious] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Load completed tasks from localStorage on mount
  useEffect(() => {
    const savedCompletedTasks = localStorage.getItem('completedTasks');
    if (savedCompletedTasks) {
      const parsed = JSON.parse(savedCompletedTasks);
      setCompletedTasks(parsed);
      setShowPrevious(parsed.length > 0);
    }
  }, []);

  // Save completed tasks to localStorage whenever it changes
  useEffect(() => {
    if (completedTasks.length > 0) {
      localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    } else {
      localStorage.removeItem('completedTasks');
    }
  }, [completedTasks]);

  const getCurrentDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayTitle = showProgressInline ? getCurrentDateString() : "Daily Ledger";
  const completionRate = totalTasks > 0 ? completedCount / totalTasks * 100 : 0;

  const handleTaskClick = () => {
    if (nextTaskId && onTaskToggle) {
      setIsTransitioning(true);
      onTaskToggle(nextTaskId);

      setCompletedTasks(prev => [...prev, nextTaskId]);

      setTimeout(() => {
        setShowPrevious(true);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handlePreviousClick = () => {
    const lastCompletedTaskId = completedTasks[completedTasks.length - 1];
    if (lastCompletedTaskId && onTaskToggle) {
      onTaskToggle(lastCompletedTaskId);

      setCompletedTasks(prev => prev.slice(0, -1));
      if (completedTasks.length <= 1) {
        setShowPrevious(false);
      }
    }
  };

  const handleNextClick = () => {
    // Find the next incomplete task after the current nextTask
    const currentIndex = tasks.findIndex(task => task.id === nextTaskId);
    const nextIncompleteTask = tasks.find((task, index) => 
      index > currentIndex && !task.completed
    );
    
    if (nextIncompleteTask && onTaskToggle) {
      onTaskToggle(nextIncompleteTask.id);
    }
  };

  return (
    <div className={showProgressInline ? "mb-10" : "mb-4"}>
      <div className="flex items-start justify-between mb-6">
        {showProgressInline ? (
          <>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                {displayTitle}
              </h1>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <div className="flex items-center gap-12">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Progress:</span>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {Array.from({
                          length: totalTasks
                        }).map((_, index) => (
                          <div 
                            key={index} 
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                              index < completedCount ? "bg-emerald-500" : "bg-gray-600"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm ml-2">
                        {completedCount}/{totalTasks}
                      </span>
                    </div>
                  </div>
                  {nextTask && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Next:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`
                            px-3 py-1.5 rounded-xl border border-gray-600/40 cursor-pointer group transition-all duration-300 ease-out overflow-hidden relative
                            ${isTransitioning ? 'border-emerald-500' : 'bg-[#202022] hover:border-emerald-500/60'}
                          `} 
                          onClick={handleTaskClick}
                        >
                          <div className={`flex items-center gap-2 transition-all duration-300 ${isTransitioning ? 'transform -translate-x-full opacity-0' : ''}`}>
                            <div className="w-3 h-3 rounded-full border border-gray-500 group-hover:border-emerald-500 transition-colors" />
                            <span className="text-sm group-hover:text-emerald-300 transition-colors">{nextTask}</span>
                          </div>
                          
                          {tasks.find(task => !task.completed && task.id !== nextTaskId) && (
                            <div className={`absolute inset-0 flex items-center gap-2 px-3 py-1.5 transition-all duration-300 ${isTransitioning ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'}`}>
                              <div className="w-3 h-3 rounded-full border border-gray-500" />
                              <span className="text-sm">{tasks.find(task => !task.completed && task.id !== nextTaskId)?.text}</span>
                            </div>
                          )}
                        </div>
                        
                        {!showPrevious && tasks.find(task => !task.completed && task.id !== nextTaskId) && (
                          <ChevronRight 
                            className="w-3 h-3 text-gray-500 hover:text-emerald-500 cursor-pointer transition-colors" 
                            onClick={handleNextClick}
                          />
                        )}
                        
                        {showPrevious && (
                          <div className="flex items-center gap-1 cursor-pointer group animate-fade-in" onClick={handlePreviousClick}>
                            <ArrowLeft className="w-3 h-3 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                            <span className="text-xs text-gray-500 group-hover:text-emerald-300 transition-colors">undo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                {displayTitle}
              </h1>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Daily Progress & Reflection</span>
              </div>
            </div>
            
            {completedCount > 0 && (
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272A" strokeWidth="2" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#progressGradient)" strokeWidth="2" strokeDasharray={`${completionRate}, 100`} className="transition-all duration-500 ease-out" />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{Math.round(completionRate)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {completedCount}/{totalTasks}
                  </p>
                  <p className="text-xs text-gray-400">completed</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
