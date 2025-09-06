import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconMehr: React.FC<IconProps> = ({ 
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
      <circle cx="12" cy="12" r="1" stroke={color} strokeWidth="2"/>
      <circle cx="19" cy="12" r="1" stroke={color} strokeWidth="2"/>
      <circle cx="5" cy="12" r="1" stroke={color} strokeWidth="2"/>
    </svg>
  );
};
