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
  galleryImages?: string[];
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
    link: "https://github.com/HenryArinaga/RSAlite",
    imageAlt: "RSAlite terminal output mockup",
    imageUrl: "/images/rsalite-main.png",
    galleryImages: [
      "/images/rsalite-main.png",
      "/images/rsalite-settings.png",
      "/images/rsalite-logs.png",
    ],
  },

  {
    title: "The Danger Room",
    description:
      "Backend for a fighting-game simulation platform that serves character data, move analytics, matchup summaries, and simulation results through a Go API.",
    tech: ["Go", "REST API", "JSON", "HTTP"],
    highlights: [
      "Built simulation endpoints for move-by-move matchup analysis",
      "Exposed character, matchup, and fastest-normal ranking APIs",
      "Added observability with health checks, request logging, and metrics",
      "Loaded structured move data from JSON into a modular server architecture",
    ],
    imageAlt: "The Danger Room backend project",
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
    galleryImages: project.galleryImages,
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
                galleryImages={project.galleryImages}
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
