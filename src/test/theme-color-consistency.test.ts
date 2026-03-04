/**
 * Property-Based Test: Theme Color Consistency
 * 
 * **Validates: Requirements 7.4**
 * 
 * Property 18: Theme Color Consistency
 * For any component or section, color values should reference CSS custom properties 
 * (variables) from the theme system rather than hardcoded color values, ensuring consistency.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 18: Theme Color Consistency', () => {
  let dom: JSDOM;
  let document: Document;
  let styleSheets: string[];

  beforeAll(() => {
    // Load all CSS files from the styles directory
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    const cssFiles = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));
    
    styleSheets = cssFiles.map(file => {
      const filePath = path.join(stylesDir, file);
      return fs.readFileSync(filePath, 'utf-8');
    });

    // Create a JSDOM instance with the theme CSS
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${styleSheets.join('\n')}</style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `;
    
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  /**
   * Helper function to check if a color value is valid (uses CSS variables or allowed values)
   */
  function isValidColorValue(value: string): boolean {
    if (!value || value === 'none' || value === 'transparent') {
      return true;
    }

    // Allow CSS custom properties (variables)
    if (value.includes('var(--')) {
      return true;
    }

    // Allow inherit and currentColor
    if (value === 'inherit' || value === 'currentColor' || value === 'initial' || value === 'unset') {
      return true;
    }

    // Allow rgba with 0 alpha (transparent)
    if (value.match(/rgba?\([^)]*,\s*0\)/)) {
      return true;
    }

    // Disallow hardcoded color values
    // Hex colors: #fff, #ffffff, #ffffffff
    if (value.match(/#[0-9a-fA-F]{3,8}/)) {
      return false;
    }

    // RGB/RGBA colors: rgb(255, 255, 255), rgba(255, 255, 255, 1)
    if (value.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/)) {
      return false;
    }

    // HSL/HSLA colors: hsl(0, 0%, 100%), hsla(0, 0%, 100%, 1)
    if (value.match(/hsla?\(/)) {
      return false;
    }

    // Named colors (basic check for common color names)
    const namedColors = [
      'white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
      'teal', 'aqua', 'maroon', 'olive', 'silver', 'fuchsia'
    ];
    
    if (namedColors.includes(value.toLowerCase())) {
      return false;
    }

    return true;
  }

  /**
   * Helper function to extract color properties from CSS rules
   */
  function extractColorPropertiesFromCSS(cssContent: string): Array<{ property: string; value: string; context: string }> {
    const colorProperties: Array<{ property: string; value: string; context: string }> = [];
    const colorProps = ['color', 'background-color', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'];
    
    // Match CSS rules (simplified regex)
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(cssContent)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2];

      // Skip :root and [data-theme] declarations as they define the variables
      if (selector.includes(':root') || selector.includes('[data-theme')) {
        continue;
      }

      // Skip media queries and keyframes
      if (selector.includes('@media') || selector.includes('@keyframes')) {
        continue;
      }

      // Extract color property declarations
      const declRegex = /([a-z-]+)\s*:\s*([^;]+);/g;
      let declMatch;

      while ((declMatch = declRegex.exec(declarations)) !== null) {
        const property = declMatch[1].trim();
        const value = declMatch[2].trim();

        if (colorProps.includes(property)) {
          colorProperties.push({
            property,
            value,
            context: selector
          });
        }
      }
    }

    return colorProperties;
  }

  it('should use CSS custom properties for all color values in stylesheets', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 18:
     * For any component or section, color values should reference CSS custom properties
     */
    
    const allColorProperties: Array<{ property: string; value: string; context: string; file: string }> = [];

    // Extract color properties from all CSS files
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    const cssFiles = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));

    cssFiles.forEach(file => {
      const filePath = path.join(stylesDir, file);
      const cssContent = fs.readFileSync(filePath, 'utf-8');
      const colorProps = extractColorPropertiesFromCSS(cssContent);
      
      colorProps.forEach(prop => {
        allColorProperties.push({ ...prop, file });
      });
    });

    // Check each color property
    const violations: Array<{ file: string; context: string; property: string; value: string }> = [];

    allColorProperties.forEach(({ file, context, property, value }) => {
      if (!isValidColorValue(value)) {
        violations.push({ file, context, property, value });
      }
    });

    // Report violations if any
    if (violations.length > 0) {
      const violationReport = violations.map(v => 
        `  - ${v.file}: ${v.context} { ${v.property}: ${v.value}; }`
      ).join('\n');
      
      expect.fail(
        `Found ${violations.length} hardcoded color value(s) that should use CSS custom properties:\n${violationReport}`
      );
    }

    // If no violations, test passes
    expect(violations.length).toBe(0);
  });

  it('should use CSS custom properties for color values across random CSS selectors (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 18:
     * Property-based test with random sampling of CSS rules
     */
    
    const allColorProperties: Array<{ property: string; value: string; context: string }> = [];

    styleSheets.forEach(cssContent => {
      const colorProps = extractColorPropertiesFromCSS(cssContent);
      allColorProperties.push(...colorProps);
    });

    // If no color properties found, skip the test
    if (allColorProperties.length === 0) {
      expect(true).toBe(true);
      return;
    }

    // Use fast-check to randomly sample color properties
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: allColorProperties.length - 1 }),
        (index) => {
          const { property, value, context } = allColorProperties[index];
          
          const isValid = isValidColorValue(value);
          
          if (!isValid) {
            throw new Error(
              `Hardcoded color found in "${context}": ${property}: ${value}. ` +
              `Should use CSS custom property (var(--color-*)) instead.`
            );
          }

          return isValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify theme.css defines required color custom properties', () => {
    /**
     * Validates that the theme system has the necessary CSS custom properties defined
     */
    
    const themeCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'theme.css'),
      'utf-8'
    );

    // Check for essential color custom properties
    const requiredColorVars = [
      '--color-primary',
      '--color-secondary',
      '--color-accent',
      '--color-bg-page',
      '--color-bg-section',
      '--color-text-primary',
      '--color-text-secondary',
      '--color-border-default',
      '--color-interactive-default',
      '--color-interactive-hover'
    ];

    const missingVars = requiredColorVars.filter(varName => 
      !themeCSS.includes(varName)
    );

    expect(missingVars).toEqual([]);
  });

  it('should not use hardcoded colors in component-specific styles', () => {
    /**
     * Checks that component styles use theme variables
     */
    
    // Get all CSS files except theme.css (which defines the variables)
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    const cssFiles = fs.readdirSync(stylesDir)
      .filter(file => file.endsWith('.css') && file !== 'theme.css');

    const violations: Array<{ file: string; issue: string }> = [];

    cssFiles.forEach(file => {
      const filePath = path.join(stylesDir, file);
      const cssContent = fs.readFileSync(filePath, 'utf-8');

      // Check for common hardcoded color patterns
      const hexColorMatches = cssContent.match(/#[0-9a-fA-F]{3,8}/g);
      const rgbMatches = cssContent.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g);
      const hslMatches = cssContent.match(/hsla?\(/g);

      if (hexColorMatches) {
        // Filter out colors in comments
        const nonCommentHex = hexColorMatches.filter(hex => {
          const index = cssContent.indexOf(hex);
          const beforeHex = cssContent.substring(Math.max(0, index - 50), index);
          return !beforeHex.includes('/*') || beforeHex.lastIndexOf('*/') > beforeHex.lastIndexOf('/*');
        });

        if (nonCommentHex.length > 0) {
          violations.push({
            file,
            issue: `Found ${nonCommentHex.length} hex color(s): ${nonCommentHex.slice(0, 3).join(', ')}`
          });
        }
      }

      if (rgbMatches && rgbMatches.length > 0) {
        // Filter out rgba with 0 alpha (transparent)
        const nonTransparentRgb = rgbMatches.filter(rgb => !rgb.match(/,\s*0\s*$/));
        if (nonTransparentRgb.length > 0) {
          violations.push({
            file,
            issue: `Found ${nonTransparentRgb.length} rgb/rgba color(s)`
          });
        }
      }

      if (hslMatches && hslMatches.length > 0) {
        violations.push({
          file,
          issue: `Found ${hslMatches.length} hsl/hsla color(s)`
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v => `  - ${v.file}: ${v.issue}`).join('\n');
      expect.fail(`Found hardcoded colors in component styles:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });
});
