import { ProjectCard } from "../components/ProjectCard";
import ScrollReveal from "../components/ScrollReveal";

type Project = {
  title: string;
  description: string;
  tech: string[];
  highlights?: string[];
  link?: string;
  imageAlt: string;
  imageUrl?: string;
};

const projects: Project[] = [
  {
    title: "RSAlite",
    description:
      "An educational RSA factorization tool written in C that lets users explore prime numbers, factorization methods, and timing comparisons.",
    tech: ["C", "Make", "GTK", "CLI"],
    highlights: [
      "O(√n) optimized prime-checking",
      "Multiple factorization methods (trial division, sqrt, etc)",
      "Benchmarked execution paths",
      "Modular architecture for algorithm swapping",
    ],
    link: "https://github.com/henryarin/rsalite",
    imageAlt: "RSAlite terminal output mockup",
    // TO ADD YOUR SCREENSHOT:
    // 1. Save your screenshot as: public/images/rsalite-screenshot.png (or .jpg, .gif)
    // 2. Replace the imageUrl below with: "/images/rsalite-screenshot.png"
    imageUrl: "https://via.placeholder.com/800x600/1a1a2e/eee?text=RSAlite+Screenshot",
  },

  {
    title: "CPU Usage Visualizer",
    description:
      "A C and X11-based visualizer that renders per-core CPU usage as smooth, animated bars using Linux /proc data.",
    tech: ["C", "X11", "Linux"],
    imageAlt: "CPU usage bar graph mockup",
    // TO ADD YOUR SCREENSHOT:
    // 1. Save your screenshot as: public/images/cpu-visualizer-screenshot.png (or .jpg, .gif)
    // 2. Replace the imageUrl below with: "/images/cpu-visualizer-screenshot.png"
    imageUrl: "https://via.placeholder.com/800x600/1a1a2e/eee?text=CPU+Visualizer+Screenshot",
  },
];

const ProjectsSection = () => {
  // Convert project data to match ProjectCardProps interface
  const projectCards = projects.map((project) => ({
    name: project.title,
    description: project.description,
    technologies: project.tech,
    highlights: project.highlights,
    imageUrl: project.imageUrl,
    githubUrl: project.link,
    projectUrl: undefined,
  }));

  return (
    <section className="projects section-spacing" id="projects">
      <div className="container">
        <h2 className="projects-title">Projects</h2>

        <div className="projects-grid">
          {projectCards.map((project, index) => (
            <ScrollReveal
              key={project.name}
              delay={index * 100} // Staggered delay: 0ms, 100ms, 200ms, etc.
              threshold={0.2}
              once={true}
              variant="slide-up"
            >
              <ProjectCard
                name={project.name}
                description={project.description}
                technologies={project.technologies}
                highlights={project.highlights}
                imageUrl={project.imageUrl}
                githubUrl={project.githubUrl}
                projectUrl={project.projectUrl}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;