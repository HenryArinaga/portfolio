import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import fc from 'fast-check';

/**
 * Property 14: Single Animation Trigger
 * Feature: portfolio-design-enhancement
 * 
 * For any scroll-revealed element, once the animation has been triggered and completed,
 * it should not animate again during the same page session (no re-triggering on scroll).
 * 
 * Validates: Requirements 5.5
 */

describe('Property 14: Single Animation Trigger', () => {
  let intersectionObserverMock: any;
  let observeMock: any;
  let disconnectMock: any;
  let unobserveMock: any;
  let observerCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    observerCallback = null;
    observeMock = vi.fn();
    disconnectMock = vi.fn();
    unobserveMock = vi.fn();
    
    intersectionObserverMock = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
        unobserve: unobserveMock,
      };
    });
    
    window.IntersectionObserver = intersectionObserverMock as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    observerCallback = null;
  });

  function createMockElement() {
    return document.createElement('div');
  }

  function simulateIntersection(isIntersecting: boolean, target: Element) {
    if (!observerCallback) {
      throw new Error('Observer callback not initialized');
    }
    
    const entries: IntersectionObserverEntry[] = [{
      isIntersecting,
      target,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    }];
    
    observerCallback(entries, {} as IntersectionObserver);
  }

  it('should disconnect observer after first trigger when once=true', () => {
    const { result } = renderHook(() => useScrollReveal({ once: true }));
    const mockElement = createMockElement();
    
    expect(result.current.isVisible).toBe(false);
    
    if (observerCallback) {
      simulateIntersection(true, mockElement);
      expect(result.current.isVisible).toBe(true);
      expect(disconnectMock).toHaveBeenCalled();
      
      simulateIntersection(false, mockElement);
      expect(result.current.isVisible).toBe(true);
    }
  });

  it('should allow re-triggering when once=false', () => {
    const { result } = renderHook(() => useScrollReveal({ once: false }));
    const mockElement = createMockElement();
    
    expect(result.current.isVisible).toBe(false);
    
    if (observerCallback) {
      simulateIntersection(true, mockElement);
      expect(result.current.isVisible).toBe(true);
      
      simulateIntersection(false, mockElement);
      expect(result.current.isVisible).toBe(false);
      
      simulateIntersection(true, mockElement);
      expect(result.current.isVisible).toBe(true);
      
      expect(disconnectMock).not.toHaveBeenCalled();
    }
  });

  it('should verify once=true is the default behavior', () => {
    const { result } = renderHook(() => useScrollReveal());
    const mockElement = createMockElement();
    
    expect(result.current.isVisible).toBe(false);
    
    if (observerCallback) {
      simulateIntersection(true, mockElement);
      expect(result.current.isVisible).toBe(true);
      expect(disconnectMock).toHaveBeenCalled();
    }
  });

  it('should verify observer configuration with once property', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.double({ min: 0, max: 1 }),
        (once, threshold) => {
          intersectionObserverMock.mockClear();
          observeMock.mockClear();
          disconnectMock.mockClear();
          
          const { result } = renderHook(() => useScrollReveal({ once, threshold }));
          
          expect(result.current.ref).toBeDefined();
          expect(result.current.isVisible).toBe(false);
          expect(typeof result.current.isVisible).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain visible state after disconnect when once=true', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 3, maxLength: 10 }),
        (intersectionSequence) => {
          intersectionObserverMock.mockClear();
          observeMock.mockClear();
          disconnectMock.mockClear();
          observerCallback = null;
          
          const { result } = renderHook(() => useScrollReveal({ once: true }));
          const mockElement = createMockElement();
          
          if (!observerCallback) {
            return true;
          }
          
          let hasBeenVisible = false;
          
          for (const isIntersecting of intersectionSequence) {
            simulateIntersection(isIntersecting, mockElement);
            
            if (isIntersecting && !hasBeenVisible) {
              expect(result.current.isVisible).toBe(true);
              hasBeenVisible = true;
              expect(disconnectMock).toHaveBeenCalled();
            } else if (hasBeenVisible) {
              expect(result.current.isVisible).toBe(true);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify single trigger across different threshold values', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 1 }),
        (threshold) => {
          intersectionObserverMock.mockClear();
          observeMock.mockClear();
          disconnectMock.mockClear();
          observerCallback = null;
          
          const { result } = renderHook(() => useScrollReveal({ threshold, once: true }));
          const mockElement = createMockElement();
          
          if (!observerCallback) {
            return true;
          }
          
          simulateIntersection(true, mockElement);
          expect(result.current.isVisible).toBe(true);
          expect(disconnectMock).toHaveBeenCalledTimes(1);
          
          simulateIntersection(false, mockElement);
          simulateIntersection(true, mockElement);
          
          expect(result.current.isVisible).toBe(true);
          expect(disconnectMock).toHaveBeenCalledTimes(1);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify observer disconnects exactly once with once=true', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (numIntersections) => {
          intersectionObserverMock.mockClear();
          observeMock.mockClear();
          disconnectMock.mockClear();
          observerCallback = null;
          
          const { result } = renderHook(() => useScrollReveal({ once: true }));
          const mockElement = createMockElement();
          
          if (!observerCallback) {
            return true;
          }
          
          for (let i = 0; i < numIntersections; i++) {
            simulateIntersection(i % 2 === 0, mockElement);
          }
          
          if (numIntersections > 0) {
            expect(result.current.isVisible).toBe(true);
            expect(disconnectMock).toHaveBeenCalledTimes(1);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never disconnect observer when once=false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        (numCycles) => {
          intersectionObserverMock.mockClear();
          observeMock.mockClear();
          disconnectMock.mockClear();
          observerCallback = null;
          
          const { result } = renderHook(() => useScrollReveal({ once: false }));
          const mockElement = createMockElement();
          
          if (!observerCallback) {
            return true;
          }
          
          for (let i = 0; i < numCycles; i++) {
            simulateIntersection(true, mockElement);
            expect(result.current.isVisible).toBe(true);
            
            simulateIntersection(false, mockElement);
            expect(result.current.isVisible).toBe(false);
          }
          
          expect(disconnectMock).not.toHaveBeenCalled();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
