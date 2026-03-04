/**
 * Property-Based Test: Image Lazy Loading
 * 
 * **Validates: Requirements 9.2**
 * 
 * Property 24: Image Lazy Loading
 * For any image element that is not immediately visible in the initial viewport 
 * (below the fold), the image should have loading="lazy" attribute or use an 
 * equivalent lazy loading implementation.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Property 24: Image Lazy Loading', () => {
  /**
   * For any image element that is not immediately visible in the initial viewport 
   * (below the fold), the image should have loading="lazy" attribute or use an 
   * equivalent lazy loading implementation.
   */

  let projectCardComponent: string;
  let blogCardComponent: string;
  let projectsSectionComponent: string;

  beforeAll(() => {
    const projectCardPath = path.join(process.cwd(), 'src', 'components', 'ProjectCard.tsx');
    const blogCardPath = path.join(process.cwd(), 'src', 'components', 'BlogCard.tsx');
    const projectsSectionPath = path.join(process.cwd(), 'src', 'sections', 'ProjectsSection.tsx');

    projectCardComponent = fs.existsSync(projectCardPath) 
      ? fs.readFileSync(projectCardPath, 'utf-8') 
      : '';
    blogCardComponent = fs.existsSync(blogCardPath) 
      ? fs.readFileSync(blogCardPath, 'utf-8') 
      : '';
    projectsSectionComponent = fs.existsSync(projectsSectionPath) 
      ? fs.readFileSync(projectsSectionPath, 'utf-8') 
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
   * Helper function to check if an image tag has lazy loading
   */
  function hasLazyLoading(imgTag: string): boolean {
    // Check for loading="lazy" attribute
    const hasLoadingLazy = /loading\s*=\s*["']lazy["']/i.test(imgTag);
    
    // Check for loading={...} with lazy value
    const hasLoadingProp = /loading\s*=\s*\{[^}]*["']lazy["'][^}]*\}/i.test(imgTag);
    
    // Check for data-src or other lazy loading patterns
    const hasDataSrc = /data-src\s*=/i.test(imgTag);
    
    return hasLoadingLazy || hasLoadingProp || hasDataSrc;
  }

  /**
   * Helper function to determine if an image is likely above the fold
   */
  function isLikelyAboveFold(componentSource: string, imgTag: string): boolean {
    // Images in HeroSection are typically above the fold
    const isInHeroSection = componentSource.includes('HeroSection') || 
                           componentSource.includes('hero-section');
    
    // Profile images in AboutSection might be above the fold
    const isProfileImage = imgTag.includes('profile') || 
                          imgTag.includes('avatar') ||
                          imgTag.includes('headshot');
    
    // First image in a component might be above the fold
    const allImages = extractImageTags(componentSource);
    const isFirstImage = allImages.length > 0 && allImages[0] === imgTag;
    
    return isInHeroSection || (isProfileImage && isFirstImage);
  }

  it('should have lazy loading on ProjectCard images', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 24:
     * Project card images should use lazy loading
     */
    
    if (!projectCardComponent) {
      console.warn('ProjectCard component not found, skipping test');
      return;
    }

    const imageTags = extractImageTags(projectCardComponent);
    
    // ProjectCard images are typically below the fold
    fc.assert(
      fc.property(
        fc.constantFrom(...imageTags),
        (imgTag) => {
          // Project images should have lazy loading
          const hasLazy = hasLazyLoading(imgTag);
          expect(hasLazy).toBe(true);
          return true;
        }
      ),
      { numRuns: Math.max(imageTags.length, 1) }
    );
  });

  it('should verify loading attribute is present in ProjectCard', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 24:
     * ProjectCard should explicitly set loading attribute
     */
    
    if (!projectCardComponent) {
      console.warn('ProjectCard component not found, skipping test');
      return;
    }

    // Should contain loading attribute
    expect(projectCardComponent).toMatch(/loading\s*=\s*["']lazy["']/i);
  });

  it('should have lazy loading on below-fold images in sections', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 24:
     * Images in ProjectsSection should use lazy loading
     */
    
    const components = [
      { name: 'ProjectsSection', source: projectsSectionComponent }
    ];

    components.forEach(({ name, source }) => {
      if (!source) {
        console.warn(`${name} component not found, skipping`);
        return;
      }

      const imageTags = extractImageTags(source);
      
      if (imageTags.length === 0) {
        // No images in this component, skip
        return;
      }

      imageTags.forEach(imgTag => {
        // Check if this image is likely below the fold
        const isBelowFold = !isLikelyAboveFold(source, imgTag);
        
        if (isBelowFold) {
          const hasLazy = hasLazyLoading(imgTag);
          expect(hasLazy).toBe(true);
        }
      });
    });
  });

  it('should verify all project images use lazy loading', () => {
    /**
     * Property-based test: All images in project-related components should be lazy loaded
     */
    
    const projectComponents = [
      projectCardComponent,
      projectsSectionComponent
    ].filter(Boolean);

    fc.assert(
      fc.property(
        fc.constantFrom(...projectComponents),
        (componentSource) => {
          const imageTags = extractImageTags(componentSource);
          
          if (imageTags.length === 0) {
            return true; // No images to check
          }

          // All images in project components should have lazy loading
          imageTags.forEach(imgTag => {
            const hasLazy = hasLazyLoading(imgTag);
            expect(hasLazy).toBe(true);
          });

          return true;
        }
      ),
      { numRuns: projectComponents.length }
    );
  });

  it('should not have eager loading on below-fold images', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 24:
     * Below-fold images should not explicitly use loading="eager"
     */
    
    const allComponents = [
      projectCardComponent,
      projectsSectionComponent
    ].filter(Boolean);

    allComponents.forEach(componentSource => {
      const imageTags = extractImageTags(componentSource);
      
      imageTags.forEach(imgTag => {
        // Should not have loading="eager" for below-fold images
        const hasEagerLoading = /loading\s*=\s*["']eager["']/i.test(imgTag);
        expect(hasEagerLoading).toBe(false);
      });
    });
  });

  it('should verify lazy loading implementation in component props', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 24:
     * Component should accept and use imageUrl prop with lazy loading
     */
    
    if (!projectCardComponent) {
      console.warn('ProjectCard component not found, skipping test');
      return;
    }

    // Should have imageUrl prop in interface
    expect(projectCardComponent).toContain('imageUrl');
    
    // Should render img tag with loading attribute
    const hasImgWithLoading = /<img[^>]*loading\s*=\s*["']lazy["'][^>]*>/i.test(projectCardComponent);
    expect(hasImgWithLoading).toBe(true);
  });

  it('should verify lazy loading attribute format is correct', () => {
    /**
     * Property-based test: loading attribute should have correct value format
     */
    
    const allComponents = [
      projectCardComponent,
      blogCardComponent,
      projectsSectionComponent
    ].filter(Boolean);

    const validLoadingValues = ['lazy', 'eager', 'auto'];

    allComponents.forEach(componentSource => {
      const loadingAttrRegex = /loading\s*=\s*["']([^"']+)["']/gi;
      let match;

      while ((match = loadingAttrRegex.exec(componentSource)) !== null) {
        const loadingValue = match[1];
        
        fc.assert(
          fc.property(
            fc.constant(loadingValue),
            (value) => {
              // Loading value should be one of the valid values
              expect(validLoadingValues).toContain(value);
              return true;
            }
          ),
          { numRuns: 1 }
        );
      }
    });
  });

  it('should have consistent lazy loading across all project cards', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 24:
     * All project card images should consistently use lazy loading
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

    // All images should have the same lazy loading implementation
    const lazyLoadingStates = imageTags.map(imgTag => hasLazyLoading(imgTag));
    
    // All should be true (all lazy loaded)
    const allLazy = lazyLoadingStates.every(state => state === true);
    expect(allLazy).toBe(true);
  });

  it('should verify images have proper error handling with lazy loading', () => {
    /**
     * Feature: portfolio-design-enhancement, Property 24:
     * Lazy loaded images should have error handling
     */
    
    if (!projectCardComponent) {
      console.warn('ProjectCard component not found, skipping test');
      return;
    }

    // Should have onError handler for images
    const hasOnError = /onError\s*=\s*\{/i.test(projectCardComponent);
    expect(hasOnError).toBe(true);
  });
});
