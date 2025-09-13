import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { PLACEHOLDER_IMAGE_URL } from '@/config/config';

interface SmartImageProps {
  src: string;
  alt: string;
  sx?: any;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const SmartImage: React.FC<SmartImageProps> = ({ src, alt, sx, onError }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attempts, setAttempts] = useState(0);

  // Wenn src sich ändert, reset attempts
  useEffect(() => {
    setCurrentSrc(src);
    setAttempts(0);
  }, [src]);

  const possibleUrls = [
    src,
    src.replace('/api/images/', '/api/uploads/'),
    src.replace('/api/images/', '/static/'),
    src.replace('/api/images/', '/uploads/'),
    `http://localhost:8000/api/images/${src.split('/').pop()}`,
    `http://localhost:8000/api/uploads/${src.split('/').pop()}`,
    `http://localhost:8000/static/${src.split('/').pop()}`,
    `http://localhost:8000/uploads/${src.split('/').pop()}`
  ];

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (attempts < possibleUrls.length - 1) {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      setCurrentSrc(possibleUrls[nextAttempt]);
    } else {
      setCurrentSrc(PLACEHOLDER_IMAGE_URL);
      if (onError) {
        onError(e);
      }
    }
  };

  return (
    <Box
      component="img"
      src={currentSrc}
      alt={alt}
      onError={handleError}
      sx={sx}
    />
  );
};
