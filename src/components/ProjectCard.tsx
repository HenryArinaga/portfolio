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
      <div className="project-card__image-container">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`${name} project screenshot`}
            className="project-card__image"
            loading="lazy"
            onError={handleImageError}
            width="400"
            height="300"
          />
        ) : (
          <div className="project-card__placeholder">
            <svg 
              className="project-card__placeholder-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="project-card__placeholder-text">{name}</span>
          </div>
        )}
      </div>
      
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
