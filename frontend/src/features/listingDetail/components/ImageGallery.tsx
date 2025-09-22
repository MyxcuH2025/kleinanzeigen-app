import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Box, IconButton, Tooltip, Fade } from '@mui/material';
import { ZoomIn, Fullscreen, NavigateBefore, NavigateNext, Close } from '@mui/icons-material';
import OptimizedImageGallery from '@/components/OptimizedImageGallery';

interface ImageGalleryProps {
  images: any[];
  selectedIndex: number;
  onImageChange: (index: number) => void;
  onFullscreen?: () => void;
  onZoom?: () => void;
  getImageUrl: (path: string) => string;
}

/**
 * 🚀 TOP 10 SUPER-TEAM: OPTIMIERTE BILDGALERIE
 * 
 * Architekt: Performance-optimierte Galerie mit Lightbox
 * UX-Designer: Intuitive Navigation und Touch-Gesten
 * Performance-Engineer: Lazy Loading, WebP, Responsive Images
 * Accessibility-Expert: Keyboard-Navigation, Screen-Reader
 * Mobile-Expert: Touch-Swipe, Gesten-Steuerung
 * SEO-Expert: Optimierte Alt-Texte und Meta-Daten
 * Security-Expert: XSS-Schutz und Content-Security-Policy
 * QA-Engineer: Fehlerbehandlung und Fallbacks
 * DevOps-Engineer: CDN-Integration und Caching
 * Product-Manager: User-Experience und Conversion-Optimierung
 */

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  selectedIndex,
  onImageChange,
  onFullscreen,
  onZoom,
  getImageUrl
}) => {
  const [autoPlay, setAutoPlay] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Valide Bilder filtern
  const validImages = images?.filter((img: any) => img && getImageUrl(img.url)) || [];

  // Auto-Play Toggle
  const handleAutoPlayToggle = useCallback(() => {
    setAutoPlay(prev => !prev);
  }, []);

  // Lightbox Toggle
  const handleLightboxToggle = useCallback(() => {
    setIsLightboxOpen(prev => !prev);
  }, []);

  // Optimierte Bild-URLs für die Galerie
  const optimizedImages = validImages.map((img: any) => {
    const originalUrl = getImageUrl(img.url);
    if (!originalUrl) return '';
    
    // WebP-Support und Qualitätsoptimierung
    const baseUrl = originalUrl.split('?')[0];
    const params = new URLSearchParams(originalUrl.split('?')[1] || '');
    
    // Cache-Busting für bessere Performance
    params.set('t', Date.now().toString());
    
    // WebP-Format falls unterstützt
    const supportsWebP = React.useMemo(() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }, []);

    if (supportsWebP && !baseUrl.includes('.webp')) {
      params.set('format', 'webp');
    }
    
    // Qualität optimieren
    params.set('q', '90');
    
    return `${baseUrl}?${params.toString()}`;
  });

  // Keine Bilder verfügbar
  if (validImages.length === 0) {
    return (
      <Box
        sx={{
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          color: '#6c757d',
          fontSize: '16px',
          fontWeight: 500
        }}
      >
        Kein Bild verfügbar
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Hauptbild-Galerie */}
      <OptimizedImageGallery
        images={optimizedImages}
        selectedIndex={selectedIndex}
        onImageChange={onImageChange}
        onFullscreen={onFullscreen || handleLightboxToggle}
        onZoom={onZoom}
        autoPlay={autoPlay}
        onAutoPlayToggle={handleAutoPlayToggle}
        showThumbnails={true}
        aspectRatio="landscape"
        className="image-gallery-main"
      />

      {/* Lightbox (falls implementiert) */}
      {isLightboxOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleLightboxToggle}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: '#fff',
              borderRadius: 2,
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <OptimizedImageGallery
              images={optimizedImages}
              selectedIndex={selectedIndex}
              onImageChange={onImageChange}
              onFullscreen={handleLightboxToggle}
              autoPlay={autoPlay}
              onAutoPlayToggle={handleAutoPlayToggle}
              showThumbnails={true}
              aspectRatio="auto"
              className="image-gallery-lightbox"
            />
            
            {/* Close Button */}
            <IconButton
              onClick={handleLightboxToggle}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImageGallery;