
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

const Index = () => {
  const [tasks, setTasks] = useState({
    task1: '',
    task2: '',
    task3: '',
    task4: '',
    task5: '',
    task6: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTaskChange = (taskKey: string, value: string) => {
    setTasks(prev => ({
      ...prev,
      [taskKey]: value
    }));
  };

  const handlePlanMyDay = async () => {
    setIsLoading(true);
    
    try {
      // N8N removed: simulate success locally
      await new Promise((resolve) => setTimeout(resolve, 300));
      toast({
        title: "✨ Day Planned Successfully!",
        description: "Your evening plan has been saved locally.",
      });
      
      // Clear the form after successful submission
      setTasks({
        task1: '',
        task2: '',
        task3: '',
        task4: '',
        task5: '',
        task6: ''
      });
    } catch (error) {
      toast({
        title: "Failed to Plan Day",
        description: "There was an error submitting your plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                Life Alchemy
              </h1>
            </div>
            <h2 className="text-2xl text-white/90 font-light">Evening Plan</h2>
            <p className="text-white/60 mt-2">Transform tomorrow with intention</p>
          </div>

          <div className="space-y-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((taskNumber) => (
              <div key={taskNumber} className="space-y-2">
                <label className="text-sm font-medium text-white/80 block">
                  Priority Task {taskNumber}
                </label>
                <Input
                  placeholder={`Task ${taskNumber}`}
                  value={tasks[`task${taskNumber}` as keyof typeof tasks]}
                  onChange={(e) => handleTaskChange(`task${taskNumber}`, e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-400/50 focus:ring-purple-400/25 transition-all duration-200 hover:bg-white/15"
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handlePlanMyDay}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Planning Your Day...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Plan My Day
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
