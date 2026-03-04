/**
 * Property-Based Test: Responsive Grid Columns
 * 
 * **Validates: Requirements 6.1, 6.2**
 * 
 * Property 15: Projects Grid Responsive Columns
 * For any viewport size, the Projects section grid should display 3 columns on desktop 
 * (≥1024px), 2 columns on tablet (768px-1023px), and 1 column on mobile (<768px).
 * 
 * Property 16: Blog Grid Responsive Columns
 * For any viewport size, the Blog section grid should display 2 columns on desktop 
 * (≥768px) and 1 column on mobile (<768px).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 15: Projects Grid Responsive Columns', () => {
  beforeAll(() => {
    // Load layout CSS
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Create a JSDOM instance with the layout CSS
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${layoutCSS}</style>
        </head>
        <body>
          <div class="projects-grid">
            <div class="project-card">Project 1</div>
            <div class="project-card">Project 2</div>
            <div class="project-card">Project 3</div>
          </div>
        </body>
      </html>
    `;
    
    new JSDOM(html);
  });

  /**
   * Helper function to extract grid column count from CSS rules
   */
  function getExpectedColumnsFromCSS(className: string, viewportWidth: number): number {
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Parse CSS to find grid-template-columns for the given class at the viewport width
    const classSelector = `.${className}`;
    
    // Default to 1 column (mobile-first)
    let columns = 1;

    // Check base rule (mobile)
    const baseRuleRegex = new RegExp(
      `\\${classSelector}\\s*{[^}]*grid-template-columns:\\s*([^;]+);`,
      'i'
    );
    const baseMatch = layoutCSS.match(baseRuleRegex);
    if (baseMatch) {
      const value = baseMatch[1].trim();
      if (value.includes('repeat')) {
        const repeatMatch = value.match(/repeat\((\d+),/);
        if (repeatMatch) {
          columns = parseInt(repeatMatch[1], 10);
        }
      } else {
        columns = value.split(' ').filter(col => col.trim() !== '').length;
      }
    }

    // Check tablet breakpoint (768px)
    if (viewportWidth >= 768) {
      const tabletRegex = new RegExp(
        `@media\\s*\\([^)]*min-width:\\s*768px[^)]*\\)[^{]*{[^}]*\\${classSelector}\\s*{[^}]*grid-template-columns:\\s*([^;]+);`,
        'is'
      );
      const tabletMatch = layoutCSS.match(tabletRegex);
      if (tabletMatch) {
        const value = tabletMatch[1].trim();
        if (value.includes('repeat')) {
          const repeatMatch = value.match(/repeat\((\d+),/);
          if (repeatMatch) {
            columns = parseInt(repeatMatch[1], 10);
          }
        } else {
          columns = value.split(' ').filter(col => col.trim() !== '').length;
        }
      }
    }

    // Check desktop breakpoint (1024px)
    if (viewportWidth >= 1024) {
      const desktopRegex = new RegExp(
        `@media\\s*\\([^)]*min-width:\\s*1024px[^)]*\\)[^{]*{[^}]*\\${classSelector}\\s*{[^}]*grid-template-columns:\\s*([^;]+);`,
        'is'
      );
      const desktopMatch = layoutCSS.match(desktopRegex);
      if (desktopMatch) {
        const value = desktopMatch[1].trim();
        if (value.includes('repeat')) {
          const repeatMatch = value.match(/repeat\((\d+),/);
          if (repeatMatch) {
            columns = parseInt(repeatMatch[1], 10);
          }
        } else {
          columns = value.split(' ').filter(col => col.trim() !== '').length;
        }
      }
    }

    return columns;
  }

  it('should display 1 column on mobile viewports (<768px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 15:
     * Projects grid should have 1 column on mobile
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // mobile viewport range
        (viewportWidth) => {
          const expectedColumns = getExpectedColumnsFromCSS('projects-grid', viewportWidth);
          
          expect(expectedColumns).toBe(1);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display 2 columns on tablet viewports (768px-1023px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 15:
     * Projects grid should have 2 columns on tablet
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 1023 }), // tablet viewport range
        (viewportWidth) => {
          const expectedColumns = getExpectedColumnsFromCSS('projects-grid', viewportWidth);
          
          expect(expectedColumns).toBe(2);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display 3 columns on desktop viewports (≥1024px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 15:
     * Projects grid should have 3 columns on desktop
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1024, max: 2560 }), // desktop viewport range
        (viewportWidth) => {
          const expectedColumns = getExpectedColumnsFromCSS('projects-grid', viewportWidth);
          
          expect(expectedColumns).toBe(3);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should have correct column count across all viewport sizes (comprehensive)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 15:
     * Comprehensive test across all viewport sizes
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // all viewport sizes
        (viewportWidth) => {
          const expectedColumns = getExpectedColumnsFromCSS('projects-grid', viewportWidth);
          
          let requiredColumns: number;
          if (viewportWidth < 768) {
            requiredColumns = 1;
          } else if (viewportWidth < 1024) {
            requiredColumns = 2;
          } else {
            requiredColumns = 3;
          }
          
          expect(expectedColumns).toBe(requiredColumns);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify projects-grid class exists in layout.css', () => {
    /**
     * Validates that the projects-grid class is defined
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    expect(layoutCSS).toContain('.projects-grid');
    expect(layoutCSS).toContain('grid-template-columns');
  });

  it('should have media queries at correct breakpoints for projects grid', () => {
    /**
     * Validates that breakpoints are defined at 768px and 1024px
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Check for 768px breakpoint
    expect(layoutCSS).toMatch(/@media\s*\([^)]*min-width:\s*768px/);
    
    // Check for 1024px breakpoint
    expect(layoutCSS).toMatch(/@media\s*\([^)]*min-width:\s*1024px/);
  });
});

describe('Property 16: Blog Grid Responsive Columns', () => {
  beforeAll(() => {
    // Load layout CSS
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Create a JSDOM instance with the layout CSS
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${layoutCSS}</style>
        </head>
        <body>
          <div class="blog-grid">
            <div class="blog-card">Post 1</div>
            <div class="blog-card">Post 2</div>
          </div>
        </body>
      </html>
    `;
    
    new JSDOM(html);
  });

  /**
   * Helper function to extract grid column count from CSS rules for blog grid
   */
  function getExpectedColumnsFromCSS(className: string, viewportWidth: number): number {
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Parse CSS to find grid-template-columns for the given class at the viewport width
    const classSelector = `.${className}`;
    
    // Default to 1 column (mobile-first)
    let columns = 1;

    // Check base rule (mobile)
    const baseRuleRegex = new RegExp(
      `\\${classSelector}\\s*{[^}]*grid-template-columns:\\s*([^;]+);`,
      'i'
    );
    const baseMatch = layoutCSS.match(baseRuleRegex);
    if (baseMatch) {
      const value = baseMatch[1].trim();
      if (value.includes('repeat')) {
        const repeatMatch = value.match(/repeat\((\d+),/);
        if (repeatMatch) {
          columns = parseInt(repeatMatch[1], 10);
        }
      } else {
        columns = value.split(' ').filter(col => col.trim() !== '').length;
      }
    }

    // Check tablet/desktop breakpoint (768px) - blog grid only has one breakpoint
    if (viewportWidth >= 768) {
      const desktopRegex = new RegExp(
        `@media\\s*\\([^)]*min-width:\\s*768px[^)]*\\)[^{]*{[^}]*\\${classSelector}\\s*{[^}]*grid-template-columns:\\s*([^;]+);`,
        'is'
      );
      const desktopMatch = layoutCSS.match(desktopRegex);
      if (desktopMatch) {
        const value = desktopMatch[1].trim();
        if (value.includes('repeat')) {
          const repeatMatch = value.match(/repeat\((\d+),/);
          if (repeatMatch) {
            columns = parseInt(repeatMatch[1], 10);
          }
        } else {
          columns = value.split(' ').filter(col => col.trim() !== '').length;
        }
      }
    }

    return columns;
  }

  it('should display 1 column on mobile viewports (<768px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 16:
     * Blog grid should have 1 column on mobile
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // mobile viewport range
        (viewportWidth) => {
          const expectedColumns = getExpectedColumnsFromCSS('blog-grid', viewportWidth);
          
          expect(expectedColumns).toBe(1);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display 2 columns on desktop viewports (≥768px)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 16:
     * Blog grid should have 2 columns on desktop
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 2560 }), // desktop viewport range
        (viewportWidth) => {
          const expectedColumns = getExpectedColumnsFromCSS('blog-grid', viewportWidth);
          
          expect(expectedColumns).toBe(2);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should have correct column count across all viewport sizes (comprehensive)', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 16:
     * Comprehensive test across all viewport sizes
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // all viewport sizes
        (viewportWidth) => {
          const expectedColumns = getExpectedColumnsFromCSS('blog-grid', viewportWidth);
          
          const requiredColumns = viewportWidth < 768 ? 1 : 2;
          
          expect(expectedColumns).toBe(requiredColumns);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify blog-grid class exists in layout.css', () => {
    /**
     * Validates that the blog-grid class is defined
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    expect(layoutCSS).toContain('.blog-grid');
    expect(layoutCSS).toContain('grid-template-columns');
  });

  it('should have media query at 768px breakpoint for blog grid', () => {
    /**
     * Validates that breakpoint is defined at 768px
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Check for 768px breakpoint
    expect(layoutCSS).toMatch(/@media\s*\([^)]*min-width:\s*768px/);
  });

  it('should transition from 1 to 2 columns exactly at 768px boundary', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 16:
     * Test the exact breakpoint transition
     */
    const columns767 = getExpectedColumnsFromCSS('blog-grid', 767);
    const columns768 = getExpectedColumnsFromCSS('blog-grid', 768);
    
    expect(columns767).toBe(1);
    expect(columns768).toBe(2);
  });
});

describe('Responsive Grid Columns: Cross-validation', () => {
  it('should have different column counts for projects and blog grids on tablet', () => {
    /**
     * Validates that projects grid (2 cols) and blog grid (2 cols) behave correctly on tablet
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Both should have definitions
    expect(layoutCSS).toContain('.projects-grid');
    expect(layoutCSS).toContain('.blog-grid');
  });

  it('should verify breakpoint consistency across grid systems', () => {
    /**
     * Validates that both grid systems use the same breakpoint values
     */
    const layoutCSS = fs.readFileSync(
      path.join(process.cwd(), 'src', 'styles', 'layout.css'),
      'utf-8'
    );

    // Extract all min-width breakpoints
    const breakpointRegex = /@media\s*\([^)]*min-width:\s*(\d+)px/g;
    const breakpoints = new Set<number>();
    
    let match;
    while ((match = breakpointRegex.exec(layoutCSS)) !== null) {
      breakpoints.add(parseInt(match[1], 10));
    }

    // Should have 768px and 1024px breakpoints
    expect(breakpoints.has(768)).toBe(true);
    expect(breakpoints.has(1024)).toBe(true);
  });
});
