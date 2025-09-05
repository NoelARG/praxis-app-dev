
import React from 'react';
import { Check } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface ProgressHeaderProps {
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ tasks, onTaskToggle }) => {
  const completedCount = tasks.filter(task => task.completed).length;
  const nextTask = tasks.find(task => !task.completed);

  return (
    <div className="mb-6 p-6 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl opacity-100">
      <div className="flex items-center justify-between">
        {/* Today's Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-sm font-medium">Today's Progress:</span>
          </div>
          
          {/* Progress Dots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < completedCount
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-zinc-600'
                }`}
              />
            ))}
          </div>
          
          <span className="text-sm font-medium text-white">
            {completedCount}/{tasks.length}
          </span>
        </div>

        {/* Next Task */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-400">Next:</span>
          {nextTask ? (
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => onTaskToggle(nextTask.id)}
            >
              <div className="w-5 h-5 rounded border-2 border-gray-500 group-hover:border-emerald-500 transition-colors flex items-center justify-center">
                <Check className="w-3 h-3 text-transparent group-hover:text-emerald-500 transition-colors" />
              </div>
              <span className="text-sm text-white group-hover:text-emerald-300 transition-colors max-w-xs truncate">
                {nextTask.text}
              </span>
            </div>
          ) : (
            <span className="text-sm text-emerald-400">All tasks completed! 🎉</span>
          )}
        </div>
      </div>
    </div>
  );
};
