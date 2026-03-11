import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/ImageGallery.css';

export interface ImageGalleryProps {
  images: string[];
  isOpen: boolean;
  initialIndex: number;
  onClose: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  isOpen,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goToNext, goToPrevious]);

  if (!isOpen) return null;

  const galleryContent = (
    <div className="gallery-overlay" onClick={onClose}>
      <div className="gallery-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="gallery-close"
          onClick={onClose}
          aria-label="Close gallery"
        >
          ×
        </button>

        {images.length > 1 && (
          <>
            <button
              className="gallery-nav gallery-nav--prev"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="gallery-nav gallery-nav--next"
              onClick={goToNext}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        <div className="gallery-image-container">
          <img
            src={images[currentIndex]}
            alt={`Gallery image ${currentIndex + 1} of ${images.length}`}
            className="gallery-image"
          />
        </div>

        {images.length > 1 && (
          <div className="gallery-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(galleryContent, document.body);
};
