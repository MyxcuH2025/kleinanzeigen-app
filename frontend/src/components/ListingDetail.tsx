import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Chip,
  Container,
  Snackbar,
  Avatar,
  Link,
  Tabs,
  Tab,
  Modal,
  Alert
} from '@mui/material';
import type { AlertColor } from '@mui/material';



import MessageIcon from '@mui/icons-material/Message';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import NoImageIcon from '@mui/icons-material/ImageNotSupported';
import CategoryIcon from '@mui/icons-material/Category';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import InfoIcon from '@mui/icons-material/Info';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { BookmarkIcon, ShopIcon, ServiceIcon, FollowIcon } from './UserTypeIcons';
import VerificationBadge from './VerificationBadge';
import FollowButton from './FollowButton';

// Eigene Icons als React-Komponenten
const ProfileIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
  </svg>
);

const FavoriteIcon = () => (
  <svg 
    width="20" 
    height="20" 
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
    width="20" 
    height="20" 
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
    width="20" 
    height="20" 
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

const ViewIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.7" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CalendarIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24"
  >
    <defs>
      <mask id="m">
        <rect width="24" height="24" fill="#fff"/>
        <circle cx="18" cy="18" r="6.2" fill="#000"/>
      </mask>
    </defs>
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" mask="url(#m)">
      <rect x="3" y="4" width="15.5" height="14" rx="2"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="13" y1="2" x2="13" y2="6"/>
      <line x1="3" y1="8" x2="18.5" y2="8"/>
    </g>
    <circle cx="18" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 15v3l2 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Helper function for image URLs
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Entferne /api/uploads/ falls bereits vorhanden
  let cleanPath = imagePath;
  if (cleanPath.startsWith('/api/uploads/')) {
    cleanPath = cleanPath.replace('/api/uploads/', '');
  }
  if (cleanPath.startsWith('api/uploads/')) {
    cleanPath = cleanPath.replace('api/uploads/', '');
  }
  
  return `http://localhost:8000/api/uploads/${cleanPath}`;
};

// Mobile Image Gallery Component
const MobileImageGallery = ({ 
  images, 
  selectedIndex, 
  onImageChange, 
  onImageClick 
}: { 
  images: string[]; 
  selectedIndex: number; 
  onImageChange: (index: number) => void; 
  onImageClick: (index: number) => void; 
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const galleryRef = useRef(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    setCurrentIndex(selectedIndex);
  }, [selectedIndex]);

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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      handleImageChange(currentIndex + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      handleImageChange(currentIndex - 1);
    }
  };

  const handleImageChange = (newIndex: number) => {
    if (isTransitioning || newIndex < 0 || newIndex >= images.length) return;
    
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    onImageChange(newIndex);
    
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      handleImageChange(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      handleImageChange(currentIndex + 1);
    }
  };

  return (
    <Box
      ref={galleryRef}
      sx={{
        position: 'relative',
        width: '85%', // Bildfenster kleiner machen - optimal!
        height: { xs: 280, sm: 350, md: 400 },
        overflow: 'hidden',
        borderRadius: { xs: '8px', sm: '12px' },
        bgcolor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '0', // Links ausrichten
        marginRight: 'auto' // Rechts automatisch
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main Image */}
      <Box
        component="img"
        src={getImageUrl(images[currentIndex])}
        alt={`Image ${currentIndex + 1}`}
        onClick={() => onImageClick(currentIndex)}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          cursor: 'pointer',
          transition: 'opacity 0.3s ease',
          opacity: isTransitioning ? 0.8 : 1,
          objectPosition: 'center center' // Bild perfekt zentrieren
        }}
      />

      {/* Image Counter */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          bgcolor: 'rgba(0,0,0,0.7)',
          color: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: '12px',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          fontWeight: 500,
          zIndex: 5
        }}
      >
        {currentIndex + 1} / {images.length}
      </Box>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            sx={{
              position: 'absolute',
              left: { xs: 8, sm: 12 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.6)',
              zIndex: 10,
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              opacity: currentIndex === 0 ? 0.3 : 1,
              '&:hover': { 
                bgcolor: 'rgba(0,0,0,0.8)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease',
              '& .MuiSvgIcon-root': {
                fontSize: { xs: 20, sm: 24 }
              }
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          
          <IconButton
            onClick={goToNext}
            disabled={currentIndex === images.length - 1}
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 12 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.6)',
              zIndex: 10,
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              opacity: currentIndex === images.length - 1 ? 0.3 : 1,
              '&:hover': { 
                bgcolor: 'rgba(0,0,0,0.8)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease',
              '& .MuiSvgIcon-root': {
                fontSize: { xs: 20, sm: 24 }
              }
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0,0,0,0.7)',
            py: 1,
            px: 1,
            display: 'flex',
            gap: 0.5,
            justifyContent: 'center',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              height: 3
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.3)',
              borderRadius: 2
            }
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              component="img"
              src={getImageUrl(image)}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => handleImageChange(index)}
              sx={{
                width: { xs: 40, sm: 50 },
                height: { xs: 27, sm: 33 },
                minWidth: { xs: 40, sm: 50 },
                objectFit: 'cover',
                borderRadius: '4px',
                cursor: 'pointer',
                border: index === currentIndex ? '2px solid #1976d2' : '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.2s ease',
                opacity: index === currentIndex ? 1 : 0.7,
                '&:hover': { 
                  opacity: 1,
                  transform: 'scale(1.05)'
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Desktop Image Gallery Component
const DesktopImageGallery = ({ 
  images, 
  selectedIndex, 
  onImageChange, 
  onImageClick 
}: { 
  images: string[]; 
  selectedIndex: number; 
  onImageChange: (index: number) => void; 
  onImageClick: (index: number) => void; 
}) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  useEffect(() => {
    setCurrentIndex(selectedIndex);
  }, [selectedIndex]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onImageChange(newIndex);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onImageChange(newIndex);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Main Image */}
      <Box
        component="img"
        src={getImageUrl(images[currentIndex])}
        alt={`Image ${currentIndex + 1}`}
        onClick={() => onImageClick(currentIndex)}
        sx={{
          width: '100%',
          height: 'auto',
          maxHeight: { xs: 300, sm: 400, md: 500, lg: 600 },
          objectFit: 'contain',
          cursor: 'pointer',
          display: 'block',
          borderRadius: { xs: '8px', sm: '12px' }
        }}
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            sx={{
              position: 'absolute',
              left: { xs: 8, sm: 12 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.6)',
              zIndex: 10,
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              opacity: currentIndex === 0 ? 0.3 : 1,
              '&:hover': { 
                bgcolor: 'rgba(0,0,0,0.8)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease',
              '& .MuiSvgIcon-root': {
                fontSize: { xs: 20, sm: 24 }
              }
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          
          <IconButton
            onClick={goToNext}
            disabled={currentIndex === images.length - 1}
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 12 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: '0',
              bgcolor: 'rgba(0,0,0,0.6)',
              zIndex: 10,
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              opacity: currentIndex === images.length - 1 ? 0.3 : 1,
              '&:hover': { 
                bgcolor: 'rgba(0,0,0,0.8)',
                transform: 'translateY(-50%) scale(1.1)'
              },
              transition: 'all 0.2s ease',
              '& .MuiSvgIcon-root': {
                fontSize: { xs: 20, sm: 24 }
              }
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </>
      )}

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1, md: 1.5 }, 
          flexWrap: 'nowrap',
          justifyContent: 'center',
          mt: { xs: 1.5, sm: 2 },
          overflow: 'auto',
          pb: { xs: 1, sm: 0 },
          '&::-webkit-scrollbar': {
            height: { xs: 4, sm: 6 }
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: 2
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: 2,
            '&:hover': {
              background: '#a8a8a8'
            }
          }
        }}>
          {images.map((image, index) => (
            <Box
              key={index}
              component="img"
              src={getImageUrl(image)}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => {
                setCurrentIndex(index);
                onImageChange(index);
              }}
              sx={{
                width: { xs: 70, sm: 90, md: 110 },
                height: { xs: 47, sm: 60, md: 74 },
                minWidth: { xs: 70, sm: 90, md: 110 },
                objectFit: 'cover',
                borderRadius: { xs: '4px', sm: '6px', md: '8px' },
                cursor: 'pointer',
                border: index === currentIndex ? '2px solid #1976d2' : '1px solid #e0e0e0',
                transition: 'all 0.15s',
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'scale(1.05)'
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};


import { useUser } from '@/context/UserContext';
import { useFavorites } from '@/context/FavoritesContext';
import { adService } from '@/services/adService';
import type { Ad } from '@/services/adService';
import { chatService } from '@/services/chatService';
import { favoriteService } from '@/services/favoriteService';
import { formatPrice } from '@/utils/formatPrice';
import { formatDate } from '@/utils/formatDate';
import { type ListingStatus } from './ListingStatusSelector';
import { ReportDialog, type ReportReason } from './ReportDialog';
import { listingService } from '@/services/listingService';
import { reportService } from '@/services/reportService';
import { RatingDialog } from './RatingDialog';
import './ListingDetail.css';
const PLACEHOLDER_IMAGE_URL = '/images/noimage.jpeg';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`listing-tabpanel-${index}`}
      aria-labelledby={`listing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

interface ListingDetailProps {
  listingId?: string;
}

const ListingDetail: React.FC<ListingDetailProps> = ({ listingId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [ratingKey, setRatingKey] = useState(0);
  const [similarListings, setSimilarListings] = useState<Ad[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  
  // Neue States für verbesserte Bildergalerie
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [revealPhone, setRevealPhone] = useState(false);
  const [revealEmail, setRevealEmail] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [lastConversationId, setLastConversationId] = useState<number | null>(null);

  // Hilfsfunktion für Bild-URLs (nutzt FastAPI /api/images für Avatare, /api/uploads für Listing-Bilder)
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return PLACEHOLDER_IMAGE_URL;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Entferne alle möglichen Pfad-Präfixe
    let cleanPath = imagePath;
    if (cleanPath.startsWith('/api/uploads/')) {
      cleanPath = cleanPath.replace('/api/uploads/', '');
    }
    if (cleanPath.startsWith('api/uploads/')) {
      cleanPath = cleanPath.replace('api/uploads/', '');
    }
    if (cleanPath.startsWith('/uploads/')) {
      cleanPath = cleanPath.replace('/uploads/', '');
    }
    if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.replace('uploads/', '');
    }
    if (cleanPath.startsWith('/api/images/')) {
      cleanPath = cleanPath.replace('/api/images/', '');
    }
    if (cleanPath.startsWith('api/images/')) {
      cleanPath = cleanPath.replace('api/images/', '');
    }
    
    // Verwende /api/images für Avatar-Dateien (die haben UUID-Namen), /api/uploads für andere
    const isAvatarFile = cleanPath.includes('-') && (cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg') || cleanPath.endsWith('.png') || cleanPath.endsWith('.webp'));
    const finalUrl = isAvatarFile ? `http://localhost:8000/api/images/${cleanPath}` : `http://localhost:8000/api/uploads/${cleanPath}`;
    console.log(`Image URL: ${imagePath} -> ${finalUrl}`);
    return finalUrl;
  };

  // Verwende den globalen Favoriten-Status
  const isFavorite = id ? favorites.has(id) : false;

  // Bildergalerie Funktionen
  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
    setImageZoom(1);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setImageZoom(1);
  };

  const nextImage = () => {
    if (ad?.images) {
      setSelectedImageIndex((prev) => (prev + 1) % ad.images.length);
      setImageZoom(1);
    }
  };

  const prevImage = () => {
    if (ad?.images) {
      setSelectedImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
      setImageZoom(1);
    }
  };

  const zoomIn = () => {
    setImageZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setImageZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setImageZoom(1);
  };

  // Keyboard Navigation für Lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (event.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen]);

  // Lade ähnliche Anzeigen
  const loadSimilarListings = async () => {
    if (!ad) return;
    
    setSimilarLoading(true);
    try {
      const response = await adService.getAdsByCategory(ad.category);
      const similar = response
        .filter(a => a.id !== ad.id)
        .slice(0, 4);
      setSimilarListings(similar);
    } catch (error) {
      console.error('Error loading similar listings:', error);
    } finally {
      setSimilarLoading(false);
    }
  };

  useEffect(() => {
    if (ad) {
      loadSimilarListings();
    }
  }, [ad]);

  useEffect(() => {
    const loadAd = async () => {
      if (!id) return;
      try {
        const adData = await adService.getAdById(id);
        if (!adData) {
          setError('Anzeige nicht gefunden');
          return;
        }
        setAd(adData);
        
        
        // Simuliere Views
        // setViews(Math.floor(Math.random() * 100) + 50); // This line was removed as per the new_code
        
        // Lade ähnliche Anzeigen
        try {
          const allAds = await adService.getAllAds();
          const similar = allAds
            .filter(a => a.id !== id && a.category === adData.category)
            .slice(0, 4);
          setSimilarListings(similar);
        } catch (error) {
          console.error('Error loading similar ads:', error);
        }
      } catch (err) {
        console.error('Error loading ad:', err);
        setError('Fehler beim Laden der Anzeige');
      } finally {
        setLoading(false);
      }
    };

    loadAd();
  }, [id]);

  // Favoriten-Status wird jetzt global verwaltet - kein separater useEffect nötig

  const handleToggleFavorite = async () => {
    if (!user) {
      // setSnackbar('Bitte melde dich an, um Favoriten zu speichern'); // This line was removed as per the new_code
      return;
    }
    if (!ad?.id) return;

    try {
      if (isFavorite) {
        await removeFavorite(ad.id);
        // setSnackbar('Aus Favoriten entfernt'); // This line was removed as per the new_code
      } else {
        await addFavorite(ad.id);
        // setSnackbar('Zu Favoriten hinzugefügt'); // This line was removed as per the new_code
      }
    } catch (error: unknown) {
      console.error('Error toggling favorite:', error);
      // setSnackbar('Fehler beim Speichern der Favoriten'); // This line was removed as per the new_code
    }
  };

  const handleSendMessage = async () => {
    if (!ad) return;
    const content = messageText.trim();
    if (!content) return;

    // Nicht eingeloggt: zur Anmeldung mit Rückkehr-URL
    if (!user) {
      const nextUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?next=${nextUrl}`);
      return;
    }

    try {
      // Bestehende Konversation finden
      const conversations = await chatService.getConversations();
      let conversationId = conversations.find((c) => c.listing?.id?.toString() === ad.id?.toString())?.id;

      // Falls nicht vorhanden, erstellen
      if (!conversationId) {
        // Schutz: keine Konversation mit sich selbst
        const ownerIdCandidate = Number(
          (ad as any).user_id ?? ad.userId ?? ad.seller?.id ?? (ad as any).seller_id ?? (ad as any).owner_id
        );
        const currentUserId = Number(user?.id);
        if (Number.isFinite(ownerIdCandidate) && Number.isFinite(currentUserId) && ownerIdCandidate === currentUserId) {
          setSnackbarSeverity('error');
          setSnackbarMsg('Du kannst dir selbst keine Nachricht schicken.');
          setSnackbarOpen(true);
          return;
        }

        const listingIdNum = Number(ad.id);
        if (!Number.isInteger(listingIdNum) || listingIdNum <= 0) {
          setSnackbarSeverity('error');
          setSnackbarMsg('Nachricht kann nicht gesendet werden: Ungültige Anzeige-ID.');
          setSnackbarOpen(true);
          return;
        }
        // Backend erwartet als Body nur die Listing-ID
        conversationId = await chatService.createConversation(listingIdNum, ownerIdCandidate);
      }

      // Nachricht senden
      await chatService.sendMessage(conversationId, content);
      setMessageText('');
      setLastConversationId(conversationId);
      setSnackbarSeverity('success');
      setSnackbarMsg('Nachricht gesendet');
      setSnackbarOpen(true);
      
      // Navigiere zum Chat mit vereinfachten Parametern
      navigate(`/chat?conversationId=${conversationId}&listingId=${ad.id}&sellerId=${ad.seller?.id}`);
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbarSeverity('error');
      setSnackbarMsg('Senden fehlgeschlagen');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!ad?.id) return;
    
    if (window.confirm('Möchtest du diese Anzeige wirklich löschen?')) {
      try {
        await adService.deleteAd(ad.id);
        // setSnackbar('Anzeige erfolgreich gelöscht'); // This line was removed as per the new_code
        navigate('/');
      } catch (error) {
        console.error('Error deleting ad:', error);
        // setSnackbar('Fehler beim Löschen der Anzeige'); // This line was removed as per the new_code
      }
    }
  };

  const handleStatusChange = async (newStatus: ListingStatus) => {
    if (!ad?.id) return;
    
    try {
      await listingService.updateStatus(ad.id, newStatus);
      setAd(prev => prev ? { ...prev, status: newStatus } : null);
      // setSnackbar('Status erfolgreich aktualisiert'); // This line was removed as per the new_code
    } catch (error: unknown) {
      console.error('Error updating status:', error);
      throw new Error(error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Status');
    }
  };

  const handleReportSubmit = async (reason: ReportReason, description: string) => {
    if (!ad?.id) return;
    
    try {
      await reportService.reportListing(ad.id, reason, description);
      // setSnackbar('Anzeige erfolgreich gemeldet'); // This line was removed as per the new_code
    } catch (error: unknown) {
      console.error('Error reporting listing:', error);
      throw error; // Re-throw für ReportDialog
    }
  };

  const handleRatingSubmitted = () => {
    // setSnackbar('Bewertung erfolgreich erstellt'); // This line was removed as per the new_code
    // Bewertungen neu laden durch Key-Update
    setRatingKey(prev => prev + 1);
  };

  const handleShare = () => {
    if (!ad) return;
    
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: ad.description,
        url: window.location.href
      });
    } else {
      // Fallback: URL in die Zwischenablage kopieren
      navigator.clipboard.writeText(window.location.href);
      // Hier könntest du einen Snackbar anzeigen
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };



  const getPropertySpecs = () => {
    if (!ad) return [];
    
    const specs = [
      { label: 'Kategorie', value: ad.category || 'Nicht angegeben', icon: <CategoryIcon /> },
      { label: 'Standort', value: ad.location || 'Nicht angegeben', icon: <LocationIcon /> },
      { label: 'Erstellt am', value: formatDate(ad.createdAt), icon: <CalendarIcon /> },
      { label: 'Bilder', value: `${ad.images?.length || 0} Stück`, icon: <ImageIcon /> },
      { label: 'Status', value: ad.status || 'Aktiv', icon: <InfoIcon /> },
    ];

    // Füge benutzerdefinierte Eigenschaften hinzu
    if (ad.description) {
      specs.push({ label: 'Beschreibung', value: ad.description, icon: <InfoIcon /> });
    }

    // Fahrzeugdetails für Auto-Kategorie
    if (ad.category === 'autos') {
      // Prüfe sowohl vehicleDetails als auch attributes
      const vehicleData = ad.vehicleDetails || ad.attributes;
      if (vehicleData) {
        if (vehicleData.marke) specs.push({ label: 'Marke', value: String(vehicleData.marke), icon: <CategoryIcon /> });
        if (vehicleData.modell) specs.push({ label: 'Modell', value: String(vehicleData.modell), icon: <CategoryIcon /> });
        if (vehicleData.erstzulassung) specs.push({ label: 'Erstzulassung', value: String(vehicleData.erstzulassung), icon: <CalendarIcon /> });
        if (vehicleData.kilometerstand) specs.push({ label: 'Kilometerstand', value: `${vehicleData.kilometerstand} km`, icon: <InfoIcon /> });
        if (vehicleData.kraftstoff) specs.push({ label: 'Kraftstoff', value: String(vehicleData.kraftstoff), icon: <InfoIcon /> });
        if (vehicleData.getriebe) specs.push({ label: 'Getriebe', value: String(vehicleData.getriebe), icon: <InfoIcon /> });
        if (vehicleData.leistung) specs.push({ label: 'Leistung', value: String(vehicleData.leistung), icon: <InfoIcon /> });
        if (vehicleData.farbe) specs.push({ label: 'Farbe', value: String(vehicleData.farbe), icon: <InfoIcon /> });
        if (vehicleData.unfallfrei !== undefined) specs.push({ label: 'Unfallfrei', value: vehicleData.unfallfrei ? 'Ja' : 'Nein', icon: <InfoIcon /> });
      }
    }

    // Attribute für Kleinanzeigen-Kategorie
    if (ad.category === 'kleinanzeigen' && ad.attributes) {
      const attrs = ad.attributes;
      if (attrs.zustand) specs.push({ label: 'Zustand', value: attrs.zustand, icon: <InfoIcon /> });
      if (attrs.versand !== undefined) specs.push({ label: 'Versand möglich', value: attrs.versand ? 'Ja' : 'Nein', icon: <LocalShippingIcon /> });
      if (attrs.garantie !== undefined) specs.push({ label: 'Garantie', value: attrs.garantie ? 'Ja' : 'Nein', icon: <InfoIcon /> });
      if (attrs.verhandelbar !== undefined) specs.push({ label: 'Verhandelbar', value: attrs.verhandelbar ? 'Ja' : 'Nein', icon: <InfoIcon /> });
      if (attrs.kategorie) specs.push({ label: 'Unterkategorie', value: attrs.kategorie, icon: <CategoryIcon /> });
      if (attrs.abholung !== undefined) specs.push({ label: 'Abholung möglich', value: attrs.abholung ? 'Ja' : 'Nein', icon: <LocationIcon /> });
      if (attrs.brand) specs.push({ label: 'Marke', value: String(attrs.brand), icon: <CategoryIcon /> });
      if (attrs.model) specs.push({ label: 'Modell', value: String(attrs.model), icon: <CategoryIcon /> });
      if (attrs.size) specs.push({ label: 'Größe', value: String(attrs.size), icon: <InfoIcon /> });
      if (attrs.type) specs.push({ label: 'Typ', value: String(attrs.type), icon: <InfoIcon /> });
      if (attrs.storage) specs.push({ label: 'Speicher', value: String(attrs.storage), icon: <InfoIcon /> });
      if (attrs.age) specs.push({ label: 'Alter', value: String(attrs.age), icon: <InfoIcon /> });
    }

    // Kontaktinformationen
    if (ad.contactInfo) {
      if (ad.contactInfo.phone) specs.push({ label: 'Telefon', value: ad.contactInfo.phone, icon: <PhoneIcon /> });
      if (ad.contactInfo.email) specs.push({ label: 'E-Mail', value: ad.contactInfo.email, icon: <EmailIcon /> });
    }

    // Verkäufer-Informationen
    if (ad.seller) {
      if (ad.seller.name) specs.push({ label: 'Verkäufer', value: ad.seller.name, icon: <PersonIcon /> });
      if (ad.seller.rating) specs.push({ label: 'Bewertung', value: `${ad.seller.rating}/5`, icon: <StarIcon /> });
      if (ad.seller.reviewCount) specs.push({ label: 'Bewertungen', value: `${ad.seller.reviewCount}`, icon: <StarIcon /> });
    }

    return specs;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
  );
  }

  if (error || !ad) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="error" variant="h6" textAlign="center">
          {error || 'Anzeige nicht gefunden'}
        </Typography>
      </Container>
  );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Suchleiste - Gleiche wie auf Hauptseite, nur auf Mobile */}
      <Box sx={{ 
        display: { xs: 'block', md: 'none' }, // Nur auf Mobile anzeigen
        mb: 3,
        px: 2 // Padding für Mobile
      }}>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
          <TextField
            fullWidth
            placeholder="Was suchst du?"
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '56px', // Gleiche Höhe wie Buttons
                borderRadius: 1.5, // Abgerundete Ecken wie Buttons
                bgcolor: '#ffffff',
                border: '1px solid #e5e7eb', // Gleiche Border wie Buttons
                boxShadow: '0 0.5px 2px rgba(0, 0, 0, 0.04), 0 0.25px 0.5px rgba(0, 0, 0, 0.02)', // Sehr subtiler 3D-Effekt
                transform: 'translateY(-0.25px)', // Minimale 3D-Position
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#d1d5db',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 0.5px 1px rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-0.5px)'
                },
                '&.Mui-focused': {
                  borderColor: '#059669',
                  bgcolor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 0.5px 1px rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-0.5px)'
                }
              },
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                fontWeight: 400,
                color: '#1f2937',
                '&::placeholder': {
                  color: '#9ca3af',
                  opacity: 1
                }
              }
            }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error">Fehler beim Laden der Anzeige</Typography>
          <Typography variant="body2" color="text.secondary">{error}</Typography>
        </Box>
      ) : ad ? (
        <>
          {/* Header Section - Kompakter und besser organisiert */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              bgcolor: '#ffffff'
            }}
          >
            {/* Erste Zeile: Titel und Status */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1a1a1a', 
                    mb: 1,
                    lineHeight: 1.2,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                >
                  {ad.title}
                </Typography>
                
                {/* Status und Views kompakt in einer Zeile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={ad.status} 
                    color={ad.status === 'active' ? 'success' : 'default'}
                    size="small"
                    sx={{ 
                      borderRadius: '16px',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: '24px'
                    }}
                  />
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ fontSize: 16, color: '#666' }}>
                        <ViewIcon />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {ad.views} Aufrufe
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ fontSize: 16, color: '#666' }}>
                        <CalendarIcon />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(ad.createdAt)}
                      </Typography>
                    </Box>
                </Box>
              </Box>
              
              {/* Action Buttons kompakter */}
              <Box sx={{ display: 'flex', gap: 1, ml: 2, flexShrink: 0 }}>
                <IconButton
                  onClick={handleToggleFavorite}
                  size="small"
                  sx={{
                    p: 1.5,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#ff4081',
                      bgcolor: '#fff5f8'
                    }
                  }}
                                  >
                    {isFavorite ? (
                      <Box sx={{ color: '#ff4081', fontSize: 20 }}>
                        <FavoriteIcon />
                      </Box>
                    ) : (
                      <Box sx={{ color: '#666', fontSize: 20 }}>
                        <FavoriteIcon />
                      </Box>
                    )}
                  </IconButton>
                <IconButton
                  onClick={handleShare}
                  size="small"
                  sx={{
                    p: 1.5,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#1976d2',
                      bgcolor: '#f5f9ff'
                    }
                  }}
                >
                  <ShareIcon />
                </IconButton>
                {user && (user.id.toString() === ad.seller?.id?.toString() || user.role === 'admin') && (
                  <IconButton
                    onClick={() => navigate(`/edit-listing/${ad.id}`)}
                    size="small"
                    sx={{
                      p: 1.5,
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      '&:hover': {
                        borderColor: '#2e7d32',
                        bgcolor: '#f5fff5'
                      }
                    }}
                  >
                    <EditIcon sx={{ color: '#666', fontSize: 20 }} />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Zweite Zeile: Preis, Standort und Verkäufer kompakt */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                {/* Preis */}
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#2e7d32',
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                  }}
                >
                  {formatPrice(ad.price)}
                </Typography>
                
                                  {/* Standort */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ color: '#666', fontSize: 18 }}>
                      <LocationIcon />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 500 }}>
                      {ad.location}
                    </Typography>
                  </Box>
              </Box>
              
              {/* Verkäufer-Info entfernt - wird in der Sidebar angezeigt */}
            </Box>
          </Paper>

          {/* Main Content */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
            gap: 4,
            alignItems: 'start' // Wichtig für Sticky-Positionierung
          }}>
            {/* Left Column - Images and Basic Info */}
            <Box>
              {/* Images */}
              <Box sx={{ mb: 4 }}>
                {ad.images && ad.images.length > 0 ? (
                  <>
                    {/* Mobile Image Gallery */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <MobileImageGallery
                        images={ad.images}
                        selectedIndex={selectedImageIndex}
                        onImageChange={setSelectedImageIndex}
                        onImageClick={openLightbox}
                      />
                    </Box>

                    {/* Desktop Image Gallery */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      <DesktopImageGallery
                        images={ad.images}
                        selectedIndex={selectedImageIndex}
                        onImageChange={setSelectedImageIndex}
                        onImageClick={openLightbox}
                      />
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      height: 300,
                      bgcolor: '#f5f5f5',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666'
                    }}
                  >
                    <NoImageIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h6">Keine Bilder verfügbar</Typography>
                  </Box>
                )}
              </Box>

              {/* Lightbox Modal */}
              <Modal
                open={lightboxOpen}
                onClose={closeLightbox}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '90vw',
                    height: '90vh',
                    bgcolor: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Schließen-Button */}
                  <IconButton
                    onClick={closeLightbox}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.7)',
                      zIndex: 1000,
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.9)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CloseIcon />
                  </IconButton>

                  {/* Navigation-Buttons */}
                  {ad?.images && ad.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={prevImage}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'white',
                          bgcolor: 'rgba(0,0,0,0.7)',
                          zIndex: 1000,
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.9)',
                            transform: 'translateY(-50%) scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <NavigateBeforeIcon />
                      </IconButton>
                      <IconButton
                        onClick={nextImage}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'white',
                          bgcolor: 'rgba(0,0,0,0.7)',
                          zIndex: 1000,
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.9)',
                            transform: 'translateY(-50%) scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <NavigateNextIcon />
                      </IconButton>
                    </>
                  )}

                  {/* Zoom-Buttons */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    display: 'flex', 
                    gap: 1,
                    zIndex: 1000
                  }}>
                    <IconButton
                      onClick={zoomOut}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.9)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ZoomOutIcon />
                    </IconButton>
                    <IconButton
                      onClick={resetZoom}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.9)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'white', px: 1 }}>
                        {Math.round(imageZoom * 100)}%
                      </Typography>
                    </IconButton>
                    <IconButton
                      onClick={zoomIn}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.9)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ZoomInIcon />
                    </IconButton>
                  </Box>

                  {/* Hauptbild */}
                  {ad?.images && (
                    <Box
                      component="img"
                      src={getImageUrl(ad.images[selectedImageIndex])}
                      alt={`${ad.title} ${selectedImageIndex + 1}`}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transform: `scale(${imageZoom})`,
                        transition: 'transform 0.2s'
                      }}
                    />
                  )}

                  {/* Bild-Indikator */}
                  {ad?.images && ad.images.length > 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 80,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 0.6,
                        backgroundColor: 'rgba(0,0,0,0.15)',
                        borderRadius: '6px',
                        px: 0.6,
                        py: 0.4
                      }}
                    >
                      {ad.images.map((_, index) => (
                        <Box
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          sx={{
                            width: index === selectedImageIndex ? 10 : 6,
                            height: 6,
                            borderRadius: index === selectedImageIndex ? 3 : '50%',
                            bgcolor: index === selectedImageIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: index === selectedImageIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Modal>

              {/* Quick Info Cards */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  mb: 4, 
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  bgcolor: '#ffffff'
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1a1a1a', 
                    mb: 3 
                  }}
                >
                  Schnellübersicht
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  {getPropertySpecs().slice(0, 4).map((spec, index) => (
                    <Box 
                      key={index} 
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 2,
                        borderBottom: '1px solid #f0f0f0'
                      }}
                    >
                      <Box sx={{
                        color: '#1976d2',
                        p: 1,
                        bgcolor: '#e3f2fd',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {spec.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5, fontWeight: 500 }}>
                          {spec.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          {spec.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Tabs für Eigenschaften, Beschreibung, etc. */}
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: '16px',
                  border: '1px solid #f0f0f0',
                  bgcolor: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        minHeight: 64,
                        color: '#666',
                        '&.Mui-selected': { color: '#1976d2' }
                      },
                      '& .MuiTabs-indicator': { height: 3, bgcolor: '#1976d2' }
                    }}
                  >
                    <Tab label="Eigenschaften" />
                    <Tab label="Beschreibung" />
                    <Tab label="Bewertungen" />
                    <Tab label="Standort" />
                    <Tab label="Ähnliche Anzeigen" />
                  </Tabs>
                </Box>
                <Box sx={{ p: 4 }}>
                  {/* Eigenschaften Tab */}
                  <TabPanel value={tabValue} index={0}>
                    {/* Eigenschaften nur für Autos anzeigen */}
                    {ad.category === 'autos' ? (
                      <>
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                            Grundlegende Eigenschaften
                          </Typography>
                          {(() => {
                            const rows = getPropertySpecs().slice(0, 6);
                            const left = rows.filter((_, i) => i % 2 === 0);
                            const right = rows.filter((_, i) => i % 2 === 1);
                            return (
                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 6 }}>
                                {[left, right].map((col, colIdx) => (
                                  <Box key={colIdx}>
                                    {col.map((spec, idx) => (
                                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25, borderBottom: '1px solid #eee' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                          {spec.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', textAlign: 'right' }}>
                                          {spec.value}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                ))}
                              </Box>
                            );
                          })()}
                        </Box>

                        {/* Fahrzeugdetails für Autos */}
                        {(ad.vehicleDetails || ad.attributes) && (
                          <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                              Fahrzeugdetails
                            </Typography>
                            {(() => {
                              const vehicleData = ad.vehicleDetails || ad.attributes;
                              if (!vehicleData) return null;
                              
                              const entries = Object.entries(vehicleData).filter(([_, v]) => Boolean(v));
                              const left = entries.filter((_, i) => i % 2 === 0);
                              const right = entries.filter((_, i) => i % 2 === 1);
                              const labelize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                              return (
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 6 }}>
                                  {[left, right].map((col, colIdx) => (
                                    <Box key={colIdx}>
                                      {col.map(([k, v]) => (
                                        <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25, borderBottom: '1px solid #eee' }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>{labelize(k)}</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', textAlign: 'right' }}>{String(v)}</Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  ))}
                                </Box>
                              );
                            })()}
                          </Box>
                        )}
                      </>
                    ) : (
                      /* Für normale Kleinanzeigen nur eine Info anzeigen */
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        color: 'text.secondary'
                      }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Keine detaillierten Eigenschaften verfügbar
                        </Typography>
                        <Typography variant="body1">
                          Bei dieser Art von Anzeige werden keine spezifischen Eigenschaften erfasst.
                        </Typography>
                      </Box>
                    )}
                  </TabPanel>

                  {/* Beschreibung Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 4 }}>
                        Vollständige Beschreibung
                      </Typography>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 4, 
                          bgcolor: '#fafafa',
                          borderRadius: '12px',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <Typography variant="body1" sx={{ lineHeight: 1.7, color: '#333', fontSize: '1.1rem' }}>
                          {ad.description || 'Keine Beschreibung verfügbar.'}
                        </Typography>
                      </Paper>
                    </Box>
                  </TabPanel>

                  {/* Weitere Tabs hier... */}
                  <TabPanel value={tabValue} index={2}>
                    <Typography>Bewertungen Tab</Typography>
                  </TabPanel>
                  <TabPanel value={tabValue} index={3}>
                    <Typography>Standort Tab</Typography>
                  </TabPanel>
                  <TabPanel value={tabValue} index={4}>
                    <Typography>Ähnliche Anzeigen Tab</Typography>
                  </TabPanel>
                </Box>
              </Paper>
            </Box>

            {/* Right Column - Seller Card (sticky) */}
            <Box sx={{ 
              position: 'relative',
              height: 'fit-content'
            }}>
              {ad.seller && (
                <Paper
                  elevation={0}
                  sx={{
                    position: { lg: 'sticky' },
                    top: { lg: 24 },
                    right: { lg: 0 },
                    width: { lg: '100%' },
                    p: 3,
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    bgcolor: '#ffffff',
                    maxHeight: { lg: 'calc(100vh - 48px)' },
                    overflow: { lg: 'auto' },
                    zIndex: 1000,
                    boxShadow: { lg: '0 4px 20px rgba(0,0,0,0.1)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Link to={`/user/${ad.seller.id}`} style={{ textDecoration: 'none' }} component={Link as any}>
                      <Avatar
                        src={ad.seller.avatar ? getImageUrl(ad.seller.avatar) : undefined}
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          fontSize: 24,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                            transform: 'scale(1.05)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        {ad.seller.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Link>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        component={Link as any}
                        to={`/user/${ad.seller.id}`}
                        sx={{ 
                          fontWeight: 700, 
                          color: '#1a1a1a', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          '&:hover': {
                            color: '#6366f1',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {ad.seller.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ fontSize: 18, color: '#f57c00' }} />
                        <Typography variant="body2" color="text.secondary">{ad.seller.rating ?? '—'}{ad.seller.rating ? '/5' : ''}</Typography>
                        {ad.seller.reviewCount && (
                          <Typography variant="body2" color="text.secondary">({ad.seller.reviewCount})</Typography>
                        )}
                      </Box>
                      {ad.createdAt && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BookmarkIcon />
                          <Typography variant="caption" color="text.secondary">
                            Aktiv seit {new Date(ad.createdAt).getFullYear()}
                          </Typography>
                        </Box>
                      )}
                      
                      {/* User Type Badge and Follow Button */}
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* User Type Badge */}
                        <Box>
                          <VerificationBadge
                            userType={(ad.seller.userType as 'private' | 'shop' | 'service') || 'private'}
                            badge={ad.seller.badge}
                            size="small"
                            showIcon={true}
                            showText={true}
                          />
                        </Box>

                        {/* Follow Button */}
                        {ad.seller.id ? (
                          <FollowButton
                            userId={ad.seller.id}
                            size="small"
                            variant="outlined"
                            showIcon={true}
                            isFollowing={ad.seller.isFollowing || false}
                            onFollowChange={(isFollowing) => {
                              // Update local state to reflect the change immediately
                              setAd(prevAd => {
                                if (!prevAd) return null;
                                return {
                                  ...prevAd,
                                  seller: {
                                    ...prevAd.seller,
                                    isFollowing: isFollowing
                                  }
                                } as any;
                              });
                              console.log('Follow status changed in ListingDetail:', isFollowing);
                            }}
                          />
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                            sx={{ minWidth: 'auto', px: 2, py: 0.5 }}
                          >
                            Folgen
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Telefon anzeigen */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PhoneIcon />}
                    onClick={() => setRevealPhone(true)}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      mb: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: '#2e7d32',
                      '&:hover': { bgcolor: '#256528' }
                    }}
                  >
                    {revealPhone ? (ad.contactInfo?.phone || 'Keine Nummer') : 'Telefon anzeigen'}
                  </Button>

                  {/* Message Input */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                      Nachricht senden
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Schreiben Sie eine Nachricht an den Verkäufer..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          }
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      startIcon={<MessageIcon />}
                      sx={{
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        fontSize: '0.875rem',
                        minWidth: 'auto',
                        width: 'fit-content'
                      }}
                    >
                      Senden
                    </Button>
                  </Box>

                  {/* E-Mail optional */}
                  {ad.contactInfo?.email && (
                    <Button
                      variant="text"
                      fullWidth
                      onClick={() => setRevealEmail((v) => !v)}
                      sx={{ textTransform: 'none' }}
                      startIcon={<EmailIcon />}
                    >
                      {revealEmail ? ad.contactInfo.email : 'E‑Mail anzeigen'}
                    </Button>
                  )}
                </Paper>
              )}
              
              {/* Platzhalter für Mobile/Tablet - damit der Content nicht überlappt */}
              <Box sx={{ 
                display: { xs: 'block', lg: 'none' },
                width: '100%',
                height: ad.seller ? 400 : 0 // Höhe der Sidebar auf Mobile
              }} />
            </Box>
          </Box>
        </>
      ) : null}

      {/* Rating Dialog */}
      <RatingDialog
        open={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        listingId={Number(ad?.id)}
        listingTitle={ad?.title || ''}
        onRatingSubmitted={handleRatingSubmitted}
      />

      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        listingId={ad?.id?.toString() || ''}
        listingTitle={ad?.title || ''}
        onReportSubmit={handleReportSubmit}
      />

      {/* Sende-Bestätigung */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMsg}{' '}
          {snackbarSeverity === 'success' && lastConversationId && ad && (
            <Button color="inherit" size="small" onClick={() => navigate(`/chat?conversationId=${lastConversationId}&listingId=${ad.id}&sellerId=${ad.seller?.id}&listingTitle=${encodeURIComponent(ad.title)}&listingPrice=${ad.price}&listingImage=${encodeURIComponent(ad.images?.[0] || '')}`)}>
              Im Chat öffnen
            </Button>
          )}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListingDetail; 