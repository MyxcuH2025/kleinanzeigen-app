import * as React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Edit, Report, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { AdminListingEdit } from './AdminListingEdit';
import type { AdCardProps } from '@/types';
// import './AdCard.css'; // CSS-Datei existiert nicht, verwende Material-UI Styling
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

const AdCard: React.FC<AdCardProps> = ({ 
  id, 
  title, 
  price, 
  location, 
  images, 
  category, 
  created_at, 
  seller, 
  vehicleDetails 
}: AdCardProps) => {
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

  // REPARIERT: Base64-Bilder filtern und Fallback-Bild setzen (verursacht "bilder werden nicht angezeigt")
  imgs = imgs.filter(img => 
    img && 
    typeof img === 'string' && 
    img.trim() !== '' && 
    img !== '[]' &&
    img !== '[""]' &&
    img !== '""' &&
    !img.startsWith('[') &&
    !img.endsWith(']') &&
    !img.startsWith('data:') && 
    !img.includes('base64')
  );

  // REPARIERT: Kein Fallback-Bild - Anzeigen ohne Bilder zeigen kein Bild (verursacht "gleiche platzhalter bilder")
  // if (!imgs || imgs.length === 0) {
  //   imgs = ['http://localhost:8000/api/images/noimage.jpeg'];
  // }

  // REPARIERT: Handle leere Bilder-Arrays (verursacht "gleiche platzhalter bilder")
  const displayImages = imgs.length === 0 ? [] : (imgs.length === 1 ? [imgs[0], imgs[0]] : imgs);
  const currentImage = displayImages.length > 0 ? (displayImages[currentImageIndex] || displayImages[0]) : null;

  // Verwende die zentrale getImageUrl Funktion
  const imageUrl = currentImage ? getImageUrlFromUtils(currentImage) : null;

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
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: { xs: '16px', sm: '20px' },
        overflow: 'visible',
        cursor: 'pointer',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        border: '1px solid rgba(220, 248, 198, 0.3)',
        height: '420px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        backdropFilter: 'blur(10px)',
        boxShadow: `
          0 4px 20px rgba(0, 0, 0, 0.08),
          0 2px 8px rgba(220, 248, 198, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.9)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: { xs: '16px', sm: '20px' },
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(220, 248, 198, 0.5), rgba(34, 197, 94, 0.3), rgba(220, 248, 198, 0.5))',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          opacity: 0,
          transition: 'opacity 0.4s ease'
        },
        '&:hover': { 
          transform: 'rotateX(2deg)',
          boxShadow: `
            0 25px 50px rgba(0, 0, 0, 0.15),
            0 12px 24px rgba(220, 248, 198, 0.4),
            0 0 0 1px rgba(220, 248, 198, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.9)
          `,
          borderColor: 'rgba(220, 248, 198, 0.8)',
          '&::before': {
            opacity: 1
          },
          '& .ad-card-image': {
            transform: 'rotateY(-2deg)',
            '&::before': {
              opacity: 0.4,
              background: 'linear-gradient(135deg, rgba(220, 248, 198, 0.4), rgba(34, 197, 94, 0.2))'
            }
          },
          '& .ad-card-price': {
            transform: 'none'
          },
          '& .ad-card-title': {
            transform: 'none'
          },
          '& .ad-card-icons': {
            transform: 'none',
            '& .icon-bg': {
              transform: 'none'
            }
          }
        }
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
              {seller.rating || '4.5'} ({seller.reviewCount || '12'})
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
        className="ad-card-image"
        sx={{ 
          position: 'relative', 
          overflow: 'hidden',
          height: '240px',
          minHeight: '240px',
          maxHeight: '240px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          borderRadius: { xs: '12px 12px 0 0', sm: '16px 16px 0 0' },
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(220, 248, 198, 0.3), rgba(34, 197, 94, 0.1))',
            zIndex: 1,
            opacity: 0,
            transition: 'all 0.4s ease'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
            opacity: 0.8,
            zIndex: 2
          },
          '&:hover::before': {
            opacity: 0.4
          }
        }}
        ref={imageAreaRef}
        onMouseMove={handleImageMouseMove}
        onMouseLeave={handleImageMouseLeave}
      >
        {/* REPARIERT: Nur Bild anzeigen wenn vorhanden (verursacht "gleiche platzhalter bilder") */}
        {currentImage && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              objectPosition: 'center top',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              zIndex: 2,
              position: 'relative',
              filter: 'brightness(1.02) contrast(1.05)'
            }}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/noimage.jpeg';
              target.style.objectFit = 'contain';
              target.style.backgroundColor = '#f8f9fa';
            }}
          />
        ) : (
          /* REPARIERT: Platzhalter für Anzeigen ohne Bilder (verursacht "gleiche platzhalter bilder") */
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              color: '#6c757d',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'center',
              padding: 2
            }}
          >
            <img 
              src="/images/noimage.jpeg" 
              alt="Kein Bild verfügbar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 0.6
              }}
            />
          </Box>
        )}

        {/* REPARIERT: Indikatoren nur bei mehreren Bildern (verursacht "gleiche platzhalter bilder") */}
        {displayImages.length > 1 && currentImage && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              zIndex: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              borderRadius: '8px',
              px: 0.8,
              py: 0.6,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            {displayImages.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === currentImageIndex ? 16 : 6,
                  height: 6,
                  borderRadius: i === currentImageIndex ? 3 : '50%',
                  backgroundColor: i === currentImageIndex ? '#dcf8c6' : 'rgba(255,255,255,0.6)',
                  transition: 'all 200ms cubic-bezier(0.25, 0.8, 0.25, 1)',
                  boxShadow: i === currentImageIndex ? '0 2px 4px rgba(220, 248, 198, 0.3)' : 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(i);
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Text */}
      <Box sx={{ 
        padding: { xs: '12px', sm: '14px' }, 
        backgroundColor: '#ffffff', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: { xs: '0 0 12px 12px', sm: '0 0 16px 16px' },
        position: 'relative',
        minHeight: '170px', // Ausgewogene Mindesthöhe für Text-Bereich
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 16,
          right: 16,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(220, 248, 198, 0.3) 50%, transparent 100%)'
        }
      }}>
        {/* Titel und Buttons in derselben Zeile */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
          <Typography 
            className="ad-card-title"
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '1.05rem', sm: '1.15rem' }, 
              color: '#1a1a1a', 
              lineHeight: 1.38,
              letterSpacing: '-0.01em',
              flex: 1,
              minWidth: 0, // Wichtig für Text-Overflow
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
          }}
        >
          {title}
        </Typography>
        
        {/* Action Buttons */}
        <Box className="ad-card-icons" sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Box 
            onClick={handleFavoriteToggle}
            className="icon-bg"
            sx={{ 
              width: 16, 
              height: 16, 
              borderRadius: '50%',
              backgroundColor: favoriteState ? 'rgba(255, 71, 87, 0.06)' : 'rgba(0, 0, 0, 0.01)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isLoading ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: favoriteState ? 'rgba(255, 71, 87, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <Box sx={{ fontSize: 14, color: favoriteState ? '#ff4757' : '#666' }}>
              <FavoriteIcon />
            </Box>
          </Box>
          <Box 
            onClick={handleShare}
            className="icon-bg"
            sx={{ 
              width: 16, 
              height: 16, 
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.01)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <Box sx={{ fontSize: 14, color: '#666' }}>
              <ShareIcon />
            </Box>
          </Box>
          <Box 
            className="ad-card-menu-button icon-bg" 
            onClick={handleMenuOpen}
            sx={{ 
              width: 16, 
              height: 16, 
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.01)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <Box sx={{ fontSize: 14, color: '#666' }}>
              <MehrIcon />
            </Box>
          </Box>
        </Box>
      </Box>

        {/* Beschreibung hinzufügen - immer 2 Zeilen */}
        <Box sx={{ 
          minHeight: '2.0rem', // Ausgewogene Höhe für Beschreibung
          maxHeight: '2.0rem', // Ausgewogene Höhe für Beschreibung
          mb: 0.375,
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
        <Typography 
          className="ad-card-price"
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            fontSize: { xs: '1.15rem', sm: '1.25rem' }, 
            color: '#1a1a1a', 
            mb: 0.5,
            transition: 'all 0.3s ease',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {formatPrice(price)}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mt: 'auto',
          pt: 1,
          borderTop: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box sx={{ 
              fontSize: { xs: 11, sm: 13 }, 
              color: '#666', 
              mr: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16
            }}>
              <LocationIcon />
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                color: '#666', 
                fontWeight: 500, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em'
              }}
            >
              {location}
            </Typography>
          </Box>
          {created_at && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
                color: '#999', 
                fontWeight: 500,
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                letterSpacing: '0.01em'
              }}
            >
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
