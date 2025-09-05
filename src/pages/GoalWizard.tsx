
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface GoalStage {
  id: string;
  title: string;
  description: string;
}

const GOAL_STAGES: GoalStage[] = [
  { id: 'manifesto', title: 'Manifesto', description: 'Define your core principles and values' },
  { id: 'vision-10', title: '10-Year Vision', description: 'Envision your ultimate destination' },
  { id: 'milestone-5', title: '5-Year Milestone', description: 'Set your major waypoint' },
  { id: 'objective-1', title: '1-Year Objective', description: 'Plan your immediate focus' }
];

const GoalWizard = () => {
  const [currentStageIndex] = useState(1); // Set to 10-Year Vision stage
  const [visionText, setVisionText] = useState('');

  const currentStage = GOAL_STAGES[currentStageIndex];
  const progressPercentage = ((currentStageIndex + 1) / GOAL_STAGES.length) * 100;

  // Calculate date exactly 10 years from today
  const getFutureDateString = () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    return futureDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCrystallizeVision = () => {
    console.log('Vision text:', visionText);
    // Future functionality will be added here
  };

  const handleNeedInspiration = () => {
    console.log('Need inspiration clicked');
    // Future functionality will be added here
  };

  return (
    <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden animate-fade-in">
      {/* Header with Progress */}
      <div className="px-8 py-6 flex-shrink-0 bg-zinc-900 border-b border-zinc-700/50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-medium title-gradient mb-6">Goal-Setting Wizard</h1>
          
          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {GOAL_STAGES.map((stage, index) => (
                <div key={stage.id} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                    index <= currentStageIndex 
                      ? 'bg-zinc-100 text-zinc-900' 
                      : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      index === currentStageIndex 
                        ? 'text-zinc-100' 
                        : index < currentStageIndex 
                          ? 'text-zinc-300' 
                          : 'text-zinc-500'
                    }`}>
                      {stage.title}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{stage.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8 min-h-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#1F1F1F] border-zinc-700/50">
            <CardContent className="p-8">
              {/* Future Date Heading */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-light text-zinc-100 mb-4">
                  {getFutureDateString()}
                </h2>
                <p className="text-lg text-zinc-300 leading-relaxed max-w-3xl mx-auto">
                  Paint a vivid picture of your ideal future. Describe your perfect day. What does your health, wealth, career, and relationships look like? Don't hold back.
                </p>
              </div>

              {/* Vision Text Area */}
              <div className="mb-6">
                <Textarea
                  value={visionText}
                  onChange={(e) => setVisionText(e.target.value)}
                  placeholder="Begin painting your vision here... Imagine waking up on this day 10 years from now. What do you see? How do you feel? What has your life become?"
                  className="min-h-[300px] bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 text-base leading-relaxed resize-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
              </div>

              {/* Need Inspiration Link */}
              <div className="mb-8 text-center">
                <button
                  onClick={handleNeedInspiration}
                  className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors underline underline-offset-2"
                >
                  Need inspiration?
                </button>
              </div>

              {/* Crystallize Button */}
              <div className="text-center">
                <Button
                  onClick={handleCrystallizeVision}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium px-8 py-3 text-base"
                  disabled={!visionText.trim()}
                >
                  Crystallize My Vision
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoalWizard;
