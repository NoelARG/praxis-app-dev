
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TasksSidebarProps {
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
}

export const TasksSidebar: React.FC<TasksSidebarProps> = ({ tasks, onTaskToggle }) => {
  return (
    <div className="w-80 flex flex-col bg-zinc-900">
      {/* Sidebar Header */}
      <div className="px-6 py-6 flex-shrink-0 bg-zinc-900">
        <h2 className="text-base font-medium title-gradient">Today's Priorities</h2>
      </div>
      
      {/* Tasks List */}
      <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start space-x-3 py-2 group">
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={() => onTaskToggle(task.id)}
              className="border-zinc-600 data-[state=checked]:bg-zinc-300 data-[state=checked]:border-zinc-300 mt-0.5"
            />
            <label 
              htmlFor={task.id} 
              className={`text-sm leading-relaxed cursor-pointer flex-1 transition-colors ${
                task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'
              }`}
            >
              {task.text}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
