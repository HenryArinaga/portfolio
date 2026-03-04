/**
 * Property-Based Tests: Micro-interaction Feedback Timing
 * 
 * **Validates: Requirements 8.1**
 * 
 * Property 19: Micro-interaction Feedback Timing
 * 
 * For any clickable/interactive element (buttons, links, icons), 
 * hover state visual feedback should be applied with a transition 
 * duration of 100ms or less.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 19: Micro-interaction Feedback Timing', () => {
  let baseCSS: string;
  let layoutCSS: string;
  let animationsCSS: string;
  let componentCSS: string;

  beforeAll(() => {
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    baseCSS = fs.readFileSync(path.join(stylesDir, 'base.css'), 'utf-8');
    layoutCSS = fs.readFileSync(path.join(stylesDir, 'layout.css'), 'utf-8');
    animationsCSS = fs.readFileSync(path.join(stylesDir, 'animations.css'), 'utf-8');
    
    // Load component CSS files
    const projectCardCSS = path.join(stylesDir, 'components', 'ProjectCard.css');
    const blogCardCSS = path.join(stylesDir, 'components', 'BlogCard.css');
    const skillBadgeCSS = path.join(stylesDir, 'components', 'SkillBadge.css');
    
    componentCSS = '';
    if (fs.existsSync(projectCardCSS)) {
      componentCSS += fs.readFileSync(projectCardCSS, 'utf-8');
    }
    if (fs.existsSync(blogCardCSS)) {
      componentCSS += fs.readFileSync(blogCardCSS, 'utf-8');
    }
    if (fs.existsSync(skillBadgeCSS)) {
      componentCSS += fs.readFileSync(skillBadgeCSS, 'utf-8');
    }
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
   * Helper function to extract transition durations from a CSS rule
   */
  function extractTransitionDurations(cssRule: string): number[] {
    const durations: number[] = [];
    
    // Match transition property declarations
    const transitionRegex = /transition(?:-duration)?\s*:\s*([^;]+);/g;
    let match;
    
    while ((match = transitionRegex.exec(cssRule)) !== null) {
      const transitionValue = match[1];
      
      // Extract all duration values (could be multiple for different properties)
      const durationRegex = /(?:var\([^)]+,\s*)?(\d+\.?\d*m?s)/g;
      let durationMatch;
      
      while ((durationMatch = durationRegex.exec(transitionValue)) !== null) {
        const duration = parseDuration(durationMatch[1]);
        if (duration > 0) {
          durations.push(duration);
        }
      }
    }
    
    return durations;
  }

  /**
   * Helper function to extract CSS rules for a given selector
   */
  function extractCSSRule(cssContent: string, selector: string): string | null {
    // Escape special regex characters in selector
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match the selector and its rule block
    const regex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'g');
    const match = regex.exec(cssContent);
    
    if (match) {
      return match[1];
    }
    
    return null;
  }

  /**
   * Helper function to check if a selector exists in CSS content
   */
  function selectorExists(cssContent: string, selector: string): boolean {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedSelector}\\s*\\{`, 'g');
    return regex.test(cssContent);
  }

  it('should have transition properties defined for interactive elements', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * All interactive elements should have transition properties
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    const interactiveSelectors = [
      'button',
      'a',
      '.btn',
      '.cta-button',
      '.nav-link',
      '.project-card',
      '.blog-card',
      '.skill-badge',
      '.footer-social-link'
    ];

    const selectorsWithTransitions: string[] = [];

    interactiveSelectors.forEach(selector => {
      const cssRule = extractCSSRule(allCSS, selector);
      if (cssRule && cssRule.includes('transition')) {
        selectorsWithTransitions.push(selector);
      }
    });

    expect(selectorsWithTransitions.length).toBeGreaterThan(0);
  });

  it('should have hover state transitions complete within 100ms for buttons', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * Button hover transitions should be 100ms or less
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    const buttonSelectors = [
      'button',
      '.btn',
      '.cta-button',
      '.resume-button',
      '.primary-button'
    ];

    const violations: Array<{ selector: string; duration: number }> = [];

    buttonSelectors.forEach(selector => {
      const cssRule = extractCSSRule(allCSS, selector);
      
      if (cssRule) {
        const durations = extractTransitionDurations(cssRule);
        
        durations.forEach(duration => {
          if (duration > 100) {
            violations.push({ selector, duration });
          }
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - ${v.selector}: ${v.duration}ms (expected: ≤100ms)`
      ).join('\n');

      expect.fail(`Button transition duration violations:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });

  it('should have hover state transitions complete within 100ms for links', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * Link hover transitions should be 100ms or less
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    const linkSelectors = [
      'a',
      '.nav-link',
      '.footer-social-link',
      '.project-link',
      '.blog-link'
    ];

    const violations: Array<{ selector: string; duration: number }> = [];

    linkSelectors.forEach(selector => {
      const cssRule = extractCSSRule(allCSS, selector);
      
      if (cssRule) {
        const durations = extractTransitionDurations(cssRule);
        
        durations.forEach(duration => {
          if (duration > 100) {
            violations.push({ selector, duration });
          }
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - ${v.selector}: ${v.duration}ms (expected: ≤100ms)`
      ).join('\n');

      expect.fail(`Link transition duration violations:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });

  it('should have hover state transitions complete within 100ms for icons', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * Icon hover transitions should be 100ms or less
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    const iconSelectors = [
      '.footer-social-link',
      '.social-icon',
      '.icon-button',
      '.skill-badge svg',
      '.footer-social svg'
    ];

    const violations: Array<{ selector: string; duration: number }> = [];

    iconSelectors.forEach(selector => {
      const cssRule = extractCSSRule(allCSS, selector);
      
      if (cssRule) {
        const durations = extractTransitionDurations(cssRule);
        
        durations.forEach(duration => {
          if (duration > 100) {
            violations.push({ selector, duration });
          }
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - ${v.selector}: ${v.duration}ms (expected: ≤100ms)`
      ).join('\n');

      expect.fail(`Icon transition duration violations:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });

  it('should verify all interactive elements have transitions ≤100ms (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * Property-based test for all interactive element transitions
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    const interactiveSelectors = [
      'button',
      'a',
      '.btn',
      '.cta-button',
      '.nav-link',
      '.footer-social-link',
      '.resume-button',
      '.primary-button',
      '.social-icon',
      '.icon-button'
    ];

    // Filter to only selectors that exist and have transitions
    const selectorsWithTransitions = interactiveSelectors.filter(selector => {
      const cssRule = extractCSSRule(allCSS, selector);
      return cssRule && cssRule.includes('transition');
    });

    if (selectorsWithTransitions.length === 0) {
      expect.fail('No interactive elements with transitions found');
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...selectorsWithTransitions),
        (selector) => {
          const cssRule = extractCSSRule(allCSS, selector);
          
          if (!cssRule) {
            throw new Error(`CSS rule not found for selector: ${selector}`);
          }

          const durations = extractTransitionDurations(cssRule);

          if (durations.length === 0) {
            throw new Error(`No transition durations found for selector: ${selector}`);
          }

          // All durations should be ≤100ms
          durations.forEach(duration => {
            expect(duration).toBeLessThanOrEqual(100);
          });

          return true;
        }
      ),
      { numRuns: selectorsWithTransitions.length }
    );
  });

  it('should use fast timing for micro-interactions across all components', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * Comprehensive check across all CSS files
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    // Find all selectors with transitions
    const transitionRegex = /([.#]?[\w-]+(?::[\w-]+)?)\s*\{[^}]*transition[^}]*\}/g;
    let match;
    const allSelectorsWithTransitions: string[] = [];
    
    while ((match = transitionRegex.exec(allCSS)) !== null) {
      const selector = match[1];
      
      // Only check interactive elements (buttons, links, hover states)
      if (
        selector.includes('button') ||
        selector.includes('btn') ||
        selector.includes('link') ||
        selector.includes('icon') ||
        selector.includes(':hover') ||
        selector.includes(':focus') ||
        selector === 'a'
      ) {
        allSelectorsWithTransitions.push(selector);
      }
    }

    const violations: Array<{ selector: string; duration: number }> = [];

    allSelectorsWithTransitions.forEach(selector => {
      const cssRule = extractCSSRule(allCSS, selector);
      
      if (cssRule) {
        const durations = extractTransitionDurations(cssRule);
        
        durations.forEach(duration => {
          if (duration > 100) {
            violations.push({ selector, duration });
          }
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - ${v.selector}: ${v.duration}ms (expected: ≤100ms)`
      ).join('\n');

      expect.fail(`Micro-interaction timing violations:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });

  it('should have consistent micro-interaction timing across similar elements', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * Similar interactive elements should use the same transition duration
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    const elementGroups = [
      ['button', '.btn', '.cta-button'],
      ['a', '.nav-link'],
      ['.footer-social-link', '.social-icon']
    ];

    elementGroups.forEach(group => {
      const durations: number[] = [];
      
      group.forEach(selector => {
        const cssRule = extractCSSRule(allCSS, selector);
        
        if (cssRule) {
          const selectorDurations = extractTransitionDurations(cssRule);
          durations.push(...selectorDurations);
        }
      });

      // All durations in the group should be the same
      if (durations.length > 1) {
        const uniqueDurations = [...new Set(durations)];
        
        if (uniqueDurations.length > 1) {
          const groupName = group.join(', ');
          expect.fail(
            `Inconsistent transition durations in group [${groupName}]: ` +
            `${uniqueDurations.join('ms, ')}ms`
          );
        }
      }
    });
  });

  it('should verify hover states exist for all interactive elements', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * All interactive elements should have hover states defined
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    const interactiveSelectors = [
      'button',
      'a',
      '.btn',
      '.cta-button',
      '.nav-link',
      '.footer-social-link'
    ];

    const missingHoverStates: string[] = [];

    interactiveSelectors.forEach(selector => {
      const hoverSelector = `${selector}:hover`;
      
      if (!selectorExists(allCSS, hoverSelector)) {
        missingHoverStates.push(selector);
      }
    });

    if (missingHoverStates.length > 0) {
      expect.fail(
        `Missing hover states for: ${missingHoverStates.join(', ')}`
      );
    }

    expect(missingHoverStates.length).toBe(0);
  });

  it('should verify focus states match hover timing for accessibility', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 19:
     * Focus states should have the same timing as hover states
     */
    
    const allCSS = baseCSS + layoutCSS + animationsCSS + componentCSS;
    
    const interactiveSelectors = [
      'button',
      'a',
      '.btn',
      '.cta-button',
      '.nav-link'
    ];

    interactiveSelectors.forEach(selector => {
      const baseRule = extractCSSRule(allCSS, selector);
      const hoverRule = extractCSSRule(allCSS, `${selector}:hover`);
      const focusRule = extractCSSRule(allCSS, `${selector}:focus`);
      const focusVisibleRule = extractCSSRule(allCSS, `${selector}:focus-visible`);

      if (baseRule) {
        const baseDurations = extractTransitionDurations(baseRule);
        
        // If hover or focus rules exist, they should use the same timing
        if (hoverRule) {
          const hoverDurations = extractTransitionDurations(hoverRule);
          if (hoverDurations.length > 0 && baseDurations.length > 0) {
            expect(hoverDurations[0]).toBe(baseDurations[0]);
          }
        }

        if (focusRule || focusVisibleRule) {
          const focusDurations = extractTransitionDurations(
            focusRule || focusVisibleRule || ''
          );
          if (focusDurations.length > 0 && baseDurations.length > 0) {
            expect(focusDurations[0]).toBe(baseDurations[0]);
          }
        }
      }
    });
  });
});
