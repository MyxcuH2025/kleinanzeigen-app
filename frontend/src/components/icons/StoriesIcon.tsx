import React from 'react';

interface StoriesIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const StoriesIcon: React.FC<StoriesIconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  className 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`gBody-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF8A5C"></stop>
          <stop offset="1" stopColor="#C44CC5"></stop>
        </linearGradient>
        <linearGradient id={`gBlue-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4FC3F7"></stop>
          <stop offset="1" stopColor="#2979FF"></stop>
        </linearGradient>
        <linearGradient id={`gPurple-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9C27B0"></stop>
          <stop offset="1" stopColor="#673AB7"></stop>
        </linearGradient>
        <linearGradient id={`gOrange-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD180"></stop>
          <stop offset="1" stopColor="#FF8A65"></stop>
        </linearGradient>
      </defs>

      {/* Icon-Körper */}
      <rect x="8" y="8" width="240" height="240" rx="48" fill={`url(#gBody-${size})`}></rect>

      <g transform="translate(128,128)">
        {/* Linke Sprechblase */}
        <path d="M-66 -6 a54 54 0 1 0 0 108 l0 16 l22 -16 a54 54 0 1 0 -22 -108z" fill={`url(#gBlue-${size})`} opacity="0.95" transform="translate(-16,-26) scale(0.9)"></path>
        {/* Rechte Sprechblase */}
        <path d="M66 -6 a54 54 0 1 1 0 108 l0 16 l-22 -16 a54 54 0 1 1 22 -108z" fill={`url(#gOrange-${size})`} opacity="0.95" transform="translate(16,-26) scale(0.9)"></path>
        {/* Vordere Sprechblase */}
        <path d="M0 -70 a70 70 0 1 1 0 140 l0 18 l-26 -18 a70 70 0 1 1 26 -140z" fill={`url(#gPurple-${size})`} opacity="0.92" transform="translate(0,0) scale(0.78)"></path>

        {/* Play-Button */}
        <circle r="30" fill="rgba(255,255,255,0.18)"></circle>
        <path d="M-8 -14 L18 0 L-8 14 Z" fill="#FFFFFF"></path>

        {/* Mini-Uhr */}
        <g transform="translate(36,-6) scale(0.9)">
          <circle r="10" fill="none" stroke="#FFFFFF" strokeWidth="3"></circle>
        </g>
      </g>
    </svg>
  );
};

export default StoriesIcon;
