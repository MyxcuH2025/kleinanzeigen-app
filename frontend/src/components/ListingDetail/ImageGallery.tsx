import * as React from 'react';
import { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Typography,
  Chip,
  Fade,
  Zoom
} from '@mui/material';
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Close as CloseIcon,
  ImageNotSupported as NoImageIcon
} from '@mui/icons-material';

// Mobile Image Gallery Component
interface MobileImageGalleryProps {
  images: string | string[];
  selectedIndex: number;
  onImageChange: (index: number) => void;
  onClose: () => void;
  getImageUrl: (imagePath: string) => string;
}

export const MobileImageGallery: React.FC<MobileImageGalleryProps> = ({
  images,
  selectedIndex,
  onImageChange,
  onClose,
  getImageUrl
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const galleryRef = useRef(null);
  
  // Normalize images to array
  const imagesArray = Array.isArray(images) ? images : [images];

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < imagesArray.length - 1) {
      handleImageChange(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      handleImageChange(currentIndex - 1);
    }
  };

  const handleImageChange = (newIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    onImageChange(newIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      handleImageChange(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < imagesArray.length - 1) {
      handleImageChange(currentIndex + 1);
    }
  };

  if (imagesArray.length === 0) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white'
        }}
      >
        <NoImageIcon sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h6">Keine Bilder verfügbar</Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      ref={galleryRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        touchAction: 'pan-y'
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          zIndex: 10000
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Image Counter */}
      <Chip
        label={`${currentIndex + 1} / ${imagesArray.length}`}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          zIndex: 10000
        }}
      />

      {/* Main Image */}
      <Fade in={!isTransitioning} timeout={300}>
        <Box
          sx={{
            maxWidth: '90%',
            maxHeight: '80%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={getImageUrl(imagesArray[currentIndex])}
            alt={`Bild ${currentIndex + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
        </Box>
      </Fade>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <IconButton
          onClick={goToPrevious}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000
          }}
        >
          <NavigateBeforeIcon />
        </IconButton>
      )}

      {currentIndex < imagesArray.length - 1 && (
        <IconButton
          onClick={goToNext}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000
          }}
        >
          <NavigateNextIcon />
        </IconButton>
      )}

      {/* Thumbnail Strip */}
      {imagesArray.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            justifyContent: 'center',
            '&::-webkit-scrollbar': {
              height: 4
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 2
            }
          }}
        >
          {imagesArray.map((image, index) => (
            <Box
              key={index}
              onClick={() => handleImageChange(index)}
              sx={{
                minWidth: 60,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: currentIndex === index ? '2px solid white' : '2px solid transparent',
                opacity: currentIndex === index ? 1 : 0.7,
                transition: 'all 0.2s ease'
              }}
            >
              <img
                src={getImageUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Desktop Image Gallery Component
interface DesktopImageGalleryProps {
  images: string | string[];
  selectedIndex: number;
  onImageChange: (index: number) => void;
  onZoom: () => void;
  getImageUrl: (imagePath: string) => string;
}

export const DesktopImageGallery: React.FC<DesktopImageGalleryProps> = ({
  images,
  selectedIndex,
  onImageChange,
  onZoom,
  getImageUrl
}) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  
  // Normalize images to array
  const imagesArray = Array.isArray(images) ? images : [images];

  const handleImageChange = (newIndex: number) => {
    setCurrentIndex(newIndex);
    onImageChange(newIndex);
  };

  if (imagesArray.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: '#f5f5f5'
        }}
      >
        <NoImageIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Keine Bilder verfügbar
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Image */}
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          height: 400,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          '&:hover .zoom-button': {
            opacity: 1
          }
        }}
        onClick={onZoom}
      >
        <img
          src={getImageUrl(imagesArray[currentIndex])}
          alt={`Bild ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Zoom Button */}
        <IconButton
          className="zoom-button"
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }
          }}
        >
          <ZoomInIcon />
        </IconButton>

        {/* Image Counter */}
        <Chip
          label={`${currentIndex + 1} / ${imagesArray.length}`}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white'
          }}
        />
      </Paper>

      {/* Thumbnail Strip */}
      {imagesArray.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 4
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: 2
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: 2
            }
          }}
        >
          {imagesArray.map((image, index) => (
            <Box
              key={index}
              onClick={() => handleImageChange(index)}
              sx={{
                minWidth: 80,
                height: 80,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: currentIndex === index ? '2px solid #1976d2' : '2px solid transparent',
                opacity: currentIndex === index ? 1 : 0.7,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <img
                src={getImageUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
