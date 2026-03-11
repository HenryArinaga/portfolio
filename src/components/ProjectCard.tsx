import React, { useState } from 'react';
import { ImageGallery } from './ImageGallery';
import '../styles/components/ProjectCard.css';

export interface ProjectCardProps {
  name: string;
  description: string;
  technologies: string[];
  highlights?: string[];
  imageUrl?: string;
  galleryImages?: string[];
  projectUrl?: string;
  githubUrl?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  technologies,
  highlights,
  imageUrl,
  galleryImages,
  projectUrl,
  githubUrl,
}) => {
  const [imageError, setImageError] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const hasGallery = galleryImages && galleryImages.length > 0;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    e.currentTarget.src = '/images/placeholder.png';
    e.currentTarget.alt = 'Image unavailable';
  };

  const handleImageClick = () => {
    if (hasGallery) {
      setGalleryIndex(0);
      setGalleryOpen(true);
    }
  };

  return (
    <article className="project-card">
      <div 
        className={`project-card__image-container ${hasGallery ? 'project-card__image-container--clickable' : ''}`}
        onClick={handleImageClick}
        role={hasGallery ? 'button' : undefined}
        tabIndex={hasGallery ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasGallery && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleImageClick();
          }
        }}
      >
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={`${name} project screenshot`}
              className="project-card__image"
              loading="lazy"
              onError={handleImageError}
              width="400"
              height="300"
            />
            {hasGallery && (
              <div className="project-card__gallery-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>{galleryImages.length} photos</span>
              </div>
            )}
          </>
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

      {hasGallery && (
        <ImageGallery
          images={galleryImages}
          isOpen={galleryOpen}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
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
