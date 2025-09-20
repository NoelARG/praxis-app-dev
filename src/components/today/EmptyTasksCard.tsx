import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Check, Plus, Minus, Calendar, Target, GripVertical, X, AlertTriangle } from 'lucide-react';
import { RolloverDeleteModal } from './RolloverDeleteModal';
import { useTasks } from '@/hooks/useTasks';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EmptyTasksCardProps {
  onTasksCreated?: () => void;
}

type TaskItem = { 
  id: string; 
  text: string; 
  rollover?: boolean;
  original_plan_date?: string;
};

interface SortableTaskItemProps {
  id: string;
  text: string;
  rollover: boolean;
  original_plan_date?: string;
  taskItems: TaskItem[];
  onUpdate: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  canRemove: boolean;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  id,
  text,
  rollover,
  original_plan_date,
  taskItems,
  onUpdate,
  onRemove,
  onKeyDown,
  canRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 transition-all duration-300 ease-out ${
        isDragging 
          ? 'scale-105 rotate-[-2deg] shadow-lg shadow-black/20 z-50' 
          : 'hover:scale-[1.005]'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted/30 rounded transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 relative">
        <Input
          value={text}
          onChange={(e) => onUpdate(id, e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a task"
          className={`bg-muted/40 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/60 ${
            rollover ? 'cursor-not-allowed opacity-60 italic text-muted-foreground' : ''
          }`}
          maxLength={200}
          disabled={rollover}
          data-task-index={taskItems.findIndex(item => item.id === id)}
        />
        {rollover && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 text-xs bg-amber-400/15 text-amber-300 border-amber-400/20"
            title={`Rolled over from ${formatRolloverDate(original_plan_date || new Date().toISOString().split('T')[0])}`}
          >
            RO
          </Badge>
        )}
      </div>
      <div className="w-8 h-8 flex items-center justify-center">
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(id)}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const DRAFT_STORAGE_KEY = 'empty-tasks-card-drafts';

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

export const EmptyTasksCard: React.FC<EmptyTasksCardProps> = ({ onTasksCreated }) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isForToday, setIsForToday] = useState(true);
  const [taskItems, setTaskItems] = useState<TaskItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [rolloverTasks, setRolloverTasks] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [savedTasks, setSavedTasks] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [rolloverDeleteOpen, setRolloverDeleteOpen] = useState(false);
  const [rolloverTaskToDelete, setRolloverTaskToDelete] = useState<{id: string, title: string, originalDate: string} | null>(null);
  const { createDailyPlan, refreshTasks } = useTasks();
  const { userPreferences } = useOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const makeItem = (text = "", rollover = false): TaskItem => ({ 
    id: crypto.randomUUID(), 
    text, 
    rollover 
  });

