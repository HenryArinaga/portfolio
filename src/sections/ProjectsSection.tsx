import useFadeInOnScroll from "../hooks/useFadeInOnScroll";

type Project = {
  title: string;
  description: string;
  tech: string[];
  highlights?: string[]; // added optional highlights
  link?: string;
  imageAlt: string;
};

const projects: Project[] = [
  {
    title: "RSAlite",
    description:
      "An educational RSA factorization tool written in C. Lets users explore prime generation, integer factorization, and performance differences between algorithms while keeping the codebase small and readable.",
    tech: ["C", "Make", "CLI", "GTK (planned)"],
    imageAlt: "RSAlite terminal output mockup",
    link: "https://github.com/henryarin/rsalite",
    highlights: [
      "Modular design for swapping factorization methods",
      "Comparison of trial division vs sqrt-based approaches and more",
      "Clear separation between core logic and I/O"
    ]
  },
  {
    title: "CPU Usage Visualizer",
    description:
      "A C and X11-based visualizer that reads /proc/stat and renders per-core CPU usage as smooth animated bars in real time.",
    tech: ["C", "X11", "Linux"],
    imageAlt: "CPU usage bar graph mockup"
  }
];


const ProjectsSection = () => {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section
      ref={ref}
      className={`projects fade-in-section ${isVisible ? "is-visible" : ""}`}
      id="projects"
    >
      <div className="projects-inner">
        <h2 className="projects-title">Projects</h2>

        <div className="projects-list">
          {projects.map((project, index) => (
            <article
              key={project.title}
              className={`
                project-item 
                project-fade 
                project-delay-${index + 1}
                ${isVisible ? "is-visible" : ""}
              `}
            >
              <div className="project-text">
                <h3 className="project-name">{project.title}</h3>
                <p className="project-description">{project.description}</p>

                {/* technical highlights */}
                {project.highlights && (
                  <ul className="project-highlights">
                    {project.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}

                {/* tech list */}
                <ul className="project-tech">
                  {project.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                {project.link && (
                  <a
                    className="project-link"
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on GitHub
                  </a>
                )}
              </div>

              <div className="project-image">
                <div className="project-image-placeholder">
                  <span>{project.imageAlt}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
