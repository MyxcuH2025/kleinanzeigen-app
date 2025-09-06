import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconHome: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '' 
}) => {
  console.log('IconHome rendered with size:', size, 'color:', color);
  
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
      <path d="M4 10v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8l-7-6a2 2 0 0 0-2 0l-7 6z"/>
    </svg>
  );
};
