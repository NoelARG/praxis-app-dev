// src/components/debug/AuthDebug.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const [debugVisible, setDebugVisible] = useState(false);

  if (!debugVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setDebugVisible(true)}
          variant="outline"
          size="sm"
          className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
        >
          Debug Auth
        </Button>
      </div>
    );
  }

  // Deprecated: N8N and related edge function tests have been removed

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-red-900/20 border-red-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-400 text-sm">Auth Debug</CardTitle>
            <Button
              onClick={() => setDebugVisible(false)}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-500/20 h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <strong className="text-red-300">Authentication:</strong>
            <div className="text-zinc-300 ml-2">
              • Authenticated: {isAuthenticated ? '✅ YES' : '❌ NO'}
              <br />
              • Loading: {isLoading ? '⏳ YES' : '✅ NO'}
              <br />
              • User Email: {user?.email || '❌ NULL'}
            </div>
          </div>

          <div>
            <strong className="text-red-300">Tasks:</strong>
            <div className="text-zinc-300 ml-2">
              • Loading: {tasksLoading ? '⏳ YES' : '✅ NO'}
              <br />
              • Count: {tasks.length}
              <br />
              • Tasks: {tasks.length > 0 ? tasks.map(t => t.text.substring(0, 20)).join(', ') : '❌ EMPTY'}
            </div>
          </div>

          <div>
            <strong className="text-red-300">Storage:</strong>
            <div className="text-zinc-300 ml-2">
              • Session: {localStorage.getItem('praxis-user-session') ? '✅ EXISTS' : '❌ MISSING'}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {/* N8N test buttons removed */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};