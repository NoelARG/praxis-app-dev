import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Goals = () => {
  const navigate = useNavigate();

  const handleBeginProcess = () => {
    console.log('Beginning the goal-setting process...');
    navigate('/goal-wizard');
  };

  return (
    <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex-shrink-0 bg-zinc-900">
        <h1 className="text-3xl font-medium title-gradient">The Architecture of Your Future</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6 min-h-0 overflow-y-auto">
        <Card className="max-w-3xl mx-auto bg-[#1F1F1F] border-zinc-700/50">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-zinc-300 leading-relaxed text-lg">
                <p>
                  Your greatest achievements begin with a vision so compelling it pulls you forward through every challenge. 
                  We will start by defining your massive, transformative 10-year vision—the future that ignites your passion 
                  and gives meaning to your daily efforts.
                </p>
                <p className="mt-4">
                  From this pinnacle, we'll work backwards with precision: crafting your 5-year milestones, 
                  your 1-year objectives, and ultimately connecting every daily task to your ultimate purpose. 
                  This top-down approach is the most effective way to ensure your daily actions compound toward 
                  extraordinary outcomes.
                </p>
                <p className="mt-4">
                  Praxis, your AI guide, will walk you through each step of this transformative process, 
                  helping you build the bridge between who you are today and who you're destined to become.
                </p>
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  onClick={handleBeginProcess}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-8 py-3 text-lg font-medium"
                  size="lg"
                >
                  Begin The Process
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Goals;
