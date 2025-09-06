import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconNotification: React.FC<IconProps> = ({ 
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
      strokeWidth="1.0"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 16c0-1.5 0-3.5 0-5a6 6 0 0 0-12 0c0 1.5 0 3.5 0 5l-2 3h16l-2-3z"/>
      <path d="M10.5 20a1.5 1.5 0 0 0 3 0"/>
    </svg>
  );
};
