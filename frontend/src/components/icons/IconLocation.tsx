import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconLocation: React.FC<IconProps> = ({ 
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
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2"/>
    </svg>
  );
};
