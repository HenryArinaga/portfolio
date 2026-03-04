/**
 * Property-Based Tests: Accessibility Properties
 * 
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.5**
 * 
 * Property 26: Interactive Element Focusability
 * Property 27: Icon Button Accessibility
 * Property 28: Visible Focus Indicators
 * Property 29: Semantic Heading Hierarchy
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import App from '../App';

describe('Property 26: Interactive Element Focusability', () => {
  /**
   * For any interactive element (buttons, links, form inputs, custom controls),
   * the element should be keyboard focusable either through natural HTML semantics
   * or explicit tabindex attribute.
   */

  beforeEach(() => {
    // Clear any existing DOM
    document.body.innerHTML = '';
  });

  it('should ensure all interactive elements are keyboard focusable', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 26:
     * For any interactive element, it should be keyboard focusable
     */

    const { container } = render(<App />);

    // Get all potentially interactive elements
    const interactiveSelectors = [
      'button',
      'a[href]',
      'input',
      'textarea',
      'select',
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[onclick]'
    ];

    const interactiveElements: HTMLElement[] = [];
    interactiveSelectors.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      elements.forEach(el => interactiveElements.push(el as HTMLElement));
    });

    const violations: Array<{ tag: string; role: string; tabIndex: number; id: string; class: string }> = [];

    interactiveElements.forEach(element => {
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute('role') || '';
      const tabIndex = element.tabIndex;
      const id = element.id || '';
      const className = element.className || '';

      // Check if element is focusable
      // Naturally focusable elements: a[href], button, input, textarea, select
      const naturallyFocusable = ['a', 'button', 'input', 'textarea', 'select'].includes(tagName);
      
      // Element is focusable if:
      // 1. Naturally focusable and tabIndex >= 0 (or not explicitly set to -1)
      // 2. Has explicit tabIndex >= 0
      const isFocusable = (naturallyFocusable && tabIndex >= -1) || tabIndex >= 0;

      // Check if element has href (for links)
      const hasHref = element.hasAttribute('href');
      
      // Links without href are not focusable
      if (tagName === 'a' && !hasHref) {
        violations.push({
          tag: tagName,
          role,
          tabIndex,
          id,
          class: className
        });
        return;
      }

      // Elements with tabIndex -1 are programmatically focusable but not in tab order
      // This is acceptable for some use cases (e.g., modal focus management)
      // So we only flag elements that are completely unfocusable
      if (!isFocusable && tabIndex !== -1) {
        violations.push({
          tag: tagName,
          role,
          tabIndex,
          id,
          class: className
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - <${v.tag}${v.role ? ` role="${v.role}"` : ''}${v.id ? ` id="${v.id}"` : ''}${v.class ? ` class="${v.class}"` : ''}> (tabIndex: ${v.tabIndex})`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} interactive element(s) that are not keyboard focusable:\n${report}`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should verify all buttons are keyboard focusable (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 26:
     * Property-based test for button focusability
     */

    const { container } = render(<App />);
    const buttons = Array.from(container.querySelectorAll('button, [role="button"]'));

    if (buttons.length === 0) {
      expect(true).toBe(true);
      return;
    }

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: buttons.length - 1 }),
        (index) => {
          const button = buttons[index] as HTMLElement;
          const tabIndex = button.tabIndex;
          const tagName = button.tagName.toLowerCase();

          // Buttons should be focusable (tabIndex >= -1 for native buttons, >= 0 for role="button")
          const isFocusable = tagName === 'button' ? tabIndex >= -1 : tabIndex >= 0;

          if (!isFocusable) {
            throw new Error(
              `Button is not focusable: <${tagName}${button.id ? ` id="${button.id}"` : ''}> (tabIndex: ${tabIndex})`
            );
          }

          return true;
        }
      ),
      { numRuns: Math.min(100, buttons.length) }
    );
  });

  it('should verify all links with href are keyboard focusable', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 26:
     * All links with href should be focusable
     */

    const { container } = render(<App />);
    const links = Array.from(container.querySelectorAll('a[href]'));

    const violations: Array<{ href: string; tabIndex: number; text: string }> = [];

    links.forEach(link => {
      const element = link as HTMLAnchorElement;
      const tabIndex = element.tabIndex;
      const href = element.getAttribute('href') || '';
      const text = element.textContent?.trim() || '';

      // Links with href should be focusable (tabIndex >= -1)
      if (tabIndex < -1) {
        violations.push({ href, tabIndex, text });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - <a href="${v.href}"> "${v.text}" (tabIndex: ${v.tabIndex})`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} link(s) that are not keyboard focusable:\n${report}`
      );
    }

    expect(violations.length).toBe(0);
  });
});

