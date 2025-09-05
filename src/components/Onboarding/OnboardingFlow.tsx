import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  MessageSquare, 
  TrendingUp, 
  Bell, 
  Zap, 
  BookOpen,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface UserPreferences {
  daily_task_count: number;
  work_start_time: string;
  work_end_time: string;
  notification_preferences: {
    daily_reminder: boolean;
    completion_celebration: boolean;
    weekly_review: boolean;
  };
  productivity_preferences: {
    auto_archive_completed: boolean;
    show_time_estimates: boolean;
    motivational_quotes: boolean;
  };
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    daily_task_count: 6,
    work_start_time: '09:00',
    work_end_time: '17:00',
    notification_preferences: {
      daily_reminder: true,
      completion_celebration: true,
      weekly_review: true,
    },
    productivity_preferences: {
      auto_archive_completed: true,
      show_time_estimates: true,
      motivational_quotes: true,
    },
  });

  // Determine signup time context
  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  const timeContext = getTimeContext();
  const shouldPlanToday = timeContext === 'morning' || timeContext === 'afternoon';

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Praxis',
      subtitle: 'Your Personal Operating System',
      content: WelcomeStep,
    },
    {
      id: 'ivy-lee',
      title: 'The Ivy Lee Method',
      subtitle: 'The Foundation of Productivity',
      content: IvyLeeEducationStep,
    },
    {
      id: 'preferences',
      title: 'Customize Your Experience',
      subtitle: 'Make Praxis work for you',
      content: PreferencesStep,
    },
    {
      id: 'features',
      title: 'Your Daily Toolkit',
      subtitle: 'Everything you need to succeed',
      content: FeaturesStep,
    },
    {
      id: 'first-day',
      title: shouldPlanToday ? 'Start Your First Day' : 'Ready for Tomorrow',
      subtitle: shouldPlanToday ? 'Let\'s plan your tasks for today' : 'Your journey begins tomorrow morning',
      content: FirstDayStep,
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          daily_task_count: preferences.daily_task_count,
          work_start_time: preferences.work_start_time,
          work_end_time: preferences.work_end_time,
          notification_preferences: preferences.notification_preferences,
          productivity_preferences: preferences.productivity_preferences,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Welcome to Praxis! 🎉",
        description: "Your personalized operating system is ready to transform your life.",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Setup Error",
        description: "We'll use default settings for now. You can customize later.",
        variant: "destructive",
      });
      onComplete();
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Step Components
  function WelcomeStep() {
    return (
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div
            className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center animate-in slide-in-from-bottom-4 duration-500"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          <div className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome to Praxis
            </h2>
            <p className="text-gray-400 text-lg mt-2">
              Your personal operating system for life optimization
            </p>
          </div>
        </div>

        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <Target className="w-8 h-8 text-emerald-500 mb-3" />
              <h3 className="font-semibold mb-2">Goal Alignment</h3>
              <p className="text-sm text-gray-400">Connect daily actions to long-term vision</p>
            </div>
            <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <TrendingUp className="w-8 h-8 text-emerald-500 mb-3" />
              <h3 className="font-semibold mb-2">Proven Methods</h3>
              <p className="text-sm text-gray-400">Built on the time-tested Ivy Lee productivity system</p>
            </div>
            <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <Zap className="w-8 h-8 text-emerald-500 mb-3" />
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-400">Intelligent insights that grow with your patterns</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/20">
            <p className="text-emerald-100 text-center">
              <strong>21-Day Challenge:</strong> Join thousands who've transformed their lives with daily intentional action.
              Studies show it takes 21 days to form a new habit—let's make it count.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function IvyLeeEducationStep() {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 animate-in slide-in-from-bottom-4 duration-500">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">The Ivy Lee Method</h2>
          <p className="text-gray-400 text-lg">
            The 100-year-old productivity system that built industrial empires
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
            <h3 className="text-xl font-semibold mb-4 text-emerald-400">The Simple 6-Step Process</h3>
            <div className="space-y-4">
              {[
                { step: 1, text: "Every evening, write down the 6 most important tasks for tomorrow", icon: "📝" },
                { step: 2, text: "Prioritize them in order of importance", icon: "🔢" },
                { step: 3, text: "Focus on the first task until completion", icon: "🎯" },
                { step: 4, text: "Move to the next task only when the first is done", icon: "➡️" },
                { step: 5, text: "Repeat until all tasks are complete or the day ends", icon: "🔄" },
                { step: 6, text: "Move unfinished tasks to tomorrow's list", icon: "📅" },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 animate-in slide-in-from-left-4 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <span className="text-2xl mr-3">{item.icon}</span>
                    <span className="text-gray-200">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-400 mb-3">Why It Works</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Eliminates decision fatigue</li>
                <li>• Forces prioritization</li>
                <li>• Prevents overwhelm</li>
                <li>• Creates momentum</li>
              </ul>
            </div>
            <div className="p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <h4 className="font-semibold text-blue-400 mb-3">Historical Success</h4>
              <p className="text-sm text-gray-300">
                Ivy Lee charged Bethlehem Steel $25,000 in 1918 (worth $500,000 today) for this simple method. 
                It transformed their productivity and became legendary.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function PreferencesStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Customize Your Experience</h2>
          <p className="text-gray-400">Make Praxis work perfectly for your lifestyle</p>
        </div>

        <div className="space-y-8">
          {/* Task Count Preference */}
          <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-emerald-500" />
              <h3 className="text-xl font-semibold">Daily Task Count</h3>
            </div>
            <p className="text-gray-400 mb-4">
              How many daily tasks work best for you? (Traditional Ivy Lee uses 6)
            </p>
            <div className="space-y-4">
              <Slider
                value={[preferences.daily_task_count]}
                onValueChange={([value]) => updatePreferences({ daily_task_count: value })}
                max={6}
                min={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>3 tasks</span>
                <span className="text-emerald-400 font-semibold">
                  {preferences.daily_task_count} tasks
                </span>
                <span>6 tasks (recommended)</span>
              </div>
            </div>
          </div>

          {/* Work Schedule */}
          <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold">Work Schedule</h3>
            </div>
            <p className="text-gray-400 mb-4">
              When are you typically most productive?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="text-sm text-gray-300">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={preferences.work_start_time}
                  onChange={(e) => updatePreferences({ work_start_time: e.target.value })}
                  className="mt-1 bg-zinc-700 border-zinc-600"
                />
              </div>
              <div>
                <Label htmlFor="end-time" className="text-sm text-gray-300">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={preferences.work_end_time}
                  onChange={(e) => updatePreferences({ work_end_time: e.target.value })}
                  className="mt-1 bg-zinc-700 border-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-semibold">Notifications</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(preferences.notification_preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <p className="text-xs text-gray-400">
                      {key === 'daily_reminder' && 'Get reminded to plan your day'}
                      {key === 'completion_celebration' && 'Celebrate when you complete tasks'}
                      {key === 'weekly_review' && 'Weekly progress and insights'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      updatePreferences({
                        notification_preferences: {
                          ...preferences.notification_preferences,
                          [key]: checked
                        }
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FeaturesStep() {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Your Daily Toolkit</h2>
          <p className="text-gray-400 text-lg">
            Everything you need to transform intention into action
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/20 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-3 mb-4">
              <Sun className="w-8 h-8 text-emerald-500" />
              <h3 className="text-xl font-semibold">Today Dashboard</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Your daily command center. See your tasks, track progress, and stay focused on what matters most.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Visual progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>One-task focus mode</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Time estimation & tracking</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20 animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <h3 className="text-xl font-semibold">Daily Chat with Praxis</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Your AI companion for reflection, planning, and breakthrough insights. Like journaling, but smarter.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Daily reflection & journaling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Pattern recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Personalized insights</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/20 animate-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-purple-500" />
              <h3 className="text-xl font-semibold">Daily Ledger</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Your evening ritual. Reflect on the day, celebrate wins, learn from challenges, and plan tomorrow.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span>Progress review & reflection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span>Tomorrow's task planning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span>Ivy Lee method workflow</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/20 animate-in slide-in-from-bottom-4 duration-500 delay-400">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-orange-500" />
              <h3 className="text-xl font-semibold">Goals & Vision</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Connect your daily actions to your life vision. Set meaningful goals and track long-term progress.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                <span>Life vision mapping</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                <span>Goal alignment tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                <span>Progress analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FirstDayStep() {
    const isEvening = timeContext === 'evening' || timeContext === 'night';
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div
            className={`w-24 h-24 mx-auto bg-gradient-to-br ${
              isEvening ? 'from-purple-500 to-purple-600' : 'from-emerald-500 to-emerald-600'
            } rounded-2xl flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500`}
          >
            {isEvening ? <Moon className="w-12 h-12 text-white" /> : <Sun className="w-12 h-12 text-white" />}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            {shouldPlanToday ? 'Start Your First Day' : 'Ready for Tomorrow'}
          </h2>
          <p className="text-gray-400 text-lg">
            {shouldPlanToday 
              ? 'Perfect timing! Let\'s plan your tasks for today and get started.'
              : 'Since it\'s evening, we\'ll prepare you for a powerful tomorrow morning.'
            }
          </p>
        </div>

        <div className="space-y-6">
          {shouldPlanToday ? (
            <div className="p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <h3 className="text-xl font-semibold text-emerald-400 mb-4">Today's Approach</h3>
              <div className="space-y-3 text-gray-300">
                <p>🌅 <strong>Morning Start:</strong> Since you're signing up during productive hours, let's make today count!</p>
                <p>📋 <strong>Quick Planning:</strong> We'll help you identify 3-4 key tasks for the remainder of today</p>
                <p>🎯 <strong>Momentum Building:</strong> Focus on small wins to build your Praxis habit</p>
                <p>🌙 <strong>Evening Reflection:</strong> Tonight, you'll plan tomorrow using the full Ivy Lee method</p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Tomorrow's Fresh Start</h3>
              <div className="space-y-3 text-gray-300">
                <p>🌙 <strong>Perfect Timing:</strong> Evening is when the Ivy Lee method shines brightest</p>
                <p>📝 <strong>Planning Mode:</strong> Take a few minutes to plan your 6 most important tasks for tomorrow</p>
                <p>🌅 <strong>Morning Power:</strong> Wake up with absolute clarity about your priorities</p>
                <p>🚀 <strong>First Day Success:</strong> You'll start tomorrow with maximum momentum</p>
              </div>
            </div>
          )}

          <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl border border-emerald-500/20">
            <h3 className="text-xl font-semibold mb-4">🏆 Your 21-Day Challenge Starts Now</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold">Days 1-7</div>
                <div className="text-gray-400">Build the habit</div>
              </div>
              <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Days 8-14</div>
                <div className="text-gray-400">Find your rhythm</div>
              </div>
              <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold">Days 15-21</div>
                <div className="text-gray-400">Master the system</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
            <h3 className="text-lg font-semibold mb-3">🔮 What to Expect</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-emerald-400 mb-2">Week 1</h4>
                <ul className="space-y-1">
                  <li>• Learning the Ivy Lee rhythm</li>
                  <li>• Building evening planning habit</li>
                  <li>• Initial resistance (totally normal!)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Week 2-3</h4>
                <ul className="space-y-1">
                  <li>• Increased focus and clarity</li>
                  <li>• Better priority recognition</li>
                  <li>• Momentum becomes automatic</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm" />
      
      {/* Onboarding card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 rounded-2xl border border-zinc-700/50 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Progress bar */}
        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div
            key={currentStep}
            className="animate-in slide-in-from-right-4 fade-in-0 duration-300"
          >
            <currentStepData.content />
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-zinc-700/50 p-6 bg-zinc-900/95 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="flex gap-1 ml-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index <= currentStep ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Start Your Journey
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};