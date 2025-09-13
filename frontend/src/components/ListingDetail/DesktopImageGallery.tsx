import React from 'react';
import {
  Box,
  IconButton,
  Typography
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';

interface DesktopImageGalleryProps {
  images: string | string[];
  selectedIndex: number;
  onImageChange: (index: number) => void;
  onZoom: () => void;
  getImageUrl: (path: string) => string;
}

export const DesktopImageGallery: React.FC<DesktopImageGalleryProps> = ({
  images,
  selectedIndex,
  onImageChange,
  onZoom,
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
        height: 400,
        borderRadius: '16px',
        overflow: 'hidden',
        bgcolor: '#f5f5f5',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }
      }}
      onClick={onZoom}
    >
      {/* Zoom-Button */}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onZoom();
        }}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          bgcolor: 'rgba(255,255,255,0.9)',
          color: '#333',
          zIndex: 10,
          '&:hover': {
            bgcolor: 'rgba(255,255,255,1)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <ZoomInIcon />
      </IconButton>

      {/* Bild */}
      <Box
        component="img"
        src={getImageUrl(currentImage)}
        alt={`Bild ${selectedIndex + 1}`}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      {/* Navigation */}
      {imageArray.length > 1 && (
        <>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            sx={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)',
              color: '#333',
              zIndex: 10,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,1)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <PrevIcon />
          </IconButton>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)',
              color: '#333',
              zIndex: 10,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,1)',
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
