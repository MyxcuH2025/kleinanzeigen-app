import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Edit, Report, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { AdminListingEdit } from './AdminListingEdit';
import type { AdCardProps } from '@/types';
import './AdCard.css';
import { getImageUrl as getImageUrlFromUtils } from '@/utils/imageUtils';
import VerificationBadge from './VerificationBadge';

// Eigene Icons als React-Komponenten
const FavoriteIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 21l-1.5-1.4C6 15.4 3 12.7 3 9.2 3 6.5 5.2 4.3 7.9 4.3c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2 2.7 0 4.9 2.2 4.9 4.9 0 3.5-3 6.2-7.5 10.4L12 21z"/>
  </svg>
);

const ShareIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 9v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3"/>
    <path d="M9 4H7a3 3 0 0 0-3 3v2"/>
    <line x1="12" y1="12" x2="20" y2="4"/>
    <polyline points="15 4 20 4 20 9"/>
  </svg>
);

const LocationIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 22s8-7.58 8-13a8 8 0 0 0-16 0c0 5.42 8 13 8 13z"/>
    <circle cx="12" cy="9" r="3"/>
  </svg>
);

const MehrIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2"
  >
    <circle cx="12" cy="12" r="10"/>
    <circle cx="8" cy="12" r="1.2"/>
    <circle cx="12" cy="12" r="1.2"/>
    <circle cx="16" cy="12" r="1.2"/>
  </svg>
);

// Kamera-Icon SVG als React-Komponente
const CameraIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <circle cx="15.5" cy="8.5" r="2"/>
    <path d="M4 17l5-5 4 4 5-5 2 2"/>
  </svg>
);

