import React from 'react';
import '../styles/components/SkillBadge.css';

export interface SkillBadgeProps {
  name: string;
  icon?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
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
    proficiency && `skill-badge--${proficiency}`,
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
      {proficiency && (
        <span className="skill-badge__proficiency" aria-label={`Proficiency: ${proficiency}`}>
          {getProficiencyIndicator(proficiency)}
        </span>
      )}
    </div>
  );
};

function getProficiencyIndicator(proficiency: string): string {
  const indicators = {
    beginner: '●○○○',
    intermediate: '●●○○',
    advanced: '●●●○',
    expert: '●●●●',
  };
  return indicators[proficiency as keyof typeof indicators] || '';
}
