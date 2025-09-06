import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconGallery: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '' 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="15.5" cy="8.5" r="2"/>
      <path d="M4 17l5-5 4 4 5-5 2 2"/>
    </svg>
  );
};
