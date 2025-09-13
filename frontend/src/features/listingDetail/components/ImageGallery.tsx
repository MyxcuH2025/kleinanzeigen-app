import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  Zoom,
  Fade
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  Fullscreen as FullscreenIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { ImageGalleryProps } from '../types';

/**
 * Premium Image Gallery Component
 * Features: Hauptbild, Thumbs, Fullscreen, Zoom on hover
 * Optimized for performance with lazy loading
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  selectedIndex,
  onImageChange,
  onFullscreen,
  onZoom,
  getImageUrl
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Local state
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);
  const [hovered, setHovered] = useState(false);
  
  // Refs
  const mainImageRef = useRef<HTMLImageElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize image loaded state
  useEffect(() => {
    setImageLoaded(new Array(images.length).fill(false));
  }, [images.length]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        onImageChange((selectedIndex + 1) % images.length);
      }, 3000);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, selectedIndex, images.length, onImageChange]);

  // Event handlers
  const handleImageLoad = useCallback((index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  }, []);

  const handleNextImage = useCallback(() => {
    onImageChange((selectedIndex + 1) % images.length);
  }, [selectedIndex, images.length, onImageChange]);

  const handlePrevImage = useCallback(() => {
    onImageChange((selectedIndex - 1 + images.length) % images.length);
  }, [selectedIndex, images.length, onImageChange]);

  const handleFullscreen = useCallback(() => {
    setFullscreenOpen(true);
    onFullscreen();
  }, [onFullscreen]);

  const handleZoom = useCallback(() => {
    onZoom();
    handleFullscreen();
  }, [onZoom, handleFullscreen]);

  const handleCloseFullscreen = useCallback(() => {
    setFullscreenOpen(false);
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    onImageChange(index);
  }, [onImageChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        handlePrevImage();
        break;
      case 'ArrowRight':
        handleNextImage();
        break;
      case 'Escape':
        handleCloseFullscreen();
        break;
      case ' ':
        event.preventDefault();
        setAutoPlay(prev => !prev);
        break;
    }
  }, [handlePrevImage, handleNextImage, handleCloseFullscreen]);

  // Keyboard navigation
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (fullscreenOpen) {
        handleKeyDown(event as any);
      }
    };

    if (fullscreenOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown);
      return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [fullscreenOpen, handleKeyDown]);

  if (!images || images.length === 0) {
    return (
      <Card sx={{ mb: 3, borderRadius: 1, overflow: 'hidden' }}>
        <Box
          sx={{
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            color: 'text.secondary'
          }}
        >
          Kein Bild verfügbar
        </Box>
      </Card>
    );
  }

  const currentImage = images[selectedIndex];
  const isImageLoaded = imageLoaded[selectedIndex];

  return (
    <>
      {/* Main Image */}
      <Card 
        sx={{ 
          mb: 3, 
          borderRadius: 1, 
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleFullscreen}
      >
        <Box sx={{ position: 'relative', height: 400 }}>
          {/* Main Image */}
          <CardMedia
            ref={mainImageRef}
            component="img"
            image={getImageUrl(currentImage.url)}
            alt={currentImage.alt || `Bild ${selectedIndex + 1}`}
            sx={{
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease',
              opacity: isImageLoaded ? 1 : 0.7
            }}
            onLoad={() => handleImageLoad(selectedIndex)}
            loading="lazy"
          />

          {/* Loading Overlay */}
          {!isImageLoaded && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 1
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  border: '3px solid #dcf8c6',
                  borderTop: '3px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
            </Box>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <Chip
              label={`${selectedIndex + 1} / ${images.length}`}
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                fontWeight: 600
              }}
            />
          )}

          {/* Action Buttons */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1,
              opacity: hovered ? 1 : 0.7,
              transition: 'opacity 0.2s ease'
            }}
          >
            {/* Auto-play Toggle */}
            {images.length > 1 && (
              <Tooltip title={autoPlay ? "Auto-Play stoppen" : "Auto-Play starten"}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setAutoPlay(!autoPlay);
                  }}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(220, 248, 198, 0.9)' }
                  }}
                >
                  {autoPlay ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Tooltip>
            )}

            {/* Zoom Button */}
            <Tooltip title="Vergrößern">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom();
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { bgcolor: 'rgba(220, 248, 198, 0.9)' }
                }}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>

            {/* Fullscreen Button */}
            <Tooltip title="Vollbild">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleFullscreen();
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { bgcolor: 'rgba(220, 248, 198, 0.9)' }
                }}
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Navigation Arrows (Desktop only) */}
          {images.length > 1 && !isMobile && (
            <>
              <Tooltip title="Vorheriges Bild">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(220, 248, 198, 0.9)' }
                  }}
                >
                  <PrevIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Nächstes Bild">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(220, 248, 198, 0.9)' }
                  }}
                >
                  <NextIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Card>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          {images.map((image, index) => (
            <Box
              key={image.id}
              sx={{
                minWidth: 80,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedIndex === index ? '2px solid #dcf8c6' : '2px solid transparent'
              }}
              onClick={() => handleThumbnailClick(index)}
            >
              <Box
                component="img"
                src={getImageUrl(image.thumbUrl || image.url)}
                alt={image.alt || `Thumbnail ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                loading="lazy"
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Fullscreen Modal */}
      <Dialog
        open={fullscreenOpen}
        onClose={handleCloseFullscreen}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            m: 0,
            maxHeight: '100vh',
            maxWidth: '100vw'
          }
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            position: 'relative'
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleCloseFullscreen}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Fullscreen Image */}
          <Box
            component="img"
            src={getImageUrl(currentImage.url)}
            alt={currentImage.alt || `Bild ${selectedIndex + 1}`}
            sx={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 1
            }}
          />

          {/* Navigation in Fullscreen */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                }}
              >
                <PrevIcon />
              </IconButton>

              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                }}
              >
                <NextIcon />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
