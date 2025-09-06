import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconLogout: React.FC<IconProps> = ({ 
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
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 4v-1a2 2 0 0 0-2-2H6a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h7a2 2 0 0 0 2-2v-1"/>
      <path d="M10 12h11m-3-3l3 3-3 3"/>
    </svg>
  );
};
