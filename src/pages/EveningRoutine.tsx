import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, BookOpen, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useTasks } from '@/hooks/useTasks';

const EveningRoutine = () => {
  const navigate = useNavigate();
  const { tasks, toggleTask, dailyPlan, updateDailyReflection } = useTasks();
  const [reflection, setReflection] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // Initialize reflection from daily plan
  useEffect(() => {
    if (dailyPlan?.evening_reflection) {
      setReflection(dailyPlan.evening_reflection);
    }
  }, [dailyPlan]);

  useEffect(() => {
    const words = reflection
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [reflection]);

  // Auto-save reflection with debounce
  useEffect(() => {
    if (!reflection || reflection === dailyPlan?.evening_reflection) return;

    const timeoutId = setTimeout(() => {
      updateDailyReflection(reflection);
    }, 1000); // Auto-save after 1 second of no typing

    return () => clearTimeout(timeoutId);
  }, [reflection, dailyPlan?.evening_reflection, updateDailyReflection]);

  const completedCount = tasks.filter(task => task.completed).length;
  const completionRate = tasks.length > 0 ? completedCount / tasks.length * 100 : 0;

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
  };

  const handlePlanTomorrow = () => {
    navigate('/plan-tomorrow');
  };

  return (
    <PageLayout>
      {/* STANDARDIZED HEADER - EXACT same structure as Today page */}
      <div className="mb-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
              Daily Ledger
            </h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <div className="flex items-center gap-12">
                <div className="flex items-center gap-4">
                  <span className="text-sm">Daily Progress & Reflection</span>
                </div>
                
                {/* Invisible spacer to match Today page structure exactly */}
                <div className="flex items-center gap-2 min-h-[24px]">
                  <span className="text-sm opacity-0">Next:</span>
                  <div className="flex items-center gap-2 min-h-[28px]">
                    <div className="px-2 py-0.5 rounded-md bg-transparent flex items-center gap-1">
                      <span className="text-sm opacity-0">placeholder text</span>
                      <div className="w-11 h-5 opacity-0"></div>
                    </div>
                  </div>
                </div>
              </div>
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
                  {completedCount}/{tasks.length}
                </p>
                <p className="text-xs text-gray-400">completed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT SECTIONS - Same mb-12 spacing as Today page */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-semibold">Completed Tasks</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent"></div>
        </div>
        
        <div className="opacity-100 transition-opacity duration-300">
          <div className="space-y-4">
            {tasks.map((task, index) => {
              const isCompleted = task.completed;

              return (
                <div
                  key={task.id}
                  className={`
                    group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer animate-fade-in
                    ${
                      isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                        : "bg-zinc-800/60 border-zinc-700/50 hover:border-zinc-600/80 hover:bg-zinc-700/80"
                    }
                  `}
                  onClick={() => handleTaskToggle(task.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative flex items-center gap-4">
                    <div
                      className={`
                        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                        ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/25"
                            : "border-gray-500 group-hover:border-gray-400 group-hover:bg-zinc-700/30"
                        }
                      `}
                    >
                      {isCompleted && <Check className="w-4 h-4 text-white" />}
                    </div>

                    <p className={`text-base font-medium transition-all ${isCompleted ? "text-emerald-300" : "text-white"}`}>
                      {task.text}
                    </p>

                    {isCompleted && (
                      <div className="ml-auto">
                        <TrendingUp className="w-4 h-4 text-emerald-400 opacity-60" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Examination Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-semibold">Examination of the day</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent"></div>
        </div>

        <div className="bg-[#212124] border-2 border-[#27272A] rounded-2xl p-8 hover:border-[#27272A]/80 transition-all duration-300 shadow-lg">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Reflect on your day... What went well? What could be improved? What did you learn?"
            className="w-full min-h-40 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base leading-relaxed overflow-hidden"
            style={{
              height: Math.max(160, reflection.split('\n').length * 24 + 40) + 'px'
            }}
          />

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#27272A]">
            <span className="text-xs text-gray-500">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Auto-saved
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handlePlanTomorrow}
          className="group px-8 py-4 bg-gradient-to-r from-white via-gray-100 to-white text-black font-semibold rounded-xl hover:from-gray-100 hover:via-white hover:to-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center gap-2">
            Next: Plan Tomorrow
            <Calendar className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      </div>
    </PageLayout>
  );
};

export default EveningRoutine;