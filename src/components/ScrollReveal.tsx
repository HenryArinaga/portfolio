import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Props for ScrollReveal component
 */
export interface ScrollRevealProps {
  /**
   * Content to be revealed on scroll
   */
  children: React.ReactNode;
  
  /**
   * Animation delay in milliseconds
   * @default 0
   */
  delay?: number;
  
  /**
   * Percentage of element visibility required to trigger animation (0-1)
   * @default 0.2 (20% visible)
   */
  threshold?: number;
  
  /**
   * Additional CSS class names to apply
   */
  className?: string;
  
  /**
   * Whether to trigger animation only once
   * @default true
   */
  once?: boolean;
  
  /**
   * Animation variant to use
   * @default 'slide-up'
   */
  variant?: 'fade' | 'slide-up' | 'scale' | 'default';
}

/**
 * ScrollReveal Component
 * 
 * A wrapper component that handles scroll-triggered animations.
 * Uses useScrollReveal and useReducedMotion hooks to provide
 * accessible, performant scroll animations.
 * 
 * @example
 * <ScrollReveal delay={100} threshold={0.2}>
 *   <div>Content to reveal</div>
 * </ScrollReveal>
 * 
 * @example
 * <ScrollReveal variant="fade" once={true}>
 *   <h2>Heading to fade in</h2>
 * </ScrollReveal>
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  threshold = 0.2,
  className = '',
  once = true,
  variant = 'slide-up',
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold, once });
  const prefersReducedMotion = useReducedMotion();

  // Determine animation class based on variant
  const getAnimationClass = () => {
    if (prefersReducedMotion) {
      // No animation classes if user prefers reduced motion
      return '';
    }

    const baseClass = variant === 'default' ? 'scroll-reveal' : `scroll-reveal-${variant}`;
    return baseClass;
  };

  // Build class names
  const animationClass = getAnimationClass();
  const visibilityClass = isVisible || prefersReducedMotion ? 'is-visible' : '';
  const combinedClassName = [animationClass, visibilityClass, className]
    .filter(Boolean)
    .join(' ');

  // Build inline styles for delay
  const style: React.CSSProperties = {};
  if (delay > 0 && !prefersReducedMotion) {
    style.transitionDelay = `${delay}ms`;
  }

  return (
    <div ref={ref} className={combinedClassName} style={style}>
      {children}
    </div>
  );
};

export default ScrollReveal;
