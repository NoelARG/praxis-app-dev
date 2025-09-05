
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PLAN_TOMORROW_KEY = 'plan-tomorrow-tasks';

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
  // Relax typing to avoid strict schema inference issues during setup
  const db = supabase as any;

  // Load saved data on component mount
  useEffect(() => {
    const savedTasks = sessionStorage.getItem(PLAN_TOMORROW_KEY);
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTask1(parsed.task1 || '');
        setTask2(parsed.task2 || '');
        setTask3(parsed.task3 || '');
        setTask4(parsed.task4 || '');
        setTask5(parsed.task5 || '');
        setTask6(parsed.task6 || '');
      } catch (error) {
        console.error('Error parsing saved plan tasks:', error);
      }
    }
  }, []);

  // Save tasks to session storage whenever any task changes
  useEffect(() => {
    const tasksData = {
      task1,
      task2,
      task3,
      task4,
      task5,
      task6
    };
    sessionStorage.setItem(PLAN_TOMORROW_KEY, JSON.stringify(tasksData));
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
      
      // Clear from session storage
      sessionStorage.removeItem(PLAN_TOMORROW_KEY);

      console.log('Plan saved successfully, form cleared');

      toast({
        title: "Plan Saved Successfully! 🎉",
        description: "Your 6 tasks have been saved and will appear on your Today page.",
      });

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
      <div className="flex-1 px-8 py-6 min-h-0 overflow-y-auto">
        <Card className="max-w-2xl mx-auto bg-[#1F1F1F] border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">{planDay === 'today' ? "Today's" : "Tomorrow's"} 6 Priority Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan day toggle */}
            <div className="flex items-center gap-2">
              <Button type="button" variant={planDay === 'today' ? 'default' : 'outline'} className={planDay === 'today' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-zinc-600 text-zinc-100'} onClick={() => setPlanDay('today')}>Plan for Today</Button>
              <Button type="button" variant={planDay === 'tomorrow' ? 'default' : 'outline'} className={planDay === 'tomorrow' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-zinc-600 text-zinc-100'} onClick={() => setPlanDay('tomorrow')}>Plan for Tomorrow</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task1" className="text-zinc-300">Priority Task 1</Label>
              <Input
                id="task1"
                value={task1}
                onChange={(e) => setTask1(e.target.value)}
                placeholder="Enter your first priority task..."
                className="bg-[#313131] border-zinc-700 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:ring-0 focus:ring-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task2" className="text-zinc-300">Priority Task 2</Label>
              <Input
                id="task2"
                value={task2}
                onChange={(e) => setTask2(e.target.value)}
                placeholder="Enter your second priority task..."
                className="bg-[#313131] border-zinc-700 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:ring-0 focus:ring-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task3" className="text-zinc-300">Priority Task 3</Label>
              <Input
                id="task3"
                value={task3}
                onChange={(e) => setTask3(e.target.value)}
                placeholder="Enter your third priority task..."
                className="bg-[#313131] border-zinc-700 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:ring-0 focus:ring-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task4" className="text-zinc-300">Priority Task 4</Label>
              <Input
                id="task4"
                value={task4}
                onChange={(e) => setTask4(e.target.value)}
                placeholder="Enter your fourth priority task..."
                className="bg-[#313131] border-zinc-700 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:ring-0 focus:ring-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task5" className="text-zinc-300">Priority Task 5</Label>
              <Input
                id="task5"
                value={task5}
                onChange={(e) => setTask5(e.target.value)}
                placeholder="Enter your fifth priority task..."
                className="bg-[#313131] border-zinc-700 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:ring-0 focus:ring-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task6" className="text-zinc-300">Priority Task 6</Label>
              <Input
                id="task6"
                value={task6}
                onChange={(e) => setTask6(e.target.value)}
                placeholder="Enter your sixth priority task..."
                className="bg-[#313131] border-zinc-700 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:ring-0 focus:ring-transparent"
              />
            </div>
            
            <Button 
              onClick={handleSavePlan}
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
            >
              Save Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanTomorrow;
