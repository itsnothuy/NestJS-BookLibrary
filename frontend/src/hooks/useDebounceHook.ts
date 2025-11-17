import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Start a timer whenever `value` changes
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If value changes again before `delay` ms:
    // clear the previous timer and schedule a new one
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
