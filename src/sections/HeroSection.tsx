import profileImg from "../assets/profile.jpg";
import { useReducedMotion } from "../hooks/useReducedMotion";

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="hero" id="hero">
      {/* Enhanced background with gradient overlay */}
      <div className="hero-background">
        <div className="hero-gradient-overlay"></div>
      </div>

      <div className="hero-content">
        {/* Profile image with staggered animation */}
        <div 
          className={`hero-profile ${!prefersReducedMotion ? 'hero-stagger-1' : ''}`}
        >
          <img src={profileImg} alt="Henry Arinaga profile" />
        </div>

        {/* Headline with staggered animation */}
        <h1 
          className={`hero-name ${!prefersReducedMotion ? 'hero-stagger-2' : ''}`}
        >
          Henry Arinaga
        </h1>

        <div 
          className={`hero-name-divider ${!prefersReducedMotion ? 'hero-stagger-3' : ''}`}
        ></div>

        {/* Tagline with staggered animation */}
        <div className={`hero-tagline-wrapper ${!prefersReducedMotion ? 'hero-stagger-4' : ''}`}>
          <p className="hero-tagline">
            Building backend systems, tools, and educational projects.
          </p>
          <p className="hero-subtitle">CSUB Computer Science Student</p>
        </div>

        {/* CTA (social links) with staggered animation */}
        <div 
          className={`hero-socials ${!prefersReducedMotion ? 'hero-stagger-5' : ''}`}
        >
          <a 
            href="https://github.com/henryarin" 
            target="_blank" 
            rel="noreferrer"
            className="hero-social-link"
          >
            GitHub
          </a>
          <a 
            href="https://www.linkedin.com/in/henryarinaga/" 
            target="_blank" 
            rel="noreferrer"
            className="hero-social-link"
          >
            LinkedIn
          </a>
          <a 
            href="mailto:Henryarinaga@gmail.com"
            className="hero-social-link"
          >
            Email
          </a>
        </div>

        {/* Animated scroll indicator with staggered animation */}
        <div 
          className={`hero-scroll-indicator ${!prefersReducedMotion ? 'hero-stagger-6' : ''}`}
          aria-label="Scroll down to view more content"
        >
          <span className="hero-scroll-text">Scroll</span>
          <span className="hero-scroll-arrow">↓</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
