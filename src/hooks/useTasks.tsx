// @ts-nocheck
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  text: string; // Add this for backward compatibility
  completed: boolean;
  description?: string;
  task_order: number;
  estimated_minutes?: number;
  actual_minutes?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  completed_at?: string;
}

interface DailyPlan {
  id: string;
  plan_date: string;
  morning_intention?: string;
  evening_reflection?: string;
  energy_level?: number;
  mood_rating?: number;
  tasks: Task[];
}

interface TasksContextType {
  tasks: Task[];
  dailyPlan: DailyPlan | null;
  isLoading: boolean;
  toggleTask: (taskId: string) => Promise<void>;
  updateTaskTime: (taskId: string, actualMinutes: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
  createDailyPlan: (taskData: any) => Promise<void>;
  updateDailyReflection: (reflection: string) => Promise<void>;
  updateMorningIntention: (intention: string) => Promise<void>;
  updateEnergyAndMood: (energy: number, mood: number) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const fetchTodaysPlan = async () => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping task fetch');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching today\'s plan for user:', user.email);
      const today = getTodayDate();

      // Fetch daily plan with tasks
      const { data: planData, error: planError } = await supabase
        .from('daily_plans')
        .select(`
          *,
          daily_tasks (
            id,
            title,
            description,
            task_order,
            completed,
            completed_at,
            priority,
            estimated_minutes,
            actual_minutes
          )
        `)
        .eq('user_id', user.id)
        .eq('plan_date', today)
        .single();

      if (planError && planError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error fetching daily plan:', planError);
        throw planError;
      }

