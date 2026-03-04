/**
 * Property-Based Tests: Project Card Properties
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 * 
 * Property 8: Project Card Dimension Consistency
 * Property 9: Hover Transformation Timing
 * Property 10: Project Metadata Completeness
 * Property 11: Focus and Hover Style Parity
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 8: Project Card Dimension Consistency', () => {
  /**
   * For any set of project cards displayed in the Projects section, 
   * all cards should have identical width and height values 
   * (or aspect ratios if using responsive sizing).
   */

  let projectCardCSS: string;

  beforeAll(() => {
    const cssPath = path.join(process.cwd(), 'src', 'styles', 'components', 'ProjectCard.css');
    projectCardCSS = fs.readFileSync(cssPath, 'utf-8');
  });

  /**
   * Helper function to extract CSS property value from a selector
   */
  function extractProperty(cssContent: string, selector: string, property: string): string | null {
    const selectorRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]+)\\}`, 'g');
    let match;
    
    while ((match = selectorRegex.exec(cssContent)) !== null) {
      const block = match[1];
      const propRegex = new RegExp(`${property}\\s*:\\s*([^;]+);`, 'i');
      const propMatch = propRegex.exec(block);
      
      if (propMatch) {
        return propMatch[1].trim();
      }
    }
    
    return null;
  }

  it('should define consistent structural properties for all project cards', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 8:
     * All project cards should have identical structural CSS
     */
    
    // Check that .project-card has consistent display and flex properties
    const display = extractProperty(projectCardCSS, '.project-card', 'display');
    const flexDirection = extractProperty(projectCardCSS, '.project-card', 'flex-direction');
    const height = extractProperty(projectCardCSS, '.project-card', 'height');

    expect(display).toBe('flex');
    expect(flexDirection).toBe('column');
    expect(height).toBe('100%');
  });

  it('should maintain consistent image container dimensions', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 8:
     * Image containers should have consistent fixed height
     */
    const width = extractProperty(projectCardCSS, '.project-card__image-container', 'width');
    const height = extractProperty(projectCardCSS, '.project-card__image-container', 'height');

    expect(width).toBe('100%');
    expect(height).toBeTruthy();
    
    // Height should be a fixed value (not percentage or auto)
    if (height) {
      expect(height).toMatch(/^\d+px$/);
    }
  });

  it('should verify image container heights are consistent across breakpoints', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 8:
     * Image containers should have defined heights at all breakpoints
     */
    
    // Extract all media query blocks
    const mediaQueryRegex = /@media\s*\([^)]+\)\s*\{([^}]*\.project-card__image-container[^}]*height[^}]*)\}/g;
    const matches = [...projectCardCSS.matchAll(mediaQueryRegex)];

    // Should have responsive height definitions
    expect(matches.length).toBeGreaterThan(0);

    // All heights should be fixed pixel values
    matches.forEach(match => {
      const block = match[1];
      const heightMatch = block.match(/height\s*:\s*([^;]+);/);
      
      if (heightMatch) {
        const height = heightMatch[1].trim();
        expect(height).toMatch(/^\d+px$/);
      }
    });
  });
});

describe('Property 9: Hover Transformation Timing', () => {
  /**
   * For any project card, when hover state is applied, 
   * the visual transformation (scale, translate, shadow) 
   * should complete within 200ms.
   */

  let projectCardCSS: string;

  beforeAll(() => {
    const cssPath = path.join(process.cwd(), 'src', 'styles', 'components', 'ProjectCard.css');
    projectCardCSS = fs.readFileSync(cssPath, 'utf-8');
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
   * Helper function to extract transition durations from CSS
   */
  function extractTransitionDurations(cssContent: string, selector: string): number[] {
    const durations: number[] = [];
    
    // Find the selector block
    const selectorRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]+)\\}`, 'g');
    let match;
    
    while ((match = selectorRegex.exec(cssContent)) !== null) {
      const block = match[1];
      
      // Extract transition or transition-duration values
      const transitionRegex = /transition(?:-duration)?:\s*([^;]+);/g;
      let transMatch;
      
      while ((transMatch = transitionRegex.exec(block)) !== null) {
        const value = transMatch[1].trim();
        
        // Handle shorthand transition property
        if (value.includes(' ')) {
          const parts = value.split(/\s+/);
          parts.forEach(part => {
            if (part.match(/^\d+\.?\d*(m?s)$/)) {
              durations.push(parseDuration(part));
            }
          });
        } else {
          durations.push(parseDuration(value));
        }
      }
    }
    
    return durations;
  }

  it('should complete hover transformations within 200ms', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 9:
     * Hover transformations should complete within 200ms
     */
    const hoverDurations = extractTransitionDurations(projectCardCSS, '.project-card:hover');
    const focusDurations = extractTransitionDurations(projectCardCSS, '.project-card:focus-within');
    const baseDurations = extractTransitionDurations(projectCardCSS, '.project-card');

    const allDurations = [...hoverDurations, ...focusDurations, ...baseDurations];

    fc.assert(
      fc.property(
        fc.constantFrom(...allDurations),
        (duration) => {
          // Duration should be 200ms or less
          expect(duration).toBeLessThanOrEqual(200);
          return true;
        }
      ),
      { numRuns: Math.max(allDurations.length, 1) }
    );
  });

  it('should have transition property defined on project cards', () => {
    /**
     * Verify that project cards have transition properties for smooth animations
     */
    expect(projectCardCSS).toContain('transition:');
    
    // Should transition transform and box-shadow
    const hasTransform = projectCardCSS.match(/transition:[^;]*transform/);
    const hasBoxShadow = projectCardCSS.match(/transition:[^;]*box-shadow/);
    
    expect(hasTransform || hasBoxShadow).toBeTruthy();
  });

  it('should verify all transition durations are within acceptable range', () => {
    /**
     * Property-based test: All transition durations should be between 50ms and 200ms
     */
    const allDurations = extractTransitionDurations(projectCardCSS, '.project-card');

    allDurations.forEach(duration => {
      expect(duration).toBeGreaterThanOrEqual(50);
      expect(duration).toBeLessThanOrEqual(200);
    });
  });
});

