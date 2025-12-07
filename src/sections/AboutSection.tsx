import useFadeInOnScroll from "../hooks/useFadeInOnScroll";

const AboutSection = () => {
  const { ref, isVisible } = useFadeInOnScroll();
    return (
      <section 
      ref={ref}
      className={`about fade-in-section ${isVisible ? "is-visible" : ""}`} 
        id="about"
        >
        <div className="about-content">
          <h2 className="about-title">Who am I?</h2>
  
          <p className="about-text">
            I’m Henry Arinaga, a first-generation Computer Science student who loves
            building backend systems, tools, and educational projects. I enjoy
            solving problems at a low level and turning complex ideas into clear,
            practical software.
          </p>
  
          <div className="about-techstack">
            <h3 className="about-tech-title">Tech I work with</h3>
            <ul className="about-tech-list">
              <li>React</li>
              <li>TypeScript</li>
              <li>Go</li>
              <li>C</li>
              <li>MariaDB / SQL</li>
            </ul>
          </div>
        </div>
      </section>
    );
  };
  
  export default AboutSection;
  