import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property 6: Staggered Animation Timing
 * Property 7: Hero Section Minimum Height
 * Feature: portfolio-design-enhancement
 * 
 * Property 6: For any group of elements with staggered animations (hero content),
 * each subsequent element should have an animation delay that is 100-150ms greater
 * than the previous element.
 * 
 * Property 7: For any viewport size, the Hero section should occupy at least 80vh
 * on desktop viewports (≥1024px) and at least 100vh on mobile viewports (<768px).
 * 
 * Validates: Requirements 3.3, 3.5
 */

describe('Property 6: Staggered Animation Timing', () => {
  let animationsCSS: string;

  beforeAll(() => {
    // Load animations.css
    const animationsPath = path.join(process.cwd(), 'src', 'styles', 'animations.css');
    animationsCSS = fs.readFileSync(animationsPath, 'utf-8');
  });

  /**
   * Helper function to parse CSS duration values to milliseconds
   */
  function parseDuration(durationStr: string): number {
    if (!durationStr || durationStr === '0s' || durationStr === '0ms') return 0;
    
    const match = durationStr.match(/^([\d.]+)(m?s)$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    return unit === 'ms' ? value : value * 1000;
  }

  /**
   * Helper function to extract animation-delay for a given class
   */
  function extractAnimationDelay(cssContent: string, className: string): number | null {
    // Match the class selector and its rule block (handle multi-line)
    // Look for standalone class definition, not grouped with commas
    const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\})\\s*\\.${escapedClassName}\\s*\\{([^}]+)\\}`, 'gms');
    
    // Find all matches and look for one with animation-delay
    const matches = [...cssContent.matchAll(regex)];
    
    for (const match of matches) {
      const ruleBlock = match[1];
      
      // Extract animation-delay property
      const delayMatch = ruleBlock.match(/animation-delay\s*:\s*([^;]+);/);
      if (delayMatch) {
        return parseDuration(delayMatch[1].trim());
      }
    }
    
    return null;
  }

  it('should have staggered delays between 100-150ms for consecutive hero elements', () => {
    /**
     * Property-based test: For any pair of consecutive staggered elements,
     * the delay difference should be between 100ms and 150ms
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // Test pairs 1-2, 2-3, 3-4, 4-5, 5-6
        (index) => {
          const currentClass = `hero-stagger-${index}`;
          const nextClass = `hero-stagger-${index + 1}`;
          
          const currentDelay = extractAnimationDelay(animationsCSS, currentClass);
          const nextDelay = extractAnimationDelay(animationsCSS, nextClass);
          
          if (currentDelay === null) {
            throw new Error(`Animation delay not found for class: ${currentClass}`);
          }
          
          if (nextDelay === null) {
            throw new Error(`Animation delay not found for class: ${nextClass}`);
          }
          
          const difference = nextDelay - currentDelay;
          
          // Assert: difference should be between 100ms and 150ms
          expect(difference).toBeGreaterThanOrEqual(100);
          expect(difference).toBeLessThanOrEqual(150);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify all hero stagger classes have increasing delays', () => {
    /**
     * Property-based test: For any stagger class, its delay should be greater
     * than all previous stagger classes
     */
    const staggerClasses = [
      'hero-stagger-1',
      'hero-stagger-2',
      'hero-stagger-3',
      'hero-stagger-4',
      'hero-stagger-5',
      'hero-stagger-6'
    ];

    const delays: number[] = [];

    staggerClasses.forEach(className => {
      const delay = extractAnimationDelay(animationsCSS, className);
      
      if (delay === null) {
        throw new Error(`Animation delay not found for class: ${className}`);
      }
      
      delays.push(delay);
    });

    // Verify delays are strictly increasing
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
  });

  it('should verify stagger delay differences are consistent', () => {
    /**
     * Static verification: Check that all consecutive stagger classes have
     * delays between 100ms and 150ms apart
     */
    const staggerClasses = [
      'hero-stagger-1',
      'hero-stagger-2',
      'hero-stagger-3',
      'hero-stagger-4',
      'hero-stagger-5',
      'hero-stagger-6'
    ];

    const delays: number[] = [];
    const violations: Array<{ pair: string; difference: number }> = [];

    staggerClasses.forEach(className => {
      const delay = extractAnimationDelay(animationsCSS, className);
      
      if (delay !== null) {
        delays.push(delay);
      }
    });

    // Check differences between consecutive delays
    for (let i = 1; i < delays.length; i++) {
      const difference = delays[i] - delays[i - 1];
      
      if (difference < 100 || difference > 150) {
        violations.push({
          pair: `${staggerClasses[i - 1]} → ${staggerClasses[i]}`,
          difference
        });
      }
    }

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - ${v.pair}: ${v.difference}ms (expected: 100-150ms)`
      ).join('\n');

      expect.fail(`Staggered animation timing violations:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });

  it('should verify all hero stagger classes exist in animations.css', () => {
    /**
     * Sanity check: Ensure all expected hero stagger classes are defined
     */
    const expectedClasses = [
      'hero-stagger-1',
      'hero-stagger-2',
      'hero-stagger-3',
      'hero-stagger-4',
      'hero-stagger-5',
      'hero-stagger-6'
    ];

    expectedClasses.forEach(className => {
      const delay = extractAnimationDelay(animationsCSS, className);
      expect(delay).not.toBeNull();
      expect(delay).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Property 7: Hero Section Minimum Height', () => {
  let layoutCSS: string;

  beforeAll(() => {
    // Load layout.css
    const layoutPath = path.join(process.cwd(), 'src', 'styles', 'layout.css');
    layoutCSS = fs.readFileSync(layoutPath, 'utf-8');
  });

  /**
   * Helper function to extract min-height value from CSS rule
   */
  function extractMinHeight(cssContent: string, selector: string, mediaQuery?: string): string | null {
    let content = cssContent;
    
    // If media query is specified, extract that section first
    if (mediaQuery) {
      const mediaRegex = new RegExp(`@media\\s*${mediaQuery}\\s*\\{([\\s\\S]+?)\\n\\}`, 'g');
      const mediaMatch = mediaRegex.exec(cssContent);
      
      if (!mediaMatch) return null;
      content = mediaMatch[1];
    }
    
    // Match the selector and its rule block
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'gs');
    const match = regex.exec(content);
    
    if (!match) return null;
    
    const ruleBlock = match[1];
    
    // Extract min-height property
    const minHeightMatch = ruleBlock.match(/min-height\s*:\s*([^;]+);/);
    if (!minHeightMatch) return null;
    
    return minHeightMatch[1].trim();
  }

  /**
   * Helper function to parse viewport height values
   */
  function parseViewportHeight(value: string): number | null {
    const match = value.match(/^(\d+)vh$/);
    if (!match) return null;
    return parseInt(match[1], 10);
  }

  it('should have minimum height of 80vh on desktop viewports', () => {
    /**
     * Property-based test: For desktop viewports (≥1024px),
     * hero section should have min-height of at least 80vh
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1024, max: 2560 }), // Desktop viewport widths
        (_viewportWidth) => {
          // Extract min-height for .hero in default (desktop) context
          const minHeight = extractMinHeight(layoutCSS, '.hero');
          
          if (!minHeight) {
            throw new Error('min-height not found for .hero selector');
          }
          
          const heightValue = parseViewportHeight(minHeight);
          
          if (heightValue === null) {
            throw new Error(`Invalid min-height value: ${minHeight}`);
          }
          
          // Assert: min-height should be at least 80vh
          expect(heightValue).toBeGreaterThanOrEqual(80);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have minimum height of 100vh on mobile viewports', () => {
    /**
     * Property-based test: For mobile viewports (<768px),
     * hero section should have min-height of at least 100vh
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // Mobile viewport widths
        (_viewportWidth) => {
          // Extract min-height for .hero in mobile media query
          const minHeight = extractMinHeight(
            layoutCSS,
            '.hero',
            '\\(max-width:\\s*768px\\)'
          );
          
          if (!minHeight) {
            throw new Error('min-height not found for .hero in mobile media query');
          }
          
          const heightValue = parseViewportHeight(minHeight);
          
          if (heightValue === null) {
            throw new Error(`Invalid min-height value: ${minHeight}`);
          }
          
          // Assert: min-height should be at least 100vh
          expect(heightValue).toBeGreaterThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify hero section has min-height defined for both desktop and mobile', () => {
    /**
     * Static verification: Ensure .hero has min-height in both contexts
     */
    const desktopMinHeight = extractMinHeight(layoutCSS, '.hero');
    const mobileMinHeight = extractMinHeight(
      layoutCSS,
      '.hero',
      '\\(max-width:\\s*768px\\)'
    );

    expect(desktopMinHeight).not.toBeNull();
    expect(mobileMinHeight).not.toBeNull();
    
    const desktopValue = parseViewportHeight(desktopMinHeight!);
    const mobileValue = parseViewportHeight(mobileMinHeight!);
    
    expect(desktopValue).toBeGreaterThanOrEqual(80);
    expect(mobileValue).toBeGreaterThanOrEqual(100);
  });

  it('should verify mobile min-height is greater than or equal to desktop', () => {
    /**
     * Property-based test: Mobile hero should be at least as tall as desktop
     */
    const desktopMinHeight = extractMinHeight(layoutCSS, '.hero');
    const mobileMinHeight = extractMinHeight(
      layoutCSS,
      '.hero',
      '\\(max-width:\\s*768px\\)'
    );

    if (!desktopMinHeight || !mobileMinHeight) {
      throw new Error('min-height not found for .hero in one or both contexts');
    }

    const desktopValue = parseViewportHeight(desktopMinHeight);
    const mobileValue = parseViewportHeight(mobileMinHeight);

    if (desktopValue === null || mobileValue === null) {
      throw new Error('Invalid min-height values');
    }

    // Mobile should be >= desktop (100vh >= 80vh)
    expect(mobileValue).toBeGreaterThanOrEqual(desktopValue);
  });
});
