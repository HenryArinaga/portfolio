import { useEffect, useRef, useState } from 'react';

const FooterSection = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = footerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3 
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <footer
      id="contact"
      ref={footerRef}
      className={`footer ${isVisible ? 'footer-visible' : ''}`}
    >
      <div className="footer-inner">
        <div className="footer-content">
          <h2 className="footer-title">Let&apos;s connect</h2>

          <p className="footer-text">
            I&apos;m always open to chatting about backend development, systems work,
            internships, or cool side projects. Feel free to reach out.
          </p>

          <div className="footer-contact">
            <div className="footer-contact-group">
              <span className="footer-label">Email</span>
              <a
                href="mailto:your.email@example.com"
                className="footer-link"
              >
                your.email@example.com
              </a>
            </div>

            <div className="footer-contact-group">
              <span className="footer-label">GitHub</span>
              <a
                href="https://github.com/your-username"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                github.com/your-username
              </a>
            </div>

            <div className="footer-contact-group">
              <span className="footer-label">LinkedIn</span>
              <a
                href="https://www.linkedin.com/in/your-linkedin"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                linkedin.com/in/your-linkedin
              </a>
            </div>

            <div className="footer-contact-group">
              <span className="footer-label">Location</span>
              <span className="footer-link">Wasco, CA</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-bottom-text">
            © {new Date().getFullYear()} Henry Arinaga. Shooting for the stars ✨
          </span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
