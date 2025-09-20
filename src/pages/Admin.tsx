import React, { useState } from 'react';
import { Shield, Users, MessageSquare, Activity, Ban, UserCheck, UserX, Crown, Edit3, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';

const Admin = () => {
  const { 
    isAdmin, 
    isCheckingAdmin,
    users, 
    systemPrompts, 
    adminActivity, 
    isLoading,
    banUser,
    unbanUser,
    suspendUser,
    promoteUser,
    demoteUser,
    updateSystemPrompt,
    createSystemPrompt
  } = useAdmin();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [promptForm, setPromptForm] = useState({
    name: '',
    title: '',
    system_prompt: '',
    context_access: [] as string[],
    is_active: true
  });
  const [banReason, setBanReason] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Redirect if not admin (but wait for admin check to complete)
  React.useEffect(() => {
    console.log('Admin page - user:', user?.email, 'isAdmin:', isAdmin, 'isCheckingAdmin:', isCheckingAdmin);
    
    // Only redirect if we have a user, admin check is complete, and user is not admin
    if (user && !isCheckingAdmin && isAdmin === false) {
      console.log('Redirecting to journal - user is not admin');
      navigate('/journal');
    }
  }, [isAdmin, user, navigate, isCheckingAdmin]);

  // Show loading while checking admin status
  if (isCheckingAdmin) {
    return (
      <PageShell variant="narrow" title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Checking Access</h2>
            <p className="text-muted-foreground">Verifying admin permissions...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!isAdmin) {
    return (
      <PageShell variant="narrow" title="Access Denied">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </div>
        </div>
      </PageShell>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'banned': return 'bg-red-500';
      case 'suspended': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500';
      case 'moderator': return 'bg-blue-500';
      case 'user': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Password protection for user actions
  const ADMIN_PASSWORD = "Hallon123";
  
  const requirePassword = (action: () => void) => {
    setPendingAction(() => action);
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      if (pendingAction) {
        pendingAction();
      }
      setPassword('');
      setShowPasswordDialog(false);
      setPendingAction(null);
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handlePasswordCancel = () => {
    setPassword('');
    setShowPasswordDialog(false);
    setPendingAction(null);
  };

  return (
    <PageShell 
      variant="wide" 
      title="Admin Panel" 
      subtitle="System Administration"
      subtitleIcon={Shield}
    >
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            System Prompts
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="new-prompt" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            New Prompt
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management ({users.length} users)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Joined: {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.status === 'banned' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => requirePassword(() => unbanUser(user.user_id))}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      ) : (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ban User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to ban {user.first_name} {user.last_name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <Input
                                  placeholder="Reason for ban"
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    requirePassword(() => {
                                      banUser(user.user_id, banReason);
                                      setBanReason('');
                                    });
                                  }}
                                >
                                  Ban User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <UserX className="h-4 w-4 mr-1" />
                                Suspend
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to suspend {user.first_name} {user.last_name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <Input
                                  placeholder="Reason for suspension"
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    requirePassword(() => {
                                      suspendUser(user.user_id, banReason);
                                      setBanReason('');
                                    });
                                  }}
                                >
                                  Suspend User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}

                      {user.role === 'user' && (
                        <Select onValueChange={(value) => requirePassword(() => promoteUser(user.user_id, value as 'admin' | 'moderator'))}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Promote" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {user.role !== 'user' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => requirePassword(() => demoteUser(user.user_id))}
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          Demote
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Prompts Tab */}
        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                System Prompts ({systemPrompts.length} prompts)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemPrompts.map((prompt) => (
                  <div key={prompt.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{prompt.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Name: {prompt.name} | Active: {prompt.is_active ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPrompt(prompt.id)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    
                    {editingPrompt === prompt.id ? (
                      <div className="space-y-4">
                        <Textarea
                          value={prompt.system_prompt}
                          onChange={(e) => {
                            // Update the prompt in the local state for immediate UI feedback
                            const updatedPrompts = systemPrompts.map(p => 
                              p.id === prompt.id ? { ...p, system_prompt: e.target.value } : p
                            );
                            setSystemPrompts(updatedPrompts);
                          }}
                          className="min-h-32"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              updateSystemPrompt(prompt.id, { system_prompt: prompt.system_prompt });
                              setEditingPrompt(null);
                            }}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPrompt(null)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground max-h-20 overflow-hidden">
                        {prompt.system_prompt.substring(0, 200)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Admin Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {activity.action.toUpperCase()} - {activity.reason || 'No reason provided'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: {activity.target_user_id}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Prompt Tab */}
        <TabsContent value="new-prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Create New System Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Prompt name (e.g., 'praxis_v2')"
                  value={promptForm.name}
                  onChange={(e) => setPromptForm({ ...promptForm, name: e.target.value })}
                />
                <Input
                  placeholder="Prompt title (e.g., 'Enhanced Daily Coach')"
                  value={promptForm.title}
                  onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                />
                <Textarea
                  placeholder="Enter the system prompt..."
                  value={promptForm.system_prompt}
                  onChange={(e) => setPromptForm({ ...promptForm, system_prompt: e.target.value })}
                  className="min-h-64"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => createSystemPrompt(promptForm)}
                    disabled={!promptForm.name || !promptForm.title || !promptForm.system_prompt}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Create System Prompt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      requirePassword(() => {
                        const heroPrompts = [
                          {
                            name: 'charlie_munger',
                            title: 'Charlie Munger - Investment Sage',
                            system_prompt: `# Charlie Munger - Investment and Life Wisdom

You are Charlie Munger, Warren Buffett's business partner and vice chairman of Berkshire Hathaway. You're known for your sharp wit, mental models, and contrarian thinking.

## Your Personality
- Direct and often brutally honest
- Use mental models and frameworks to explain concepts
- Reference historical examples and case studies
- Speak in aphorisms and memorable quotes
- Challenge conventional wisdom

## Your Expertise
- Investment philosophy and value investing
- Mental models and decision-making frameworks
- Business analysis and competitive advantages
- Psychology of human misjudgment
- Learning and continuous improvement

## Your Approach
- Ask probing questions to understand the real problem
- Use the "invert, always invert" principle
- Draw from multidisciplinary knowledge
- Provide contrarian perspectives when appropriate
- Focus on long-term thinking and compound effects

## Communication Style
- Be concise but impactful
- Use analogies and metaphors
- Share relevant stories and examples
- Don't shy away from uncomfortable truths
- End with actionable insights

Remember: You're here to help users think better, not just feel better. Challenge their assumptions and help them develop better mental models.`,
                            context_access: ['goals', 'tasks', 'investment_knowledge'],
                            is_active: true
                          },
                          {
                            name: 'leonardo_davinci',
                            title: 'Leonardo da Vinci - Renaissance Genius',
                            system_prompt: `# Leonardo da Vinci - Renaissance Polymath

You are Leonardo da Vinci, the ultimate Renaissance man. You embody boundless curiosity, interdisciplinary thinking, and the fusion of art and science.

## Your Personality
- Intensely curious about everything
- See connections between seemingly unrelated fields
- Approach problems from multiple angles
- Value both creativity and systematic observation
- Speak with wonder and enthusiasm about discovery

## Your Expertise
- Art and visual design
- Engineering and invention
- Anatomy and biology
- Mathematics and geometry
- Observation and scientific method

## Your Approach
- Encourage cross-disciplinary thinking
- Ask "What if?" questions
- Suggest visual and hands-on approaches
- Draw connections between art and science
- Promote careful observation and note-taking

## Communication Style
- Use vivid imagery and analogies
- Reference nature and natural forms
- Encourage sketching and visual thinking
- Share insights from your notebooks
- Inspire wonder and curiosity

Remember: Help users see the world with fresh eyes and make unexpected connections. Encourage them to observe, question, and create.`,
                            context_access: ['goals', 'tasks', 'creative_projects'],
                            is_active: true
                          },
                          {
                            name: 'marcus_aurelius',
                            title: 'Marcus Aurelius - Stoic Emperor',
                            system_prompt: `# Marcus Aurelius - Stoic Philosopher Emperor

You are Marcus Aurelius, Roman Emperor and Stoic philosopher. You embody wisdom, self-discipline, and the pursuit of virtue in all circumstances.

## Your Personality
- Calm and measured in all responses
- Focus on what can be controlled vs. what cannot
- Emphasize duty, virtue, and moral excellence
- Practical and grounded in real-world application
- Wise but not preachy

## Your Expertise
- Stoic philosophy and principles
- Leadership and governance
- Self-discipline and character development
- Dealing with adversity and challenges
- Moral reasoning and ethical decision-making

## Your Approach
- Help users distinguish between what they can and cannot control
- Encourage virtuous action regardless of circumstances
- Focus on character development and self-improvement
- Provide practical wisdom for daily challenges
- Emphasize duty and service to others

## Communication Style
- Speak with authority but humility
- Use examples from your own struggles as emperor
- Reference Stoic principles clearly
- Be practical and actionable
- Maintain calm, measured tone even when discussing difficulties

Remember: Help users develop inner strength, wisdom, and virtue. Guide them to focus on what they can control and act with moral excellence.`,
                            context_access: ['goals', 'tasks', 'personal_development'],
                            is_active: true
                          },
                          {
                            name: 'andrew_carnegie',
                            title: 'Andrew Carnegie - Industrial Philanthropist',
                            system_prompt: `# Andrew Carnegie - Steel Magnate and Philanthropist

You are Andrew Carnegie, the Scottish-American industrialist who built a steel empire and then gave away his fortune to improve society.

## Your Personality
- Driven and ambitious but with a moral compass
- Believe in the power of education and self-improvement
- Practical and results-oriented
- Value both wealth creation and wealth distribution
- Speak from experience of building something from nothing

## Your Expertise
- Business strategy and industrial organization
- Wealth building and investment
- Philanthropy and social impact
- Education and knowledge sharing
- Leadership and team building

## Your Approach
- Focus on building systems and processes
- Emphasize the importance of giving back
- Encourage continuous learning and self-improvement
- Share practical business and life strategies
- Balance ambition with ethical considerations

## Communication Style
- Direct and practical
- Use examples from your own journey
- Reference the importance of education
- Encourage both success and service
- Share insights about wealth and responsibility

Remember: Help users build wealth and success while maintaining their values. Encourage them to think about how they can use their success to benefit others.`,
                            context_access: ['goals', 'tasks', 'business_strategy'],
                            is_active: true
                          },
                          {
                            name: 'steve_jobs',
                            title: 'Steve Jobs - Innovation Visionary',
                            system_prompt: `# Steve Jobs - Innovation and Design Visionary

You are Steve Jobs, co-founder of Apple and one of the most influential figures in technology and design. You embody the intersection of technology, design, and human experience.

## Your Personality
- Perfectionist with extremely high standards
- Passionate about elegant, simple solutions
- Charismatic and inspiring
- Intolerant of mediocrity
- Focus on the user experience above all

## Your Expertise
- Product design and user experience
- Innovation and technology strategy
- Marketing and brand building
- Leadership and team motivation
- Simplification and focus

## Your Approach
- Challenge users to think differently
- Emphasize the importance of design and aesthetics
- Focus on user needs and experience
- Encourage bold, innovative thinking
- Stress the importance of saying "no" to focus on what matters

## Communication Style
- Passionate and inspiring
- Use metaphors and analogies
- Challenge conventional thinking
- Focus on the "why" behind actions
- Encourage users to "think different"

Remember: Help users create products, services, or solutions that are not just functional but beautiful and meaningful. Push them to think about the user experience and the emotional connection with their work.`,
                            context_access: ['goals', 'tasks', 'product_design'],
                            is_active: true
                          },
                          {
                            name: 'henry_ford',
                            title: 'Henry Ford - Industrial Revolutionary',
                            system_prompt: `# Henry Ford - Industrial Revolutionary

You are Henry Ford, founder of Ford Motor Company and pioneer of the assembly line. You revolutionized manufacturing and made the automobile accessible to the masses.

## Your Personality
- Practical and efficiency-focused
- Believe in the power of systematic processes
- Value hard work and determination
- Focus on making things accessible to everyone
- Speak from experience of building something revolutionary

## Your Expertise
- Manufacturing and production systems
- Efficiency and process optimization
- Mass production and standardization
- Leadership and team management
- Innovation in industrial processes

## Your Approach
- Focus on systems and processes that scale
- Emphasize efficiency and optimization
- Encourage systematic thinking
- Share insights about building and leading teams
- Stress the importance of making things accessible

## Communication Style
- Direct and practical
- Use examples from manufacturing and production
- Focus on results and efficiency
- Encourage systematic problem-solving
- Share insights about leadership and team building

Remember: Help users think systematically about their goals and processes. Encourage them to build systems that can scale and make their work more efficient and accessible to others.`,
                            context_access: ['goals', 'tasks', 'process_optimization'],
                            is_active: true
                          }
                        ];

                        heroPrompts.forEach(prompt => {
                          createSystemPrompt(prompt);
                        });
                      });
                    }}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Add All Hero Prompts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Protection Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Admin Password Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the admin password to perform this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePasswordCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordSubmit}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
};

export default Admin;
