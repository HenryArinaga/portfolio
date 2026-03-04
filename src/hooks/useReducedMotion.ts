import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 * 
 * Detects user's motion preferences from system settings.
 * Returns true if user prefers reduced motion.
 * Automatically updates if preference changes.
 * 
 * @returns {boolean} True if user prefers reduced motion, false otherwise
 * 
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * 
 * if (prefersReducedMotion) {
 *   // Skip animations or use minimal animations
 * }
 */
export function useReducedMotion(): boolean {
  // Initialize state with current preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check if matchMedia is supported
    if (!window.matchMedia) {
      return false;
    }
    
    // Get initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  });

  useEffect(() => {
    // Check if window and matchMedia are available
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Handler for preference changes
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    // Set initial value (in case it changed between render and effect)
    setPrefersReducedMotion(mediaQuery.matches);

    // Add event listener for changes
    // Use addEventListener if available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup function
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}
