import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconChat: React.FC<IconProps> = ({ 
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
      <path d="M20 13a3 3 0 0 1-3 3H9l-4 3v-11a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v5z"/>
      <circle cx="9" cy="11.5" r="0.5"/>
      <circle cx="12" cy="11.5" r="0.5"/>
      <circle cx="15" cy="11.5" r="0.5"/>
    </svg>
  );
};
