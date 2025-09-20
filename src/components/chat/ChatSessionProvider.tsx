import React, { useEffect } from 'react';
import { useChatSession } from '@/hooks/useChatSession';
import { useTasks } from '@/hooks/useTasks';

interface ChatSessionProviderProps {
  children: React.ReactNode;
}

export const ChatSessionProvider: React.FC<ChatSessionProviderProps> = ({ children }) => {
  const { createOrGetSession, archiveAndCreateNew } = useChatSession();
  const { onPlanCreated } = useTasks();

  // Handle plan creation events
  useEffect(() => {
    if (onPlanCreated) {
      const handlePlanCreated = async (planId: string, planDate: string, isReplan: boolean) => {
        console.log('📋 Plan created event:', { planId, planDate, isReplan });
        
        if (isReplan) {
          // Archive current session and create new one
          await archiveAndCreateNew(planId, planDate);
        } else {
          // Create new session for new plan
          await createOrGetSession(planId, planDate);
        }
      };

      // Store the handler so it can be called from useTasks
      (window as any).handlePlanCreated = handlePlanCreated;
    }
  }, [onPlanCreated, createOrGetSession, archiveAndCreateNew]);

  return <>{children}</>;
};


