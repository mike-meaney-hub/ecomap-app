import { useCallback, useEffect, useRef } from 'react';

/**
 * Debounces writes for continuous text input (labels, notes). Discrete actions
 * (create/archive/swatch pick) should write immediately instead — see nodes.ts/edges.ts.
 * flush() forces an immediate write; called automatically on blur and on unmount so
 * navigating away mid-debounce can't silently drop the last edit.
 */
export function useAutosave<T>(value: T, save: (value: T) => void | Promise<void>, delayMs = 500) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValueRef = useRef(value);
  const saveRef = useRef(save);
  const isFirstRun = useRef(true);

  saveRef.current = save;
  latestValueRef.current = value;

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      saveRef.current(latestValueRef.current);
    }
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      saveRef.current(latestValueRef.current);
    }, delayMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delayMs]);

  useEffect(() => () => flush(), [flush]);

  return { flush };
}
