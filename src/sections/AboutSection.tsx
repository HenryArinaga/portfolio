import ScrollReveal from "../components/ScrollReveal";
import { SkillBadge } from "../components/SkillBadge";
import profileImage from "../assets/mining.png";

const AboutSection = () => {
  const skills = [
    { name: "C", proficiency: 3 },
    { name: "Go", proficiency: 2 },
    { name: "TypeScript", proficiency: 2 },
    { name: "React", proficiency: 1.5 },
    { name: "SQL", proficiency: 3 },
    { name: "AWS", proficiency: 3 },
    { name: "Git / GitHub", proficiency: 4 },
  ];

  return (
    <section className="about" id="about">
      <div className="about-container">
        <ScrollReveal delay={0} threshold={0.2}>
          <h2 className="about-title">Who am I?</h2>
        </ScrollReveal>

        <div className="about-content">
          <ScrollReveal delay={100} threshold={0.2}>
            <div className="about-profile">
              <img
                src={profileImage}
                alt="Henry Arinaga profile"
                className="about-profile-image"
                loading="lazy"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} threshold={0.2}>
            <div className="about-biography">
              <p className="about-text">
                I'm Henry Arinaga, a first-generation Computer Science student who enjoys building
                reliable backend systems and tools. Most of my projects live close to the metal:
                C, Linux, system calls, and data structures. I like taking vague ideas, turning
                them into clear designs, and shipping code that is easy to reason about.
              </p>

              <p className="about-text">
                I enjoy working on projects that have real-world value and teach something meaningful
                through hands-on experience. My long-term goal is to become a backend cloud developer
                who builds systems that scale and make life easier for millions of people.
              </p>

              <a
                href="/Henry_Arinaga_Resume.pdf"
                className="about-resume-button"
                download
                aria-label="Download resume"
              >
                <span className="about-resume-icon" aria-hidden="true">📄</span>
                Download Resume
              </a>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={300} threshold={0.2}>
          <div className="about-skills">
            <h3 className="about-skills-title">Tech I work with</h3>
            <div className="about-skills-grid">
              {skills.map((skill) => (
                <SkillBadge
                  key={skill.name}
                  name={skill.name}
                  proficiency={skill.proficiency}
                  variant="filled"
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AboutSection;