const AdCard: React.FC<AdCardProps> = ({ id, title, price, location, images, category, created_at, seller, vehicleDetails }) => {
  const { user } = useUser();
  const { isFavorite: isFavoriteGlobal, addFavorite, removeFavorite } = useFavorites();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const imageAreaRef = React.useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const open = Boolean(anchorEl);

  // Verwende den globalen Favoriten-Status
  const favoriteState = isFavoriteGlobal(id);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => setAnchorEl(null);

  const handleCardClick = () => {
    navigate(`/listing/${id}`);
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      return;
    }

    setIsLoading(true);
    try {
      if (favoriteState) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/listing/${id}`;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `${title} - ${formatPrice(price)}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
    }
    handleMenuClose();
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
  };

  // Bild-Array verarbeiten
  let imgs: string[] = [];
  try {
    if (images) {
      if (typeof images === 'string') {
        try {
          imgs = JSON.parse(images);
        } catch {
          imgs = [images];
        }
      } else if (Array.isArray(images)) {
        imgs = images;
      }
    }
  } catch {
    imgs = [];
  }

  if (!imgs || imgs.length === 0) {
    imgs = ['/images/noimage.jpeg'];
  }

  const displayImages = imgs.length === 1 ? [imgs[0], imgs[0]] : imgs;
  const currentImage = displayImages[currentImageIndex] || displayImages[0];

  // Verwende die zentrale getImageUrl Funktion
  const imageUrl = getImageUrlFromUtils(currentImage);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatKilometer = (value: string | number): string | null => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (Number.isNaN(num) || num <= 0) return null;
    if (num >= 1000) {
      const tkm = Math.round(num / 1000);
      return `${tkm} Tkm`;
    }
    return `${Math.round(num)} km`;
  };

  const truncateTitle = (title: string, maxLength: number = 40) => {
    if (!title || title.trim() === '') return 'Kein Titel verfügbar';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  // Maus-Positions-basiertes Wechseln (Avito-Stil): Fläche in N Segmente teilen
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!displayImages || displayImages.length <= 1) return;
    const rect = imageAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const width = rect.width || 1;
    const segments = displayImages.length;
    let index = Math.floor((x / width) * segments);
    if (index < 0) index = 0;
    if (index >= segments) index = segments - 1;
    if (index !== currentImageIndex) setCurrentImageIndex(index);
  };

  const handleImageMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: '#ffffff',
        borderRadius: { xs: '8px', sm: '12px' },
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid #e5e7eb',
        height: 'auto',
        minHeight: '400px',
        maxHeight: 'none',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        '&:hover': { boxShadow: 4 }
      }}
      onClick={handleCardClick}
    >
      {/* Verkäufer-Badge mit Bewertung */}
      {seller && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            left: -6,
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            px: 0.75,
            py: 0.5,
            background: 'rgba(248, 249, 250, 0.9)', // Sehr durchsichtig - fast unsichtbar
            backdropFilter: 'none', // Kein Blur für maximale Durchsichtigkeit
            border: '1px solid rgba(233, 236, 239, 0.3)',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            zIndex: 5,
            pointerEvents: 'none',
            transform: 'rotate(-1deg)'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: '0.6rem',
              color: '#495057',
              maxWidth: 100,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {seller.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <Star sx={{ fontSize: 9, color: '#ffc107' }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                fontSize: '0.55rem',
                color: '#6c757d'
              }}
            >
              {seller.rating || '4.5'} ({seller.ratingCount || '12'})
            </Typography>
          </Box>
          {(seller as any).userType && (
            <VerificationBadge
              userType={(seller as any).userType}
              badge={(seller as any).badge}
              size="small"
              showIcon={true}
              showText={false}
            />
          )}
        </Box>
      )}

      {/* Image */}
      <Box 
        sx={{ 
          position: 'relative', 
          overflow: 'hidden',
          height: '240px',
          minHeight: '240px',
          maxHeight: '240px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' }
        }}
        ref={imageAreaRef}
        onMouseMove={handleImageMouseMove}
        onMouseLeave={handleImageMouseLeave}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/noimage.jpeg';
            target.style.objectFit = 'contain';
            target.style.backgroundColor = '#f8f9fa';
          }}
        />

        {/* Indikatoren (unten rechts) – aktives Bild als längere Linie */}
        {displayImages.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
              zIndex: 3,
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: '6px',
              px: 0.6,
              py: 0.4
            }}
          >
            {displayImages.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === currentImageIndex ? 12 : 4,
                  height: 4,
                  borderRadius: i === currentImageIndex ? 2 : '50%',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  transition: 'width 150ms ease'
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Text */}
      <Box sx={{ padding: { xs: '6px', sm: '8px' }, backgroundColor: '#ffffff', flex: 1, display: 'flex', flexDirection: 'column', borderRadius: { xs: '0 0 8px 8px', sm: '0 0 12px 12px' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 0.25, height: '32px' }}>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <IconButton onClick={handleFavoriteToggle} disabled={isLoading} size="small" sx={{ width: 24, height: 24, minWidth: 24 }}>
              <Box sx={{ fontSize: 12, color: favoriteState ? '#ff4757' : '#666' }}>
                <FavoriteIcon />
              </Box>
            </IconButton>
            <IconButton onClick={handleShare} size="small" sx={{ width: 24, height: 24, minWidth: 24 }}>
              <Box sx={{ fontSize: 12, color: '#666' }}>
                <ShareIcon />
              </Box>
            </IconButton>
            <IconButton className="ad-card-menu-button" onClick={handleMenuOpen} size="small" sx={{ width: 24, height: 24, minWidth: 24 }}>
              <Box sx={{ fontSize: 12, color: '#666' }}>
                <MehrIcon />
              </Box>
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 400, fontSize: { xs: '1rem', sm: '1.1rem' }, color: '#1a1a1a', mb: 0.25 }}>
          {truncateTitle(title)}
        </Typography>

        {/* Beschreibung hinzufügen - immer 2 Zeilen */}
        <Box sx={{ 
          minHeight: '2.2rem', // Reduzierte Höhe für 2 Zeilen
          mb: 0.25,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.8rem' }, 
              color: '#666', 
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title} - {category === 'autos' && vehicleDetails ? 
              (() => {
                const parts: string[] = [];
                const km = formatKilometer(vehicleDetails.kilometerstand);
                if (km) parts.push(km);
                if (vehicleDetails.erstzulassung) parts.push(`BJ ${String(vehicleDetails.erstzulassung)}`);
                if (vehicleDetails.kraftstoff) parts.push(String(vehicleDetails.kraftstoff));
                if (vehicleDetails.getriebe) parts.push(String(vehicleDetails.getriebe));
                return parts.filter(Boolean).slice(0, 3).join(' · ');
              })() : 
              'Gebrauchter Artikel in gutem Zustand'
            }
          </Typography>
        </Box>

        {/* Preis nach unten verschieben */}
        <Typography variant="h6" sx={{ fontWeight: 400, fontSize: { xs: '1rem', sm: '1.1rem' }, color: '#1a1a1a', mb: 0.25 }}>
          {formatPrice(price)}
        </Typography>


        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box sx={{ fontSize: { xs: 10, sm: 12 }, color: '#666', mr: 0.25 }}>
              <LocationIcon />
            </Box>
            <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.675rem' }, color: '#666', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location}
            </Typography>
          </Box>
          {created_at && (
            <Typography variant="caption" sx={{ fontSize: { xs: '0.575rem', sm: '0.625rem' }, color: '#999', fontWeight: 500 }}>
              {new Date(created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </Typography>
          )}
        </Box>
      </Box>

      <AdminListingEdit
        listingId={parseInt(id)}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      />
    </Box>
  );
};

export default AdCard;
