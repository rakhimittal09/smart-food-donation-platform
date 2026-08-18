// Custom hooks for the Smart Food Donation Platform
// Add reusable React hooks here

import { useState, useEffect } from 'react';

/**
 * useDebounce - delays value update by specified delay
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
