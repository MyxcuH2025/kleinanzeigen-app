import React from 'react';
import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';

interface LogoProps extends Omit<BoxProps, 'component'> {
  height?: number | string;
  width?: number | string;
  variant?: 'default' | 'white' | 'small';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  height = 40, 
  width = 'auto', 
  variant = 'default',
  onClick,
  sx,
  ...props 
}) => {
  const getLogoSrc = () => {
    switch (variant) {
      case 'white':
        return '/images/logo-white.webp';
      case 'small':
        return '/images/logo.webp';
      default:
        return '/images/logo.webp';
    }
  };

  return (
    <Box
      component="img"
      src={getLogoSrc()}
      alt="tüka Logo"
      sx={{
        height: 56,
        width: 56,
        objectFit: 'contain',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 1.5,
        border: '1px solid #e5e7eb',
        bgcolor: '#f9fafb',
        p: 1,
        '&:hover': onClick ? {
          bgcolor: '#f3f4f6',
          borderColor: '#d1d5db'
        } : {},
        ...sx
      }}
      onClick={onClick}
      {...props}
    />
  );
}; 