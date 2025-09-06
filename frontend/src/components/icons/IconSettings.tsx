import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconSettings: React.FC<IconProps> = ({ 
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
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
      <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.3 1a6.3 6.3 0 0 0-2.6-1.5l-.4-2.5h-4l-.4 2.5a6.3 6.3 0 0 0-2.6 1.5l-2.3-1-2 3.5 2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.5 2.3-1a6.3 6.3 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a6.3 6.3 0 0 0 2.6-1.5l2.3 1 2-3.5-2-1.5z"/>
    </svg>
  );
};
