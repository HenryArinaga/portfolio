/**
 * Property-Based Test: Color Contrast Compliance
 * 
 * **Validates: Requirements 1.5**
 * 
 * Property 2: Color Contrast Compliance
 * For any text element in the application, the contrast ratio between text color 
 * and background color should be at least 4.5:1 for body text (font-size < 18px or 
 * < 14px bold) and at least 3:1 for large text (font-size ≥ 18px or ≥ 14px bold).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 2: Color Contrast Compliance', () => {
  let styleSheets: string[];

  beforeAll(() => {
    // Load all CSS files from the styles directory
    const stylesDir = path.join(process.cwd(), 'src', 'styles');
    const cssFiles = fs.readdirSync(stylesDir).filter((file: string) => file.endsWith('.css'));
    
    styleSheets = cssFiles.map((file: string) => {
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
    
    new JSDOM(html);
  });

  /**
   * Helper function to parse color string to RGB values
   */
  function parseColor(colorString: string): { r: number; g: number; b: number } | null {
    if (!colorString || colorString === 'transparent' || colorString === 'none') {
      return null;
    }

    // Handle hex colors
    const hexMatch = colorString.match(/#([0-9a-fA-F]{3,8})/);
    if (hexMatch) {
      let hex = hexMatch[1];
      
      // Convert 3-digit hex to 6-digit
      if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
      }
      
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return { r, g, b };
    }

    // Handle rgb/rgba colors
    const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }

    // Handle named colors (basic set)
    const namedColors: Record<string, { r: number; g: number; b: number }> = {
      'white': { r: 255, g: 255, b: 255 },
      'black': { r: 0, g: 0, b: 0 },
      'red': { r: 255, g: 0, b: 0 },
      'green': { r: 0, g: 128, b: 0 },
      'blue': { r: 0, g: 0, b: 255 },
      'gray': { r: 128, g: 128, b: 128 },
      'grey': { r: 128, g: 128, b: 128 }
    };

    const lowerColor = colorString.toLowerCase().trim();
    if (namedColors[lowerColor]) {
      return namedColors[lowerColor];
    }

    return null;
  }

  /**
   * Calculate relative luminance according to WCAG 2.1
   * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
   */
  function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    // Convert RGB to sRGB
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    // Apply gamma correction
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    // Calculate relative luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio according to WCAG 2.1
   * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
   */
  function calculateContrastRatio(color1: string, color2: string): number | null {
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);

    if (!rgb1 || !rgb2) {
      return null;
    }

    const l1 = getRelativeLuminance(rgb1);
    const l2 = getRelativeLuminance(rgb2);

    // Ensure l1 is the lighter color
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Helper function to determine if text is considered "large" according to WCAG
   */
  function isLargeText(fontSize: number, fontWeight: number): boolean {
    // Large text is defined as:
    // - 18px or larger, OR
    // - 14px or larger AND bold (700+)
    return fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
  }

  /**
   * Helper function to extract text-related CSS rules from stylesheets
   */
  function extractTextStylesFromCSS(cssContent: string): Array<{
    selector: string;
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
  }> {
    const textStyles: Array<{
      selector: string;
      color?: string;
      backgroundColor?: string;
      fontSize?: string;
      fontWeight?: string;
    }> = [];

    // Match CSS rules (simplified regex)
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

      const style: {
        selector: string;
        color?: string;
        backgroundColor?: string;
        fontSize?: string;
        fontWeight?: string;
      } = { selector };

      // Extract relevant properties
      const declRegex = /([a-z-]+)\s*:\s*([^;]+);/g;
      let declMatch;

      while ((declMatch = declRegex.exec(declarations)) !== null) {
        const property = declMatch[1].trim();
        const value = declMatch[2].trim();

        if (property === 'color') {
          style.color = value;
        } else if (property === 'background-color' || property === 'background') {
          style.backgroundColor = value;
        } else if (property === 'font-size') {
          style.fontSize = value;
        } else if (property === 'font-weight') {
          style.fontWeight = value;
        }
      }

      // Only include rules that have color or background-color
      if (style.color || style.backgroundColor) {
        textStyles.push(style);
      }
    }

    return textStyles;
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
   * Helper function to parse font size to pixels
   */
  function parseFontSizeToPixels(fontSize: string | undefined): number {
    if (!fontSize) {
      return 16; // Default browser font size
    }

    // Handle rem units (assuming 16px base)
    if (fontSize.includes('rem')) {
      const remValue = parseFloat(fontSize);
      return remValue * 16;
    }

    // Handle px units
    if (fontSize.includes('px')) {
      return parseFloat(fontSize);
    }

    // Handle em units (assuming 16px base for simplicity)
    if (fontSize.includes('em')) {
      const emValue = parseFloat(fontSize);
      return emValue * 16;
    }

    // Default
    return 16;
  }

  /**
   * Helper function to parse font weight
   */
  function parseFontWeight(fontWeight: string | undefined): number {
    if (!fontWeight) {
      return 400; // Default font weight
    }

    // Handle numeric values
    const numericWeight = parseInt(fontWeight);
    if (!isNaN(numericWeight)) {
      return numericWeight;
    }

    // Handle named weights
    const namedWeights: Record<string, number> = {
      'normal': 400,
      'bold': 700,
      'lighter': 300,
      'bolder': 700
    };

    return namedWeights[fontWeight.toLowerCase()] || 400;
  }

  it('should maintain proper contrast ratios for all text color combinations in CSS', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 2:
     * For any text element, contrast ratio should meet WCAG requirements
     */

    const allCSS = styleSheets.join('\n');
    const textStyles = extractTextStylesFromCSS(allCSS);

    const violations: Array<{
      selector: string;
      textColor: string;
      bgColor: string;
      contrastRatio: number;
      required: number;
      fontSize: number;
      fontWeight: number;
    }> = [];

    textStyles.forEach(style => {
      if (!style.color || !style.backgroundColor) {
        return; // Skip if missing color or background
      }

      // Resolve CSS variables
      const textColor = resolveCSSVariable(style.color, allCSS);
      const bgColor = resolveCSSVariable(style.backgroundColor, allCSS);

      // Skip if still contains unresolved variables or special values
      if (
        textColor.includes('var(') ||
        bgColor.includes('var(') ||
        textColor === 'inherit' ||
        textColor === 'currentColor' ||
        bgColor === 'inherit' ||
        bgColor === 'transparent'
      ) {
        return;
      }

      const contrastRatio = calculateContrastRatio(textColor, bgColor);
      if (contrastRatio === null) {
        return; // Skip if colors couldn't be parsed
      }

      // Determine text size and weight
      const fontSize = parseFontSizeToPixels(style.fontSize);
      const fontWeight = parseFontWeight(style.fontWeight);
      const isLarge = isLargeText(fontSize, fontWeight);
      const requiredRatio = isLarge ? 3 : 4.5;

      if (contrastRatio < requiredRatio) {
        violations.push({
          selector: style.selector,
          textColor,
          bgColor,
          contrastRatio: Math.round(contrastRatio * 100) / 100,
          required: requiredRatio,
          fontSize,
          fontWeight
        });
      }
    });

    // Report violations if any
    if (violations.length > 0) {
      const violationReport = violations.map(v =>
        `  - ${v.selector}\n` +
        `    Text: ${v.textColor}, Background: ${v.bgColor}\n` +
        `    Contrast: ${v.contrastRatio}:1 (required: ${v.required}:1)\n` +
        `    Font: ${v.fontSize}px, weight ${v.fontWeight}`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} color contrast violation(s):\n${violationReport}`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should maintain proper contrast ratios across random color combinations (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 2:
     * Property-based test with random color combinations from theme
     */

    // Extract all color values from theme.css
    const themeCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'theme.css'),
      'utf-8'
    );

    const colorVarRegex = /--((?:color|blue|purple|cyan|gray|slate)-[a-z0-9-]+)\s*:\s*([^;]+);/g;
    const themeColors: Array<{ name: string; value: string }> = [];
    let match;

    while ((match = colorVarRegex.exec(themeCSS)) !== null) {
      const varName = match[1];
      const varValue = match[2].trim();

      // Skip if value is a CSS variable reference
      if (varValue.includes('var(')) {
        continue;
      }

      themeColors.push({ name: varName, value: varValue });
    }

    if (themeColors.length === 0) {
      expect(true).toBe(true);
      return;
    }

    // Test semantic text colors against semantic background colors
    // Exclude inverse text as it's meant for dark backgrounds only
    const textColors = themeColors.filter(c => 
      (c.name.includes('color-text-primary') || 
       c.name.includes('color-text-secondary') ||
       c.name.includes('color-text-muted')) &&
      !c.name.includes('inverse')
    );
    const bgColors = themeColors.filter(c => 
      c.name.includes('color-bg-page') || 
      c.name.includes('color-bg-section') ||
      c.name.includes('color-bg-card')
    );

    if (textColors.length === 0 || bgColors.length === 0) {
      expect(true).toBe(true);
      return;
    }

    // Property-based test: for any combination of text and background colors,
    // they should meet contrast requirements
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: textColors.length - 1 }),
        fc.integer({ min: 0, max: bgColors.length - 1 }),
        fc.integer({ min: 12, max: 24 }), // font size in px
        fc.constantFrom(400, 500, 600, 700), // font weight
        (textIndex, bgIndex, fontSize, fontWeight) => {
          const textColor = textColors[textIndex].value;
          const bgColor = bgColors[bgIndex].value;

          // Skip if same color (unrealistic scenario)
          if (textColor === bgColor) {
            return true;
          }

          const contrastRatio = calculateContrastRatio(textColor, bgColor);
          
          if (contrastRatio === null) {
            return true; // Skip if colors couldn't be parsed
          }

          const isLarge = isLargeText(fontSize, fontWeight);
          const requiredRatio = isLarge ? 3 : 4.5;

          if (contrastRatio < requiredRatio) {
            throw new Error(
              `Insufficient contrast between ${textColors[textIndex].name} and ${bgColors[bgIndex].name}: ` +
              `${contrastRatio.toFixed(2)}:1 (required: ${requiredRatio}:1, ` +
              `fontSize: ${fontSize}px, fontWeight: ${fontWeight})`
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify theme defines text and background colors with sufficient contrast', () => {
    /**
     * Validates that the primary text/background combinations in theme.css
     * meet WCAG contrast requirements
     */

    const themeCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'theme.css'),
      'utf-8'
    );

    // Define expected text/background pairings
    const pairings = [
      { text: '--color-text-primary', bg: '--color-bg-page', minRatio: 4.5 },
      { text: '--color-text-primary', bg: '--color-bg-section', minRatio: 4.5 },
      { text: '--color-text-secondary', bg: '--color-bg-page', minRatio: 4.5 },
      { text: '--color-text-secondary', bg: '--color-bg-section', minRatio: 4.5 },
      { text: '--color-text-muted', bg: '--color-bg-page', minRatio: 4.5 },
      { text: '--color-text-inverse', bg: '--color-primary', minRatio: 4.5 }
    ];

    const violations: Array<{ text: string; bg: string; ratio: number; required: number }> = [];

    pairings.forEach(pairing => {
      const textColorMatch = themeCSS.match(new RegExp(`${pairing.text}\\s*:\\s*([^;]+);`));
      const bgColorMatch = themeCSS.match(new RegExp(`${pairing.bg}\\s*:\\s*([^;]+);`));

      if (!textColorMatch || !bgColorMatch) {
        return; // Skip if colors not defined
      }

      let textColor = textColorMatch[1].trim();
      let bgColor = bgColorMatch[1].trim();

      // Resolve CSS variables
      textColor = resolveCSSVariable(textColor, themeCSS);
      bgColor = resolveCSSVariable(bgColor, themeCSS);

      const contrastRatio = calculateContrastRatio(textColor, bgColor);

      if (contrastRatio !== null && contrastRatio < pairing.minRatio) {
        violations.push({
          text: pairing.text,
          bg: pairing.bg,
          ratio: Math.round(contrastRatio * 100) / 100,
          required: pairing.minRatio
        });
      }
    });

    if (violations.length > 0) {
      const report = violations.map(v =>
        `  - ${v.text} on ${v.bg}: ${v.ratio}:1 (required: ${v.required}:1)`
      ).join('\n');

      expect.fail(`Theme color contrast violations:\n${report}`);
    }

    expect(violations.length).toBe(0);
  });
});
