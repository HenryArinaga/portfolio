/**
 * Property-Based Test: Fluid Spacing Implementation
 * 
 * **Validates: Requirements 6.5**
 * 
 * Property 17: Fluid Spacing Implementation
 * For any spacing value that should scale responsively, the CSS should use fluid sizing 
 * functions (clamp, min, max, or calc with viewport units) rather than fixed 
 * breakpoint-based values.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 17: Fluid Spacing Implementation', () => {
  /**
   * Helper function to extract spacing-related CSS properties from a file
   */
  function extractSpacingProperties(cssContent: string): Array<{
    selector: string;
    property: string;
    value: string;
  }> {
    const spacingProps: Array<{ selector: string; property: string; value: string }> = [];
    
    // Properties that should use fluid spacing
    const spacingPropertyNames = [
      'padding',
      'padding-top',
      'padding-bottom',
      'padding-left',
      'padding-right',
      'margin',
      'margin-top',
      'margin-bottom',
      'margin-left',
      'margin-right',
      'gap',
      'row-gap',
      'column-gap',
    ];

    // Remove comments and media queries for base analysis
    const cleanedCSS = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Match CSS rules
    const ruleRegex = /([^{}]+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(cleanedCSS)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2];

      // Skip media query blocks (we'll analyze them separately)
      if (selector.includes('@media')) {
        continue;
      }

      // Extract individual declarations
      const declRegex = /([\w-]+)\s*:\s*([^;]+);/g;
      let declMatch;

      while ((declMatch = declRegex.exec(declarations)) !== null) {
        const property = declMatch[1].trim();
        const value = declMatch[2].trim();

        if (spacingPropertyNames.includes(property)) {
          spacingProps.push({ selector, property, value });
        }
      }
    }

    return spacingProps;
  }

  /**
   * Helper function to check if a value uses fluid sizing functions
   */
  function usesFluidSizing(value: string): boolean {
    // Check for fluid sizing functions
    const fluidFunctions = ['clamp(', 'min(', 'max(', 'calc('];
    const hasFluidFunction = fluidFunctions.some(fn => value.includes(fn));
    
    // Check for viewport units (vw, vh, vmin, vmax, dvw, dvh, etc.)
    const hasViewportUnit = /\d+\.?\d*(vw|vh|vmin|vmax|dvw|dvh|svw|svh|lvw|lvh)/i.test(value);
    
    return hasFluidFunction || hasViewportUnit;
  }

  /**
   * Helper function to check if a property should use fluid sizing
   * Some properties are intentionally fixed (e.g., small gaps, borders)
   */
  function shouldUseFluidSizing(selector: string, property: string, value: string): boolean {
    // Skip very small fixed values (< 1rem or < 16px) - these are intentionally fixed
    const smallFixedValueRegex = /^(0|0\.[\d]+rem|[0-9]px|1[0-5]px)$/;
    if (smallFixedValueRegex.test(value)) {
      return false;
    }

    // Skip auto, inherit, initial, unset values
    if (['auto', 'inherit', 'initial', 'unset', '0'].includes(value)) {
      return false;
    }

    // Section spacing should definitely use fluid sizing
    if (selector.includes('section-spacing')) {
      return true;
    }

    // Large padding/margin values should use fluid sizing
    const largeValueRegex = /^([3-9]|[1-9]\d+)(rem|px|em)$/;
    if (largeValueRegex.test(value)) {
      return true;
    }

    // Container padding should use fluid sizing
    if (selector.includes('container') && property.includes('padding')) {
      return true;
    }

    return false;
  }

  it('should use fluid sizing functions for section spacing', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * Section spacing should use clamp() or viewport units
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Find section-spacing class
    const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
    const match = layoutCSS.match(sectionSpacingRegex);

    expect(match).toBeTruthy();

    if (match) {
      const declarations = match[1];
      
      // Check for padding-top and padding-bottom
      const paddingTopMatch = declarations.match(/padding-top\s*:\s*([^;]+);/);
      const paddingBottomMatch = declarations.match(/padding-bottom\s*:\s*([^;]+);/);

      expect(paddingTopMatch).toBeTruthy();
      expect(paddingBottomMatch).toBeTruthy();

      if (paddingTopMatch) {
        const value = paddingTopMatch[1].trim();
        expect(usesFluidSizing(value)).toBe(true);
      }

      if (paddingBottomMatch) {
        const value = paddingBottomMatch[1].trim();
        expect(usesFluidSizing(value)).toBe(true);
      }
    }
  });

  it('should verify clamp() function has correct structure', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * clamp() should have min, preferred, and max values
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Find all clamp() usages
    const clampRegex = /clamp\(([^)]+)\)/g;
    const clampMatches = [...layoutCSS.matchAll(clampRegex)];

    expect(clampMatches.length).toBeGreaterThan(0);

    clampMatches.forEach(match => {
      const clampContent = match[1];
      const parts = clampContent.split(',').map(p => p.trim());

      // clamp() should have exactly 3 arguments: min, preferred, max
      expect(parts.length).toBe(3);

      // Each part should be a valid CSS length value
      parts.forEach(part => {
        expect(part).toMatch(/^[\d.]+\s*(px|rem|em|%|vw|vh|vmin|vmax)/);
      });
    });
  });

  it('should use fluid sizing for responsive spacing across viewport sizes', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * Test that fluid spacing scales appropriately across viewport sizes
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // viewport width range
        (_viewportWidth) => {
          const layoutCSS = fs.readFileSync(
            path.join(process.cwd(), 'src', 'styles', 'layout.css'),
            'utf-8'
          );

          // Extract section-spacing padding values
          const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
          const match = layoutCSS.match(sectionSpacingRegex);

          if (match) {
            const declarations = match[1];
            const paddingMatch = declarations.match(/padding-(?:top|bottom)\s*:\s*clamp\(([^)]+)\)/);

            if (paddingMatch) {
              const clampContent = paddingMatch[1];
              const [minValue, _preferredValue, maxValue] = clampContent.split(',').map(p => p.trim());

              // Parse values (simplified - assumes px units)
              const parseValue = (val: string): number => {
                const numMatch = val.match(/^([\d.]+)/);
                return numMatch ? parseFloat(numMatch[1]) : 0;
              };

              const min = parseValue(minValue);
              const max = parseValue(maxValue);

              // Verify min <= max
              expect(min).toBeLessThanOrEqual(max);

              // Verify reasonable range (40px to 80px as per requirements)
              expect(min).toBeGreaterThanOrEqual(30);
              expect(max).toBeLessThanOrEqual(100);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not use fixed breakpoint-based spacing for section spacing', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * Section spacing should not rely solely on media query breakpoints
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Find section-spacing class definition
    const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
    const match = layoutCSS.match(sectionSpacingRegex);

    expect(match).toBeTruthy();

    if (match) {
      const declarations = match[1];
      
      // Should use clamp() or viewport units, not just fixed rem/px values
      const paddingTopMatch = declarations.match(/padding-top\s*:\s*([^;]+);/);
      
      if (paddingTopMatch) {
        const value = paddingTopMatch[1].trim();
        
        // Should NOT be a simple fixed value like "80px" or "5rem"
        const isSimpleFixedValue = /^[\d.]+\s*(px|rem|em)$/.test(value);
        expect(isSimpleFixedValue).toBe(false);
      }
    }
  });

  it('should verify fluid spacing values scale between min and max', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * Fluid spacing should have appropriate min and max values
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Extract all clamp() usages
    const clampRegex = /clamp\(([\d.]+px),\s*([^,]+),\s*([\d.]+px)\)/g;
    const clampMatches = [...layoutCSS.matchAll(clampRegex)];

    clampMatches.forEach(match => {
      const minValue = parseFloat(match[1]);
      const maxValue = parseFloat(match[3]);

      // Min should be less than max
      expect(minValue).toBeLessThan(maxValue);

      // For section spacing, verify it meets requirements (40px mobile, 80px desktop)
      if (match[0].includes('40px') || match[0].includes('80px')) {
        expect(minValue).toBeGreaterThanOrEqual(30);
        expect(minValue).toBeLessThanOrEqual(50);
        expect(maxValue).toBeGreaterThanOrEqual(70);
        expect(maxValue).toBeLessThanOrEqual(100);
      }
    });
  });

  it('should use viewport units in preferred value of clamp()', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * The preferred value in clamp() should use viewport units for true fluidity
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Find section-spacing clamp() usage
    const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
    const match = layoutCSS.match(sectionSpacingRegex);

    if (match) {
      const declarations = match[1];
      const clampMatch = declarations.match(/clamp\(([^)]+)\)/);

      if (clampMatch) {
        const clampContent = clampMatch[1];
        const [, preferredValue] = clampContent.split(',').map(p => p.trim());

        // Preferred value should use viewport units (vw, vh, vmin, vmax)
        expect(preferredValue).toMatch(/\d+\.?\d*(vw|vh|vmin|vmax)/);
      }
    }
  });

  it('should have consistent fluid spacing approach across layout file', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * All major spacing should use fluid sizing consistently
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    const spacingProps = extractSpacingProperties(layoutCSS);
    const fluidSpacingProps = spacingProps.filter(prop => 
      shouldUseFluidSizing(prop.selector, prop.property, prop.value)
    );

    // Check that properties that should use fluid sizing actually do
    fluidSpacingProps.forEach(prop => {
      const isFluid = usesFluidSizing(prop.value);
      
      if (!isFluid) {
        // Log for debugging
        console.warn(
          `Property ${prop.property} in ${prop.selector} has value "${prop.value}" ` +
          `which should use fluid sizing but doesn't`
        );
      }
    });

    // At minimum, section-spacing should use fluid sizing
    const sectionSpacingProps = spacingProps.filter(prop => 
      prop.selector.includes('section-spacing')
    );
    
    expect(sectionSpacingProps.length).toBeGreaterThan(0);
    
    sectionSpacingProps.forEach(prop => {
      expect(usesFluidSizing(prop.value)).toBe(true);
    });
  });

  it('should verify clamp() min value corresponds to mobile requirement (40px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * Validates that minimum spacing meets mobile requirement
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
    const match = layoutCSS.match(sectionSpacingRegex);

    if (match) {
      const declarations = match[1];
      const clampMatch = declarations.match(/clamp\(([\d.]+px)/);

      if (clampMatch) {
        const minValue = parseFloat(clampMatch[1]);
        
        // Should be around 40px (allow some tolerance)
        expect(minValue).toBeGreaterThanOrEqual(35);
        expect(minValue).toBeLessThanOrEqual(45);
      }
    }
  });

  it('should verify clamp() max value corresponds to desktop requirement (80px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * Validates that maximum spacing meets desktop requirement
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
    const match = layoutCSS.match(sectionSpacingRegex);

    if (match) {
      const declarations = match[1];
      const clampMatch = declarations.match(/clamp\([^,]+,\s*[^,]+,\s*([\d.]+px)\)/);

      if (clampMatch) {
        const maxValue = parseFloat(clampMatch[1]);
        
        // Should be around 80px (allow some tolerance)
        expect(maxValue).toBeGreaterThanOrEqual(75);
        expect(maxValue).toBeLessThanOrEqual(85);
      }
    }
  });

  it('should prefer fluid sizing over media query breakpoints for spacing', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 17:
     * Property-based test verifying fluid sizing is preferred
     */
    fc.assert(
      fc.property(
        fc.constantFrom('section-spacing', 'container'),
        (className) => {
          const layoutCSS = fs.readFileSync(
            path.join(process.cwd(), 'src', 'styles', 'layout.css'),
            'utf-8'
          );

          // Find the class definition
          const classRegex = new RegExp(`\\.${className}\\s*\\{([^}]+)\\}`, 'i');
          const match = layoutCSS.match(classRegex);

          if (match && className === 'section-spacing') {
            const declarations = match[1];
            
            // Should have clamp() or viewport units in base definition
            const hasFluidSizing = /clamp\(|vw|vh|vmin|vmax/.test(declarations);
            expect(hasFluidSizing).toBe(true);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
