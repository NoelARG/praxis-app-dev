import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, BookOpen, TrendingUp, Clock, Calendar, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RolloverDeleteModal } from '@/components/today/RolloverDeleteModal';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { useTasks } from '@/hooks/useTasks';
import { EmptyTasksCard } from '@/components/today/EmptyTasksCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

const EveningRoutine = () => {
  const navigate = useNavigate();
  const { tasks, tomorrowTasks, toggleTask, refreshTasks, removeTask } = useTasks();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Rollover delete modal state
  const [rolloverDeleteOpen, setRolloverDeleteOpen] = useState(false);
  const [rolloverTaskToDelete, setRolloverTaskToDelete] = useState<{id: string, title: string, originalDate: string} | null>(null);
  
  // Success confirmation state
  const [showSuccessConfirmation, setShowSuccessConfirmation] = useState(false);

  // Debug logging
  console.log('📊 EveningRoutine - Today tasks:', tasks);
  console.log('📊 EveningRoutine - Tomorrow tasks:', tomorrowTasks);

  // Force refresh tasks when component mounts
  useEffect(() => {
    console.log('🔄 EveningRoutine mounted, refreshing tasks...');
    refreshTasks();
  }, []);

  // Get current date for header
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get tomorrow's date for display
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const completionRate = tasks.length > 0 ? completedCount / tasks.length * 100 : 0;

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
  };


  const handleTasksCreated = () => {
    // Refresh the page to show the newly created tasks
    window.location.reload();
  };

  const handleRolloverDelete = (task: any) => {
    setRolloverTaskToDelete({
      id: task.id,
      title: task.text,
      originalDate: task.original_plan_date || task.plan_date || new Date().toISOString().split('T')[0]
    });
    setRolloverDeleteOpen(true);
  };

  const handleRolloverDeleteConfirm = async () => {
    if (rolloverTaskToDelete) {
      try {
        // Remove from database and UI
        await removeTask(rolloverTaskToDelete.id);
        
        // Log to deleted_tasks table for user reflection
        try {
          const { error } = await supabase
            .from('deleted_tasks')
            .insert({
              user_id: user?.id,
              original_task_id: rolloverTaskToDelete.id,
              task_title: rolloverTaskToDelete.title,
              original_plan_date: rolloverTaskToDelete.originalDate,
              deletion_reason: 'user_deleted_rollover',
              notes: 'Task deleted from Daily Ledger'
            });

          if (error) {
            console.error('Failed to log deleted task:', error);
          } else {
            console.log('Rollover task deletion logged successfully');
          }
        } catch (error) {
          console.error('Error logging deleted task:', error);
        }
        
        toast({
          title: "Rollover Task Removed",
          description: `"${rolloverTaskToDelete.title}" has been permanently deleted. Consider reflecting on why this task was left unfinished.`,
          variant: "gray"
        });
        
        setRolloverDeleteOpen(false);
        setRolloverTaskToDelete(null);
      } catch (error) {
        console.error('Error deleting rollover task:', error);
        toast({
          title: "Delete Failed",
          description: "Failed to permanently delete the rollover task.",
          variant: "gray"
        });
      }
    }
  };

  return (
    <PageShell
      variant="narrow"
      title={
        <span className="font-mono">
          <span className="font-sans">Daily Ledger</span> <span className="text-muted-foreground font-light text-4xl"><span className="text-2xl">/</span><span className="text-3xl"> {getCurrentDate()}</span></span>
        </span>
      }
      subtitle="Daily Progress & Reflection"
      subtitleIcon={Clock}
      headerRight={
        completedCount > 0 ? (
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
        ) : null
      }
    >
      {/* Success Confirmation Banner */}
      {showSuccessConfirmation && (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-emerald-400 mb-1">
                Plan Saved Successfully!
              </h3>
              <p className="text-emerald-300/80 text-sm">
                Your 3 tasks have been scheduled for tomorrow. You're all set for a productive day ahead!
              </p>
            </div>
            <Button
              onClick={() => setShowSuccessConfirmation(false)}
              variant="ghost"
              size="sm"
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {/* Always show task list if tasks exist, otherwise show Add Tasks card */}
        {tasks.length > 0 ? (
          <div>
            <SectionHeader icon={Check}>Completed Tasks</SectionHeader>
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

                        <div className="flex items-center gap-2 flex-1">
                          <p className={`text-base font-medium transition-all ${
                            isCompleted 
                              ? "text-emerald-300" 
                              : task.rollover 
                                ? "text-muted-foreground italic opacity-75" 
                                : "text-white"
                          }`}>
                            {task.text}
                          </p>
                          {task.rollover && (
                            <span 
                              className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded text-[10px] font-medium"
                              title={`Rolled over from ${formatRolloverDate(task.original_plan_date || task.plan_date || new Date().toISOString().split('T')[0])}`}
                            >
                              RO
                            </span>
                          )}
                        </div>

                        {/* Remove button for rollover tasks */}
                        {task.rollover && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent task toggle
                              handleRolloverDelete(task);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                            title="Remove rollover task"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

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
        ) : (
          <EmptyTasksCard onTasksCreated={handleTasksCreated} />
        )}

        {/* Tomorrow's Tasks Section */}
        {tomorrowTasks.length > 0 && (
          <div>
            <SectionHeader icon={Calendar}>Tomorrow's Tasks ({getTomorrowDate()})</SectionHeader>
            <div className="space-y-4">
              {tomorrowTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="group relative p-6 rounded-2xl border bg-zinc-800/40 border-zinc-700/50 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative flex items-center gap-4">
                    <div className="w-6 h-6 rounded-lg border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-400">{task.task_order}</span>
                    </div>
                    <p className="text-base font-medium text-blue-200">
                      {task.text}
                    </p>
                    <div className="ml-auto">
                      <Calendar className="w-4 h-4 text-blue-400 opacity-60" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation to Examination page when tasks exist */}
        {tasks.length > 0 && (
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate('/reflection')}
              className="group px-8 py-4 bg-gradient-to-r from-white via-gray-100 to-white text-black font-semibold rounded-xl hover:from-gray-100 hover:via-white hover:to-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                Next: Evening Reflection
                <BookOpen className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Rollover Delete Modal */}
      <RolloverDeleteModal
        isOpen={rolloverDeleteOpen}
        onClose={() => setRolloverDeleteOpen(false)}
        onConfirm={handleRolloverDeleteConfirm}
        taskTitle={rolloverTaskToDelete?.title || ''}
        originalDate={rolloverTaskToDelete?.originalDate || ''}
      />
    </PageShell>
  );
};

export default EveningRoutine;