import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PLAN_TOMORROW_KEY = 'plan-tomorrow-tasks';
const PLAN_TOMORROW_BACKUP_KEY = 'plan-tomorrow-tasks-backup';

const PlanTomorrow = () => {
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');
  const [task3, setTask3] = useState('');
  const [task4, setTask4] = useState('');
  const [task5, setTask5] = useState('');
  const [task6, setTask6] = useState('');
  // Allow planning for today or tomorrow
  const localHour = new Date().getHours();
  const defaultPlanDay: 'today' | 'tomorrow' = localHour < 17 ? 'today' : 'tomorrow';
  const [planDay, setPlanDay] = useState<'today' | 'tomorrow'>(defaultPlanDay);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Relax typing to avoid strict schema inference issues during setup
  const db = supabase as any;

  // Load saved data on component mount
  useEffect(() => {
    console.log('🚀 PlanTomorrow component mounted - checking for saved drafts...');
    
    const savedTasks = sessionStorage.getItem(PLAN_TOMORROW_KEY);
    const backupTasks = localStorage.getItem(PLAN_TOMORROW_BACKUP_KEY);
    
    console.log('🔄 Loading saved tasks from session storage:', savedTasks);
    console.log('🔄 Loading backup tasks from localStorage:', backupTasks);
    
    // Try session storage first, then localStorage as backup
    const tasksToLoad = savedTasks || backupTasks;
    
    if (tasksToLoad) {
      try {
        const parsed = JSON.parse(tasksToLoad);
        console.log('📋 Parsed saved tasks:', parsed);
        
        // Only restore if we have at least one task with content
        const hasContent = Object.values(parsed).some((value: any) => value && value.toString().trim() !== '');
        
        if (hasContent) {
          console.log('✅ Restoring saved tasks');
          setTask1(parsed.task1 || '');
          setTask2(parsed.task2 || '');
          setTask3(parsed.task3 || '');
          setTask4(parsed.task4 || '');
          setTask5(parsed.task5 || '');
          setTask6(parsed.task6 || '');
        } else {
          console.log('⚠️ Saved tasks found but no content, skipping restore');
        }
      } catch (error) {
        console.error('❌ Error parsing saved tasks:', error);
      }
    } else {
      console.log('📝 No saved tasks found, starting fresh');
    }
  }, []);

  // Save drafts to storage whenever tasks change
  useEffect(() => {
    try {
      const tasksData = {
        task1, task2, task3, task4, task5, task6
      };

      console.log('💾 Drafts saved to session storage:', tasksData);
      
      // Also backup to localStorage (persists across browser sessions)
      localStorage.setItem(PLAN_TOMORROW_BACKUP_KEY, JSON.stringify(tasksData));
      console.log('💾 Drafts backed up to localStorage');
    } catch (error) {
      console.error('❌ Error saving drafts to storage:', error);
    }
  }, [task1, task2, task3, task4, task5, task6]);
  
  const getTargetDateString = () => {
    const base = new Date();
    if (planDay === 'tomorrow') {
      base.setDate(base.getDate() + 1);
    }
    return base.toISOString().split('T')[0];
  };

  const handleSavePlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to save your plan.",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one task is filled
    const tasks = [task1, task2, task3, task4, task5, task6];
    console.log('All tasks:', tasks);
    
    const hasAnyTask = tasks.some(task => task.trim() !== '');
    if (!hasAnyTask) {
      console.log('No tasks found, showing validation error');
      toast({
        title: "Validation Error",
        description: "Please enter at least one task before saving.",
        variant: "destructive",
      });
      return;
    }

    // Show loading state
    toast({
      title: "Saving Plan",
      description: "Your daily plan is being saved...",
    });

    try {
      const targetDate = getTargetDateString();
      console.log('🎯 Saving plan for:', planDay, 'with date:', targetDate);

      // Ensure no existing plan for today
      const { data: existingPlan } = await db
        .from('daily_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('plan_date', targetDate)
        .maybeSingle();

      if (existingPlan) {
        throw new Error(`A plan for ${planDay} already exists.`);
      }

      // Create daily plan for today
      const { data: plan, error: planError } = await db
        .from('daily_plans')
        .insert({
          user_id: user.id,
          plan_date: targetDate,
          evening_reflection: null,
          morning_intention: null
        })
        .select()
        .single();

      if (planError) throw planError;
      if (!plan) throw new Error('Failed to create daily plan.');

      // Insert up to 6 tasks
      const texts = [task1, task2, task3, task4, task5, task6].map(t => t.trim());
      const tasksToInsert = texts
        .map((text, idx) => ({ text, idx }))
        .filter(({ text }) => text)
        .map(({ text, idx }) => ({
          daily_plan_id: plan.id,
          user_id: user.id,
          title: text,
          task_order: idx + 1,
          priority: 'medium',
          estimated_minutes: 60
        }));

      if (tasksToInsert.length > 0) {
        const { error: tasksError } = await db
          .from('daily_tasks')
          .insert(tasksToInsert);
        if (tasksError) throw tasksError;
      }

      // Clear form and storage on success
      setTask1('');
      setTask2('');
      setTask3('');
      setTask4('');
      setTask5('');
      setTask6('');
      
      // Clear from both storage locations
      sessionStorage.removeItem(PLAN_TOMORROW_KEY);
      localStorage.removeItem(PLAN_TOMORROW_BACKUP_KEY);
      console.log('🗑️ Cleared tasks from both storage locations');

      console.log('Plan saved successfully, form cleared');

      toast({
        title: "Plan Saved Successfully!",
        description: `Your ${tasksToInsert.length} tasks have been saved for ${planDay === 'today' ? 'today' : 'tomorrow'}. ${planDay === 'tomorrow' ? 'Redirecting to Daily Ledger...' : 'They should appear on your Today page now.'}`,
      });

      // Redirect to Daily Ledger page after successful save to show confirmation
      console.log('🔄 Redirecting to Daily Ledger...');
      setTimeout(() => {
        console.log('🔄 Executing navigation to /ledger');
        navigate('/ledger', { replace: true });
      }, 1000);

    } catch (error) {
      console.error('Save plan error:', error);
      
      toast({
        title: "Save Failed",
        description: `Unable to save plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
    
    console.log('=== SAVE PLAN DEBUG END ===');
  };

  return (
    <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex-shrink-0 bg-zinc-900">
        <h1 className="text-2xl font-medium title-gradient">Plan Tomorrow</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Plan Day Selector */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-zinc-200">Planning For</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => setPlanDay('today')}
                  variant={planDay === 'today' ? 'default' : 'outline'}
                  className={planDay === 'today' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-600 text-zinc-300 hover:bg-zinc-700'}
                >
                  Today
                </Button>
                <Button
                  onClick={() => setPlanDay('tomorrow')}
                  variant={planDay === 'tomorrow' ? 'default' : 'outline'}
                  className={planDay === 'tomorrow' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-600 text-zinc-300 hover:bg-zinc-700'}
                >
                  Tomorrow
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Input Form */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-zinc-200">Your Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const taskState = [task1, task2, task3, task4, task5, task6][num - 1];
                const setTaskState = [setTask1, setTask2, setTask3, setTask4, setTask5, setTask6][num - 1];
                
                return (
                  <div key={num} className="space-y-2">
                    <Label htmlFor={`task${num}`} className="text-zinc-300">
                      Task {num}
                    </Label>
                    <Input
                      id={`task${num}`}
                      value={taskState}
                      onChange={(e) => setTaskState(e.target.value)}
                      placeholder={`Enter your ${num}${num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'} task...`}
                      className="bg-zinc-700 border-zinc-600 text-zinc-200 placeholder-zinc-400 focus:border-emerald-500"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSavePlan}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
            >
              Save Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanTomorrow;
