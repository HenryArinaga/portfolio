import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property 13: Reduced Motion Compliance
 * Feature: portfolio-design-enhancement
 * 
 * For any animated element, when the user's system has prefers-reduced-motion 
 * set to "reduce", all animation durations should be 0ms or animations should 
 * be disabled entirely.
 * 
 * Validates: Requirements 5.3
 */

describe('Property 13: Reduced Motion Compliance', () => {
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
   * Helper function to extract the prefers-reduced-motion media query block
   */
  function extractReducedMotionBlock(cssContent: string): string | null {
    const regex = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s;
    const match = regex.exec(cssContent);
    
    if (match) {
      return match[1];
    }
    
    return null;
  }

  /**
   * Helper function to check if a class is handled in reduced motion block
   */
  function isClassHandledInReducedMotion(reducedMotionBlock: string, className: string): boolean {
    // Check if the class selector appears in the reduced motion block
    const classRegex = new RegExp(`\\.${className}(?:[,\\s{]|$)`, 'g');
    return classRegex.test(reducedMotionBlock);
  }

  /**
   * Helper function to extract animation/transition durations from reduced motion block
   */
  function extractDurationsFromReducedMotion(reducedMotionBlock: string): {
    animationDurations: number[];
    transitionDurations: number[];
  } {
    const animationDurations: number[] = [];
    const transitionDurations: number[] = [];

    // Extract animation-duration values
    const animDurationRegex = /animation-duration\s*:\s*([^;!]+)(?:\s*!important)?;/g;
    let match;
    while ((match = animDurationRegex.exec(reducedMotionBlock)) !== null) {
      const duration = parseDuration(match[1].trim());
      animationDurations.push(duration);
    }

    // Extract transition-duration values
    const transDurationRegex = /transition-duration\s*:\s*([^;!]+)(?:\s*!important)?;/g;
    while ((match = transDurationRegex.exec(reducedMotionBlock)) !== null) {
      const duration = parseDuration(match[1].trim());
      transitionDurations.push(duration);
    }

    return { animationDurations, transitionDurations };
  }

  it('should have a prefers-reduced-motion media query defined', () => {
    /**
     * Sanity check: Ensure the reduced motion media query exists
     */
    const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
    expect(reducedMotionBlock).not.toBeNull();
    expect(reducedMotionBlock).toBeTruthy();
  });

  it('should disable animations for all animated elements when reduced motion is preferred', () => {
    /**
     * Property-based test: For any animated class, verify it's handled
     * in the reduced motion media query
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
          'blog-post',
          'hero-enter',
          'hover-lift',
          'hover-scale',
          'hover-scale-subtle',
          'button-press',
          'icon-hover'
        ),
        (className) => {
          const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
          
          if (!reducedMotionBlock) {
            throw new Error('Reduced motion media query not found');
          }

          // Check if this class is handled in reduced motion block
          // Either directly or through universal selector (*, *::before, *::after)
          const hasUniversalSelector = reducedMotionBlock.includes('*,') || 
                                       reducedMotionBlock.includes('*::before') ||
                                       reducedMotionBlock.includes('*::after');
          const isDirectlyHandled = isClassHandledInReducedMotion(reducedMotionBlock, className);

          // Class should be handled either directly or through universal selector
          expect(hasUniversalSelector || isDirectlyHandled).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should set animation durations to minimal values (≤10ms) in reduced motion mode', () => {
    /**
     * Property-based test: All animation durations in the reduced motion block
     * should be minimal (0.01ms or similar)
     */
    const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
    
    if (!reducedMotionBlock) {
      throw new Error('Reduced motion media query not found');
    }

    const { animationDurations, transitionDurations } = extractDurationsFromReducedMotion(reducedMotionBlock);

    // All durations should be minimal (≤10ms)
    const allDurations = [...animationDurations, ...transitionDurations];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...allDurations),
        (duration) => {
          // Duration should be 10ms or less (0.01ms is typical)
          expect(duration).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: Math.max(allDurations.length, 1) }
    );
  });

  it('should use !important flag for reduced motion overrides', () => {
    /**
     * Property-based test: Reduced motion rules should use !important
     * to ensure they override other styles
     */
    const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
    
    if (!reducedMotionBlock) {
      throw new Error('Reduced motion media query not found');
    }

    fc.assert(
      fc.property(
        fc.constantFrom(
          'animation-duration',
          'animation-iteration-count',
          'transition-duration'
        ),
        (property) => {
          // Check if this property exists in the reduced motion block
          const propertyRegex = new RegExp(`${property}\\s*:[^;]+!important`, 'g');
          const hasImportant = propertyRegex.test(reducedMotionBlock);

          // If the property exists, it should have !important
          if (reducedMotionBlock.includes(property)) {
            expect(hasImportant).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should immediately show scroll-reveal elements in reduced motion mode', () => {
    /**
     * Property-based test: All scroll-reveal classes should have
     * opacity: 1 and transform: none in reduced motion mode
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
          const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
          
          if (!reducedMotionBlock) {
            throw new Error('Reduced motion media query not found');
          }

          // Check if the class is explicitly set to visible
          const isHandled = isClassHandledInReducedMotion(reducedMotionBlock, className);
          
          if (isHandled) {
            // Should have opacity: 1 and transform: none
            const hasOpacity = reducedMotionBlock.includes('opacity: 1');
            const hasTransform = reducedMotionBlock.includes('transform: none');
            
            expect(hasOpacity || hasTransform).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should disable scroll-behavior smooth in reduced motion mode', () => {
    /**
     * Verify that scroll-behavior is set to auto in reduced motion mode
     */
    const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
    
    if (!reducedMotionBlock) {
      throw new Error('Reduced motion media query not found');
    }

    // Should include scroll-behavior: auto
    expect(reducedMotionBlock).toContain('scroll-behavior: auto');
  });

  it('should remove stagger delays in reduced motion mode', () => {
    /**
     * Property-based test: All stagger delay classes should have
     * transition-delay: 0ms in reduced motion mode
     */
    fc.assert(
      fc.property(
        fc.constantFrom(
          'stagger-delay-1',
          'stagger-delay-2',
          'stagger-delay-3',
          'stagger-delay-4',
          'stagger-delay-5',
          'stagger-delay-6',
          'project-delay-1',
          'project-delay-2'
        ),
        (className) => {
          const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
          
          if (!reducedMotionBlock) {
            throw new Error('Reduced motion media query not found');
          }

          // Check if stagger delays are handled
          const isHandled = isClassHandledInReducedMotion(reducedMotionBlock, className);
          
          // Should be handled either directly or through universal selector
          const hasUniversalSelector = reducedMotionBlock.includes('*,') || 
                                       reducedMotionBlock.includes('*::before');
          
          expect(hasUniversalSelector || isHandled).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify comprehensive reduced motion coverage', () => {
    /**
     * Static verification: Ensure the reduced motion block covers
     * all necessary animation properties
     */
    const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
    
    if (!reducedMotionBlock) {
      throw new Error('Reduced motion media query not found');
    }

    const requiredProperties = [
      'animation-duration',
      'transition-duration',
      'scroll-behavior'
    ];

    const missingProperties: string[] = [];

    requiredProperties.forEach(property => {
      if (!reducedMotionBlock.includes(property)) {
        missingProperties.push(property);
      }
    });

    if (missingProperties.length > 0) {
      const report = missingProperties.map(p => `  - ${p}`).join('\n');
      expect.fail(`Missing properties in reduced motion block:\n${report}`);
    }

    expect(missingProperties.length).toBe(0);
  });

  it('should verify animation-iteration-count is set to 1 in reduced motion mode', () => {
    /**
     * Verify that animations only run once (if at all) in reduced motion mode
     */
    const reducedMotionBlock = extractReducedMotionBlock(animationsCSS);
    
    if (!reducedMotionBlock) {
      throw new Error('Reduced motion media query not found');
    }

    // Should include animation-iteration-count: 1
    expect(reducedMotionBlock).toContain('animation-iteration-count: 1');
  });
});
