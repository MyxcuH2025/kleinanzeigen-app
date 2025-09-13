import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface ParallaxImageGalleryProps {
  images: string | string[];
  selectedIndex: number;
  onImageChange: (index: number) => void;
  onZoom: () => void;
  onClose: () => void;
  getImageUrl: (path: string) => string;
}

export const ParallaxImageGallery: React.FC<ParallaxImageGalleryProps> = ({
  images,
  selectedIndex,
  onImageChange,
  onZoom,
  onClose,
  getImageUrl
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Performance-optimiert: Keine Mouse-Tracking
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageArray = Array.isArray(images) ? images : [images];
  const currentImage = imageArray[selectedIndex];

  // Performance-optimiert: Keine Mouse-Tracking

  const nextImage = () => {
    onImageChange((selectedIndex + 1) % imageArray.length);
  };

  const prevImage = () => {
    onImageChange((selectedIndex - 1 + imageArray.length) % imageArray.length);
  };

  // Performance-optimiert: Einfache Touch-Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    // Einfache Touch-Handling ohne komplexe Berechnungen
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Minimal
  };

  const handleTouchEnd = () => {
    // Minimal
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        height: { xs: 350, md: 450 },
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: '#f8f9fa',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease', // Nur einfache Transition
        border: '1px solid rgba(220, 248, 198, 0.3)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Minimale Schatten
          borderColor: 'rgba(220, 248, 198, 0.5)'
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onZoom}
    >
      {/* 3D Parallax Background */}
      {/* Performance-optimiert: Statischer Hintergrund */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)',
          zIndex: 1
        }}
      />

      {/* Performance-optimiertes Bild */}
      <Box
        component="img"
        src={getImageUrl(currentImage)}
        alt={`Bild ${selectedIndex + 1}`}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          zIndex: 2,
          bgcolor: '#f8f9fa'
        }}
      />

      {/* Performance-optimierter Zoom Button */}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onZoom();
        }}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          p: 1,
          zIndex: 10,
          '&:hover': {
            bgcolor: 'rgba(220, 248, 198, 0.9)'
          }
        }}
      >
        <ZoomInIcon sx={{ 
          color: '#22c55e',
          fontSize: 20
        }} />
      </IconButton>

      {/* Performance-optimierte Navigation */}
      {imageArray.length > 1 && !isMobile && (
        <>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              p: 1,
              zIndex: 10,
              '&:hover': {
                bgcolor: 'rgba(220, 248, 198, 0.9)'
              }
            }}
          >
            <PrevIcon sx={{ color: '#22c55e', fontSize: 20 }} />
          </IconButton>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px',
              p: 1,
              zIndex: 10,
              '&:hover': {
                bgcolor: 'rgba(220, 248, 198, 0.9)'
              }
            }}
          >
            <NextIcon sx={{ color: '#22c55e', fontSize: 20 }} />
          </IconButton>
        </>
      )}

      {/* Performance-optimierter Counter */}
      {imageArray.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            zIndex: 10
          }}
        >
          {selectedIndex + 1} / {imageArray.length}
        </Box>
      )}

      {/* Swipe Indicator for Mobile */}
      {isMobile && imageArray.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 10
          }}
        >
          {imageArray.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === selectedIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
