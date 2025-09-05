
import React from 'react';

export const DateHeader: React.FC = () => {
  const getCurrentDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="px-8 py-6 flex-shrink-0 bg-zinc-900">
      <h1 className="text-2xl font-medium title-gradient">{getCurrentDateString()}</h1>
    </div>
  );
};
