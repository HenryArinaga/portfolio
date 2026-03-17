import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/blogApi';
import '../styles/components/BlogCard.css';

export interface BlogCardProps {
  title: string;
  date: string;
  preview: string;
  slug: string;
  readTime?: string;
  imageUrl?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  title,
  date,
  preview,
  slug,
  readTime,
  imageUrl,
}) => {
  return (
    <article className="blog-card">
      <Link
        to={`/blog/${slug}`}
        className="blog-card__link"
      >
        {imageUrl && (
          <div className="blog-card__image">
            <img
              src={getImageUrl(imageUrl)}
              alt={title}
              className="blog-card__image-element"
              loading="lazy"
            />
          </div>
        )}
        <div className="blog-card__content">
          <header className="blog-card__header">
            <h3 className="blog-card__title">{title}</h3>
            <div className="blog-card__meta">
              <time className="blog-card__date" dateTime={date}>
                {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {readTime && (
                <>
                  <span className="blog-card__separator" aria-hidden="true">•</span>
                  <span className="blog-card__read-time">{readTime}</span>
                </>
              )}
            </div>
          </header>
          
          <p className="blog-card__preview">{preview}</p>
          
          <span className="blog-card__read-more" aria-label={`Read more about ${title}`}>
            Read more →
          </span>
        </div>
      </Link>
    </article>
  );
};
