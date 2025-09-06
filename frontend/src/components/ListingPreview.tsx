import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Container,
  Divider,
  Alert
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ListingPreviewProps {
  formData: Record<string, string | number | boolean>;
  images: File[];
  type: 'auto' | 'kleinanzeigen';
  onBack: () => void;
  onPublish: () => void;
  loading?: boolean;
}

const ListingPreview: React.FC<ListingPreviewProps> = ({ 
  formData, 
  images, 
  type, 
  onBack,
  onPublish,
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



  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header mit Aktionen */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Zurück zum Formular
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Vorschau deiner Anzeige
          </Typography>
        </Box>
        
        <Button
          startIcon={<PublishIcon />}
          onClick={onPublish}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: 2,
            backgroundColor: '#1a1a1a',
            '&:hover': { backgroundColor: '#000000' },
            '&:disabled': { backgroundColor: '#9ca3af' }
          }}
        >
          {loading ? 'Wird veröffentlicht...' : 'Anzeige veröffentlichen'}
        </Button>
      </Box>

      {/* Vorschau-Karte */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
          overflow: 'hidden'
        }}
      >
        {/* Bild-Bereich */}
        <Box
          sx={{
            position: 'relative',
            height: { xs: 300, md: 400 },
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
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1
            }}
          >
            <IconButton
              size="large"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <FavoriteIcon />
            </IconButton>
            <IconButton
              size="large"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <ShareIcon />
            </IconButton>
            <IconButton
              size="large"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Bild-Indikator wenn mehrere Bilder */}
          {previewImages.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1
              }}
            >
              {previewImages.slice(0, 5).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: index === 0 ? 'primary.main' : 'rgba(255, 255, 255, 0.6)'
                  }}
                />
              ))}
              {previewImages.length > 5 && (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                    +{previewImages.length - 5}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Inhalt */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            {/* Hauptinhalt */}
            <Box>
              {/* Titel */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: formData.title ? 'text.primary' : 'text.disabled'
                }}
              >
                {formData.title || 'Titel der Anzeige'}
              </Typography>

              {/* Preis */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 3
                }}
              >
                {formatPrice(String(formData.price))}
              </Typography>

              {/* Auto-spezifische Details */}
              {type === 'auto' && (
                <Box sx={{ mb: 3 }}>
                  {formData.marke && formData.modell && (
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      {formData.marke} {formData.modell}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formData.erstzulassung && (
                      <Chip
                        label={`EZ: ${formData.erstzulassung}`}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.kilometerstand && (
                      <Chip
                        label={`${formData.kilometerstand} km`}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.kraftstoff && (
                      <Chip
                        label={formData.kraftstoff}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.getriebe && (
                      <Chip
                        label={formData.getriebe}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.farbe && (
                      <Chip
                        label={formData.farbe}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.leistung && (
                      <Chip
                        label={`${formData.leistung} PS`}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.unfallfrei && (
                      <Chip
                        label="Unfallfrei"
                        size="medium"
                        variant="outlined"
                        color="success"
                      />
                    )}
                  </Box>
                </Box>
              )}

              {/* Kleinanzeigen-spezifische Details */}
              {type === 'kleinanzeigen' && (
                <Box sx={{ mb: 3 }}>
                  {formData.brand && (
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Marke: {formData.brand}
                    </Typography>
                  )}
                  {formData.model && (
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Modell: {formData.model}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formData.size && (
                      <Chip
                        label={formData.size}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.type && (
                      <Chip
                        label={formData.type}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.storage && (
                      <Chip
                        label={formData.storage}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.age && (
                      <Chip
                        label={formData.age}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                    {formData.versand && (
                      <Chip
                        label="Versand"
                        size="medium"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                    {formData.garantie && (
                      <Chip
                        label="Garantie"
                        size="medium"
                        variant="outlined"
                        color="success"
                      />
                    )}
                    {formData.abholung && (
                      <Chip
                        label="Abholung"
                        size="medium"
                        variant="outlined"
                        color="info"
                      />
                    )}
                    {formData.verhandelbar && (
                      <Chip
                        label="Verhandelbar"
                        size="medium"
                        variant="outlined"
                        color="warning"
                      />
                    )}
                  </Box>
                </Box>
              )}

              {/* Beschreibung */}
              {formData.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Beschreibung
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {formData.description}
                  </Typography>
                </Box>
              )}

              {/* Standort und Datum */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon />
                  <Typography variant="body1">
                    {formData.location || 'Standort'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon />
                  <Typography variant="body1">
                    {formatDate()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Seitenleiste */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#fafbfc'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Anzeige-Details
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kategorie: {type === 'auto' ? 'Auto' : 'Kleinanzeige'}
                  </Typography>
                  {formData.condition && (
                    <Typography variant="body2" color="text.secondary">
                      Zustand: {formData.condition}
                    </Typography>
                  )}
                  {formData.category && (
                    <Typography variant="body2" color="text.secondary">
                      Unterkategorie: {formData.category}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Bilder: {images.length} von 10
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Überprüfe alle Angaben sorgfältig, bevor du die Anzeige veröffentlichst.
                </Alert>

                <Button
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={onBack}
                  variant="outlined"
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  Bearbeiten
                </Button>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ListingPreview;
