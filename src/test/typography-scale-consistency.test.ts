/**
 * Property-Based Test: Typography Scale Consistency
 * 
 * **Validates: Requirements 2.2**
 * 
 * Property 3: Typography Scale Consistency
 * For any two adjacent font sizes in the typography scale, the ratio between them 
 * should be consistent (within 5% tolerance) across the entire scale, demonstrating 
 * a modular approach.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 3: Typography Scale Consistency', () => {
  let typographyScale: Array<{ name: string; value: number }>;

  beforeAll(() => {
    // Load theme.css to extract typography scale values
    const themeCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'theme.css'),
      'utf-8'
    );

    // Extract font size variables from theme.css
    const fontSizeRegex = /--(text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl))\s*:\s*([0-9.]+)rem;/g;
    const fontSizes: Array<{ name: string; value: number }> = [];
    let match;

    while ((match = fontSizeRegex.exec(themeCSS)) !== null) {
      const varName = match[1];
      const remValue = parseFloat(match[2]);
      const pxValue = remValue * 16; // Convert rem to px (assuming 16px base)
      
      fontSizes.push({ name: varName, value: pxValue });
    }

    // Sort by value to ensure correct ordering
    typographyScale = fontSizes.sort((a, b) => a.value - b.value);
  });

  /**
   * Helper function to calculate the ratio between two font sizes
   */
  function calculateRatio(smaller: number, larger: number): number {
    return larger / smaller;
  }

  /**
   * Helper function to check if ratios are consistent within tolerance
   */
  function areRatiosConsistent(ratio1: number, ratio2: number, tolerance: number = 0.05): boolean {
    const difference = Math.abs(ratio1 - ratio2);
    const maxDifference = ratio1 * tolerance;
    return difference <= maxDifference;
  }

  it('should have a consistent ratio between adjacent font sizes in the typography scale', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 3:
     * For any two adjacent font sizes, the ratio should be consistent
     */

    // Need at least 3 sizes to calculate ratios
    expect(typographyScale.length).toBeGreaterThanOrEqual(3);

    // Calculate all adjacent ratios
    const ratios: Array<{ from: string; to: string; ratio: number }> = [];
    
    for (let i = 0; i < typographyScale.length - 1; i++) {
      const smaller = typographyScale[i];
      const larger = typographyScale[i + 1];
      const ratio = calculateRatio(smaller.value, larger.value);
      
      ratios.push({
        from: smaller.name,
        to: larger.name,
        ratio
      });
    }

    // Check that all ratios are consistent (within 5% tolerance)
    const violations: Array<{ 
      pair1: string; 
      ratio1: number; 
      pair2: string; 
      ratio2: number; 
      difference: number 
    }> = [];

    for (let i = 0; i < ratios.length - 1; i++) {
      for (let j = i + 1; j < ratios.length; j++) {
        const ratio1 = ratios[i];
        const ratio2 = ratios[j];
        
        if (!areRatiosConsistent(ratio1.ratio, ratio2.ratio, 0.05)) {
          const difference = Math.abs(ratio1.ratio - ratio2.ratio);
          const percentDiff = (difference / ratio1.ratio) * 100;
          
          violations.push({
            pair1: `${ratio1.from} → ${ratio1.to}`,
            ratio1: ratio1.ratio,
            pair2: `${ratio2.from} → ${ratio2.to}`,
            ratio2: ratio2.ratio,
            difference: percentDiff
          });
        }
      }
    }

    // Report violations if any
    if (violations.length > 0) {
      const violationReport = violations.map(v =>
        `  - ${v.pair1}: ${v.ratio1.toFixed(3)} vs ${v.pair2}: ${v.ratio2.toFixed(3)} ` +
        `(${v.difference.toFixed(1)}% difference, exceeds 5% tolerance)`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} typography scale ratio inconsistencies:\n${violationReport}\n\n` +
        `All ratios:\n${ratios.map(r => `  - ${r.from} → ${r.to}: ${r.ratio.toFixed(3)}`).join('\n')}`
      );
    }

    expect(violations.length).toBe(0);
  });

  it('should maintain consistent ratios across random pairs of adjacent sizes (property-based)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 3:
     * Property-based test with random sampling of adjacent size pairs
     */

    // Need at least 3 sizes to test
    if (typographyScale.length < 3) {
      expect(true).toBe(true);
      return;
    }

    // Calculate all adjacent ratios
    const ratios: number[] = [];
    for (let i = 0; i < typographyScale.length - 1; i++) {
      const ratio = calculateRatio(typographyScale[i].value, typographyScale[i + 1].value);
      ratios.push(ratio);
    }

    // Use fast-check to randomly compare pairs of ratios
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: ratios.length - 1 }),
        fc.integer({ min: 0, max: ratios.length - 1 }),
        (index1, index2) => {
          // Skip if same index
          if (index1 === index2) {
            return true;
          }

          const ratio1 = ratios[index1];
          const ratio2 = ratios[index2];

          const isConsistent = areRatiosConsistent(ratio1, ratio2, 0.05);

          if (!isConsistent) {
            const difference = Math.abs(ratio1 - ratio2);
            const percentDiff = (difference / ratio1) * 100;
            
            throw new Error(
              `Typography scale ratios are inconsistent:\n` +
              `  Ratio at index ${index1}: ${ratio1.toFixed(3)}\n` +
              `  Ratio at index ${index2}: ${ratio2.toFixed(3)}\n` +
              `  Difference: ${percentDiff.toFixed(1)}% (exceeds 5% tolerance)`
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify typography scale is defined in theme.css', () => {
    /**
     * Validates that the theme system has typography scale variables defined
     */

    const expectedSizes = [
      'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
      'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'
    ];

    const definedSizes = typographyScale.map(s => s.name);
    const missingSizes = expectedSizes.filter(size => !definedSizes.includes(size));

    expect(missingSizes).toEqual([]);
  });

  it('should have typography scale values in ascending order', () => {
    /**
     * Validates that font sizes increase monotonically
     */

    for (let i = 0; i < typographyScale.length - 1; i++) {
      const current = typographyScale[i];
      const next = typographyScale[i + 1];

      expect(next.value).toBeGreaterThan(current.value);
    }
  });

  it('should calculate the average ratio and verify consistency', () => {
    /**
     * Calculates the average ratio and ensures all ratios are within 5% of it
     */

    if (typographyScale.length < 2) {
      expect(true).toBe(true);
      return;
    }

    // Calculate all adjacent ratios
    const ratios: number[] = [];
    for (let i = 0; i < typographyScale.length - 1; i++) {
      const ratio = calculateRatio(typographyScale[i].value, typographyScale[i + 1].value);
      ratios.push(ratio);
    }

    // Calculate average ratio
    const averageRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;

    // Check each ratio against the average
    const violations: Array<{ index: number; ratio: number; difference: number }> = [];

    ratios.forEach((ratio, index) => {
      const difference = Math.abs(ratio - averageRatio);
      const percentDiff = (difference / averageRatio) * 100;

      if (percentDiff > 5) {
        violations.push({
          index,
          ratio,
          difference: percentDiff
        });
      }
    });

    if (violations.length > 0) {
      const violationReport = violations.map(v =>
        `  - Ratio ${v.index} (${typographyScale[v.index].name} → ${typographyScale[v.index + 1].name}): ` +
        `${v.ratio.toFixed(3)} differs from average ${averageRatio.toFixed(3)} by ${v.difference.toFixed(1)}%`
      ).join('\n');

      expect.fail(
        `Found ${violations.length} ratios that deviate more than 5% from the average:\n${violationReport}`
      );
    }

    expect(violations.length).toBe(0);
  });
});
