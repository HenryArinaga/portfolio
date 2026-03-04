import { useRef, useState, useEffect } from 'react';

/**
 * Options for useScrollReveal hook
 */
export interface UseScrollRevealOptions {
  /**
   * Percentage of element visibility required to trigger animation (0-1)
   * @default 0.2 (20% visible)
   */
  threshold?: number;
  
  /**
   * Margin around the root element (viewport)
   * @default '0px'
   */
  rootMargin?: string;
  
  /**
   * Whether to trigger animation only once
   * @default true
   */
  once?: boolean;
}

/**
 * Return value from useScrollReveal hook
 */
export interface UseScrollRevealReturn<T extends HTMLElement = HTMLElement> {
  /**
   * Ref to attach to the element to observe
   */
  ref: React.RefObject<T>;
  
  /**
   * Whether the element is currently visible
   */
  isVisible: boolean;
}

/**
 * useScrollReveal Hook
 * 
 * Manages Intersection Observer logic for scroll-triggered animations.
 * Returns a ref to attach to the element and an isVisible state.
 * 
 * @param options - Configuration options for the hook
 * @returns Object containing ref and isVisible state
 * 
 * @example
 * const { ref, isVisible } = useScrollReveal({ threshold: 0.2, once: true });
 * 
 * return (
 *   <div ref={ref} className={isVisible ? 'is-visible' : ''}>
 *     Content to reveal
 *   </div>
 * );
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: UseScrollRevealOptions = {}
): UseScrollRevealReturn<T> {
  const {
    threshold = 0.2,
    rootMargin = '0px',
    once = true,
  } = options;

  const ref = useRef<T>(null);
  
  // Initialize isVisible based on IntersectionObserver support
  const [isVisible, setIsVisible] = useState(() => {
    // If IntersectionObserver is not supported, show content immediately
    if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    const element = ref.current;
    
    // Early return if element doesn't exist
    if (!element) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: immediately show content if IntersectionObserver is not supported
      setIsVisible(true);
      return;
    }

    // Create observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            
            // If 'once' is true, disconnect observer after first trigger
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            // If 'once' is false, allow re-triggering when element leaves viewport
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Start observing
    observer.observe(element);

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
