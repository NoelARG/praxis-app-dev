import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'banned' | 'suspended' | 'pending';
  ban_reason?: string;
  banned_at?: string;
  created_at: string;
  updated_at: string;
}

interface SystemPrompt {
  id: string;
  name: string;
  title: string;
  system_prompt: string;
  context_access: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminActivity {
  id: string;
  admin_user_id: string;
  target_user_id: string;
  action: string;
  reason?: string;
  details?: any;
  created_at: string;
}

export const useAdmin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [adminActivity, setAdminActivity] = useState<AdminActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log('No user, setting isAdmin to false');
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      console.log('Checking admin status for user:', user.id);
      setIsCheckingAdmin(true);

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setIsCheckingAdmin(false);
          return;
        }

        console.log('Admin check result:', profile?.role, 'isAdmin:', profile?.role === 'admin');
        setIsAdmin(profile?.role === 'admin');
        setIsCheckingAdmin(false);
      } catch (error) {
        console.error('Error in checkAdminStatus:', error);
        setIsAdmin(false);
        setIsCheckingAdmin(false);
      }
    };

    // Add a small delay to ensure user data is loaded
    const timer = setTimeout(checkAdminStatus, 100);
    return () => clearTimeout(timer);
  }, [user]);

  // Load all data for admin interface
  const loadAdminData = async () => {
    if (!isAdmin) {
      console.log('Not admin, skipping data load');
      return;
    }

    console.log('Loading admin data...');
    try {
      setIsLoading(true);

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error loading users:', usersError);
        throw new Error(`Failed to load users: ${usersError.message}`);
      }

      // Load system prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('system_prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (promptsError) {
        console.error('Error loading system prompts:', promptsError);
        throw new Error(`Failed to load system prompts: ${promptsError.message}`);
      }

      // Load admin activity (this table might not exist yet)
      let activityData = [];
      try {
        const { data, error: activityError } = await supabase
          .from('admin_activity')
          .select(`
            *,
            admin_user:admin_user_id (
              first_name,
              last_name,
              email
            ),
            target_user:target_user_id (
              first_name,
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (activityError && activityError.code !== '42P01') { // 42P01 = table doesn't exist
          console.error('Error loading admin activity:', activityError);
          throw new Error(`Failed to load admin activity: ${activityError.message}`);
        }
        
        activityData = data || [];
      } catch (activityError) {
        console.log('Admin activity table not found, skipping...');
        activityData = [];
      }

      setUsers(usersData || []);
      setSystemPrompts(promptsData || []);
      setAdminActivity(activityData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // User management actions
  const banUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          status: 'banned',
          ban_reason: reason,
          banned_at: new Date().toISOString(),
          banned_by: user?.id
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log admin activity
      await logAdminActivity(userId, 'ban', reason);

      toast({
        title: "User Banned",
        description: "User has been successfully banned",
      });

      loadAdminData();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          status: 'active',
          ban_reason: null,
          banned_at: null,
          banned_by: null
        })
        .eq('user_id', userId);

      if (error) throw error;

      await logAdminActivity(userId, 'unban', 'User unbanned');

      toast({
        title: "User Unbanned",
        description: "User has been successfully unbanned",
      });

      loadAdminData();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          status: 'suspended',
          ban_reason: reason,
          banned_at: new Date().toISOString(),
          banned_by: user?.id
        })
        .eq('user_id', userId);

      if (error) throw error;

      await logAdminActivity(userId, 'suspend', reason);

      toast({
        title: "User Suspended",
        description: "User has been successfully suspended",
      });

      loadAdminData();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    }
  };

  const promoteUser = async (userId: string, newRole: 'admin' | 'moderator') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      await logAdminActivity(userId, 'promote', `Promoted to ${newRole}`);

      toast({
        title: "User Promoted",
        description: `User has been promoted to ${newRole}`,
      });

      loadAdminData();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      });
    }
  };

  const demoteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'user' })
        .eq('user_id', userId);

      if (error) throw error;

      await logAdminActivity(userId, 'demote', 'Demoted to user');

      toast({
        title: "User Demoted",
        description: "User has been demoted to regular user",
      });

      loadAdminData();
    } catch (error) {
      console.error('Error demoting user:', error);
      toast({
        title: "Error",
        description: "Failed to demote user",
        variant: "destructive",
      });
    }
  };

  // System prompt management
  const updateSystemPrompt = async (promptId: string, updates: Partial<SystemPrompt>) => {
    try {
      const { error } = await supabase
        .from('system_prompts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId);

      if (error) throw error;

      toast({
        title: "System Prompt Updated",
        description: "System prompt has been successfully updated",
      });

      loadAdminData();
    } catch (error) {
      console.error('Error updating system prompt:', error);
      toast({
        title: "Error",
        description: "Failed to update system prompt",
        variant: "destructive",
      });
    }
  };

  const createSystemPrompt = async (prompt: Omit<SystemPrompt, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('system_prompts')
        .insert(prompt);

      if (error) throw error;

      toast({
        title: "System Prompt Created",
        description: "New system prompt has been created",
      });

      loadAdminData();
    } catch (error) {
      console.error('Error creating system prompt:', error);
      toast({
        title: "Error",
        description: "Failed to create system prompt",
        variant: "destructive",
      });
    }
  };

  // Helper function to log admin activity
  const logAdminActivity = async (targetUserId: string, action: string, reason?: string, details?: any) => {
    try {
      await supabase
        .from('admin_activity')
        .insert({
          admin_user_id: user?.id,
          target_user_id: targetUserId,
          action,
          reason,
          details
        });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  };

  // Load data when admin status is confirmed
  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  return {
    isAdmin,
    isCheckingAdmin,
    users,
    systemPrompts,
    adminActivity,
    isLoading,
    loadAdminData,
    banUser,
    unbanUser,
    suspendUser,
    promoteUser,
    demoteUser,
    updateSystemPrompt,
    createSystemPrompt
  };
};
