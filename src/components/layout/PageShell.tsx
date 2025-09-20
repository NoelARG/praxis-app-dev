import * as React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "narrow" | "wide";

const MAX_BY_VARIANT: Record<Variant, string> = {
  narrow: "max-w-3xl",
  wide: "max-w-6xl",
};

export type PageShellProps = {
  /** narrow -> Daily Ledger baseline, wide -> Heroes baseline */
  variant?: Variant;
  /** Main title (H1) */
  title: React.ReactNode;
  /** Subtitle text */
  subtitle?: string;
  /** Optional Lucide icon component for subtitle */
  subtitleIcon?: React.ComponentType<{ className?: string }>;
  /** Optional right-aligned header region (completion ring, buttons, etc.) */
  headerRight?: React.ReactNode;
  /** Optional: hide the gradient title style and use solid text instead */
  plainTitle?: boolean;
  /** Progress data for Today page */
  progressData?: {
    completedCount: number;
    totalTasks: number;
    nextTask?: { id: string; text: string; completed: boolean };
    currentTask?: { id: string; text: string; completed: boolean };
    currentTaskIndex: number;
    onTaskToggle: (taskId: string) => void;
    onPreviousTask: () => void;
    onNextTask: () => void;
    onPlanTasks: () => void;
  };
  /** Page content */
  children: React.ReactNode;
  /** Additional classes on the inner container */
  className?: string;
};

export function PageShell({
  variant = "narrow",
  title,
  subtitle,
  subtitleIcon: SubtitleIcon,
  headerRight,
  plainTitle = false,
  progressData,
  children,
  className,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex-1 flex justify-center">
        <div className={cn("w-full px-4 md:px-8 py-8", MAX_BY_VARIANT[variant])}>
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1
                  className={cn(
                    "text-4xl font-bold mb-2",
                    plainTitle
                      ? "text-foreground"
                      : "bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
                  )}
                >
                  {title}
                </h1>

                {subtitle ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    {SubtitleIcon ? <SubtitleIcon className="h-4 w-4" /> : null}
                    <div className="flex items-center gap-12">
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{subtitle}</span>
                        {!progressData && (
                          <div className="flex items-center gap-4 min-h-[28px]">
                            <div className="w-16"></div>
                            <div className="w-20"></div>
                          </div>
                        )}
                        {progressData && (
                          <>
                            {/* Progress Dots */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 6 }).map((_, index) => {
                                const isCompleted = index < progressData.completedCount;
                                const isCurrent = index === progressData.currentTaskIndex;
                                return (
                                  <div
                                    key={index}
                                    className={`rounded-full transition-all duration-300 ${
                                      isCompleted
                                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                                        : 'bg-zinc-600'
                                    } ${
                                      isCurrent ? 'w-2.5 h-2.5' : 'w-2 h-2'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">
                              {progressData.completedCount}/{progressData.totalTasks}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Next Task */}
                      {progressData && (
                        <div className="flex items-center gap-2 min-h-[24px]">
                          <span className="text-sm">Next:</span>
                          <div className="flex items-center gap-2 min-h-[28px]">
                            {progressData.totalTasks === 0 ? (
                              <div 
                                className="flex items-center gap-2 cursor-pointer group bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1 transition-all duration-300 hover:bg-zinc-700/50"
                                onClick={progressData.onPlanTasks}
                              >
                                <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">
                                  Plan next tasks
                                </span>
                              </div>
                            ) : progressData.currentTask ? (
                              <div className="flex items-center gap-2">
                                {/* Previous arrow */}
                                <button
                                  onClick={progressData.onPreviousTask}
                                  className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                >
                                  <ChevronLeft className="w-3 h-3 text-gray-400 hover:text-white" />
                                </button>
                                
                                {/* Current task */}
                                <div 
                                  className={`flex items-center gap-2 cursor-pointer group transition-all duration-300 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1 hover:bg-zinc-700/50 ${
                                    progressData.currentTask.completed 
                                      ? 'bg-emerald-500/20 border-emerald-500' 
                                      : ''
                                  }`}
                                  onClick={() => progressData.onTaskToggle(progressData.currentTask!.id)}
                                >
                                  <div className={`w-4 h-4 rounded border-2 transition-colors flex items-center justify-center ${
                                    progressData.currentTask.completed
                                      ? 'border-emerald-500 bg-emerald-500/20'
                                      : 'border-gray-500 group-hover:border-emerald-500'
                                  }`}>
                                    <Check className={`w-2.5 h-2.5 transition-colors ${
                                      progressData.currentTask.completed
                                        ? 'text-emerald-500'
                                        : 'text-transparent group-hover:text-emerald-500'
                                    }`} />
                                  </div>
                                  <span className={`text-xs transition-colors max-w-xs truncate ${
                                    progressData.currentTask.completed
                                      ? 'text-emerald-300'
                                      : 'text-muted-foreground group-hover:text-white'
                                  }`}>
                                    {progressData.currentTask.text}
                                  </span>
                                </div>
                                
                                {/* Next arrow */}
                                <button
                                  onClick={progressData.onNextTask}
                                  className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                >
                                  <ChevronRight className="w-3 h-3 text-gray-400 hover:text-white" />
                                </button>
                              </div>
                            ) : (
                              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1">
                                <span className="text-xs text-emerald-400">All tasks completed!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {headerRight ? <div className="flex items-center gap-4">{headerRight}</div> : null}
            </div>
          </div>

          {/* Content */}
          <div className={cn(className)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
