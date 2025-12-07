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
          I’m Henry Arinaga, a first-generation Computer Science student who enjoys building
          reliable backend systems and tools. Most of my projects live close to the metal:
          C, Linux, system calls, and data structures. I like taking vague ideas, turning
          them into clear designs, and shipping code that is easy to reason about.
        </p>

        <p className="about-text">
          I enjoy working on projects that have real-world value and teach something meaningful
          through hands-on experience. My long-term goal is to become a backend cloud developer
          who builds systems that scale and make life easier for millions of people.
        </p>

        <div className="about-techstack">
          <h3 className="about-tech-title">Tech I work with</h3>
          <ul className="about-tech-list">
            <li>C</li>
            <li>Go</li>
            <li>TypeScript / React</li>
            <li>MariaDB / SQL</li>
            <li>AWS</li>
            <li>Git / GitHub</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
