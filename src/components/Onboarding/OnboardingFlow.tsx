import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DualSlider } from '@/components/ui/dual-slider';
import { Clock, Target, Bell, ChevronRight, ListChecks, NotebookPen, Goal } from 'lucide-react';
import { useOnboarding, type UserPreferences as HookUserPreferences } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { minutesToHHMM, hhmmToMinutes, useSliderWithInput } from '@/components/hooks/use-slider-with-input';
import * as SliderPrimitive from "@radix-ui/react-slider"

interface OnboardingFlowProps {
  onComplete?: () => void;
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
  const { completeOnboarding } = useOnboarding();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    daily_task_count: 6,
    work_start_time: '06:00',
    work_end_time: '22:00',
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
  const [primaryPillar, setPrimaryPillar] = useState<'productivity' | 'clarity' | 'direction' | null>(null);
  const [challengeOptIn, setChallengeOptIn] = useState<boolean | null>(null);

  // Personalization and background scroll lock
  const firstName = (user?.user_metadata?.first_name
    || (user?.user_metadata?.full_name ? String(user.user_metadata.full_name).split(' ')[0] : undefined)
    || (user?.email ? String(user.email).split('@')[0] : undefined)
    || 'there');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const steps = [
    { id: 'welcome', title: 'Welcome to Praxis', subtitle: 'Your personal operating system for a happy and productive life.', content: WelcomeStep },
    { id: 'task-count', title: 'Task Count', subtitle: 'This helps Praxis align with your natural flow.', content: TaskCountStep },
    { id: 'awake-window', title: 'Awake Window', subtitle: 'This helps Praxis align with your natural flow.', content: AwakeWindow },
    { id: 'notifications', title: 'Stay on Track', subtitle: "Praxis will send nudges when you’re most likely to use it — you stay in control.", content: NotificationsStep },
    { id: 'pillar', title: 'What matters most right now?', subtitle: 'Praxis will guide you here first.', content: PillarStep },
    { id: 'challenge', title: 'Want to build your keystone habit?', subtitle: 'The 21-day challenge helps you lock in daily rituals with Praxis.', content: ChallengeStep },
  ] as const;

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
    const success = await completeOnboarding(preferences as HookUserPreferences);
      toast({
      title: success ? 'Welcome to Praxis' : 'Setup Error',
      description: success
        ? 'Preferences saved successfully.'
        : 'We used default settings. You can customize later.',
      ...(success ? {} : { variant: 'destructive' }),
    });
    if (success) {
      navigate('/dashboard');
    }
    onComplete && onComplete();
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
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Welcome to Praxis, {firstName}</h2>
          <p className="text-gray-400 text-lg shimmer-glow">Your personal operating system for a happy and productive life.</p>
        </div>
      </div>
    );
  }

  function TaskCountStep() {
    const [taskCountLocal, setTaskCountLocal] = useState<number>(preferences.daily_task_count);
    useEffect(() => { setTaskCountLocal(preferences.daily_task_count); }, [preferences.daily_task_count]);
    return (
      <div className="w-full space-y-8">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-2">Task Count</h2>
          <p className="text-gray-400">Set a daily pace you can keep.</p>
        </div>
        <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-semibold">How many tasks per day?</h3>
          </div>
          <div className="space-y-4">
            <div className="px-2">
              <SliderPrimitive.Root
                value={[taskCountLocal]}
                onValueChange={(value) => setTaskCountLocal(value[0])}
                onValueCommit={(value) => updatePreferences({ daily_task_count: value[0] })}
                max={6}
                min={3}
                step={1}
                className="relative flex w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-700">
                  <SliderPrimitive.Range className="absolute h-full bg-emerald-500" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-emerald-500 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
              </SliderPrimitive.Root>
            </div>
            <div className="mt-4 flex justify-between px-1">
              {[3,4,5,6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updatePreferences({ daily_task_count: n })}
                  className={`flex flex-col items-center text-xs transition-colors duration-200 ${
                    preferences.daily_task_count === n ? 'text-emerald-400' : 'text-gray-400'
                  }`}
                >
                  <span className={`h-3 w-0.5 ${preferences.daily_task_count === n ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                  <span className="mt-1">{n}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-2">You can always adjust the number of daily tasks you want to accomplish in your settings.</p>
          </div>
        </div>
      </div>
    );
  }

  function AwakeWindow() {
    const { snap, parseInput } = useSliderWithInput(30);
    const [awakeMinutes, setAwakeMinutes] = useState<[number, number]>([
      hhmmToMinutes(preferences.work_start_time),
      hhmmToMinutes(preferences.work_end_time),
    ]);
  
    const updateWindow = (next: [number, number]) => {
      const snapped: [number, number] = [snap(next[0]), snap(next[1])];
      setAwakeMinutes(snapped);
      updatePreferences({
        work_start_time: minutesToHHMM(snapped[0]),
        work_end_time: minutesToHHMM(snapped[1]),
      });
    };
  
    const onStartInput = (val: string) => updateWindow([parseInput(val), awakeMinutes[1]]);
    const onEndInput = (val: string) => updateWindow([awakeMinutes[0], parseInput(val)]);
  
    return (
      <div className="w-full space-y-8">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-2">Awake Window</h2>
          <p className="text-gray-400">This helps Praxis align with your natural flow.</p>
        </div>
        <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-semibold">When are you typically awake?</h3>
          </div>
          <div className="space-y-4">
            <DualSlider
              min={0}
              max={1440}
              step={30}
              value={awakeMinutes}
              onValueChange={(v) => setAwakeMinutes(v as [number, number])}
              onValueCommit={(v) => updateWindow(v as [number, number])}
              ariaLabelLower="awake-window-start"
              ariaLabelUpper="awake-window-end"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="awake-start" className="text-sm text-gray-300">Start</Label>
                <input
                  id="awake-start"
                  type="time"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 time-input"
                  step={1800}
                  value={minutesToHHMM(awakeMinutes[0])}
                  onChange={(e) => onStartInput(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="awake-end" className="text-sm text-gray-300">End</Label>
                <input
                  id="awake-end"
                  type="time"
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 time-input"
                  step={1800}
                  value={minutesToHHMM(awakeMinutes[1])}
                  onChange={(e) => onEndInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

function NotificationsStep() {
  return (
    <div className="w-full space-y-8">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-white mb-2">Stay on Track</h2>
        <p className="text-gray-400">Praxis will send nudges when you're most likely to use it — you stay in control.</p>
      </div>
      <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
        <div className="space-y-4">
          {([
            { key: 'daily_reminder', label: 'Daily Reminders', sub: 'Conservative nudges to keep you on track' },
            { key: 'weekly_review', label: 'Personalized Weekly Review', sub: 'Insights tailored to your patterns' },
          ] as const).map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{item.label}</Label>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <Switch
                className="data-[state=checked]:bg-emerald-500"
                checked={(preferences.notification_preferences as any)[item.key]}
                onCheckedChange={(checked) => 
                  updatePreferences({
                    notification_preferences: {
                      ...preferences.notification_preferences,
                      [item.key]: checked
                    }
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PillarStep() {
  return (
    <div className="w-full space-y-8">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-white mb-2">What matters most right now?</h2>
        <p className="text-gray-400">Praxis will guide you here first.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: 'productivity', label: 'Productivity', sub: 'Getting more done' },
          { key: 'clarity', label: 'Clarity', sub: 'Understanding what matters' },
          { key: 'direction', label: 'Direction', sub: 'Finding your purpose' },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setPrimaryPillar(opt.key as any)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              primaryPillar === opt.key ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800/30 border-zinc-700/50 text-gray-300 hover:border-zinc-600'
            }`}
          >
            <div className="font-medium">{opt.label}</div>
            <div className="text-sm text-gray-400">{opt.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


  function ChallengeStep() {
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 18 || currentHour <= 6;
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-2">Want to build your keystone habit?</h2>
          <p className="text-gray-400">The 21-day challenge helps you lock in daily rituals with Praxis.</p>
        </div>
        
        <div className="p-5 bg-zinc-800/40 rounded-xl border border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.08)]">
          <div className="space-y-4 text-zinc-300">
            <p className="text-center">Research shows it takes 21 days to form a new habit. We'll send you gentle daily check-ins to help you stay consistent with your Ivy Lee planning ritual.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-zinc-900/40 border border-zinc-700/50 p-3">
                <div className="text-emerald-400 font-semibold mb-1">Week 1</div>
                <div className="text-sm">Getting started (expect some resistance)</div>
              </div>
              <div className="rounded-lg bg-zinc-900/40 border border-zinc-700/50 p-3">
                <div className="text-emerald-400 font-semibold mb-1">Week 2</div>
                <div className="text-sm">Finding your rhythm (it gets easier)</div>
              </div>
              <div className="rounded-lg bg-zinc-900/40 border border-zinc-700/50 p-3">
                <div className="text-emerald-400 font-semibold mb-1">Week 3</div>
                <div className="text-sm">Making it stick (real momentum builds)</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom button layout for this final step */}
        <div className="flex flex-col gap-0 pt-4">
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => setChallengeOptIn(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2"
            >
              Count me in
            </Button>
            <Button 
              onClick={() => setChallengeOptIn(false)}
              className="bg-zinc-600 hover:bg-zinc-700 text-zinc-200 hover:text-zinc-200 border-0 px-8 py-2"
            >
              Maybe later
            </Button>
          </div>
          
          {/* Back button positioned closer to the main buttons */}
          <div className="flex justify-center mt-1">
            <Button 
              onClick={handleBack}
              className="bg-transparent hover:bg-transparent text-zinc-500 hover:text-zinc-300 border-0 shadow-none hover:shadow-none"
              style={{ color: 'rgb(113 113 122)' }} // zinc-500
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(212 212 216)'} // zinc-300
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(113 113 122)'} // zinc-500
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-[720px] mx-auto">
        {/* Render per-step card */}
        {currentStep === 0 && (
          <div className="relative">
            <div className="rounded-2xl border border-zinc-700/50 shadow-2xl bg-zinc-900">
              <div className="px-8 pt-6">
                <div className="h-1 bg-zinc-800 rounded">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
              <div className="px-8 pt-12 pb-8 h-[460px]">
                <div className="h-full flex flex-col justify-center">
                  <div className="flex-1 flex items-center">
                    <WelcomeStep />
                  </div>
                  <div className="mt-6 flex items-center justify-end">
                    <Button onClick={handleNext} className="bg-emerald-500 hover:bg-emerald-600 text-white">Let's Begin</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentStep === 1 && (
          <div className="relative">
            <div className="rounded-2xl border border-zinc-700/50 shadow-2xl bg-zinc-900">
              <div className="px-8 pt-6">
                <div className="h-1 bg-zinc-800 rounded">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
              <div className="px-8 pt-12 pb-8 h-[460px]">
                <div className="h-full flex flex-col">
                  <div className="flex-1"><TaskCountStep /></div>
                  <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={handleBack} className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800">Back</Button>
                    <Button onClick={handleNext} className="bg-emerald-500 hover:bg-emerald-600 text-white">Continue</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="relative">
            <div className="rounded-2xl border border-zinc-700/50 shadow-2xl bg-zinc-900">
              <div className="px-8 pt-6">
                <div className="h-1 bg-zinc-800 rounded">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
              <div className="px-8 pt-12 pb-8 h-[460px]">
                <div className="h-full flex flex-col">
                  <div className="flex-1"><AwakeWindow /></div>
                  <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={handleBack} className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800">Back</Button>
                    <Button onClick={handleNext} className="bg-emerald-500 hover:bg-emerald-600 text-white">Continue</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div className="relative">
            <div className="rounded-2xl border border-zinc-700/50 shadow-2xl bg-zinc-900">
              <div className="px-8 pt-6">
                <div className="h-1 bg-zinc-800 rounded">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
              <div className="px-8 pt-12 pb-8 h-[460px]">
                <div className="h-full flex flex-col">
                  <div className="flex-1"><NotificationsStep /></div>
                  <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={handleBack} className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800">Back</Button>
                    <Button onClick={handleNext} className="bg-emerald-500 hover:bg-emerald-600 text-white">Continue</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentStep === 4 && (
          <div className="relative">
            <div className="rounded-2xl border border-zinc-700/50 shadow-2xl bg-zinc-900">
              <div className="px-8 pt-6">
                <div className="h-1 bg-zinc-800 rounded">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
              <div className="px-8 pt-12 pb-8 h-[460px]">
                <div className="h-full flex flex-col">
                  <div className="flex-1"><PillarStep /></div>
                  <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={handleBack} className="bg-transparent border-zinc-600 text-zinc-300 hover:bg-zinc-800">Back</Button>
                    <Button onClick={handleNext} disabled={!primaryPillar} className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50">Continue</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentStep === 5 && (
          <div className="relative">
            <div className="rounded-2xl border border-zinc-700/50 shadow-2xl bg-zinc-900">
              <div className="px-8 pt-6">
                <div className="h-1 bg-zinc-800 rounded">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
              <div className="px-8 pt-12 pb-8 h-[460px]">
                <div className="h-full flex flex-col">
                  <div className="flex-1"><ChallengeStep /></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};