/**
 * OnboardingCard
 *
 * Prereqs (if missing in project):
 * - Tailwind configured with CSS variables and shadcn tokens
 * - Ensure :root includes --primary and --ring for emerald brand
 *   Example (add in your global CSS):
 *   :root { --primary: 164 95% 34%; --ring: 164 95% 34%; }
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  showNav?: boolean;
  step: number;
  totalSteps: number;
  nextLabel?: string;
  isNextDisabled?: boolean;
  tall?: boolean;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSkip,
  showNav = true,
  step,
  totalSteps,
  nextLabel = 'Continue',
  isNextDisabled = false,
  tall = false,
}) => {
  return (
    <div className={cn(
      'relative w-full max-w-[720px] rounded-2xl border border-zinc-700/50 shadow-2xl bg-zinc-900',
      tall ? 'h-[500px]' : 'h-[460px]'
    )}>
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Step indicator */}
      <div className="px-8">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Step {step} of {totalSteps}</span>
          <div className="flex gap-1 ml-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn('w-2 h-2 rounded-full', i < step ? 'bg-emerald-500' : 'bg-zinc-600')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content area (no internal scroll at ≥640px) */}
      <div className="px-8 pt-6 pb-8 h-[calc(100%-140px)] sm:h-[calc(100%-140px)]">
        <div className="h-full flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>
          {showNav && (
            <div className="mt-6 flex items-center justify-between">
              <div>
                {!!onSkip && (
                  <Button variant="outline" onClick={onSkip} className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">Skip</Button>
                )}
              </div>
              <div className="flex gap-3">
                {!!onBack && (
                  <Button variant="outline" onClick={onBack} className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">Back</Button>
                )}
                {!!onNext && (
                  <Button onClick={onNext} disabled={isNextDisabled} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
                    {nextLabel}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