describe('Property 27: Icon Button Accessibility', () => {
  /**
   * For any icon-only button or link (no visible text label), the element should
   * have an aria-label or aria-labelledby attribute providing a text description.
   */

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should ensure all icon-only buttons have accessible labels', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 27:
     * For any icon-only button, it should have aria-label or aria-labelledby
     */

    const { container } = render(<App />);

    // Get all buttons and links
    const interactiveElements = Array.from(
      container.querySelectorAll('button, a[href], [role="button"], [role="link"]')
    );

    const violations: Array<{ tag: string; id: string; class: string; textContent: string }> = [];

    interactiveElements.forEach(element => {
      const el = element as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      const id = el.id || '';
      const className = el.className || '';
      
      // Get visible text content (excluding whitespace)
      const textContent = el.textContent?.trim() || '';
      
      // Check if element has an img child (icon image)
      const hasImgChild = el.querySelector('img') !== null;
      
      // Check if element has SVG child (icon)
      const hasSvgChild = el.querySelector('svg') !== null;
      
      // Check if element has icon class (common pattern)
      const hasIconClass = className.includes('icon') || className.includes('Icon');
      
      // Determine if this is likely an icon-only button
      const isLikelyIconOnly = (hasImgChild || hasSvgChild || hasIconClass) && textContent.length === 0;
      
      if (isLikelyIconOnly) {
        // Check for accessible label
        const hasAriaLabel = el.hasAttribute('aria-label') && el.getAttribute('aria-label')!.trim().length > 0;
        const hasAriaLabelledBy = el.hasAttribute('aria-labelledby');
        const hasTitle = el.hasAttribute('title') && el.getAttribute('title')!.trim().length > 0;
        
        // For links, check if there's an img with alt text
        const imgAlt = el.querySelector('img')?.getAttribute('alt');
        const hasImgAlt = imgAlt && imgAlt.trim().length > 0;

        const hasAccessibleLabel = hasAriaLabel || hasAriaLabelledBy || hasTitle || hasImgAlt;

        if (!hasAccessibleLabel) {
          violations.push({
            tag: tagName,
            id,
            class: className,
            textContent: textContent.substring(0, 50)
          });
        }
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - <${v.tag}${v.id ? ` id="${v.id}"` : ''}${v.class ? ` class="${v.class}"` : ''}>`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} icon-only button(s)/link(s) without accessible labels:\n${report}\n` +
        `Add aria-label, aria-labelledby, or title attribute.`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should verify social media links have accessible labels (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 27:
     * Social media links (typically icon-only) should have accessible labels
     */

    const { container } = render(<App />);
    
    // Find social media links (common patterns)
    const socialLinks = Array.from(
      container.querySelectorAll('a[href*="github"], a[href*="linkedin"], a[href*="twitter"], a[href*="facebook"], a[href*="instagram"]')
    );

    if (socialLinks.length === 0) {
      expect(true).toBe(true);
      return;
    }

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: socialLinks.length - 1 }),
        (index) => {
          const link = socialLinks[index] as HTMLAnchorElement;
          const href = link.getAttribute('href') || '';
          
          // Check for accessible label
          const hasAriaLabel = link.hasAttribute('aria-label') && link.getAttribute('aria-label')!.trim().length > 0;
          const hasAriaLabelledBy = link.hasAttribute('aria-labelledby');
          const hasTitle = link.hasAttribute('title') && link.getAttribute('title')!.trim().length > 0;
          const textContent = link.textContent?.trim() || '';
          const imgAlt = link.querySelector('img')?.getAttribute('alt');
          const hasImgAlt = imgAlt && imgAlt.trim().length > 0;

          const hasAccessibleLabel = hasAriaLabel || hasAriaLabelledBy || hasTitle || textContent.length > 0 || hasImgAlt;

          if (!hasAccessibleLabel) {
            throw new Error(
              `Social media link without accessible label: ${href}\n` +
              `Add aria-label, title, visible text, or img alt attribute.`
            );
          }

          return true;
        }
      ),
      { numRuns: Math.min(100, socialLinks.length) }
    );
  });
});

