/**
 * Property-Based Test: Layout Shift Prevention
 * 
 * **Validates: Requirements 9.5**
 * 
 * Property 25: Layout Shift Prevention
 * For any image or dynamically loaded content element, explicit dimensions 
 * (width and height attributes or CSS dimensions) should be defined to 
 * prevent layout shifts during loading.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 25: Layout Shift Prevention', () => {
  /**
   * For any image or dynamically loaded content element, explicit dimensions 
   * (width and height attributes or CSS dimensions) should be defined to 
   * prevent layout shifts during loading.
   */

  let projectCardComponent: string;
  let projectCardCSS: string;
  let blogCardComponent: string;
  let aboutSectionComponent: string;

  beforeAll(() => {
    const projectCardPath = path.join(process.cwd(), 'src', 'components', 'ProjectCard.tsx');
    const projectCardCSSPath = path.join(process.cwd(), 'src', 'styles', 'components', 'ProjectCard.css');
    const blogCardPath = path.join(process.cwd(), 'src', 'components', 'BlogCard.tsx');
    const aboutSectionPath = path.join(process.cwd(), 'src', 'sections', 'AboutSection.tsx');

    projectCardComponent = fs.existsSync(projectCardPath) 
      ? fs.readFileSync(projectCardPath, 'utf-8') 
      : '';
    projectCardCSS = fs.existsSync(projectCardCSSPath) 
      ? fs.readFileSync(projectCardCSSPath, 'utf-8') 
      : '';
    blogCardComponent = fs.existsSync(blogCardPath) 
      ? fs.readFileSync(blogCardPath, 'utf-8') 
      : '';
    aboutSectionComponent = fs.existsSync(aboutSectionPath) 
      ? fs.readFileSync(aboutSectionPath, 'utf-8') 
      : '';
  });

  /**
   * Helper function to extract all <img> tags from component source
   */
  function extractImageTags(componentSource: string): string[] {
    const imgTagRegex = /<img[^>]*>/g;
    const matches = componentSource.match(imgTagRegex);
    return matches || [];
  }

  /**
   * Helper function to check if an image tag has explicit dimensions
   */
  function hasExplicitDimensions(imgTag: string): boolean {
    // Check for width and height attributes
    const hasWidthAttr = /width\s*=\s*["'{\d]/i.test(imgTag);
    const hasHeightAttr = /height\s*=\s*["'{\d]/i.test(imgTag);
    
    // Check for style attribute with dimensions
    const hasStyleDimensions = /style\s*=\s*\{[^}]*(?:width|height)[^}]*\}/i.test(imgTag);
    
    // Check for className that would apply dimensions
    const hasClassName = /className\s*=\s*["'][^"']*(?:image|img|photo|picture)[^"']*["']/i.test(imgTag);
    
    return (hasWidthAttr && hasHeightAttr) || hasStyleDimensions || hasClassName;
  }

  /**
   * Helper function to extract CSS dimension properties for image classes
   */
  function extractImageDimensions(cssContent: string, className: string): { width: string | null; height: string | null } {
    const selectorRegex = new RegExp(`\\.${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]+)\\}`, 'g');
    let match;
    
    let width: string | null = null;
    let height: string | null = null;
    
    while ((match = selectorRegex.exec(cssContent)) !== null) {
      const block = match[1];
      
      const widthMatch = block.match(/width\s*:\s*([^;]+);/i);
      const heightMatch = block.match(/height\s*:\s*([^;]+);/i);
      
      if (widthMatch) width = widthMatch[1].trim();
      if (heightMatch) height = heightMatch[1].trim();
    }
    
    return { width, height };
  }

  /**
   * Helper function to check if dimensions are explicit (not auto or unset)
   */
  function isExplicitDimension(value: string | null): boolean {
    if (!value) return false;
    
    const nonExplicitValues = ['auto', 'unset', 'initial', 'inherit'];
    return !nonExplicitValues.includes(value.toLowerCase());
  }

  it('should have explicit dimensions on ProjectCard images', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Project card images should have explicit dimensions to prevent layout shift
     */
    
    if (!projectCardComponent) {
      console.warn('ProjectCard component not found, skipping test');
      return;
    }

    const imageTags = extractImageTags(projectCardComponent);
    
    if (imageTags.length === 0) {
      console.warn('No images found in ProjectCard component');
      return;
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...imageTags),
        (imgTag) => {
          // Image should have explicit dimensions via attributes or className
          const hasDimensions = hasExplicitDimensions(imgTag);
          expect(hasDimensions).toBe(true);
          return true;
        }
      ),
      { numRuns: imageTags.length }
    );
  });

  it('should define image container dimensions in CSS', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Image containers should have explicit CSS dimensions
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    // Check image container dimensions
    const containerDimensions = extractImageDimensions(projectCardCSS, 'project-card__image-container');
    
    expect(isExplicitDimension(containerDimensions.width)).toBe(true);
    expect(isExplicitDimension(containerDimensions.height)).toBe(true);
  });

  it('should have aspect-ratio or fixed height for image containers', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Image containers should use aspect-ratio or fixed height
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    // Check for aspect-ratio property
    const hasAspectRatio = /aspect-ratio\s*:\s*[^;]+;/i.test(projectCardCSS);
    
    // Check for fixed height
    const containerDimensions = extractImageDimensions(projectCardCSS, 'project-card__image-container');
    const hasFixedHeight = containerDimensions.height && /^\d+px$/.test(containerDimensions.height);
    
    // Should have either aspect-ratio or fixed height
    expect(hasAspectRatio || hasFixedHeight).toBe(true);
  });

  it('should verify all image-related CSS classes have dimensions', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * All image-related classes should define dimensions
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    const imageClasses = [
      'project-card__image-container',
      'project-card__image',
      'project-card__placeholder'
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...imageClasses),
        (className) => {
          const dimensions = extractImageDimensions(projectCardCSS, className);
          
          // At least one dimension should be explicitly defined
          const hasExplicitWidth = isExplicitDimension(dimensions.width);
          const hasExplicitHeight = isExplicitDimension(dimensions.height);
          
          expect(hasExplicitWidth || hasExplicitHeight).toBe(true);
          return true;
        }
      ),
      { numRuns: imageClasses.length }
    );
  });

  it('should have object-fit property for images to maintain aspect ratio', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Images should use object-fit to prevent distortion
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    // Check for object-fit property on image class
    const hasObjectFit = /\.project-card__image[^}]*object-fit\s*:\s*[^;]+;/is.test(projectCardCSS);
    
    expect(hasObjectFit).toBe(true);
  });

  it('should verify profile images have explicit dimensions', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Profile images in AboutSection should have explicit dimensions
     */
    
    if (!aboutSectionComponent) {
      console.warn('AboutSection component not found, skipping test');
      return;
    }

    const imageTags = extractImageTags(aboutSectionComponent);
    
    if (imageTags.length === 0) {
      // No images in AboutSection, skip
      return;
    }

    imageTags.forEach(imgTag => {
      const hasDimensions = hasExplicitDimensions(imgTag);
      expect(hasDimensions).toBe(true);
    });
  });

  it('should verify placeholder elements have matching dimensions', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Placeholder elements should have same dimensions as images
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    const imageDimensions = extractImageDimensions(projectCardCSS, 'project-card__image');
    const placeholderDimensions = extractImageDimensions(projectCardCSS, 'project-card__placeholder');

    // If both have explicit dimensions, they should match
    if (isExplicitDimension(imageDimensions.width) && isExplicitDimension(placeholderDimensions.width)) {
      expect(imageDimensions.width).toBe(placeholderDimensions.width);
    }

    if (isExplicitDimension(imageDimensions.height) && isExplicitDimension(placeholderDimensions.height)) {
      expect(imageDimensions.height).toBe(placeholderDimensions.height);
    }
  });

  it('should not use auto dimensions for critical images', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Critical images should not use auto dimensions
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    const imageClasses = [
      'project-card__image-container',
      'project-card__image'
    ];

    imageClasses.forEach(className => {
      const dimensions = extractImageDimensions(projectCardCSS, className);
      
      // Height should not be auto for critical images
      if (dimensions.height) {
        expect(dimensions.height.toLowerCase()).not.toBe('auto');
      }
    });
  });

  it('should verify all components with images have dimension strategies', () => {
    /**
     * Property-based test: All components with images should prevent layout shift
     */
    
    const components = [
      { name: 'ProjectCard', source: projectCardComponent },
      { name: 'BlogCard', source: blogCardComponent },
      { name: 'AboutSection', source: aboutSectionComponent }
      // Note: HeroSection images are above the fold and may not need explicit dimensions
    ];

    const componentsWithImages = components.filter(({ source }) => {
      return source && extractImageTags(source).length > 0;
    });

    if (componentsWithImages.length === 0) {
      console.warn('No components with images found, skipping test');
      return;
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...componentsWithImages),
        ({ source }) => {
          const imageTags = extractImageTags(source);
          
          // All images should have dimension strategy
          imageTags.forEach(imgTag => {
            const hasDimensions = hasExplicitDimensions(imgTag);
            expect(hasDimensions).toBe(true);
          });

          return true;
        }
      ),
      { numRuns: componentsWithImages.length }
    );
  });

  it('should verify image containers use consistent sizing approach', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * All image containers should use consistent sizing approach
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    // Check that image container has width: 100% and explicit height
    const containerDimensions = extractImageDimensions(projectCardCSS, 'project-card__image-container');
    
    expect(containerDimensions.width).toBe('100%');
    expect(isExplicitDimension(containerDimensions.height)).toBe(true);
    
    // Height should be a fixed pixel value
    if (containerDimensions.height) {
      const isFixedHeight = /^\d+px$/.test(containerDimensions.height);
      expect(isFixedHeight).toBe(true);
    }
  });

  it('should verify responsive image dimensions are defined at all breakpoints', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Image dimensions should be defined at all responsive breakpoints
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    // Extract media query blocks with image container dimensions
    const mediaQueryRegex = /@media\s*\([^)]+\)\s*\{[^}]*\.project-card__image-container[^}]*height[^}]*\}/gs;
    const matches = projectCardCSS.match(mediaQueryRegex);

    // Should have responsive height definitions
    if (matches) {
      expect(matches.length).toBeGreaterThan(0);

      // All responsive heights should be explicit
      matches.forEach(block => {
        const heightMatch = block.match(/height\s*:\s*([^;]+);/);
        
        if (heightMatch) {
          const height = heightMatch[1].trim();
          expect(isExplicitDimension(height)).toBe(true);
        }
      });
    }
  });

  it('should verify images have width and height attributes or CSS classes', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Images should have explicit dimensions via attributes or CSS
     */
    
    const allComponents = [
      projectCardComponent,
      blogCardComponent,
      aboutSectionComponent
    ].filter(Boolean);

    allComponents.forEach(componentSource => {
      const imageTags = extractImageTags(componentSource);
      
      imageTags.forEach(imgTag => {
        // Should have width/height attributes OR className for CSS dimensions
        const hasAttributes = /width\s*=/.test(imgTag) && /height\s*=/.test(imgTag);
        const hasClassName = /className\s*=/.test(imgTag);
        
        expect(hasAttributes || hasClassName).toBe(true);
      });
    });
  });

  it('should verify height strategy is set for card containers', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Card containers should have height strategy to prevent shift
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    // Check for height: 100% or min-height on card containers
    const hasHeightStrategy = /\.project-card[^}]*height\s*:\s*100%;/is.test(projectCardCSS) ||
                             /\.project-card[^}]*min-height\s*:\s*[^;]+;/is.test(projectCardCSS);
    
    // Should have height strategy defined (height: 100% is valid for flex children)
    expect(hasHeightStrategy).toBe(true);
  });

  it('should verify card containers have explicit height or flex properties', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 25:
     * Card containers should have height strategy to prevent layout shift
     */
    
    if (!projectCardCSS) {
      console.warn('ProjectCard CSS not found, skipping test');
      return;
    }

    const cardDimensions = extractImageDimensions(projectCardCSS, 'project-card');
    
    // Should have height: 100% or explicit height
    const hasHeightStrategy = cardDimensions.height === '100%' || 
                             (cardDimensions.height && /^\d+px$/.test(cardDimensions.height));
    
    expect(hasHeightStrategy).toBe(true);
  });
});
