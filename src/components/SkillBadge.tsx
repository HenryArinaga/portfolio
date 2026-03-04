import React from 'react';
import '../styles/components/SkillBadge.css';

export interface SkillBadgeProps {
  name: string;
  icon?: string;
  proficiency?: number;
  variant?: 'default' | 'outlined' | 'filled';
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  icon,
  proficiency,
  variant = 'default',
}) => {
  const badgeClasses = [
    'skill-badge',
    `skill-badge--${variant}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={badgeClasses}>
      {icon && (
        <span className="skill-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="skill-badge__name">{name}</span>
      {proficiency !== undefined && (
        <span className="skill-badge__proficiency" aria-label={`Proficiency: ${proficiency} out of 4`}>
          {renderProficiencyDots(proficiency)}
        </span>
      )}
    </div>
  );
};

function getColorForLevel(level: number): string {
  // Red (low) → Yellow (mid) → Green (high)
  if (level <= 1) return '#ef4444'; // red
  if (level <= 2) return '#eab308'; // yellow
  return '#22c55e'; // green
}

function renderProficiencyDots(proficiency: number): React.ReactNode {
  const maxDots = 4;
  const dots: React.ReactNode[] = [];
  
  for (let i = 1; i <= maxDots; i++) {
    const fillAmount = Math.max(0, Math.min(1, proficiency - (i - 1)));
    const color = getColorForLevel(i <= proficiency ? i : proficiency);
    
    if (fillAmount === 0) {
      // Empty dot
      dots.push(
        <span
          key={i}
          className="skill-dot skill-dot--empty"
          style={{ borderColor: '#64748b' }}
        />
      );
    } else if (fillAmount === 1) {
      // Full dot
      dots.push(
        <span
          key={i}
          className="skill-dot skill-dot--full"
          style={{ backgroundColor: color }}
        />
      );
    } else {
      // Half dot
      dots.push(
        <span
          key={i}
          className="skill-dot skill-dot--half"
          style={{
            background: `linear-gradient(90deg, ${color} 50%, transparent 50%)`,
            borderColor: color,
          }}
        />
      );
    }
  }
  
  return <span className="skill-dots-container">{dots}</span>;
}
