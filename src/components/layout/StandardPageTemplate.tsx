import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';

interface StandardPageTemplateProps {
  // Header props
  title: string;
  subtitle?: string;
  showProgressIndicator?: boolean;
  progressData?: {
    completed: number;
    total: number;
  };
  
  // Main content
  children: React.ReactNode;
}

export const StandardPageTemplate: React.FC<StandardPageTemplateProps> = ({
  title,
  subtitle,
  showProgressIndicator = false,
  progressData,
  children
}) => {
  const progressPercentage = progressData ? (progressData.completed / progressData.total) * 100 : 0;

  return (
    <PageLayout>
      {/* STANDARDIZED HEADER - Fixed positioning for all pages */}
      <div className="mb-10">
        <div className="flex items-start justify-between mb-6">
          {/* Left side - Title and subtitle */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {subtitle && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-sm">{subtitle}</span>
              </div>
            )}
          </div>
          
          {/* Right side - Progress indicator (if enabled) */}
          {showProgressIndicator && progressData && progressData.completed > 0 && (
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="#27272A" 
                    strokeWidth="2" 
                  />
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="url(#progressGradient)" 
                    strokeWidth="2" 
                    strokeDasharray={`${progressPercentage}, 100`} 
                    className="transition-all duration-500 ease-out" 
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {progressData.completed}/{progressData.total}
                </p>
                <p className="text-xs text-gray-400">completed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA - Consistent spacing */}
      <div className="space-y-12">
        {children}
      </div>
    </PageLayout>
  );
};

// Helper component for consistent section headers
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-zinc-700 to-transparent"></div>
    </div>
  );
};