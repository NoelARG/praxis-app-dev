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

  const testEdgeFunction = async () => {
    try {
      console.log('Testing edge function call...');
      const response = await fetch('https://ubhowoetpnratmhcugik.supabase.co/functions/v1/n8n-task-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaG93b2V0cG5yYXRtaGN1Z2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTU2ODEsImV4cCI6MjA2NTgzMTY4MX0.Dgt_AchRH8yyH2r24FWS6oSmj5NLUR70tp6X8dMJ-1U',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaG93b2V0cG5yYXRtaGN1Z2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTU2ODEsImV4cCI6MjA2NTgzMTY4MX0.Dgt_AchRH8yyH2r24FWS6oSmj5NLUR70tp6X8dMJ-1U',
        },
        body: JSON.stringify({
          action: 'fetch_tasks',
          userEmail: user?.email || 'test@test.com'
        }),
      });
      
      const result = await response.json();
      console.log('Edge function test result:', result);
      alert(`Edge function test: ${response.ok ? 'SUCCESS' : 'FAILED'}\nResponse: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('Edge function test error:', error);
      alert(`Edge function test ERROR: ${error.message}`);
    }
  };

  const testDirectN8N = async () => {
    try {
      console.log('Testing direct N8N call...');
      const response = await fetch('https://brinkenauto.app.n8n.cloud/webhook/task-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fetch_tasks',
          userEmail: user?.email || 'test@test.com'
        }),
      });
      
      const result = await response.json();
      console.log('Direct N8N test result:', result);
      alert(`Direct N8N test: ${response.ok ? 'SUCCESS' : 'FAILED'}\nResponse: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('Direct N8N test error:', error);
      alert(`Direct N8N test ERROR: ${error.message}`);
    }
  };

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
            <Button
              onClick={testEdgeFunction}
              size="sm"
              className="w-full text-xs"
              variant="outline"
            >
              Test Edge Function
            </Button>
            <Button
              onClick={testDirectN8N}
              size="sm"
              className="w-full text-xs"
              variant="outline"
            >
              Test Direct N8N
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};