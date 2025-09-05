
import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};
