import React from 'react';
import {
  Box,
  IconButton,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';

interface MobileImageGalleryProps {
  images: string | string[];
  selectedIndex: number;
  onImageChange: (index: number) => void;
  onClose: () => void;
  getImageUrl: (path: string) => string;
}

export const MobileImageGallery: React.FC<MobileImageGalleryProps> = ({
  images,
  selectedIndex,
  onImageChange,
  onClose,
  getImageUrl
}) => {
  const imageArray = Array.isArray(images) ? images : [images];
  const currentImage = imageArray[selectedIndex];

  const nextImage = () => {
    onImageChange((selectedIndex + 1) % imageArray.length);
  };

  const prevImage = () => {
    onImageChange((selectedIndex - 1 + imageArray.length) % imageArray.length);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: 300,
        borderRadius: '16px',
        overflow: 'hidden',
        bgcolor: '#f5f5f5'
      }}
    >
      {/* Schließen-Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: 'rgba(0,0,0,0.7)',
          color: 'white',
          zIndex: 10,
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.9)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Bild */}
      <Box
        component="img"
        src={getImageUrl(currentImage)}
        alt={`Bild ${selectedIndex + 1}`}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer'
        }}
        onClick={onClose}
      />

      {/* Navigation */}
      {imageArray.length > 1 && (
        <>
          <IconButton
            onClick={prevImage}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              zIndex: 10,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <PrevIcon />
          </IconButton>

          <IconButton
            onClick={nextImage}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              zIndex: 10,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <NextIcon />
          </IconButton>
        </>
      )}

      {/* Bild-Indikator */}
      {imageArray.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: 'rgba(0,0,0,0.75)',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {selectedIndex + 1} / {imageArray.length}
        </Box>
      )}
    </Box>
  );
};
