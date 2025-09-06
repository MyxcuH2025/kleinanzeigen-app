import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconVideo: React.FC<IconProps> = ({ 
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
      <polygon points="23,7 16,12 23,17 23,7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke={color} strokeWidth="2"/>
    </svg>
  );
};
