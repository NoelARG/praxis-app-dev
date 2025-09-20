import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { useTasks } from '@/hooks/useTasks';
import { RatingRow } from '@/components/checkin/RatingRow';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

const Reflection = () => {
  const navigate = useNavigate();
  const { dailyPlan, updateDailyReflection, updateDailyCheckIn } = useTasks();
  const [reflection, setReflection] = useState('');
  const [wordCount, setWordCount] = useState(0);
  
  // Quiz state
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);

  // Initialize reflection and quiz values from daily plan
  useEffect(() => {
    if (dailyPlan?.evening_reflection) {
      setReflection(dailyPlan.evening_reflection);
    }
    if (dailyPlan?.mood_rating) {
      setMood(dailyPlan.mood_rating);
    }
    if (dailyPlan?.energy_rating) {
      setEnergy(dailyPlan.energy_rating);
    }
    if (dailyPlan?.focus_rating) {
      setFocus(dailyPlan.focus_rating);
    }
  }, [dailyPlan]);

  useEffect(() => {
    const words = reflection
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [reflection]);

  // Auto-save reflection with debounce
  useEffect(() => {
    if (!reflection || reflection === dailyPlan?.evening_reflection) return;

    const timeoutId = setTimeout(() => {
      updateDailyReflection(reflection);
    }, 1000); // Auto-save after 1 second of no typing

    return () => clearTimeout(timeoutId);
  }, [reflection, dailyPlan?.evening_reflection, updateDailyReflection]);

  // Debounced save for check-in data
  const saveCheckIn = useDebouncedCallback((next: {mood?: number; energy?: number; focus?: number}) => {
    const currentMood = next.mood !== undefined ? next.mood : mood;
    const currentEnergy = next.energy !== undefined ? next.energy : energy;
    const currentFocus = next.focus !== undefined ? next.focus : focus;
    
    if (currentMood !== null && currentEnergy !== null && currentFocus !== null) {
      updateDailyCheckIn(currentMood, currentEnergy, currentFocus);
    }
  }, 300);

  // Auto-save quiz with debounce
  useEffect(() => {
    if (mood !== null && energy !== null && focus !== null) {
      const currentMood = dailyPlan?.mood_rating;
      const currentEnergy = dailyPlan?.energy_rating;
      const currentFocus = dailyPlan?.focus_rating;
      
      if (mood !== currentMood || energy !== currentEnergy || focus !== currentFocus) {
        saveCheckIn({});
      }
    }
  }, [mood, energy, focus, dailyPlan, saveCheckIn]);

  const handlePlanTomorrow = () => {
    navigate('/plan-tomorrow');
  };

  // Flag to show/hide the legend (set to false to hide)
  const SHOW_LEGEND = true;

  return (
    <PageShell
      variant="narrow"
      title="Evening Reflection"
      subtitle="Daily check-in and reflection"
      subtitleIcon={BookOpen}
    >
      <div className="space-y-12">
        {/* Daily Check-In Quiz Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">Daily Check-In</h2>
            {/* Optional one-line legend; set SHOW_LEGEND=true to render */}
            {SHOW_LEGEND && (
              <div className="hidden sm:flex w-[240px] justify-between text-[11px] text-muted-foreground">
                <span>Low</span><span>High</span>
              </div>
            )}
          </div>
          <div className="grid gap-y-5">
            <RatingRow 
              label="How was your mood today?" 
              value={mood} 
              onChange={(value) => {
                setMood(value);
                saveCheckIn({ mood: value });
              }}
            />
            <RatingRow 
              label="How was your energy level today?" 
              value={energy} 
              onChange={(value) => {
                setEnergy(value);
                saveCheckIn({ energy: value });
              }}
            />
            <RatingRow 
              label="How focused did you feel today?" 
              value={focus} 
              onChange={(value) => {
                setFocus(value);
                saveCheckIn({ focus: value });
              }}
            />
          </div>
        </section>

        {/* Evening Reflection Section */}
        <div>
          <SectionHeader icon={BookOpen}>Evening Reflection</SectionHeader>

          <div className="bg-[#212124] border-2 border-[#27272A] rounded-2xl p-8 hover:border-[#27272A]/80 transition-all duration-300 shadow-lg">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflect on your day... What went well? What could be improved? What did you learn?"
              className="w-full min-h-40 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base leading-relaxed overflow-hidden"
              style={{
                height: Math.max(160, reflection.split('\n').length * 24 + 40) + 'px'
              }}
            />

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#27272A]">
              <span className="text-xs text-gray-500">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Auto-saved
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handlePlanTomorrow}
            className="group px-8 py-4 bg-gradient-to-r from-white via-gray-100 to-white text-black font-semibold rounded-xl hover:from-gray-100 hover:via-white hover:to-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
              Next: Plan Tomorrow
              <Calendar className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

      </div>
    </PageShell>
  );
};

export default Reflection;
