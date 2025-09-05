
import React from 'react';

export const EmptyChat: React.FC = () => {
  return (
    <div className="text-center py-16">
      <p className="text-zinc-300 text-base">Good day! How are you feeling today?</p>
      <p className="text-zinc-500 text-sm mt-2">Start a conversation about your day, goals, or anything on your mind...</p>
    </div>
  );
};
