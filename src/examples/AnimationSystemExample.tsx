import React from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Example component demonstrating the animation system usage
 * 
 * This file shows how to use:
 * - ScrollReveal component for declarative scroll animations
 * - useScrollReveal hook for custom scroll animation logic
 * - useReducedMotion hook for accessibility
 * - Animation CSS classes for hover effects and transitions
 */
export const AnimationSystemExample: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Animation System Examples</h1>

      {/* Example 1: Using ScrollReveal component */}
      <section style={{ marginTop: '100vh' }}>
        <h2>Example 1: ScrollReveal Component</h2>
        
        <ScrollReveal variant="slide-up" delay={0}>
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: '#f0f0f0' }}>
            <h3>Card 1 - Slides up on scroll</h3>
            <p>This card uses the ScrollReveal component with slide-up animation.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade" delay={100}>
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: '#f0f0f0' }}>
            <h3>Card 2 - Fades in with delay</h3>
            <p>This card fades in 100ms after the first card.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scale" delay={200}>
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: '#f0f0f0' }}>
            <h3>Card 3 - Scales in with delay</h3>
            <p>This card scales in 200ms after the first card.</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Example 2: Using useScrollReveal hook directly */}
      <section style={{ marginTop: '50vh' }}>
        <h2>Example 2: useScrollReveal Hook</h2>
        
        <div 
          ref={ref} 
          className={`scroll-reveal ${isVisible ? 'is-visible' : ''}`}
          style={{ padding: '1rem', background: '#e0e0e0' }}
        >
          <h3>Custom Hook Usage</h3>
          <p>This element uses the useScrollReveal hook directly for custom animation logic.</p>
          <p>Visibility state: {isVisible ? 'Visible' : 'Hidden'}</p>
        </div>
      </section>

      {/* Example 3: Hover effects */}
      <section style={{ marginTop: '50vh' }}>
        <h2>Example 3: Hover Effects</h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="hover-lift button-press" style={{ padding: '1rem 2rem' }}>
            Hover Lift Effect
          </button>
          
          <button className="hover-scale button-press" style={{ padding: '1rem 2rem' }}>
            Hover Scale Effect
          </button>
          
          <button className="hover-scale-subtle button-press" style={{ padding: '1rem 2rem' }}>
            Subtle Scale Effect
          </button>
        </div>
      </section>

      {/* Example 4: Reduced motion detection */}
      <section style={{ marginTop: '50vh', marginBottom: '50vh' }}>
        <h2>Example 4: Reduced Motion Detection</h2>
        
        <div style={{ padding: '1rem', background: '#d0d0d0' }}>
          <h3>Accessibility Status</h3>
          <p>
            <strong>Prefers Reduced Motion:</strong> {prefersReducedMotion ? 'Yes' : 'No'}
          </p>
          <p>
            {prefersReducedMotion 
              ? 'Animations are disabled or minimized for accessibility.'
              : 'Full animations are enabled.'}
          </p>
        </div>
      </section>
    </div>
  );
};

export default AnimationSystemExample;
