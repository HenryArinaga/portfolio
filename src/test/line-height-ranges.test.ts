/**
 * Property-Based Test: Line Height Ranges
 * 
 * **Validates: Requirements 2.3, 2.4**
 * 
 * Property 4: Body Text Line Height Range
 * For any body text element (paragraphs, list items, general content), the computed 
 * line-height value should fall between 1.5 and 1.8 inclusive.
 * 
 * Property 5: Heading Line Height Range
 * For any heading element (h1, h2, h3, h4, h5, h6), the computed line-height value 
 * should fall between 1.2 and 1.4 inclusive.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 4 & 5: Line Height Ranges', () => {
  let dom: JSDOM;
  let document: Document;
  let styleSheets: string[];

  beforeAll(() => {
    // Load all CSS files from the styles directory
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    const cssFiles = fs.readdirSync(stylesDir).filter((file: string) => file.endsWith('.css'));
    
    styleSheets = cssFiles.map((file: string) => {
      const filePath = path.join(stylesDir, file);
      return fs.readFileSync(filePath, 'utf-8');
    });

    // Create a JSDOM instance with all CSS loaded
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${styleSheets.join('\n')}</style>
        </head>
        <body>
          <div id="root">
            <!-- Body text elements -->
            <p>Paragraph text</p>
            <ul><li>List item</li></ul>
            <ol><li>Ordered list item</li></ol>
            <div class="text-base">Base text</div>
            <div class="text-sm">Small text</div>
            <div class="text-lg">Large text</div>
            <span>Span text</span>
            <article>Article content</article>
            
            <!-- Heading elements -->
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <h5>Heading 5</h5>
            <h6>Heading 6</h6>
            <div class="text-h1">Text h1 class</div>
            <div class="text-h2">Text h2 class</div>
          </div>
        </body>
      </html>
    `;
    
    dom = new JSDOM(html, {
      resources: 'usable',
      runScripts: 'dangerously'
    });
    document = dom.window.document;
  });

  /**
   * Helper function to parse line-height value to a numeric ratio
   */
  function parseLineHeight(element: HTMLElement): number | null {
    const computedStyle = dom.window.getComputedStyle(element);
    const lineHeight = computedStyle.lineHeight;
    const fontSize = computedStyle.fontSize;

    // If line-height is 'normal', return null (browser default, typically ~1.2)
    if (lineHeight === 'normal') {
      return 1.2; // Approximate browser default
    }

    // If line-height is a number (unitless), return it directly
    const numericLineHeight = parseFloat(lineHeight);
    if (!isNaN(numericLineHeight)) {
      // If it's in pixels, divide by font size to get ratio
      if (lineHeight.includes('px')) {
        const fontSizeValue = parseFloat(fontSize);
        return numericLineHeight / fontSizeValue;
      }
      // If it's unitless, it's already a ratio
      return numericLineHeight;
    }

    return null;
  }

  /**
   * Helper function to check if an element is a body text element
   */
  function isBodyTextElement(element: HTMLElement): boolean {
    const bodyTextTags = ['p', 'li', 'span', 'div', 'article', 'section', 'td', 'th', 'dd', 'dt', 'label'];
    const tagName = element.tagName.toLowerCase();
    
    // Check if it's a body text tag
    if (bodyTextTags.includes(tagName)) {
      // Exclude if it has heading classes
      const className = element.className || '';
      if (className.match(/text-h[1-6]|heading/)) {
        return false;
      }
      return true;
    }
    
    return false;
  }

  /**
   * Helper function to extract line-height rules from CSS
   */
  function extractLineHeightRulesFromCSS(cssContent: string): Array<{
    selector: string;
    lineHeight: string;
    isBodyText: boolean;
    isHeading: boolean;
  }> {
    const lineHeightRules: Array<{
      selector: string;
      lineHeight: string;
      isBodyText: boolean;
      isHeading: boolean;
    }> = [];

    // Match CSS rules
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(cssContent)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2];

      // Skip :root, [data-theme], @media, @keyframes
      if (
        selector.includes(':root') ||
        selector.includes('[data-theme') ||
        selector.includes('@media') ||
        selector.includes('@keyframes') ||
        selector.includes('@supports')
      ) {
        continue;
      }

      // Extract line-height property
      const lineHeightMatch = declarations.match(/line-height\s*:\s*([^;]+);/);
      if (!lineHeightMatch) {
        continue;
      }

      const lineHeight = lineHeightMatch[1].trim();

      // Determine if selector is for body text or headings
      const isHeading = /^h[1-6]|\.text-h[1-6]|heading|\.leading-tight|\.leading-snug/.test(selector);
      const isBodyText = /^p|^li|^body|\.text-(?:base|sm|lg|xl)|\.leading-(?:normal|relaxed|loose)/.test(selector) && !isHeading;

      if (isBodyText || isHeading) {
        lineHeightRules.push({
          selector,
          lineHeight,
          isBodyText,
          isHeading
        });
      }
    }

    return lineHeightRules;
  }

  /**
   * Helper function to resolve CSS variable values
   */
  function resolveCSSVariable(value: string, cssContent: string): string {
    if (!value.includes('var(--')) {
      return value;
    }

    // Extract variable name
    const varMatch = value.match(/var\((--[a-z0-9-]+)(?:,\s*([^)]+))?\)/);
    if (!varMatch) {
      return value;
    }

    const varName = varMatch[1];
    const fallback = varMatch[2];

    // Find variable definition in CSS
    const varRegex = new RegExp(`${varName}\\s*:\\s*([^;]+);`);
    const varDefMatch = cssContent.match(varRegex);

    if (varDefMatch) {
      const varValue = varDefMatch[1].trim();
      // Recursively resolve if the value is also a variable
      return resolveCSSVariable(varValue, cssContent);
    }

    // Return fallback if provided, otherwise return original
    return fallback || value;
  }

  /**
   * Helper function to parse line-height string to numeric value
   */
  function parseLineHeightValue(lineHeight: string): number | null {
    // Remove whitespace
    lineHeight = lineHeight.trim();

    // If it's a unitless number, return it directly
    const numericValue = parseFloat(lineHeight);
    if (!isNaN(numericValue) && !lineHeight.includes('px') && !lineHeight.includes('rem') && !lineHeight.includes('em')) {
      return numericValue;
    }

    // For pixel, rem, or em values, we can't determine the ratio without font-size context
    // Return null for these cases
    return null;
  }

  it('should maintain line-height between 1.5 and 1.8 for body text elements', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 4:
     * For any body text element, line-height should be between 1.5 and 1.8
     */

    const bodyTextElements = Array.from(document.querySelectorAll('p, li, span, div, article'))
      .filter((el): el is HTMLElement => el instanceof dom.window.HTMLElement)
      .filter(isBodyTextElement);

    const violations: Array<{
      tag: string;
      className: string;
      lineHeight: number;
    }> = [];

    bodyTextElements.forEach(element => {
      const lineHeight = parseLineHeight(element);
      
      if (lineHeight === null) {
        return; // Skip if couldn't parse
      }

      // Check if line-height is within range [1.5, 1.8]
      if (lineHeight < 1.5 || lineHeight > 1.8) {
        violations.push({
          tag: element.tagName.toLowerCase(),
          className: element.className || '(none)',
          lineHeight: Math.round(lineHeight * 1000) / 1000
        });
      }
    });

    // Report violations if any
    if (violations.length > 0) {
      const violationReport = violations.map(v =>
        `  - <${v.tag}${v.className !== '(none)' ? ` class="${v.className}"` : ''}>: ` +
        `line-height ${v.lineHeight} (expected: 1.5-1.8)`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} body text element(s) with line-height outside the 1.5-1.8 range:\n${violationReport}`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should maintain line-height between 1.2 and 1.4 for heading elements', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 5:
     * For any heading element, line-height should be between 1.2 and 1.4
     */

    const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, .text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6'))
      .filter((el): el is HTMLElement => el instanceof dom.window.HTMLElement);

    const violations: Array<{
      tag: string;
      className: string;
      lineHeight: number;
    }> = [];

    headingElements.forEach(element => {
      const lineHeight = parseLineHeight(element);
      
      if (lineHeight === null) {
        return; // Skip if couldn't parse
      }

      // Check if line-height is within range [1.2, 1.4]
      if (lineHeight < 1.2 || lineHeight > 1.4) {
        violations.push({
          tag: element.tagName.toLowerCase(),
          className: element.className || '(none)',
          lineHeight: Math.round(lineHeight * 1000) / 1000
        });
      }
    });

    // Report violations if any
    if (violations.length > 0) {
      const violationReport = violations.map(v =>
        `  - <${v.tag}${v.className !== '(none)' ? ` class="${v.className}"` : ''}>: ` +
        `line-height ${v.lineHeight} (expected: 1.2-1.4)`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} heading element(s) with line-height outside the 1.2-1.4 range:\n${violationReport}`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should verify line-height CSS rules for body text are within range (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 4:
     * Property-based test checking CSS rules for body text line-heights
     */

    const allCSS = styleSheets.join('\n');
    const lineHeightRules = extractLineHeightRulesFromCSS(allCSS);
    const bodyTextRules = lineHeightRules.filter(rule => rule.isBodyText);

    if (bodyTextRules.length === 0) {
      expect(true).toBe(true);
      return;
    }

    // Use fast-check to randomly sample body text rules
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: bodyTextRules.length - 1 }),
        (index) => {
          const rule = bodyTextRules[index];
          let lineHeight = resolveCSSVariable(rule.lineHeight, allCSS);
          const lineHeightValue = parseLineHeightValue(lineHeight);

          // Skip if we can't parse to a numeric ratio
          if (lineHeightValue === null) {
            return true;
          }

          // Check if line-height is within range [1.5, 1.8]
          if (lineHeightValue < 1.5 || lineHeightValue > 1.8) {
            throw new Error(
              `Body text selector "${rule.selector}" has line-height ${lineHeightValue} ` +
              `(expected: 1.5-1.8)`
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify line-height CSS rules for headings are within range (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 5:
     * Property-based test checking CSS rules for heading line-heights
     */

    const allCSS = styleSheets.join('\n');
    const lineHeightRules = extractLineHeightRulesFromCSS(allCSS);
    const headingRules = lineHeightRules.filter(rule => rule.isHeading);

    if (headingRules.length === 0) {
      expect(true).toBe(true);
      return;
    }

    // Use fast-check to randomly sample heading rules
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: headingRules.length - 1 }),
        (index) => {
          const rule = headingRules[index];
          let lineHeight = resolveCSSVariable(rule.lineHeight, allCSS);
          const lineHeightValue = parseLineHeightValue(lineHeight);

          // Skip if we can't parse to a numeric ratio
          if (lineHeightValue === null) {
            return true;
          }

          // Check if line-height is within range [1.2, 1.4]
          if (lineHeightValue < 1.2 || lineHeightValue > 1.4) {
            throw new Error(
              `Heading selector "${rule.selector}" has line-height ${lineHeightValue} ` +
              `(expected: 1.2-1.4)`
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify theme.css defines line-height variables within correct ranges', () => {
    /**
     * Validates that the theme system line-height variables are within expected ranges
     */

    const themeCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'theme.css'),
      'utf-8'
    );

    // Extract line-height variables
    const lineHeightVarRegex = /--(leading-[a-z]+|line-height-[a-z]+)\s*:\s*([0-9.]+);/g;
    const lineHeightVars: Array<{ name: string; value: number }> = [];
    let match;

    while ((match = lineHeightVarRegex.exec(themeCSS)) !== null) {
      const varName = match[1];
      const varValue = parseFloat(match[2]);
      
      lineHeightVars.push({ name: varName, value: varValue });
    }

    // Check body text line-height variables (normal, relaxed, loose)
    const bodyLineHeights = lineHeightVars.filter(v => 
      v.name.includes('normal') || 
      v.name.includes('relaxed') || 
      v.name.includes('loose') ||
      v.name.includes('line-height-body')
    );

    const bodyViolations: Array<{ name: string; value: number }> = [];
    bodyLineHeights.forEach(lh => {
      if (lh.value < 1.5 || lh.value > 1.8) {
        bodyViolations.push(lh);
      }
    });

    // Check heading line-height variables (tight, snug)
    const headingLineHeights = lineHeightVars.filter(v => 
      v.name.includes('tight') || 
      v.name.includes('snug') ||
      v.name.includes('line-height-heading')
    );

    const headingViolations: Array<{ name: string; value: number }> = [];
    headingLineHeights.forEach(lh => {
      if (lh.value < 1.2 || lh.value > 1.4) {
        headingViolations.push(lh);
      }
    });

    // Report violations
    const allViolations = [...bodyViolations, ...headingViolations];
    if (allViolations.length > 0) {
      const report = [
        ...bodyViolations.map(v => `  - ${v.name}: ${v.value} (expected: 1.5-1.8 for body text)`),
        ...headingViolations.map(v => `  - ${v.name}: ${v.value} (expected: 1.2-1.4 for headings)`)
      ].join('\n');

      expect.fail(`Theme line-height variables outside expected ranges:\n${report}`);
    }

    expect(allViolations.length).toBe(0);
  });

  it('should verify all line-height values in typography.css are within appropriate ranges', () => {
    /**
     * Validates that typography.css uses appropriate line-height values
     */

    const typographyCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'typography.css'),
      'utf-8'
    );

    const lineHeightRules = extractLineHeightRulesFromCSS(typographyCSS);
    const violations: Array<{ selector: string; lineHeight: string; expected: string }> = [];

    lineHeightRules.forEach(rule => {
      const lineHeight = resolveCSSVariable(rule.lineHeight, typographyCSS);
      const lineHeightValue = parseLineHeightValue(lineHeight);

      if (lineHeightValue === null) {
        return; // Skip if can't parse
      }

      // Check body text rules
      if (rule.isBodyText && (lineHeightValue < 1.5 || lineHeightValue > 1.8)) {
        violations.push({
          selector: rule.selector,
          lineHeight: lineHeightValue.toString(),
          expected: '1.5-1.8 (body text)'
        });
      }

      // Check heading rules
      if (rule.isHeading && (lineHeightValue < 1.2 || lineHeightValue > 1.4)) {
        violations.push({
          selector: rule.selector,
          lineHeight: lineHeightValue.toString(),
          expected: '1.2-1.4 (heading)'
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - ${v.selector}: line-height ${v.lineHeight} (expected: ${v.expected})`
      ).join('\n');

      expect.fail(`Typography.css line-height violations:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });
});