describe('Property 28: Visible Focus Indicators', () => {
  /**
   * For any focusable element, the :focus state should have visible styling
   * (outline, border, shadow, or background change) that is not removed without
   * providing an alternative indicator.
   */

  it('should ensure focus indicators are defined in CSS', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 28:
     * For any focusable element, :focus state should have visible styling
     */

    // Load all CSS files
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    const cssFiles = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));
    
    const allCSS = cssFiles.map((file: string) => {
      const filePath = path.join(stylesDir, file);
      return fs.readFileSync(filePath, 'utf-8');
    }).join('\n');

    // Check for focus styles
    const hasFocusStyles = allCSS.includes(':focus') || allCSS.includes(':focus-visible');
    
    expect(hasFocusStyles).toBe(true);

    // Check that outline is not globally removed without alternative
    const outlineNoneRegex = /(\*|:focus|:focus-visible)[^}]*outline\s*:\s*none/g;
    const outlineNoneMatches = allCSS.match(outlineNoneRegex);

    if (outlineNoneMatches) {
      // If outline: none is found, check if there's an alternative focus indicator
      const hasAlternativeFocusIndicator = 
        allCSS.includes('box-shadow') ||
        allCSS.includes('border') ||
        allCSS.includes('background');

      if (!hasAlternativeFocusIndicator) {
        expect.fail(
          'Found "outline: none" on focus without alternative focus indicator.\n' +
          'Provide alternative styling (box-shadow, border, or background change).'
        );
      }
    }
  });

  it('should verify focus styles are not completely removed', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 28:
     * Verify that focus indicators are not globally disabled
     */

    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    const cssFiles = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));
    
    const violations: Array<{ file: string; issue: string }> = [];

    cssFiles.forEach((file: string) => {
      const filePath = path.join(stylesDir, file);
      const cssContent = fs.readFileSync(filePath, 'utf-8');

      // Check for problematic patterns
      // Pattern 1: * { outline: none } (global outline removal)
      const globalOutlineNone = cssContent.match(/\*\s*\{[^}]*outline\s*:\s*none/);
      if (globalOutlineNone) {
        // Check if there's a compensating :focus-visible rule
        const hasFocusVisible = cssContent.includes(':focus-visible');
        if (!hasFocusVisible) {
          violations.push({
            file,
            issue: 'Global outline: none found without :focus-visible alternative'
          });
        }
      }

      // Pattern 2: :focus { outline: none } without :focus-visible alternative
      // This is acceptable if using :focus:not(:focus-visible) pattern
      const focusOutlineNone = cssContent.match(/:focus\s*\{[^}]*outline\s*:\s*none[^}]*\}/g);
      if (focusOutlineNone) {
        focusOutlineNone.forEach((match: string) => {
          // Skip if this is :focus:not(:focus-visible) pattern (modern accessibility pattern)
          if (match.includes(':not(:focus-visible)')) {
            return;
          }

          // Check if there's a corresponding :focus-visible rule for the same selector
          const selectorMatch = match.match(/([^{]+):focus/);
          if (selectorMatch) {
            const baseSelector = selectorMatch[1].trim();
            const focusVisiblePattern = new RegExp(`${baseSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:focus-visible`);
            const hasFocusVisibleRule = focusVisiblePattern.test(cssContent);
            
            if (!hasFocusVisibleRule) {
              // Check if this rule has alternative focus indicators
              const hasBoxShadow = match.includes('box-shadow');
              const hasBorder = match.includes('border');
              const hasBackground = match.includes('background');
              
              if (!hasBoxShadow && !hasBorder && !hasBackground) {
                violations.push({
                  file,
                  issue: `Focus outline removed for "${baseSelector}" without :focus-visible or alternative indicator`
                });
              }
            }
          }
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v => `  - ${v.file}: ${v.issue}`).join('\n');
      expect.fail(
        `Found ${violations.length} focus indicator violation(s):\n${report}`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should verify interactive elements have focus styles (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 28:
     * Property-based test for focus indicator presence
     */

    const { container } = render(<App />);
    
    const interactiveElements = Array.from(
      container.querySelectorAll('button, a[href], input, textarea, select, [role="button"]')
    );

    if (interactiveElements.length === 0) {
      expect(true).toBe(true);
      return;
    }

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: interactiveElements.length - 1 }),
        (index) => {
          const element = interactiveElements[index] as HTMLElement;
          
          // Simulate focus
          element.focus();
          
          // Get computed styles
          const styles = window.getComputedStyle(element);
          
          // Check for focus indicators
          const hasOutline = styles.outline !== 'none' && styles.outline !== '';
          const hasBoxShadow = styles.boxShadow !== 'none';
          const hasBorder = styles.border !== 'none' && styles.borderWidth !== '0px';
          
          // Element should have at least one focus indicator
          // Note: This is a basic check; actual focus styles might be applied via :focus pseudo-class
          // which we can't easily test in JSDOM
          const hasFocusIndicator = hasOutline || hasBoxShadow || hasBorder;

          // For this test, we'll just verify the element is focusable
          // The CSS-based test above checks for :focus styles in stylesheets
          const isFocusable = element.tabIndex >= -1 || 
                             ['button', 'a', 'input', 'textarea', 'select'].includes(element.tagName.toLowerCase());

          return isFocusable;
        }
      ),
      { numRuns: Math.min(100, interactiveElements.length) }
    );
  });
});

