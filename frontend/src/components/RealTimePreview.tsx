import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  IconButton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

interface RealTimePreviewProps {
  formData: Record<string, string | number | boolean>;
  images: File[];
  type: 'auto' | 'kleinanzeigen';
  loading?: boolean;
}

const RealTimePreview: React.FC<RealTimePreviewProps> = ({ 
  formData, 
  images, 
  type, 
  loading = false 
}) => {
  // Erstelle Vorschau-Bilder aus den hochgeladenen Dateien
  const previewImages = images.map(file => URL.createObjectURL(file));

  // Fallback-Bild wenn keine Bilder vorhanden sind
  const defaultImage = 'https://via.placeholder.com/400x300/f0f0f0/cccccc?text=Kein+Bild';

  const formatPrice = (price: string) => {
    if (!price) return 'Preis auf Anfrage';
    return `${price} €`;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
          height: 'fit-content',
          position: 'sticky',
          top: 20
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Live-Vorschau
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Skeleton variant="rectangular" height={250} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={16} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#ffffff',
        height: 'fit-content',
        position: 'sticky',
        top: 20
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Live-Vorschau
      </Typography>
      
      {/* Vorschau-Karte */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff'
        }}
      >
        {/* Bild-Bereich */}
        <Box
          sx={{
            position: 'relative',
            height: 250,
            bgcolor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {previewImages.length > 0 ? (
            <img
              src={previewImages[0]}
              alt="Vorschau"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <img
              src={defaultImage}
              alt="Kein Bild"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
          
          {/* Aktions-Buttons */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: 1
            }}
          >
            <IconButton
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <FavoriteIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Bild-Indikator wenn mehrere Bilder */}
          {previewImages.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 0.5
              }}
            >
              {previewImages.slice(0, 5).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: index === 0 ? 'primary.main' : 'rgba(255, 255, 255, 0.6)'
                  }}
                />
              ))}
              {previewImages.length > 5 && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem' }}>
                    +{previewImages.length - 5}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Inhalt */}
        <Box sx={{ p: 2 }}>
          {/* Titel */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: formData.title ? 'text.primary' : 'text.disabled'
            }}
          >
            {formData.title || 'Titel der Anzeige'}
          </Typography>

          {/* Preis */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 1.5
            }}
          >
            {formatPrice(String(formData.price))}
          </Typography>

          {/* Auto-spezifische Details */}
          {type === 'auto' && (
            <Box sx={{ mb: 2 }}>
              {formData.marke && formData.modell && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {formData.marke} {formData.modell}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {formData.erstzulassung && (
                  <Chip
                    label={`EZ: ${formData.erstzulassung}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {formData.kilometerstand && (
                  <Chip
                    label={`${formData.kilometerstand} km`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {formData.kraftstoff && (
                  <Chip
                    label={formData.kraftstoff}
                    size="small"
                    variant="outlined"
                  />
                )}
                {formData.getriebe && (
                  <Chip
                    label={formData.getriebe}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Kleinanzeigen-spezifische Details */}
          {type === 'kleinanzeigen' && (
            <Box sx={{ mb: 2 }}>
              {formData.brand && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Marke: {formData.brand}
                </Typography>
              )}
              {formData.model && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Modell: {formData.model}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {formData.size && (
                  <Chip
                    label={formData.size}
                    size="small"
                    variant="outlined"
                  />
                )}
                {formData.type && (
                  <Chip
                    label={formData.type}
                    size="small"
                    variant="outlined"
                  />
                )}
                {formData.versand && (
                  <Chip
                    label="Versand"
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
                {formData.garantie && (
                  <Chip
                    label="Garantie"
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Beschreibung */}
          {formData.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.5, lineHeight: 1.4 }}
            >
              {truncateText(String(formData.description), 100)}
            </Typography>
          )}

          {/* Standort und Datum */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <LocationIcon fontSize="small" />
            <Typography variant="body2">
              {formData.location || 'Standort'}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon fontSize="small" />
              <Typography variant="body2">
                {formatDate()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Hinweis */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: 'block', textAlign: 'center' }}
      >
        Diese Vorschau wird in Echtzeit aktualisiert
      </Typography>
    </Paper>
  );
};

export default RealTimePreview;
