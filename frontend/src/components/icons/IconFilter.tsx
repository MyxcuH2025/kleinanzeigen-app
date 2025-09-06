import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconFilter: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="16" cy="7" r="3"/>
      <line x1="4" y1="7" x2="13" y2="7"/>
      <line x1="19" y1="7" x2="20" y2="7"/>
      <circle cx="8" cy="17" r="3"/>
      <line x1="4" y1="17" x2="5" y2="17"/>
      <line x1="11" y1="17" x2="20" y2="17"/>
    </svg>
  );
};
