// @ts-nocheck
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  text: string;
  completed: boolean;
  description?: string;
  task_order: number;
  estimated_minutes?: number;
  actual_minutes?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  completed_at?: string;
  rollover?: boolean;
  original_plan_date?: string;
  plan_date?: string;
}

interface DailyPlan {
  id: string;
  plan_date: string;
  morning_intention?: string;
  evening_reflection?: string;
  energy_level?: number;
  mood_rating?: number;
  energy_rating?: number;
  focus_rating?: number;
  tasks: Task[];
}

interface TasksContextType {
  tasks: Task[];
  tomorrowTasks: Task[];
  dailyPlan: DailyPlan | null;
  isLoading: boolean;
  toggleTask: (taskId: string) => Promise<void>;
  updateTaskTime: (taskId: string, actualMinutes: number) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
  createDailyPlan: (taskData: any) => Promise<void>;
  updateDailyReflection: (reflection: string) => Promise<void>;
  updateMorningIntention: (intention: string) => Promise<void>;
  updateEnergyAndMood: (energy: number, mood: number) => Promise<void>;
  updateDailyCheckIn: (mood: number, energy: number, focus: number) => Promise<void>;
  onPlanCreated?: (planId: string, planDate: string, isReplan: boolean) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({
  children,
  onPlanCreated,
}: {
  children: ReactNode;
  onPlanCreated?: (planId: string, planDate: string, isReplan: boolean) => void;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tomorrowTasks, setTomorrowTasks] = useState<Task[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // --- Fetch most recent plan (today or earlier) from Supabase ---
  // --- Fetch most recent plan (today or earlier) from Supabase ---
const fetchTodaysPlan = async () => {
  if (!isAuthenticated || !user) {
    setIsLoading(false);
    return;
  }

  try {
    const today = getTodayDate();

    const { data: planData, error: planError } = await supabase
      .from("daily_plans")
      .select(`
        id,
        plan_date,
        morning_routine,
        evening_routine,
        notes,
        energy_level,
        mood_rating,
        energy_rating,
        focus_rating,
        daily_tasks (
          id,
          title,
          description,
          completed,
          task_order,
          estimated_minutes,
          actual_minutes,
          priority,
          completed_at,
          created_at
        )
      `)
      .eq("user_id", user.id)
      .lte("plan_date", today) // ✅ fetch today or most recent earlier plan
      .order("plan_date", { ascending: false })
      .limit(1)
      .single();

    if (planError) throw planError;

    console.log("🔍 planData from Supabase:", planData);

    if (!planData) {
      setTasks([]);
      setDailyPlan(null);
      return;
    }

    const normalized: Task[] = (planData.daily_tasks || []).map(
      (item: any, index: number) => {
        const planDate = planData.plan_date;
        const isRolledOver = planDate < today;

        return {
          id: item.id,
          title: item.title,
          text: item.title,
          completed: item.completed || false,
          description: item.description || "",
          task_order: item.task_order || index + 1,
          estimated_minutes: item.estimated_minutes ?? 60,
          actual_minutes: item.actual_minutes ?? null,
          priority: item.priority || "medium",
          completed_at: item.completed_at || null,
          rollover: isRolledOver,
          original_plan_date: planDate,
          plan_date: planDate,
        };
      }
    );

    setTasks(normalized);

    const plan: DailyPlan = {
      id: planData.id,
      plan_date: planData.plan_date,
      morning_intention: planData.morning_routine ?? null,
      evening_reflection: planData.evening_routine ?? null,
      energy_level: planData.energy_level,
      mood_rating: planData.mood_rating,
      energy_rating: planData.energy_rating,
      focus_rating: planData.focus_rating,
      tasks: normalized,
    };

    setDailyPlan(plan);
  } catch (e) {
    console.error("❌ Failed to fetch plan from Supabase", e);
    setTasks([]);
    setDailyPlan(null);
  } finally {
    setIsLoading(false);
  }
};


  const fetchTomorrowsTasks = async () => {
    setTomorrowTasks([]);
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;

    // Update local state immediately for responsive UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    try {
      // Find the current task to get its new completion status
      const currentTask = tasks.find(t => t.id === taskId);
      const newCompletedStatus = !currentTask?.completed;

      // Update database
      const updateData: any = { 
        completed: newCompletedStatus 
      };
      
      // Set completed_at timestamp when marking as completed
      if (newCompletedStatus) {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('daily_tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        // Revert local state if database update fails
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: currentTask?.completed || false } : t))
        );
        throw error;
      }

    } catch (error) {
      console.error('❌ Error toggling task completion:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update task completion status.',
        variant: 'destructive',
      });
    }
  };

  const updateTaskTime = async (taskId: string, actualMinutes: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('daily_tasks')
        .update({ actual_minutes: actualMinutes })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, actual_minutes: actualMinutes } : t))
      );
    } catch (error) {
      console.error('❌ Error updating task time:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update task time.',
        variant: 'gray',
      });
    }
  };

  const removeTask = async (taskId: string) => {
    if (!user) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('daily_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error deleting task:', error);
        toast({
          title: 'Delete Failed',
          description: 'Failed to delete task from database.',
          variant: 'gray',
        });
        return;
      }

      // Update local state only after successful database deletion
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      
      // Also update the dailyPlan tasks if it exists
      setDailyPlan((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId)
        };
      });

      console.log('✅ Task deleted successfully');
    } catch (error) {
      console.error('❌ Unexpected error deleting task:', error);
      toast({
        title: 'Delete Failed',
        description: 'An unexpected error occurred while deleting the task.',
        variant: 'gray',
      });
    }
  };

  const createDailyPlan = async (taskData: any) => {
    if (!user) return;

    try {
      const today = getTodayDate();

      const { data: existingPlan } = await supabase
        .from('daily_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('plan_date', today)
        .single();

      const isReplan = !!existingPlan;

      const { data: planData, error: planError } = await supabase
        .from('daily_plans')
        .insert({ user_id: user.id, plan_date: today })
        .select()
        .single();

      if (planError) throw planError;

      const tasksToInsert: any[] = [];
      for (let i = 1; i <= 6; i++) {
        const taskText = taskData[`task${i}`];
        if (taskText && taskText.trim()) {
          tasksToInsert.push({
            daily_plan_id: planData.id,
            user_id: user.id,
            title: taskText.trim(),
            task_order: i,
            priority: 'medium' as const,
            estimated_minutes: 60,
          });
        }
      }

      let tasksData: any[] = [];
      if (tasksToInsert.length > 0) {
        const { data, error: tasksError } = await supabase
          .from('daily_tasks')
          .insert(tasksToInsert)
          .select();

        if (tasksError) throw tasksError;
        tasksData = data;
      }

      const plan: DailyPlan = {
        id: planData.id,
        plan_date: planData.plan_date,
        tasks: tasksData.map((t) => ({
          id: t.id,
          title: t.title,
          text: t.title,
          completed: false,
          task_order: t.task_order,
          priority: t.priority,
          estimated_minutes: t.estimated_minutes,
          rollover: false,
          plan_date: today,
        })),
      };

      setDailyPlan(plan);
      setTasks(plan.tasks);

      if (onPlanCreated) onPlanCreated(planData.id, planData.plan_date, isReplan);
      if ((window as any).handlePlanCreated) {
        (window as any).handlePlanCreated(planData.id, planData.plan_date, isReplan);
      }
    } catch (error) {
      console.error('❌ Error creating daily plan:', error);
      toast({
        title: 'Failed to Create Plan',
        description: 'There was an error creating your daily plan.',
        variant: 'gray',
      });
    }
  };

  const updateDailyReflection = async (reflection: string) => {
    if (!user || !dailyPlan) return;
    try {
      const { error } = await supabase
        .from('daily_plans')
        .update({ evening_reflection: reflection })
        .eq('id', dailyPlan.id)
        .eq('user_id', user.id);
      if (error) throw error;
      setDailyPlan((p) => (p ? { ...p, evening_reflection: reflection } : null));
    } catch (error) {
      console.error('❌ Error updating reflection:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save evening reflection.',
        variant: 'gray',
      });
    }
  };

  const updateMorningIntention = async (intention: string) => {
    if (!user || !dailyPlan) return;
    try {
      const { error } = await supabase
        .from('daily_plans')
        .update({ morning_intention: intention })
        .eq('id', dailyPlan.id)
        .eq('user_id', user.id);
      if (error) throw error;
      setDailyPlan((p) => (p ? { ...p, morning_intention: intention } : null));
    } catch (error) {
      console.error('❌ Error updating intention:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save morning intention.',
        variant: 'gray',
      });
    }
  };

  const updateEnergyAndMood = async (energy: number, mood: number) => {
    if (!user || !dailyPlan) return;
    try {
      const { error } = await supabase
        .from('daily_plans')
        .update({ energy_level: energy, mood_rating: mood })
        .eq('id', dailyPlan.id)
        .eq('user_id', user.id);
      if (error) throw error;
      setDailyPlan((p) => (p ? { ...p, energy_level: energy, mood_rating: mood } : null));
    } catch (error) {
      console.error('❌ Error updating energy/mood:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save energy and mood ratings.',
        variant: 'gray',
      });
    }
  };

  const updateDailyCheckIn = async (mood: number, energy: number, focus: number) => {
    if (!user || !dailyPlan) return;
    try {
      const { error } = await supabase
        .from('daily_plans')
        .update({ mood_rating: mood, energy_rating: energy, focus_rating: focus })
        .eq('id', dailyPlan.id)
        .eq('user_id', user.id);
      if (error) throw error;
      setDailyPlan((p) =>
        p ? { ...p, mood_rating: mood, energy_rating: energy, focus_rating: focus } : null
      );
    } catch (error) {
      console.error('❌ Error updating daily check-in:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save daily check-in ratings.',
        variant: 'gray',
      });
    }
  };

  const refreshTasks = async () => {
    setIsLoading(true);
    await Promise.all([fetchTodaysPlan(), fetchTomorrowsTasks()]);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      Promise.all([fetchTodaysPlan(), fetchTomorrowsTasks()]);
    } else {
      setIsLoading(false);
      setTasks([]);
      setTomorrowTasks([]);
      setDailyPlan(null);
    }
  }, [isAuthenticated, user?.id]);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        tomorrowTasks,
        dailyPlan,
        isLoading,
        toggleTask,
        updateTaskTime,
        removeTask,
        refreshTasks,
        createDailyPlan,
        updateDailyReflection,
        updateMorningIntention,
        updateEnergyAndMood,
        updateDailyCheckIn,
        onPlanCreated,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
