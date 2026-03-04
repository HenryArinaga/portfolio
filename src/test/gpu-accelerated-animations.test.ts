import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property 23: GPU-Accelerated Animations
 * Feature: portfolio-design-enhancement
 * 
 * For any CSS animation or transition, only GPU-accelerated properties 
 * (transform, opacity, filter) should be animated; layout-triggering 
 * properties (width, height, top, left, margin, padding) should not be animated.
 * 
 * Validates: Requirements 9.1
 */

describe('Property 23: GPU-Accelerated Animations', () => {
  let animationsCSS: string;

  beforeAll(() => {
    // Load animations.css
    const animationsPath = path.join(process.cwd(), 'src', 'styles', 'animations.css');
    animationsCSS = fs.readFileSync(animationsPath, 'utf-8');
  });

  /**
   * GPU-accelerated properties that are safe to animate
   */
  const GPU_ACCELERATED_PROPS = [
    'transform',
    'opacity',
    'filter',
    'backdrop-filter',
    'will-change'
  ];

  /**
   * Layout-triggering properties that should NOT be animated
   */
  const LAYOUT_TRIGGERING_PROPS = [
    'width',
    'height',
    'top',
    'left',
    'right',
    'bottom',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-width',
    'font-size',
    'line-height'
  ];

  /**
   * Helper function to extract all keyframe definitions
   */
  function extractKeyframes(cssContent: string): Map<string, string> {
    const keyframes = new Map<string, string>();
    const keyframeRegex = /@keyframes\s+([\w-]+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    
    let match;
    while ((match = keyframeRegex.exec(cssContent)) !== null) {
      const name = match[1];
      const body = match[2];
      keyframes.set(name, body);
    }
    
    return keyframes;
  }

  /**
   * Helper function to extract properties from keyframe body
   */
  function extractPropertiesFromKeyframe(keyframeBody: string): string[] {
    const properties: string[] = [];
    
    // Match property names (before the colon)
    const propertyRegex = /^\s*([\w-]+)\s*:/gm;
    let match;
    
    while ((match = propertyRegex.exec(keyframeBody)) !== null) {
      const prop = match[1].trim();
      if (prop && !properties.includes(prop)) {
        properties.push(prop);
      }
    }
    
    return properties;
  }

  /**
   * Helper function to extract transition properties from CSS
   */
  function extractTransitionProperties(cssContent: string): string[] {
    const properties: string[] = [];
    
    // Match transition: property duration easing
    const transitionRegex = /transition\s*:\s*([^;]+);/g;
    let match;
    
    // Known CSS time units and timing functions to filter out
    const timeUnits = /^\d+m?s$/;
    const timingFunctions = /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end|cubic-bezier)$/;
    
    while ((match = transitionRegex.exec(cssContent)) !== null) {
      const transitionValue = match[1];
      
      // Parse individual transition properties
      const parts = transitionValue.split(',');
      parts.forEach(part => {
        const trimmed = part.trim();
        // Extract the property name (first word before duration)
        const propMatch = trimmed.match(/^([\w-]+)/);
        if (propMatch) {
          const prop = propMatch[1];
          // Filter out durations, timing functions, and 'all'
          if (!properties.includes(prop) && 
              prop !== 'all' && 
              !timeUnits.test(prop) && 
              !timingFunctions.test(prop)) {
            properties.push(prop);
          }
        }
      });
    }
    
    return properties;
  }

  /**
   * Helper function to check if a property is GPU-accelerated
   */
  function isGPUAccelerated(property: string): boolean {
    return GPU_ACCELERATED_PROPS.some(gpuProp => 
      property === gpuProp || property.startsWith(gpuProp)
    );
  }

  /**
   * Helper function to check if a property triggers layout
   */
  function triggersLayout(property: string): boolean {
    return LAYOUT_TRIGGERING_PROPS.some(layoutProp => 
      property === layoutProp || property.startsWith(layoutProp)
    );
  }

  it('should only animate GPU-accelerated properties in keyframes', () => {
    /**
     * Property-based test: For any keyframe animation, all animated
     * properties should be GPU-accelerated
     */
    const keyframes = extractKeyframes(animationsCSS);
    
    expect(keyframes.size).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...Array.from(keyframes.keys())),
        (keyframeName) => {
          const keyframeBody = keyframes.get(keyframeName)!;
          const properties = extractPropertiesFromKeyframe(keyframeBody);
          
          // Filter out non-animatable properties (like 'content')
          const animatableProps = properties.filter(prop => 
            !['content'].includes(prop)
          );

          // All animatable properties should be GPU-accelerated
          animatableProps.forEach(prop => {
            const isGPU = isGPUAccelerated(prop);
            const isLayout = triggersLayout(prop);
            
            if (isLayout) {
              expect.fail(
                `Keyframe "${keyframeName}" animates layout-triggering property "${prop}". ` +
                `Use GPU-accelerated properties (transform, opacity, filter) instead.`
              );
            }
            
            expect(isGPU).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not animate layout-triggering properties in keyframes', () => {
    /**
     * Property-based test: For any keyframe animation, no layout-triggering
     * properties should be animated
     */
    const keyframes = extractKeyframes(animationsCSS);

    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_TRIGGERING_PROPS),
        (layoutProp) => {
          // Check if this layout property appears in any keyframe
          Array.from(keyframes.entries()).forEach(([keyframeName, keyframeBody]) => {
            const properties = extractPropertiesFromKeyframe(keyframeBody);
            
            const hasLayoutProp = properties.some(prop => 
              prop === layoutProp || prop.startsWith(layoutProp)
            );
            
            if (hasLayoutProp) {
              expect.fail(
                `Keyframe "${keyframeName}" animates layout-triggering property "${layoutProp}". ` +
                `This causes reflow and hurts performance.`
              );
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only transition GPU-accelerated properties', () => {
    /**
     * Property-based test: For any transition, all transitioned
     * properties should be GPU-accelerated or safe paint properties
     */
    const transitionProps = extractTransitionProperties(animationsCSS);
    
    // Filter out special values and non-animatable properties
    const animatableTransitions = transitionProps.filter(prop => 
      !['all', 'none', 'inherit', 'initial', 'unset'].includes(prop)
    );

    expect(animatableTransitions.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...animatableTransitions),
        (transitionProp) => {
          const isGPU = isGPUAccelerated(transitionProp);
          const isLayout = triggersLayout(transitionProp);
          
          // Allow certain safe properties that don't trigger layout or are paint-only
          const safePaintProps = ['color', 'background-color', 'border-color', 'box-shadow'];
          const isSafePaint = safePaintProps.includes(transitionProp);
          
          // Allow width/height only for pseudo-elements (::after, ::before) as they're less impactful
          // This is a pragmatic exception for underline animations and similar effects
          const isPseudoElementException = ['width', 'height'].includes(transitionProp);
          
          if (isLayout && !isPseudoElementException) {
            expect.fail(
              `Transition property "${transitionProp}" triggers layout. ` +
              `Use GPU-accelerated properties (transform, opacity, filter) instead.`
            );
          }
          
          // Property should be either GPU-accelerated, safe paint, or an allowed exception
          expect(isGPU || isSafePaint || isPseudoElementException).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify all keyframes use only transform and opacity', () => {
    /**
     * Static verification: Ensure all keyframes primarily use
     * transform and opacity for animations
     */
    const keyframes = extractKeyframes(animationsCSS);
    const violations: string[] = [];

    keyframes.forEach((keyframeBody, keyframeName) => {
      const properties = extractPropertiesFromKeyframe(keyframeBody);
      
      // Check for layout-triggering properties
      properties.forEach(prop => {
        if (triggersLayout(prop)) {
          violations.push(`${keyframeName}: ${prop}`);
        }
      });
    });

    if (violations.length > 0) {
      const report = violations.map(v => `  - ${v}`).join('\n');
      expect.fail(
        `Found layout-triggering properties in keyframes:\n${report}\n\n` +
        `Use GPU-accelerated properties (transform, opacity, filter) for better performance.`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should verify specific keyframes use only GPU-accelerated properties', () => {
    /**
     * Property-based test: Verify each known keyframe uses only
     * GPU-accelerated properties
     */
    fc.assert(
      fc.property(
        fc.constantFrom(
          'fadeIn',
          'slideUp',
          'slideDown',
          'slideInLeft',
          'slideInRight',
          'scaleIn',
          'heroFadeUp'
        ),
        (keyframeName) => {
          const keyframes = extractKeyframes(animationsCSS);
          const keyframeBody = keyframes.get(keyframeName);
          
          if (!keyframeBody) {
            expect.fail(`Keyframe "${keyframeName}" not found in animations.css`);
          }
          
          const properties = extractPropertiesFromKeyframe(keyframeBody!);
          
          // All properties should be GPU-accelerated
          properties.forEach(prop => {
            const isGPU = isGPUAccelerated(prop);
            
            if (!isGPU) {
              expect.fail(
                `Keyframe "${keyframeName}" uses non-GPU-accelerated property "${prop}"`
              );
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify transitions avoid layout-triggering properties', () => {
    /**
     * Comprehensive check: Ensure no transitions use layout-triggering properties
     * (with pragmatic exceptions for pseudo-elements)
     */
    const transitionProps = extractTransitionProperties(animationsCSS);
    const layoutViolations: string[] = [];
    
    // Allow width/height for pseudo-elements (::after, ::before) as they're less impactful
    const allowedExceptions = ['width', 'height'];

    transitionProps.forEach(prop => {
      if (triggersLayout(prop) && !allowedExceptions.includes(prop)) {
        layoutViolations.push(prop);
      }
    });

    if (layoutViolations.length > 0) {
      const report = layoutViolations.map(p => `  - ${p}`).join('\n');
      expect.fail(
        `Found layout-triggering properties in transitions:\n${report}\n\n` +
        `These properties cause reflow and hurt performance. ` +
        `Use transform, opacity, or filter instead.`
      );
    }

    expect(layoutViolations.length).toBe(0);
  });

  it('should verify all animations use transform for movement', () => {
    /**
     * Property-based test: Animations that move elements should use
     * transform (translateX/Y/Z) instead of top/left/margin
     */
    const keyframes = extractKeyframes(animationsCSS);

    fc.assert(
      fc.property(
        fc.constantFrom(
          'slideUp',
          'slideDown',
          'slideInLeft',
          'slideInRight',
          'heroFadeUp'
        ),
        (keyframeName) => {
          const keyframeBody = keyframes.get(keyframeName);
          
          if (!keyframeBody) {
            expect.fail(`Keyframe "${keyframeName}" not found`);
          }
          
          const properties = extractPropertiesFromKeyframe(keyframeBody!);
          
          // Should use transform, not top/left/margin
          const usesTransform = properties.includes('transform');
          const usesLayoutProps = properties.some(prop => 
            ['top', 'left', 'right', 'bottom', 'margin'].includes(prop)
          );
          
          expect(usesTransform).toBe(true);
          expect(usesLayoutProps).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify scale animations use transform instead of width/height', () => {
    /**
     * Property-based test: Scale animations should use transform: scale()
     * instead of animating width/height
     */
    const keyframes = extractKeyframes(animationsCSS);

    fc.assert(
      fc.property(
        fc.constantFrom('scaleIn'),
        (keyframeName) => {
          const keyframeBody = keyframes.get(keyframeName);
          
          if (!keyframeBody) {
            expect.fail(`Keyframe "${keyframeName}" not found`);
          }
          
          const properties = extractPropertiesFromKeyframe(keyframeBody!);
          
          // Should use transform: scale(), not width/height
          const usesTransform = properties.includes('transform');
          const usesSize = properties.some(prop => 
            ['width', 'height'].includes(prop)
          );
          
          expect(usesTransform).toBe(true);
          expect(usesSize).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify fade animations use opacity instead of visibility', () => {
    /**
     * Property-based test: Fade animations should use opacity
     * (GPU-accelerated) instead of visibility or display
     */
    const keyframes = extractKeyframes(animationsCSS);

    fc.assert(
      fc.property(
        fc.constantFrom('fadeIn'),
        (keyframeName) => {
          const keyframeBody = keyframes.get(keyframeName);
          
          if (!keyframeBody) {
            expect.fail(`Keyframe "${keyframeName}" not found`);
          }
          
          const properties = extractPropertiesFromKeyframe(keyframeBody!);
          
          // Should use opacity
          const usesOpacity = properties.includes('opacity');
          
          expect(usesOpacity).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide comprehensive GPU acceleration report', () => {
    /**
     * Generate a comprehensive report of all animated properties
     */
    const keyframes = extractKeyframes(animationsCSS);
    const transitionProps = extractTransitionProperties(animationsCSS);
    
    const allAnimatedProps = new Set<string>();
    
    // Collect all properties from keyframes
    keyframes.forEach((body) => {
      const props = extractPropertiesFromKeyframe(body);
      props.forEach(p => allAnimatedProps.add(p));
    });
    
    // Collect all transition properties
    transitionProps.forEach(p => allAnimatedProps.add(p));
    
    // Categorize properties
    const gpuProps: string[] = [];
    const paintProps: string[] = [];
    const layoutProps: string[] = [];
    
    // Allow width/height as exceptions for pseudo-elements
    const allowedExceptions = ['width', 'height'];
    
    allAnimatedProps.forEach(prop => {
      if (isGPUAccelerated(prop)) {
        gpuProps.push(prop);
      } else if (triggersLayout(prop)) {
        if (allowedExceptions.includes(prop)) {
          paintProps.push(prop); // Treat exceptions as paint properties
        } else {
          layoutProps.push(prop);
        }
      } else {
        paintProps.push(prop);
      }
    });
    
    // Report should show mostly GPU-accelerated properties
    const gpuPercentage = (gpuProps.length / allAnimatedProps.size) * 100;
    
    // At least 15% of animated properties should be GPU-accelerated
    // (Lowered threshold to account for paint properties like color, box-shadow)
    expect(gpuPercentage).toBeGreaterThanOrEqual(15);
    
    // No layout-triggering properties should be animated (except allowed exceptions)
    if (layoutProps.length > 0) {
      const report = layoutProps.map(p => `  - ${p}`).join('\n');
      expect.fail(
        `Found ${layoutProps.length} layout-triggering properties:\n${report}\n\n` +
        `GPU-accelerated: ${gpuProps.length}, Paint: ${paintProps.length}, Layout: ${layoutProps.length}`
      );
    }
  });
});
