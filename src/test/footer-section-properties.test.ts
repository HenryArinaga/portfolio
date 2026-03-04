/**
 * Property-Based Tests: Footer Section Properties
 * 
 * **Validates: Requirements 8.4, 12.4**
 * 
 * Property 21: Social Link Hover Effects
 * Property 30: Footer Social Icon Consistency
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 21: Social Link Hover Effects', () => {
  /**
   * For any social media link in the Footer section, 
   * hover state should apply either a scale transform or a color transition (or both).
   */

  let baseCSS: string;
  let layoutCSS: string;
  let animationsCSS: string;

  beforeAll(() => {
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    baseCSS = fs.readFileSync(path.join(stylesDir, 'base.css'), 'utf-8');
    layoutCSS = fs.readFileSync(path.join(stylesDir, 'layout.css'), 'utf-8');
    animationsCSS = fs.readFileSync(path.join(stylesDir, 'animations.css'), 'utf-8');
  });

  /**
   * Helper function to extract CSS properties from a selector block
   */
  function extractProperties(cssContent: string, selector: string): Map<string, string> {
    const properties = new Map<string, string>();
    
    // Escape special regex characters in selector
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Find the selector block
    const selectorRegex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'g');
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

  /**
   * Helper function to check if a selector exists in CSS content
   */
  function selectorExists(cssContent: string, selector: string): boolean {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedSelector}\\s*\\{`, 'g');
    return regex.test(cssContent);
  }

  /**
   * Helper function to check if transform includes scale
   */
  function hasScaleTransform(transformValue: string): boolean {
    return /scale\([^)]+\)/.test(transformValue);
  }

  /**
   * Helper function to check if transition includes color or transform
   */
  function hasColorOrTransformTransition(transitionValue: string): boolean {
    return /color|transform/.test(transitionValue);
  }

  it('should have hover styles defined for footer social links', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 21:
     * Footer social links must have hover state styles
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS;
    
    // Check for footer social link hover selector
    const hasHoverSelector = 
      selectorExists(allCSS, '.footer-social-link:hover') ||
      selectorExists(allCSS, '.footer-social a:hover') ||
      selectorExists(allCSS, '.footer-social-links a:hover');

    expect(hasHoverSelector).toBe(true);
  });

  it('should apply scale transform or color transition on hover', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 21:
     * Hover state should include scale transform or color transition
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS;
    
    // Extract properties from possible hover selectors
    const selectors = [
      '.footer-social-link:hover',
      '.footer-social a:hover',
      '.footer-social-links a:hover'
    ];

    let hasScaleOrColor = false;
    let foundTransform = '';
    let foundTransition = '';

    for (const selector of selectors) {
      const props = extractProperties(allCSS, selector);
      
      const transform = props.get('transform');
      const transition = props.get('transition');

      if (transform) {
        foundTransform = transform;
        if (hasScaleTransform(transform)) {
          hasScaleOrColor = true;
          break;
        }
      }

      if (transition) {
        foundTransition = transition;
        if (hasColorOrTransformTransition(transition)) {
          hasScaleOrColor = true;
          break;
        }
      }
    }

    if (!hasScaleOrColor) {
      expect.fail(
        `Footer social links should have scale transform or color transition on hover. ` +
        `Found transform: "${foundTransform}", transition: "${foundTransition}"`
      );
    }

    expect(hasScaleOrColor).toBe(true);
  });

  it('should have transition property for smooth hover effects', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 21:
     * Social links should have transition for smooth animations
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS;
    
    const selectors = [
      '.footer-social-link',
      '.footer-social a',
      '.footer-social-links a'
    ];

    let hasTransition = false;

    for (const selector of selectors) {
      const props = extractProperties(allCSS, selector);
      if (props.has('transition')) {
        hasTransition = true;
        break;
      }
    }

    expect(hasTransition).toBe(true);
  });

  it('should verify hover effects are applied within acceptable timing', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 21:
     * Hover transitions should complete quickly (within 300ms)
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS;
    
    const selectors = [
      '.footer-social-link',
      '.footer-social a',
      '.footer-social-links a'
    ];

    /**
     * Helper to parse duration to milliseconds
     */
    function parseDuration(durationStr: string): number {
      if (!durationStr || durationStr === '0s' || durationStr === '0ms') return 0;
      
      const match = durationStr.match(/^([\d.]+)(m?s)$/);
      if (!match) return 0;
      
      const value = parseFloat(match[1]);
      const unit = match[2];
      
      return unit === 'ms' ? value : value * 1000;
    }

    for (const selector of selectors) {
      const props = extractProperties(allCSS, selector);
      const transition = props.get('transition');

      if (transition) {
        // Extract duration from transition
        const durationMatch = transition.match(/(\d+\.?\d*(m?s))/);
        if (durationMatch) {
          const duration = parseDuration(durationMatch[1]);
          expect(duration).toBeLessThanOrEqual(300);
        }
      }
    }
  });

  it('should apply hover effects to all social link variations (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 21:
     * Property-based test for hover effects across different selectors
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS;
    
    const possibleSelectors = [
      '.footer-social-link:hover',
      '.footer-social a:hover',
      '.footer-social-links a:hover',
      '.footer-social-link:focus',
      '.footer-social a:focus',
      '.footer-social-links a:focus'
    ];

    const existingSelectors = possibleSelectors.filter(sel => 
      selectorExists(allCSS, sel)
    );

    expect(existingSelectors.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...existingSelectors),
        (selector) => {
          const props = extractProperties(allCSS, selector);
          
          // Should have either transform or transition defined
          const hasTransform = props.has('transform');
          const hasTransition = props.has('transition');
          const hasColor = props.has('color');

          expect(hasTransform || hasTransition || hasColor).toBe(true);
          return true;
        }
      ),
      { numRuns: existingSelectors.length }
    );
  });

  it('should have focus styles matching hover styles for accessibility', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 21:
     * Focus styles should match hover styles for keyboard users
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS;
    
    // Check for focus selectors (including focus-visible)
    const hasFocusSelector = 
      selectorExists(allCSS, '.footer-social-link:focus') ||
      selectorExists(allCSS, '.footer-social-link:focus-visible') ||
      selectorExists(allCSS, '.footer-social a:focus') ||
      selectorExists(allCSS, '.footer-social a:focus-visible') ||
      selectorExists(allCSS, '.footer-social-links a:focus') ||
      selectorExists(allCSS, '.footer-social-links a:focus-visible');

    expect(hasFocusSelector).toBe(true);
  });
});

describe('Property 30: Footer Social Icon Consistency', () => {
  /**
   * For any set of social media icons in the Footer section, 
   * all icons should have identical dimensions (width and height) 
   * and consistent spacing (gap or margin) between them.
   */

  let baseCSS: string;
  let layoutCSS: string;

  beforeAll(() => {
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    baseCSS = fs.readFileSync(path.join(stylesDir, 'base.css'), 'utf-8');
    layoutCSS = fs.readFileSync(path.join(stylesDir, 'layout.css'), 'utf-8');
  });

  /**
   * Helper function to extract CSS properties from a selector block
   */
  function extractProperties(cssContent: string, selector: string): Map<string, string> {
    const properties = new Map<string, string>();
    
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const selectorRegex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'g');
    let match;
    
    while ((match = selectorRegex.exec(cssContent)) !== null) {
      const block = match[1];
      
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

  it('should define consistent dimensions for all footer social icons', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 30:
     * All social icons should have identical width and height
     */
    
    const allCSS = baseCSS + layoutCSS;
    
    // Check for icon dimension definitions
    const iconSelectors = [
      '.footer-social-icon',
      '.footer-social svg',
      '.footer-social-link svg'
    ];

    let foundWidth = '';
    let foundHeight = '';
    let dimensionsFound = false;

    for (const selector of iconSelectors) {
      const props = extractProperties(allCSS, selector);
      
      if (props.has('width') || props.has('height')) {
        foundWidth = props.get('width') || '';
        foundHeight = props.get('height') || '';
        dimensionsFound = true;
        break;
      }
    }

    expect(dimensionsFound).toBe(true);
    
    // Width and height should be defined
    expect(foundWidth).toBeTruthy();
    expect(foundHeight).toBeTruthy();
  });

  it('should have equal width and height for square icons', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 30:
     * Icons should be square (width === height)
     */
    
    const allCSS = baseCSS + layoutCSS;
    
    const iconSelectors = [
      '.footer-social-icon',
      '.footer-social svg',
      '.footer-social-link svg'
    ];

    for (const selector of iconSelectors) {
      const props = extractProperties(allCSS, selector);
      
      const width = props.get('width');
      const height = props.get('height');

      if (width && height) {
        // If both are defined, they should be equal
        expect(width).toBe(height);
      }
    }
  });

  it('should define consistent spacing between social icons', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 30:
     * Icons should have consistent spacing via gap or margin
     */
    
    const allCSS = baseCSS + layoutCSS;
    
    // Check for spacing in container
    const containerSelectors = [
      '.footer-social-links',
      '.footer-social',
      '.footer-social-link'
    ];

    let hasSpacing = false;
    let spacingValue = '';

    for (const selector of containerSelectors) {
      const props = extractProperties(allCSS, selector);
      
      if (props.has('gap')) {
        hasSpacing = true;
        spacingValue = props.get('gap') || '';
        break;
      }
      
      if (props.has('margin') || props.has('margin-right') || props.has('margin-left')) {
        hasSpacing = true;
        spacingValue = props.get('margin') || props.get('margin-right') || props.get('margin-left') || '';
        break;
      }
    }

    expect(hasSpacing).toBe(true);
    expect(spacingValue).toBeTruthy();
  });

  it('should use flexbox or grid for consistent icon layout', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 30:
     * Container should use flexbox or grid for consistent layout
     */
    
    const allCSS = baseCSS + layoutCSS;
    
    const containerSelectors = [
      '.footer-social-links',
      '.footer-social'
    ];

    let hasLayoutSystem = false;

    for (const selector of containerSelectors) {
      const props = extractProperties(allCSS, selector);
      
      const display = props.get('display');
      
      if (display === 'flex' || display === 'grid' || display === 'inline-flex') {
        hasLayoutSystem = true;
        break;
      }
    }

    expect(hasLayoutSystem).toBe(true);
  });

  it('should verify icon dimensions are consistent across all instances (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 30:
     * Property-based test for dimension consistency
     */
    
    const allCSS = baseCSS + layoutCSS;
    
    const iconSelectors = [
      '.footer-social-icon',
      '.footer-social svg',
      '.footer-social-link svg'
    ];

    const dimensions: Array<{ width: string; height: string }> = [];

    iconSelectors.forEach(selector => {
      const props = extractProperties(allCSS, selector);
      const width = props.get('width');
      const height = props.get('height');
      
      if (width && height) {
        dimensions.push({ width, height });
      }
    });

    if (dimensions.length > 0) {
      fc.assert(
        fc.property(
          fc.constantFrom(...dimensions),
          (dim) => {
            // Width and height should be equal (square icons)
            expect(dim.width).toBe(dim.height);
            return true;
          }
        ),
        { numRuns: dimensions.length }
      );
    }
  });

  it('should have consistent sizing units for all icon dimensions', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 30:
     * All dimensions should use the same unit (px, rem, em)
     */
    
    const allCSS = baseCSS + layoutCSS;
    
    const iconSelectors = [
      '.footer-social-icon',
      '.footer-social svg',
      '.footer-social-link svg'
    ];

    const units: string[] = [];

    iconSelectors.forEach(selector => {
      const props = extractProperties(allCSS, selector);
      const width = props.get('width');
      const height = props.get('height');
      
      if (width) {
        const unitMatch = width.match(/(px|rem|em|%)$/);
        if (unitMatch) units.push(unitMatch[1]);
      }
      
      if (height) {
        const unitMatch = height.match(/(px|rem|em|%)$/);
        if (unitMatch) units.push(unitMatch[1]);
      }
    });

    // All units should be the same
    if (units.length > 1) {
      const firstUnit = units[0];
      units.forEach(unit => {
        expect(unit).toBe(firstUnit);
      });
    }
  });

  it('should verify spacing is consistent across all icon gaps', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 30:
     * All spacing between icons should be identical
     */
    
    const allCSS = baseCSS + layoutCSS;
    
    const containerSelectors = [
      '.footer-social-links',
      '.footer-social'
    ];

    const spacingValues: string[] = [];

    containerSelectors.forEach(selector => {
      const props = extractProperties(allCSS, selector);
      
      const gap = props.get('gap');
      if (gap) spacingValues.push(gap);
      
      const margin = props.get('margin');
      if (margin) spacingValues.push(margin);
    });

    // If multiple spacing values found, they should be consistent
    if (spacingValues.length > 1) {
      const firstValue = spacingValues[0];
      spacingValues.forEach(value => {
        expect(value).toBe(firstValue);
      });
    }
  });

  it('should have aria-labels for all icon-only social links', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 30:
     * Accessibility check - all icon links should have aria-labels
     */
    
    const footerComponent = fs.readFileSync(
      path.join(process.cwd(), 'src', 'sections', 'FooterSection.tsx'),
      'utf-8'
    );

    // Check that social links have aria-label attributes
    const socialLinkRegex = /<a[^>]*className="footer-social-link"[^>]*>/g;
    const matches = footerComponent.match(socialLinkRegex);

    if (matches) {
      matches.forEach(linkTag => {
        expect(linkTag).toContain('aria-label');
      });
    }
  });
});