describe('Property 10: Project Metadata Completeness', () => {
  /**
   * For any project card, it should display both a thumbnail/image element 
   * and technology metadata (list of technologies used).
   */

  let projectCardCSS: string;
  let projectCardComponent: string;

  beforeAll(() => {
    const cssPath = path.join(process.cwd(), 'src', 'styles', 'components', 'ProjectCard.css');
    const componentPath = path.join(process.cwd(), 'src', 'components', 'ProjectCard.tsx');
    projectCardCSS = fs.readFileSync(cssPath, 'utf-8');
    projectCardComponent = fs.readFileSync(componentPath, 'utf-8');
  });

  it('should have CSS classes for image display', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 10:
     * CSS should define styles for image and placeholder
     */
    
    // Should have image class
    expect(projectCardCSS).toContain('.project-card__image');
    
    // Should have placeholder class
    expect(projectCardCSS).toContain('.project-card__placeholder');
    
    // Should have image container class
    expect(projectCardCSS).toContain('.project-card__image-container');
  });

  it('should have CSS classes for technology metadata', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 10:
     * CSS should define styles for technology tags
     */
    
    // Should have technologies container class
    expect(projectCardCSS).toContain('.project-card__technologies');
    
    // Should have tech tag class
    expect(projectCardCSS).toContain('.project-card__tech-tag');
  });

  it('should render both image container and metadata in component', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 10:
     * Component should render both visual and metadata sections
     */
    
    // Should render image container
    expect(projectCardComponent).toContain('project-card__image-container');
    
    // Should render metadata section
    expect(projectCardComponent).toContain('project-card__metadata');
    
    // Should render technologies section
    expect(projectCardComponent).toContain('project-card__technologies');
    
    // Should render tech tags
    expect(projectCardComponent).toContain('project-card__tech-tag');
  });

  it('should have CSS for all required metadata components', () => {
    /**
     * Verify that all metadata components have CSS definitions
     */
    const requiredClasses = [
      '.project-card__image-container',
      '.project-card__metadata',
      '.project-card__technologies',
      '.project-card__tech-tag',
      '.project-card__title',
      '.project-card__description'
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...requiredClasses),
        (className) => {
          expect(projectCardCSS).toContain(className);
          return true;
        }
      ),
      { numRuns: requiredClasses.length }
    );
  });

  it('should verify component renders all required props', () => {
    /**
     * Component should use all required props in rendering
     */
    const requiredProps = ['name', 'description', 'technologies'];

    requiredProps.forEach(prop => {
      // Should reference the prop in the component
      expect(projectCardComponent).toContain(prop);
    });
  });
});

