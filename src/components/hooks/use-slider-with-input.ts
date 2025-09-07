import { useCallback } from 'react';

export const minutesToHHMM = (m: number): string => {
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const hhmmToMinutes = (s: string): number => {
  const [h, m] = s.split(':').map(Number);
  const minutes = (h || 0) * 60 + (m || 0);
  return Math.min(1440, Math.max(0, minutes));
};

export function useSliderWithInput(stepMinutes: number = 30) {
  const snap = useCallback((minutes: number) => {
    const snapped = Math.round(minutes / stepMinutes) * stepMinutes;
    return Math.min(1440, Math.max(0, snapped));
  }, [stepMinutes]);

  const parseInput = useCallback((value: string) => {
    const minutes = hhmmToMinutes(value);
    return snap(minutes);
  }, [snap]);

  return { snap, parseInput };
}


