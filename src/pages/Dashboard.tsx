import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Brain, 
  Compass, 
  CheckCircle2, 
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Zap
} from 'lucide-react';

interface UserProfile {
  primary_pillar?: string;
  challenge_opt_in?: boolean;
  daily_task_count?: number;
  onboarding_completed?: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('primary_pillar, challenge_opt_in, daily_task_count, onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const getPillarConfig = (pillar: string) => {
    switch (pillar) {
      case 'productivity':
        return {
          icon: Zap,
          title: 'Productivity Focus',
          description: 'Getting more done with less stress and better focus',
          color: 'from-blue-500 to-blue-600',
          actions: [
            { title: 'Plan Your Tasks', description: 'Set up your daily task list', action: () => navigate('/journal'), icon: Target },
            { title: 'Time Management', description: 'Optimize your daily schedule', action: () => navigate('/planner'), icon: Clock },
            { title: 'Track Progress', description: 'Monitor your completion rates', action: () => navigate('/dashboard'), icon: TrendingUp }
          ]
        };
      case 'clarity':
        return {
          icon: Brain,
          title: 'Clarity Focus',
          description: 'Understanding what truly matters and making better decisions',
          color: 'from-purple-500 to-purple-600',
          actions: [
            { title: 'Daily Reflection', description: 'Journal with Praxis for insights', action: () => navigate('/praxis'), icon: MessageSquare },
            { title: 'Set Goals', description: 'Define what matters most', action: () => navigate('/goals'), icon: Target },
            { title: 'Evening Review', description: 'Reflect on your day', action: () => navigate('/ledger'), icon: Calendar }
          ]
        };
      case 'direction':
        return {
          icon: Compass,
          title: 'Direction Focus',
          description: 'Finding your purpose and knowing where you\'re heading in life',
          color: 'from-emerald-500 to-emerald-600',
          actions: [
            { title: 'Define Goals', description: 'Create your life vision', action: () => navigate('/goals'), icon: Target },
            { title: 'Seek Wisdom', description: 'Learn from great minds', action: () => navigate('/heroes'), icon: Star },
            { title: 'Plan Long-term', description: 'Map your future path', action: () => navigate('/planner'), icon: Compass }
          ]
        };
      default:
        return {
          icon: Target,
          title: 'Getting Started',
          description: 'Begin your journey with Praxis',
          color: 'from-emerald-500 to-emerald-600',
          actions: [
            { title: 'Start Today', description: 'Begin with your daily tasks', action: () => navigate('/journal'), icon: Target },
            { title: 'Chat with Praxis', description: 'Get personalized guidance', action: () => navigate('/praxis'), icon: MessageSquare },
            { title: 'Set Goals', description: 'Define your direction', action: () => navigate('/goals'), icon: Target }
          ]
        };
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-300">Loading your personalized dashboard...</div>
      </div>
    );
  }

  const pillarConfig = getPillarConfig(userProfile?.primary_pillar || '');
  const PillarIcon = pillarConfig.icon;

  return (
    <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex-shrink-0 bg-zinc-900">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-zinc-400 mt-2">Your personalized command center</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-6 min-h-0 overflow-y-auto space-y-6">
        
        {/* Primary Focus Card */}
        <Card className="bg-zinc-800/50 border-zinc-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${pillarConfig.color}`}>
                <PillarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-zinc-100">{pillarConfig.title}</CardTitle>
                <p className="text-zinc-400 text-sm">{pillarConfig.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {pillarConfig.actions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={index}
                    onClick={action.action}
                    variant="ghost"
                    className="justify-start h-auto p-4 bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-700/30 hover:border-zinc-600/50"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <ActionIcon className="w-5 h-5 text-emerald-400" />
                      <div className="text-left flex-1">
                        <div className="font-medium text-zinc-200">{action.title}</div>
                        <div className="text-sm text-zinc-400">{action.description}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Challenge Status Card */}
        {userProfile?.challenge_opt_in && (
          <Card className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-zinc-100">21-Day Challenge</CardTitle>
                  <p className="text-zinc-400 text-sm">Building your keystone habit</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Progress</span>
                  <span className="text-emerald-400 font-medium">Day 1 of 21</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full" style={{ width: '5%' }} />
                </div>
                <p className="text-sm text-zinc-400">
                  Start strong! Today is about establishing your rhythm with the Ivy Lee method.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/70 transition-colors cursor-pointer" onClick={() => navigate('/journal')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-200">Today</div>
                  <div className="text-sm text-zinc-400">Your daily tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/70 transition-colors cursor-pointer" onClick={() => navigate('/praxis')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-200">Chat</div>
                  <div className="text-sm text-zinc-400">Talk with Praxis</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/70 transition-colors cursor-pointer" onClick={() => navigate('/goals')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-200">Goals</div>
                  <div className="text-sm text-zinc-400">Set your vision</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="bg-zinc-800/30 border-zinc-700/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-zinc-200">
                Ready to transform your daily routine?
              </h3>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Praxis will help you stay focused on what matters most. Start with your daily tasks and let the momentum build.
              </p>
              <Button 
                onClick={() => navigate('/journal')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Start Your Day
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;