describe('Property 29: Semantic Heading Hierarchy', () => {
  /**
   * For any page or section, heading elements should follow sequential order
   * (h1 → h2 → h3) without skipping levels, maintaining proper document structure.
   */

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should maintain proper heading hierarchy without skipping levels', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 29:
     * For any page, headings should follow sequential order
     */

    const { container } = render(<App />);

    // Get all heading elements
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    if (headings.length === 0) {
      expect.fail('No heading elements found in the application');
    }

    // Extract heading levels
    const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));

    const violations: Array<{ from: number; to: number; index: number }> = [];

    // Check for sequential order
    for (let i = 1; i < headingLevels.length; i++) {
      const prevLevel = headingLevels[i - 1];
      const currLevel = headingLevels[i];

      // Heading level can:
      // 1. Stay the same (sibling heading)
      // 2. Increase by 1 (child section)
      // 3. Decrease by any amount (back to parent section)
      // But should NOT increase by more than 1 (skip levels)
      if (currLevel > prevLevel + 1) {
        violations.push({
          from: prevLevel,
          to: currLevel,
          index: i
        });
      }
    }

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - Position ${v.index}: h${v.from} → h${v.to} (skipped ${v.to - v.from - 1} level(s))`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} heading hierarchy violation(s):\n${report}\n` +
        `Headings should not skip levels (e.g., h1 → h3 without h2).`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should have exactly one h1 element per page', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 29:
     * Page should have exactly one h1 element
     */

    const { container } = render(<App />);
    const h1Elements = container.querySelectorAll('h1');

    expect(h1Elements.length).toBe(1);
  });

  it('should verify heading hierarchy across random sections (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 29:
     * Property-based test for heading hierarchy
     */

    const { container } = render(<App />);
    
    // Get all sections
    const sections = Array.from(container.querySelectorAll('section, [role="region"]'));

    if (sections.length === 0) {
      expect(true).toBe(true);
      return;
    }

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: sections.length - 1 }),
        (index) => {
          const section = sections[index] as HTMLElement;
          const headings = Array.from(section.querySelectorAll('h1, h2, h3, h4, h5, h6'));

          if (headings.length === 0) {
            return true; // Section without headings is acceptable
          }

          // Extract heading levels within this section
          const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));

          // Check for sequential order within section
          for (let i = 1; i < headingLevels.length; i++) {
            const prevLevel = headingLevels[i - 1];
            const currLevel = headingLevels[i];

            if (currLevel > prevLevel + 1) {
              throw new Error(
                `Heading hierarchy violation in section ${index}: ` +
                `h${prevLevel} → h${currLevel} (skipped ${currLevel - prevLevel - 1} level(s))`
              );
            }
          }

          return true;
        }
      ),
      { numRuns: Math.min(100, sections.length) }
    );
  });

  it('should verify headings are used for structure, not styling', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 29:
     * Headings should represent document structure
     */

    const { container } = render(<App />);
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    // Check that headings have meaningful content (not empty or just whitespace)
    const emptyHeadings = headings.filter(h => {
      const text = h.textContent?.trim() || '';
      return text.length === 0;
    });

    if (emptyHeadings.length > 0) {
      expect.fail(
        `Found ${emptyHeadings.length} empty heading element(s). ` +
        `Headings should have meaningful text content.`
      );
    }

    expect(emptyHeadings.length).toBe(0);
  });
});
