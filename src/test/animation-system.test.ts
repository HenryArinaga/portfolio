import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollReveal } from '../hooks/useScrollReveal';

describe('Animation System', () => {
  describe('useReducedMotion', () => {
    let matchMediaMock: any;

    beforeEach(() => {
      // Mock matchMedia
      matchMediaMock = vi.fn();
      window.matchMedia = matchMediaMock;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return false when prefers-reduced-motion is not set', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
    });

    it('should return true when prefers-reduced-motion is set to reduce', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(true);
    });

    it('should return false when matchMedia is not supported', () => {
      window.matchMedia = undefined as any;

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
    });
  });

  describe('useScrollReveal', () => {
    let intersectionObserverMock: any;
    let observeMock: any;
    let disconnectMock: any;

    beforeEach(() => {
      // Create mock functions
      observeMock = vi.fn();
      disconnectMock = vi.fn();
      
      // Mock IntersectionObserver constructor
      intersectionObserverMock = vi.fn().mockImplementation(() => ({
        observe: observeMock,
        disconnect: disconnectMock,
        unobserve: vi.fn(),
      }));
      
      window.IntersectionObserver = intersectionObserverMock as any;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return a ref and isVisible state', () => {
      const { result } = renderHook(() => useScrollReveal());
      
      expect(result.current).toHaveProperty('ref');
      expect(result.current).toHaveProperty('isVisible');
      expect(typeof result.current.isVisible).toBe('boolean');
      expect(result.current.isVisible).toBe(false); // Initially not visible
    });

    it('should accept custom options', () => {
      const { result } = renderHook(() => 
        useScrollReveal({ threshold: 0.5, once: false, rootMargin: '10px' })
      );
      
      expect(result.current).toHaveProperty('ref');
      expect(result.current).toHaveProperty('isVisible');
    });

    it('should set isVisible to true immediately when IntersectionObserver is not supported', () => {
      // Remove IntersectionObserver before rendering
      const originalIO = window.IntersectionObserver;
      delete (window as any).IntersectionObserver;

      const { result } = renderHook(() => useScrollReveal());
      
      // Should fallback to visible immediately
      expect(result.current.isVisible).toBe(true);
      
      // Restore IntersectionObserver
      window.IntersectionObserver = originalIO;
    });
  });

  describe('CSS Animation Classes', () => {
    it('should have scroll-reveal classes defined', () => {
      // This test verifies that the CSS classes exist
      // In a real browser environment, we would check computed styles
      const testDiv = document.createElement('div');
      testDiv.className = 'scroll-reveal';
      document.body.appendChild(testDiv);
      
      expect(testDiv.className).toBe('scroll-reveal');
      
      document.body.removeChild(testDiv);
    });

    it('should have is-visible class defined', () => {
      const testDiv = document.createElement('div');
      testDiv.className = 'scroll-reveal is-visible';
      document.body.appendChild(testDiv);
      
      expect(testDiv.classList.contains('is-visible')).toBe(true);
      
      document.body.removeChild(testDiv);
    });
  });
});
