/**
 * Property-Based Test: Section Spacing Constraints
 * 
 * **Validates: Requirements 1.2**
 * 
 * Property 1: Section Spacing Constraints
 * For any viewport size, section spacing should meet minimum requirements: 
 * at least 80px on desktop viewports (≥1024px) and at least 40px on mobile 
 * viewports (<768px).
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 1: Section Spacing Constraints', () => {
  /**
   * Helper function to parse clamp() values and calculate spacing at viewport width
   */
  function calculateClampValue(
    clampStr: string,
    viewportWidth: number
  ): number {
    // Parse clamp(min, preferred, max)
    const match = clampStr.match(/clamp\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    
    if (!match) {
      // If not a clamp, try to parse as fixed value
      const pxMatch = clampStr.match(/([\d.]+)px/);
      if (pxMatch) {
        return parseFloat(pxMatch[1]);
      }
      return 0;
    }

    const [, minStr, preferredStr, maxStr] = match;
    
    // Parse min and max values (in px)
    const minValue = parseFloat(minStr.match(/([\d.]+)/)?.[1] || '0');
    const maxValue = parseFloat(maxStr.match(/([\d.]+)/)?.[1] || '0');
    
    // Parse preferred value (usually with vw)
    const preferredMatch = preferredStr.match(/([\d.]+)vw/);
    if (preferredMatch) {
      const vwValue = parseFloat(preferredMatch[1]);
      const preferredPx = (viewportWidth * vwValue) / 100;
      
      // clamp returns: max(min, min(preferred, max))
      return Math.max(minValue, Math.min(preferredPx, maxValue));
    }
    
    // Fallback to min value if can't parse preferred
    return minValue;
  }

  /**
   * Helper function to extract section spacing from CSS
   */
  function getSectionSpacing(viewportWidth: number): {
    paddingTop: number;
    paddingBottom: number;
  } {
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Find .section-spacing class
    const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
    const match = layoutCSS.match(sectionSpacingRegex);

    if (!match) {
      throw new Error('section-spacing class not found in layout.css');
    }

    const declarations = match[1];
    
    // Extract padding-top
    const paddingTopMatch = declarations.match(/padding-top\s*:\s*([^;]+);/);
    const paddingBottomMatch = declarations.match(/padding-bottom\s*:\s*([^;]+);/);

    const paddingTop = paddingTopMatch
      ? calculateClampValue(paddingTopMatch[1].trim(), viewportWidth)
      : 0;
    
    const paddingBottom = paddingBottomMatch
      ? calculateClampValue(paddingBottomMatch[1].trim(), viewportWidth)
      : 0;

    return { paddingTop, paddingBottom };
  }

  it('should meet minimum spacing of 40px on mobile viewports (<768px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Section spacing should be at least 40px on mobile
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // mobile viewport range
        (viewportWidth) => {
          const spacing = getSectionSpacing(viewportWidth);
          
          expect(spacing.paddingTop).toBeGreaterThanOrEqual(40);
          expect(spacing.paddingBottom).toBeGreaterThanOrEqual(40);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should meet minimum spacing of 80px on desktop viewports (≥1024px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Section spacing should be at least 80px on desktop
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1024, max: 2560 }), // desktop viewport range
        (viewportWidth) => {
          const spacing = getSectionSpacing(viewportWidth);
          
          expect(spacing.paddingTop).toBeGreaterThanOrEqual(80);
          expect(spacing.paddingBottom).toBeGreaterThanOrEqual(80);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have consistent spacing for top and bottom padding', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Top and bottom padding should be equal for visual consistency
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // all viewport sizes
        (viewportWidth) => {
          const spacing = getSectionSpacing(viewportWidth);
          
          // Top and bottom should be equal (or very close due to rounding)
          expect(Math.abs(spacing.paddingTop - spacing.paddingBottom)).toBeLessThan(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should scale smoothly between mobile and desktop breakpoints', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Spacing should increase monotonically as viewport width increases
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        fc.integer({ min: 1, max: 500 }), // delta to add to first viewport
        (viewportWidth1, delta) => {
          const viewportWidth2 = Math.min(viewportWidth1 + delta, 2560);
          
          const spacing1 = getSectionSpacing(viewportWidth1);
          const spacing2 = getSectionSpacing(viewportWidth2);
          
          // Spacing should not decrease as viewport increases
          expect(spacing2.paddingTop).toBeGreaterThanOrEqual(spacing1.paddingTop - 0.1);
          expect(spacing2.paddingBottom).toBeGreaterThanOrEqual(spacing1.paddingBottom - 0.1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify section-spacing class exists and uses clamp()', () => {
    /**
     * Validates that section-spacing class is properly defined with fluid sizing
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Check class exists
    expect(layoutCSS).toContain('.section-spacing');
    
    // Check it uses clamp() for fluid spacing
    const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
    const match = layoutCSS.match(sectionSpacingRegex);
    
    expect(match).toBeTruthy();
    
    if (match) {
      const declarations = match[1];
      expect(declarations).toContain('clamp(');
      expect(declarations).toContain('padding-top');
      expect(declarations).toContain('padding-bottom');
    }
  });

  it('should have spacing values within reasonable bounds', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Spacing should not exceed reasonable maximum values
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          const spacing = getSectionSpacing(viewportWidth);
          
          // Should not be less than 40px (mobile minimum)
          expect(spacing.paddingTop).toBeGreaterThanOrEqual(40);
          expect(spacing.paddingBottom).toBeGreaterThanOrEqual(40);
          
          // Should not exceed 100px (reasonable maximum)
          expect(spacing.paddingTop).toBeLessThanOrEqual(100);
          expect(spacing.paddingBottom).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should meet exact minimum at mobile breakpoint (320px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Test minimum viewport width
     */
    const spacing = getSectionSpacing(320);
    
    expect(spacing.paddingTop).toBeGreaterThanOrEqual(40);
    expect(spacing.paddingBottom).toBeGreaterThanOrEqual(40);
  });

  it('should meet exact minimum at desktop breakpoint (1024px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Test desktop breakpoint
     */
    const spacing = getSectionSpacing(1024);
    
    expect(spacing.paddingTop).toBeGreaterThanOrEqual(80);
    expect(spacing.paddingBottom).toBeGreaterThanOrEqual(80);
  });

  it('should handle tablet viewport range (768px-1023px) appropriately', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Tablet spacing should be between mobile and desktop values
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 1023 }), // tablet viewport range
        (viewportWidth) => {
          const spacing = getSectionSpacing(viewportWidth);
          
          // Should be at least mobile minimum
          expect(spacing.paddingTop).toBeGreaterThanOrEqual(40);
          expect(spacing.paddingBottom).toBeGreaterThanOrEqual(40);
          
          // Should be less than or equal to desktop minimum (since not yet at 1024px)
          // Allow some tolerance for the fluid calculation
          expect(spacing.paddingTop).toBeLessThanOrEqual(85);
          expect(spacing.paddingBottom).toBeLessThanOrEqual(85);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should verify clamp() structure has correct min, preferred, and max', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Validates clamp() function structure
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    const sectionSpacingRegex = /\.section-spacing\s*\{([^}]+)\}/;
    const match = layoutCSS.match(sectionSpacingRegex);

    if (match) {
      const declarations = match[1];
      const clampMatch = declarations.match(/clamp\(([^)]+)\)/);

      expect(clampMatch).toBeTruthy();

      if (clampMatch) {
        const clampContent = clampMatch[1];
        const parts = clampContent.split(',').map(p => p.trim());

        // Should have exactly 3 parts: min, preferred, max
        expect(parts.length).toBe(3);

        // Min should be around 40px
        const minMatch = parts[0].match(/([\d.]+)px/);
        expect(minMatch).toBeTruthy();
        if (minMatch) {
          const minValue = parseFloat(minMatch[1]);
          expect(minValue).toBeGreaterThanOrEqual(35);
          expect(minValue).toBeLessThanOrEqual(45);
        }

        // Preferred should use viewport units
        expect(parts[1]).toMatch(/vw|vh|vmin|vmax/);

        // Max should be around 80px
        const maxMatch = parts[2].match(/([\d.]+)px/);
        expect(maxMatch).toBeTruthy();
        if (maxMatch) {
          const maxValue = parseFloat(maxMatch[1]);
          expect(maxValue).toBeGreaterThanOrEqual(75);
          expect(maxValue).toBeLessThanOrEqual(85);
        }
      }
    }
  });

  it('should maintain spacing constraints across wide range of viewports', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 1:
     * Comprehensive test across all viewport sizes
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          const spacing = getSectionSpacing(viewportWidth);
          
          // Determine expected minimum based on viewport
          const expectedMin = viewportWidth >= 1024 ? 80 : 40;
          
          expect(spacing.paddingTop).toBeGreaterThanOrEqual(expectedMin);
          expect(spacing.paddingBottom).toBeGreaterThanOrEqual(expectedMin);
        }
      ),
      { numRuns: 200 }
    );
  });
});
