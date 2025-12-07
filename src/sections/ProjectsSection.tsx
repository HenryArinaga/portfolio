import useFadeInOnScroll from "../hooks/useFadeInOnScroll";

type Project = {
    title: string;
    description: string;
    tech: string[];
    link?: string;
    imageAlt: string;
  };
  
  const projects: Project[] = [
    {
      title: 'RSAlite',
      description:
        'An educational RSA factorization tool written in C that lets users explore prime numbers, factorization methods, and timing comparisons.',
      tech: ['C', 'Make', 'GTK (planned)', 'CLI'],
      link: 'https://github.com/henryarin/rsalite',
      imageAlt: 'RSAlite terminal output mockup'
    },
    {
      title: 'CPU Usage Visualizer',
      description:
        'A C and X11-based visualizer that renders per-core CPU usage as smooth, animated bars using Linux /proc data.',
      tech: ['C', 'X11', 'Linux'],
      imageAlt: 'CPU usage bar graph mockup'
    }
  ];
  
  const ProjectsSection = () => {
    const { ref, isVisible } = useFadeInOnScroll();
    return (
      <section 
      ref={ref} 
      className={`projects fade-in-section ${isVisible ? "is-visible" : ""}`}
      id="projects">
        <div className="projects-inner">
          <h2 className="projects-title">Projects</h2>
  
          <div className="projects-list">
            {projects.map((project) => (
              <article key={project.title} className="project-item">
                <div className="project-text">
                  <h3 className="project-name">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
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
  