  // Get tomorrow's date for the title
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get recommendation based on time
  const getRecommendation = () => {
    if (!userPreferences?.work_start_time || !userPreferences?.work_end_time) {
      return null;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const wakeHour = parseInt(userPreferences.work_start_time.split(':')[0]);
    const bedHour = parseInt(userPreferences.work_end_time.split(':')[0]);

    // Within 4 hours of wake time → "Today"
    if (currentHour >= wakeHour && currentHour < wakeHour + 4) {
      return 'Today';
    }
    
    // Within 3 hours before bedtime → "Tomorrow"
    if (currentHour >= bedHour - 3 && currentHour < bedHour) {
      return 'Tomorrow';
    }

    return null;
  };

  const recommendation = getRecommendation();

  // Fetch rollover tasks from yesterday
  useEffect(() => {
    const fetchRolloverTasks = async () => {
      if (!user) return;

      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];

        const { data: yesterdayPlan, error } = await supabase
          .from('daily_plans')
          .select(`
            *,
            daily_tasks (
              id,
              title,
              completed,
              task_order
            )
          `)
          .eq('user_id', user.id)
          .eq('plan_date', yesterdayDate)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching yesterday\'s plan:', error);
          return;
        }

        if (yesterdayPlan?.daily_tasks) {
          const incompleteTasks = yesterdayPlan.daily_tasks
            .filter((task: any) => !task.completed)
            .sort((a: any, b: any) => a.task_order - b.task_order)
            .map((task: any) => task.title);
          
          setRolloverTasks(incompleteTasks);
        }
      } catch (error) {
        console.error('Error fetching rollover tasks:', error);
      }
    };

    fetchRolloverTasks();
  }, [user]);

  // Load saved drafts on component mount
  useEffect(() => {
    console.log('🚀 EmptyTasksCard mounted - checking for saved drafts...');
    
    const savedDrafts = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    const backupDrafts = localStorage.getItem(DRAFT_STORAGE_KEY + '-backup');
    
    console.log('🔄 Loading saved drafts from session storage:', savedDrafts);
    console.log('🔄 Loading backup drafts from localStorage:', backupDrafts);
    
    const draftsToLoad = savedDrafts || backupDrafts;
    
    if (draftsToLoad) {
      try {
        const parsed = JSON.parse(draftsToLoad);
        console.log('📋 Parsed saved drafts:', parsed);
        
        if (parsed.taskItems && Array.isArray(parsed.taskItems) && parsed.taskItems.length > 0) {
          // Check if we have meaningful content
          const hasContent = parsed.taskItems.some((item: any) => item.text && item.text.trim() !== '');
          
          if (hasContent) {
            // Ensure we have at least 6 task boxes, pad with empty ones if needed
            const paddedItems = [...parsed.taskItems];
            while (paddedItems.length < 6) {
              paddedItems.push(makeItem("", false));
            }
            setTaskItems(paddedItems);
            setIsComposerOpen(parsed.isComposerOpen || false);
            setIsForToday(parsed.isForToday !== undefined ? parsed.isForToday : true);
            
            const source = savedDrafts ? 'session storage' : 'localStorage backup';
            console.log(`✅ Drafts restored from ${source}`);
          } else {
            console.log('ℹ️ No meaningful content found in saved drafts');
          }
        }
      } catch (error) {
        console.error('❌ Error parsing saved drafts:', error);
        // Clear corrupted data
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        localStorage.removeItem(DRAFT_STORAGE_KEY + '-backup');
      }
    } else {
      console.log('ℹ️ No saved drafts found, initializing with defaults');
      // Initialize with user's preferred task count and rollover tasks
      const taskCount = Math.max(3, userPreferences?.daily_task_count || 6);
      const initialItems: TaskItem[] = [];
      
      // Pre-fill with rollover tasks
      rolloverTasks.forEach((task, index) => {
        if (index < taskCount) {
          initialItems.push(makeItem(task, true));
        }
      });
      
      // Fill remaining slots with empty tasks
      while (initialItems.length < taskCount) {
        initialItems.push(makeItem("", false));
      }
      
      setTaskItems(initialItems);
    }
  }, [userPreferences, rolloverTasks, toast]);

  // Ensure composer always has 6 task boxes when opened
  useEffect(() => {
    if (isComposerOpen && taskItems.length === 0) {
      console.log('🔧 Composer opened with 0 tasks, initializing with 6 empty boxes');
      setTaskItems(Array.from({ length: 6 }, () => makeItem("", false)));
    }
  }, [isComposerOpen]);

  // Save drafts whenever taskItems, isComposerOpen, or isForToday changes
  useEffect(() => {
    if (taskItems.length === 0) return; // Don't save empty state
    
    console.log('💾 Draft save triggered - Current state:', { 
      taskItems, 
      isComposerOpen, 
      isForToday 
    });
    
    const draftData = {
      taskItems,
      isComposerOpen,
      isForToday,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Save to session storage (primary)
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      console.log('💾 Drafts saved to session storage');
      
      // Also backup to localStorage (persists across browser sessions)
      localStorage.setItem(DRAFT_STORAGE_KEY + '-backup', JSON.stringify(draftData));
      console.log('💾 Drafts backed up to localStorage');
    } catch (error) {
      console.error('❌ Error saving drafts to storage:', error);
    }
  }, [taskItems, isComposerOpen, isForToday]);

  const addTaskSlot = () => {
    if (taskItems.length < 6) {
      setTaskItems([...taskItems, makeItem("", false)]);
    }
  };

  const removeTask = (id: string) => {
    const task = taskItems.find(i => i.id === id);
    
    // If it's a rollover task, show special rollover deletion modal
    if (task?.rollover) {
      setRolloverTaskToDelete({
        id: id,
        title: task.text,
        originalDate: task.original_plan_date || new Date().toISOString().split('T')[0]
      });
      setRolloverDeleteOpen(true);
      return;
    }
    
    // Regular task removal
    if (taskItems.length > 3) {
      setTaskItems(items => items.filter(i => i.id !== id));
    }
  };

  const confirmDeleteRolloverTask = () => {
    if (taskToDelete && taskItems.length > 3) {
      setTaskItems(items => items.filter(i => i.id !== taskToDelete));
      toast({
        title: "Rollover Task Deleted",
        description: "The rolled-over task has been removed from your list.",
        variant: "default"
      });
    }
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleRolloverDeleteConfirm = async () => {
    if (rolloverTaskToDelete && taskItems.length > 3) {
      // Remove from UI immediately
      setTaskItems(items => items.filter(i => i.id !== rolloverTaskToDelete.id));
      
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
            notes: 'Task deleted from rollover list'
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
    }
  };

  const updateTaskText = (id: string, value: string) => {
    setTaskItems(items => items.map(i => i.id === id ? { ...i, text: value } : i));
  };

  const handlePrimaryAction = (forToday: boolean) => {
    setIsForToday(forToday);
    
    // Always ensure we start with 6 empty task boxes
    if (taskItems.length === 0) {
      setTaskItems(Array.from({ length: 6 }, () => makeItem("", false)));
    }
    
    setIsComposerOpen(true);
  };

  const handleSave = async () => {
    const validTasks = taskItems.map(i => i.text).filter(Boolean);
    
    if (validTasks.length < 3) {
      toast({
        title: "Not Enough Tasks",
        description: "Please add at least 3 tasks before saving.",
        variant: "gray",
        duration: 4000
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isForToday) {
        // Create today's plan
        const taskData: any = {};
        validTasks.forEach((task, index) => {
          taskData[`task${index + 1}`] = task.trim();
        });

        await createDailyPlan(taskData);
        
        // Show confirmation instead of toast
        setSavedTasks(validTasks);
        setShowConfirmation(true);
        setIsComposerOpen(false);

        // Clear drafts after successful save
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        localStorage.removeItem(DRAFT_STORAGE_KEY + '-backup');
        console.log('🗑️ Cleared drafts after successful save');

        // Call onTasksCreated to refresh the parent component
        onTasksCreated?.();
      } else {
        // Save to tomorrow's date
        const taskData: any = {};
        validTasks.forEach((task, index) => {
          taskData[`task${index + 1}`] = task.trim();
        });

        // Create tomorrow's plan directly
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        console.log('🗓️ Creating plan for tomorrow:', tomorrowDate);
        console.log('👤 User ID:', user!.id);
        console.log('📋 Tasks to save:', validTasks);

        // Check if plan already exists for tomorrow, if not create it
        let plan;
        const { data: existingPlan, error: checkError } = await supabase
          .from('daily_plans')
          .select('*')
          .eq('user_id', user!.id)
          .eq('plan_date', tomorrowDate)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('❌ Error checking existing plan:', checkError);
          throw checkError;
        }

        if (existingPlan) {
          console.log('✅ Found existing plan for tomorrow:', existingPlan);
          plan = existingPlan;
        } else {
          console.log('📝 Creating new plan for tomorrow');
          const { data: newPlan, error: planError } = await supabase
            .from('daily_plans')
            .insert({
              user_id: user!.id,
              plan_date: tomorrowDate
            })
            .select()
            .single();

          if (planError) {
            console.error('❌ Error creating daily plan:', planError);
            throw planError;
          }
          if (!newPlan) throw new Error('Failed to create daily plan.');
          
          plan = newPlan;
          console.log('✅ Daily plan created:', plan);
        }

        // Clear existing tasks if updating an existing plan
        if (existingPlan) {
          console.log('🗑️ Clearing existing tasks for tomorrow');
          const { error: deleteError } = await supabase
            .from('daily_tasks')
            .delete()
            .eq('daily_plan_id', plan.id)
            .eq('user_id', user!.id);
          
          if (deleteError) {
            console.error('❌ Error clearing existing tasks:', deleteError);
            throw deleteError;
          }
          console.log('✅ Existing tasks cleared');
        }

        // Insert tasks
        const tasksToInsert = validTasks.map((task, index) => ({
          daily_plan_id: plan.id,
          user_id: user!.id,
          title: task.trim(),
          task_order: index + 1,
          priority: 'medium',
          estimated_minutes: 60
        }));

        console.log('📝 Tasks to insert:', tasksToInsert);

        if (tasksToInsert.length > 0) {
          const { error: tasksError } = await supabase
            .from('daily_tasks')
            .insert(tasksToInsert);
          if (tasksError) {
            console.error('❌ Error inserting tasks:', tasksError);
            throw tasksError;
          }
          console.log('✅ Tasks inserted successfully');
        }

        // Show confirmation instead of toast
        setSavedTasks(validTasks);
        setShowConfirmation(true);
        setIsComposerOpen(false);

        // Clear drafts after successful save
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        localStorage.removeItem(DRAFT_STORAGE_KEY + '-backup');
        console.log('🗑️ Cleared drafts after successful save');

        // Refresh tasks to show tomorrow's tasks in the Daily Ledger
        console.log('🔄 Refreshing tasks to show tomorrow\'s tasks...');
        await refreshTasks();
        
        // Trigger plan created callback for chat session management
        if ((window as any).handlePlanCreated) {
          (window as any).handlePlanCreated(plan.id, tomorrowDate, false);
        }
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsComposerOpen(false);
    
    // Clear drafts when canceling
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_STORAGE_KEY + '-backup');
    console.log('🗑️ Cleared drafts after cancel');
    
    // Reset to initial state
    const taskCount = Math.max(3, userPreferences?.daily_task_count || 6);
    const initialItems: TaskItem[] = [];
    
    rolloverTasks.forEach((task, index) => {
      if (index < taskCount) {
        initialItems.push(makeItem(task, true));
      }
    });
    
    while (initialItems.length < taskCount) {
      initialItems.push(makeItem("", false));
    }
    
    setTaskItems(initialItems);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTaskItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Find the next empty task box instead of saving
      const currentInput = e.target as HTMLInputElement;
      const currentIndex = taskItems.findIndex(item => 
        currentInput.value === item.text || currentInput.placeholder === 'Add a task'
      );
      
      // Find next empty task box
      const nextEmptyIndex = taskItems.findIndex((item, index) => 
        index > currentIndex && (!item.text || item.text.trim() === '')
      );
      
      if (nextEmptyIndex !== -1) {
        // Focus the next empty task box
        const nextInput = document.querySelector(`input[data-task-index="${nextEmptyIndex}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        // If no empty boxes found, focus the last task box
        const lastInput = document.querySelector(`input[data-task-index="${taskItems.length - 1}"]`) as HTMLInputElement;
        if (lastInput) {
          lastInput.focus();
        }
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (showConfirmation) {
    return (
      <Card className="bg-card border border-border rounded-2xl">
        <CardContent className="px-6 py-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-full mx-auto">
              <Check className="h-6 w-6 text-emerald-500" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Tasks Created Successfully!
              </h3>
              <p className="text-sm text-muted-foreground">
                {isForToday 
                  ? `Added ${savedTasks.length} tasks for today. You can now start working on them.`
                  : `Added ${savedTasks.length} tasks for tomorrow (${getTomorrowDate()}). They will appear on your Today page tomorrow.`
                }
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Your tasks:</p>
              <div className="space-y-1">
                {savedTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-emerald-500">{index + 1}</span>
                    </div>
                    <span className="text-left">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => {
                setShowConfirmation(false);
                setSavedTasks([]);
                // Reset to initial state
                const taskCount = Math.max(3, userPreferences?.daily_task_count || 6);
                const initialItems: TaskItem[] = [];
                
                rolloverTasks.forEach((task, index) => {
                  if (index < taskCount) {
                    initialItems.push(makeItem(task, true));
                  }
                });
                
                while (initialItems.length < taskCount) {
                  initialItems.push(makeItem("", false));
                }
                
                setTaskItems(initialItems);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Plan More Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComposerOpen) {
    return (
      <Card className="bg-card border border-border rounded-2xl">
        <CardContent className="px-0 pt-6 pb-6">
          <div className="px-6">
            {/* Title - aligned with input field width */}
            <div className="flex items-center mb-2">
              <div className="w-10"></div> {/* Spacer to match drag handle width */}
              <h3 className="text-lg font-semibold text-foreground flex-1">
                Add Tasks for {isForToday ? "Today" : (
                  <>
                    Tomorrow <span className="font-normal">({getTomorrowDate()})</span>
                  </>
                )}
              </h3>
              <div className="w-10"></div> {/* Spacer to match delete button width */}
            </div>

            {/* Subtitle - aligned with input field width */}
            <div className="flex items-center mb-4">
              <div className="w-10"></div> {/* Spacer to match drag handle width */}
              <p className="text-sm text-muted-foreground flex-1">
                Tasks at the top have highest priority
              </p>
              <div className="w-10"></div> {/* Spacer to match delete button width */}
            </div>

            {/* List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={taskItems.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {taskItems.map(item => (
                    <SortableTaskItem
                      key={item.id}
                      id={item.id}
                      text={item.text}
                      rollover={!!item.rollover}
                      original_plan_date={item.original_plan_date}
                      taskItems={taskItems}
                      onUpdate={updateTaskText}
                      onRemove={removeTask}
                      onKeyDown={handleKeyDown}
                      canRemove={taskItems.length > 3}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add row - aligned with input field width */}
            {taskItems.length < 6 && (
              <div className="flex items-center mt-2">
                <div className="w-10"></div> {/* Spacer to match drag handle width */}
                <Button 
                  variant="ghost" 
                  onClick={addTaskSlot}
                  className="flex-1 border-2 border-dashed border-zinc-700/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Task ({taskItems.length}/6)
                </Button>
                <div className="w-10"></div> {/* Spacer to match delete button width */}
              </div>
            )}

            {/* Actions — aligned with input field width */}
            <div className="flex items-center pt-6">
              <div className="w-10"></div> {/* Spacer to match drag handle width */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSaving ? "Saving..." : "Save & Start"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleCancel} 
                  disabled={isSaving}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
              <div className="w-10"></div> {/* Spacer to match delete button width */}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="bg-card border border-border rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-foreground">
            No tasks yet
          </CardTitle>
          {recommendation && (
            <Badge variant="secondary" className="bg-zinc-800/50 text-emerald-400 border-emerald-500/30">
              Recommended: {recommendation}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subcopy */}
        <p className="text-muted-foreground">
          Your day isn't planned yet. Add tasks now — or set tomorrow's list
        </p>

        {/* Primary Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => handlePrimaryAction(true)}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Add for Today
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePrimaryAction(false)}
            className="flex-1 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
          >
            Plan for Tomorrow
          </Button>
        </div>

      </CardContent>
    </Card>

    {/* Delete Confirmation Dialog for Rollover Tasks */}
    <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Delete Rollover Task?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This task was carried over from a previous day. Are you sure you want to delete it? 
            This action cannot be undone and you won't be able to recover this task.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Task</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDeleteRolloverTask}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Task
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Enhanced Rollover Delete Modal */}
    <RolloverDeleteModal
      isOpen={rolloverDeleteOpen}
      onClose={() => setRolloverDeleteOpen(false)}
      onConfirm={handleRolloverDeleteConfirm}
      taskTitle={rolloverTaskToDelete?.title || ''}
      originalDate={rolloverTaskToDelete?.originalDate || ''}
    />
  </>
  );
};
