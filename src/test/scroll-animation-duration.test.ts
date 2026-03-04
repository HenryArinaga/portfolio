import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property 12: Scroll Animation Duration Range
 * Feature: portfolio-design-enhancement
 * 
 * For any element with scroll-triggered reveal animation, the fade-in animation 
 * duration should be between 400ms and 600ms inclusive.
 * 
 * Validates: Requirements 5.1
 */

describe('Property 12: Scroll Animation Duration Range', () => {
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
    if (!durationStr || durationStr === '0s') return 0;
    
    const match = durationStr.match(/^([\d.]+)(m?s)$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    return unit === 'ms' ? value : value * 1000;
  }

  /**
   * Helper function to extract transition duration for opacity from CSS rule
   */
  function extractOpacityTransitionDuration(cssRule: string): number | null {
    // Match transition property declarations
    const transitionMatch = cssRule.match(/transition\s*:\s*([^;]+);/);
    if (!transitionMatch) return null;

    const transitionValue = transitionMatch[1];

    // Check if it's a shorthand with opacity
    if (transitionValue.includes('opacity')) {
      // Extract duration after opacity
      const opacityMatch = transitionValue.match(/opacity\s+(?:var\([^)]+,\s*)?(\d+m?s)/);
      if (opacityMatch) {
        return parseDuration(opacityMatch[1]);
      }
    }

    // If no specific opacity transition, check for general transition duration
    const durationMatch = transitionValue.match(/(?:var\([^)]+,\s*)?(\d+m?s)/);
    if (durationMatch) {
      return parseDuration(durationMatch[1]);
    }

    return null;
  }

  /**
   * Helper function to extract CSS rules for a given class selector
   */
  function extractCSSRule(cssContent: string, className: string): string | null {
    // Match the class selector and its rule block
    const regex = new RegExp(`\\.${className}\\s*\\{([^}]+)\\}`, 'g');
    const match = regex.exec(cssContent);
    
    if (match) {
      return match[1];
    }
    
    return null;
  }

  it('should have scroll-reveal animations with duration between 400ms and 600ms', () => {
    /**
     * Property-based test: For any scroll-reveal class variant,
     * the animation duration should be within the specified range
     */
    fc.assert(
      fc.property(
        fc.constantFrom(
          'scroll-reveal',
          'scroll-reveal-fade',
          'scroll-reveal-slide-up',
          'scroll-reveal-scale',
          'fade-in-section',
          'project-fade',
          'blog-post'
        ),
        (className) => {
          // Extract CSS rule for this class
          const cssRule = extractCSSRule(animationsCSS, className);
          
          if (!cssRule) {
            throw new Error(`CSS rule not found for class: ${className}`);
          }

          // Extract opacity transition duration
          const duration = extractOpacityTransitionDuration(cssRule);

          if (duration === null) {
            throw new Error(`No transition duration found for class: ${className}`);
          }

          // Assert: duration should be between 400ms and 600ms
          expect(duration).toBeGreaterThanOrEqual(400);
          expect(duration).toBeLessThanOrEqual(600);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use consistent duration across all scroll-reveal variants', () => {
    /**
     * Property-based test: All scroll-reveal variants should use the same duration
     */
    const scrollRevealClasses = [
      'scroll-reveal',
      'scroll-reveal-fade',
      'scroll-reveal-slide-up',
      'scroll-reveal-scale',
      'fade-in-section',
      'project-fade',
      'blog-post'
    ];

    const durations: number[] = [];

    scrollRevealClasses.forEach(className => {
      const cssRule = extractCSSRule(animationsCSS, className);
      
      if (cssRule) {
        const duration = extractOpacityTransitionDuration(cssRule);
        if (duration !== null) {
          durations.push(duration);
        }
      }
    });

    // All durations should be the same (600ms based on animations.css)
    const uniqueDurations = [...new Set(durations)];
    expect(uniqueDurations.length).toBe(1);
    expect(uniqueDurations[0]).toBe(600);
  });

  it('should verify all scroll-reveal classes exist in animations.css', () => {
    /**
     * Sanity check: Ensure all expected scroll-reveal classes are defined
     */
    const expectedClasses = [
      'scroll-reveal',
      'scroll-reveal-fade',
      'scroll-reveal-slide-up',
      'scroll-reveal-scale',
      'fade-in-section',
      'project-fade',
      'blog-post'
    ];

    expectedClasses.forEach(className => {
      const cssRule = extractCSSRule(animationsCSS, className);
      expect(cssRule).not.toBeNull();
      expect(cssRule).toBeTruthy();
    });
  });

  it('should verify scroll-reveal durations fall within acceptable range (static check)', () => {
    /**
     * Static verification: Check that all scroll-reveal classes have durations
     * between 400ms and 600ms by parsing the CSS file
     */
    const scrollRevealClasses = [
      'scroll-reveal',
      'scroll-reveal-fade',
      'scroll-reveal-slide-up',
      'scroll-reveal-scale',
      'fade-in-section',
      'project-fade',
      'blog-post'
    ];

    const violations: Array<{ className: string; duration: number }> = [];

    scrollRevealClasses.forEach(className => {
      const cssRule = extractCSSRule(animationsCSS, className);
      
      if (cssRule) {
        const duration = extractOpacityTransitionDuration(cssRule);
        
        if (duration !== null && (duration < 400 || duration > 600)) {
          violations.push({ className, duration });
        }
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - ${v.className}: ${v.duration}ms (expected: 400-600ms)`
      ).join('\n');

      expect.fail(`Scroll animation duration violations:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });
});