      if (planData) {
        console.log('✅ Found existing daily plan:', planData);
        
        // Sort tasks by order
        const sortedTasks = planData.daily_tasks?.sort((a: any, b: any) => a.task_order - b.task_order) || [];
        
        const plan: DailyPlan = {
          id: planData.id,
          plan_date: planData.plan_date,
          morning_intention: planData.morning_intention,
          evening_reflection: planData.evening_reflection,
          energy_level: planData.energy_level,
          mood_rating: planData.mood_rating,
          tasks: sortedTasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            text: task.title, // Add this for backward compatibility
            completed: task.completed,
            description: task.description,
            task_order: task.task_order,
            estimated_minutes: task.estimated_minutes,
            actual_minutes: task.actual_minutes,
            priority: task.priority,
            completed_at: task.completed_at
          }))
        };

        setDailyPlan(plan);
        setTasks(plan.tasks);

      } else {
        console.log('ℹ️ No existing plan found for today; leaving tasks empty');
        setDailyPlan(null);
        setTasks([]);
      }
    } catch (error) {
      console.error('❌ Error fetching today\'s plan:', error);
      // Do not show a toast or create fallback tasks; keep Today page clean
      setDailyPlan(null);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed fallback plan and preloaded example tasks to keep Today page clean

  const toggleTask = async (taskId: string) => {
    if (!user) return;

    // Update local state immediately for responsive UI
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          
          // Update in database asynchronously
          updateTaskInDatabase(taskId, newCompleted);
          
          return {
            ...task,
            completed: newCompleted,
            completed_at: newCompleted ? new Date().toISOString() : undefined
          };
        }
        return task;
      });
    });
  };

  const updateTaskInDatabase = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_tasks')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', taskId)
        .eq('user_id', user!.id);

      if (error) {
        console.error('❌ Error updating task:', error);
        // Revert local state if database update fails
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, completed: !completed, completed_at: undefined }
              : task
          )
        );
        
        toast({
          title: "Sync Error",
          description: "Failed to sync task status. Changes saved locally.",
          variant: "gray"
        });
      } else {
        console.log('✅ Task updated successfully');
      }
    } catch (error) {
      console.error('❌ Unexpected error updating task:', error);
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

      if (error) {
        console.error('❌ Error updating task time:', error);
        throw error;
      }

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, actual_minutes: actualMinutes } : task
        )
      );

      console.log('✅ Task time updated successfully');
    } catch (error) {
      console.error('❌ Error updating task time:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update task time.",
        variant: "gray"
      });
    }
  };

  const createDailyPlan = async (taskData: any) => {
    if (!user) return;

    try {
      const today = getTodayDate();
      
      // Check if plan already exists
      const { data: existingPlan } = await supabase
        .from('daily_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('plan_date', today)
        .single();

      if (existingPlan) {
        toast({
          title: "Plan Already Exists",
          description: "You already have a plan for today. Use the refresh button to reload it.",
          variant: "gray"
        });
        return;
      }

      // Create new plan
      const { data: planData, error: planError } = await supabase
        .from('daily_plans')
        .insert({
          user_id: user.id,
          plan_date: today
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create tasks from taskData
      const tasksToInsert = [];
      for (let i = 1; i <= 6; i++) {
        const taskText = taskData[`task${i}`];
        if (taskText && taskText.trim()) {
          tasksToInsert.push({
            daily_plan_id: planData.id,
            user_id: user.id,
            title: taskText.trim(),
            task_order: i,
            priority: 'medium' as const,
            estimated_minutes: 60
          });
        }
      }

      if (tasksToInsert.length > 0) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('daily_tasks')
          .insert(tasksToInsert)
          .select();

        if (tasksError) throw tasksError;

        const plan: DailyPlan = {
          id: planData.id,
          plan_date: planData.plan_date,
          tasks: tasksData.map(task => ({
            id: task.id,
            title: task.title,
            completed: false,
            task_order: task.task_order,
            priority: task.priority,
            estimated_minutes: task.estimated_minutes
          }))
        };

        setDailyPlan(plan);
        setTasks(plan.tasks);

      }
    } catch (error) {
      console.error('❌ Error creating daily plan:', error);
      toast({
        title: "Failed to Create Plan",
        description: "There was an error creating your daily plan.",
        variant: "gray"
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

      setDailyPlan(prev => prev ? { ...prev, evening_reflection: reflection } : null);
      console.log('✅ Evening reflection updated');
    } catch (error) {
      console.error('❌ Error updating reflection:', error);
      toast({
        title: "Update Failed",
        description: "Failed to save evening reflection.",
        variant: "gray"
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

      setDailyPlan(prev => prev ? { ...prev, morning_intention: intention } : null);
      console.log('✅ Morning intention updated');
    } catch (error) {
      console.error('❌ Error updating intention:', error);
      toast({
        title: "Update Failed",
        description: "Failed to save morning intention.",
        variant: "gray"
      });
    }
  };

  const updateEnergyAndMood = async (energy: number, mood: number) => {
    if (!user || !dailyPlan) return;

    try {
      const { error } = await supabase
        .from('daily_plans')
        .update({ 
          energy_level: energy,
          mood_rating: mood 
        })
        .eq('id', dailyPlan.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDailyPlan(prev => prev ? { ...prev, energy_level: energy, mood_rating: mood } : null);
      console.log('✅ Energy and mood updated');
    } catch (error) {
      console.error('❌ Error updating energy/mood:', error);
      toast({
        title: "Update Failed",
        description: "Failed to save energy and mood ratings.",
        variant: "gray"
      });
    }
  };

  const refreshTasks = async () => {
    setIsLoading(true);
    await fetchTodaysPlan();
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTodaysPlan();
    } else {
      setIsLoading(false);
      setTasks([]);
      setDailyPlan(null);
    }
  }, [isAuthenticated, user]);

  return (
    <TasksContext.Provider value={{ 
      tasks, 
      dailyPlan,
      isLoading, 
      toggleTask, 
      updateTaskTime,
      refreshTasks,
      createDailyPlan,
      updateDailyReflection,
      updateMorningIntention,
      updateEnergyAndMood
    }}>
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