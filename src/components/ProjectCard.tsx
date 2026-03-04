import React, { useState } from 'react';
import '../styles/components/ProjectCard.css';

export interface ProjectCardProps {
  name: string;
  description: string;
  technologies: string[];
  highlights?: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  technologies,
  highlights,
  imageUrl,
  projectUrl,
  githubUrl,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    e.currentTarget.src = '/images/placeholder.png';
    e.currentTarget.alt = 'Image unavailable';
  };

  return (
    <article className="project-card">
      {imageUrl && !imageError && (
        <div className="project-card__image-container">
          <img
            src={imageUrl}
            alt={`${name} project screenshot`}
            className="project-card__image"
            loading="lazy"
            onError={handleImageError}
            width="400"
            height="300"
          />
        </div>
      )}
      
      <div className="project-card__content">
        <h3 className="project-card__title">{name}</h3>
        <p className="project-card__description">{description}</p>
        
        {highlights && highlights.length > 0 && (
          <ul className="project-card__highlights">
            {highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        )}
        
        <div className="project-card__metadata">
          <div className="project-card__technologies">
            {technologies.map((tech, index) => (
              <span key={index} className="project-card__tech-tag">
                {tech}
              </span>
            ))}
          </div>
          
          <div className="project-card__links">
            {projectUrl && (
              <a
                href={projectUrl}
                className="project-card__link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${name} project`}
              >
                View Project
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                className="project-card__link project-card__link--github"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${name} on GitHub`}
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