describe('Property 11: Focus and Hover Style Parity', () => {
  /**
   * For any project card, the visual styles applied on keyboard focus (:focus) 
   * should match the visual styles applied on hover (:hover), 
   * ensuring equivalent feedback for all users.
   */

  let projectCardCSS: string;

  beforeAll(() => {
    const cssPath = path.join(process.cwd(), 'src', 'styles', 'components', 'ProjectCard.css');
    projectCardCSS = fs.readFileSync(cssPath, 'utf-8');
  });

  /**
   * Helper function to extract CSS properties from a selector block
   */
  function extractProperties(cssContent: string, selector: string): Map<string, string> {
    const properties = new Map<string, string>();
    
    // Find the selector block
    const selectorRegex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]+)\\}`, 'g');
    let match;
    
    while ((match = selectorRegex.exec(cssContent)) !== null) {
      const block = match[1];
      
      // Extract property-value pairs
      const propRegex = /([a-z-]+)\s*:\s*([^;]+);/g;
      let propMatch;
      
      while ((propMatch = propRegex.exec(block)) !== null) {
        const property = propMatch[1].trim();
        const value = propMatch[2].trim();
        properties.set(property, value);
      }
    }
    
    return properties;
  }

  it('should have matching transform properties for hover and focus states', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 11:
     * Focus and hover should apply the same transform
     */
    const hoverProps = extractProperties(projectCardCSS, '.project-card:hover');
    const focusProps = extractProperties(projectCardCSS, '.project-card:focus-within');

    // Check if both have transform property
    const hoverTransform = hoverProps.get('transform');
    const focusTransform = focusProps.get('transform');

    if (hoverTransform && focusTransform) {
      expect(hoverTransform).toBe(focusTransform);
    }
  });

  it('should have matching box-shadow properties for hover and focus states', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 11:
     * Focus and hover should apply the same box-shadow
     */
    const hoverProps = extractProperties(projectCardCSS, '.project-card:hover');
    const focusProps = extractProperties(projectCardCSS, '.project-card:focus-within');

    const hoverShadow = hoverProps.get('box-shadow');
    const focusShadow = focusProps.get('box-shadow');

    if (hoverShadow && focusShadow) {
      expect(hoverShadow).toBe(focusShadow);
    }
  });

  it('should use combined selector for hover and focus states', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 11:
     * CSS should use combined selectors to ensure parity
     */
    
    // Check if there's a combined selector like .project-card:hover, .project-card:focus-within
    const combinedSelectorRegex = /\.project-card:hover\s*,\s*\.project-card:focus-within\s*\{/;
    const hasCombinedSelector = combinedSelectorRegex.test(projectCardCSS);

    expect(hasCombinedSelector).toBe(true);
  });

  it('should verify visual feedback properties are consistent', () => {
    /**
     * Property-based test: All visual feedback properties should match
     */
    const visualProperties = ['transform', 'box-shadow', 'opacity', 'scale'];

    fc.assert(
      fc.property(
        fc.constantFrom(...visualProperties),
        (property) => {
          const hoverProps = extractProperties(projectCardCSS, '.project-card:hover');
          const focusProps = extractProperties(projectCardCSS, '.project-card:focus-within');

          const hoverValue = hoverProps.get(property);
          const focusValue = focusProps.get(property);

          // If both states define this property, they should match
          if (hoverValue && focusValue) {
            expect(hoverValue).toBe(focusValue);
          }

          return true;
        }
      ),
      { numRuns: visualProperties.length }
    );
  });

  it('should have focus-visible styles for keyboard navigation', () => {
    /**
     * Verify that focus styles are accessible for keyboard users
     */
    
    // Should have focus-within or focus styles
    const hasFocusWithin = projectCardCSS.includes(':focus-within');
    const hasFocus = projectCardCSS.includes(':focus');

    expect(hasFocusWithin || hasFocus).toBe(true);
  });

  it('should verify links within cards have proper focus indicators', () => {
    /**
     * Links should have visible focus indicators
     */
    const linkFocusProps = extractProperties(projectCardCSS, '.project-card__link:focus');

    // Should have outline or other focus indicator
    const hasOutline = linkFocusProps.has('outline');
    const hasBoxShadow = linkFocusProps.has('box-shadow');
    const hasBorder = linkFocusProps.has('border');

    expect(hasOutline || hasBoxShadow || hasBorder).toBe(true);
  });
});
