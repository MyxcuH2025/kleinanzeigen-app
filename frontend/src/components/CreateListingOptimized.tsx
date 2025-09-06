import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as UploadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ListingPreview from './ListingPreview';

interface CreateListingProps {
  onFormDataUpdate?: (data: Record<string, string | number | boolean>, images: File[]) => void;
}

const CreateListingOptimized: React.FC<CreateListingProps> = ({ onFormDataUpdate }) => {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Formular-Daten
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    condition: '',
    // Auto-spezifische Felder
    marke: '',
    modell: '',
    erstzulassung: '',
    kilometerstand: '',
    kraftstoff: '',
    getriebe: '',
    farbe: '',
    leistung: '',
    unfallfrei: false
  });
  
  const [images, setImages] = useState<File[]>([]);

  // Marken-Datenbank
  const marken = [
    'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Opel', 'Ford', 'Renault', 'Peugeot',
    'Citroen', 'Fiat', 'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi',
    'Hyundai', 'Kia', 'Skoda', 'Seat', 'Volvo', 'Saab', 'Alfa Romeo', 'Lancia',
    'Jaguar', 'Land Rover', 'Mini', 'Smart', 'Porsche', 'Ferrari', 'Lamborghini',
    'Maserati', 'Bentley', 'Rolls Royce', 'Aston Martin', 'McLaren', 'Lotus',
    'Tesla', 'Polestar', 'Rivian', 'Lucid', 'Nio', 'Xpeng', 'BYD', 'Geely'
  ];

  // Kraftstoff-Optionen
  const kraftstoffOptions = [
    'Benzin', 'Diesel', 'Elektro', 'Hybrid', 'Plug-in Hybrid', 'LPG', 'CNG', 'Wasserstoff'
  ];

  // Getriebe-Optionen
  const getriebeOptions = [
    'Manuell', 'Automatik', 'Halbautomatik', 'CVT', 'DSG', 'DCT'
  ];

  // Zustand-Optionen
  const conditionOptions = [
    'Neu', 'Gebraucht', 'Defekt', 'Unfallfrei', 'Unfallwagen'
  ];

  const handleInputChange = (field: string, value: string | number | boolean) => {
    const newData = {
      ...formData,
      [field]: value
    };
    setFormData(newData);
    
    // Update Live-Vorschau
    if (onFormDataUpdate) {
      onFormDataUpdate(newData, images);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 10) {
      setError('Maximal 10 Bilder erlaubt');
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);
    
    // Update Live-Vorschau
    if (onFormDataUpdate) {
      onFormDataUpdate(formData, newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Update Live-Vorschau
    if (onFormDataUpdate) {
      onFormDataUpdate(formData, newImages);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      
      try {
        const response = await fetch('http://localhost:8000/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          // Korrekte URL-Extraktion basierend auf Backend-Response
          const imageUrl = data.url || data.filename || `http://localhost:8000/api/images/${data.filename}`;
          uploadedUrls.push(imageUrl);
        } else {
          console.error('Error uploading image:', response.statusText);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Bilder hochladen
      const imageUrls = await uploadImages();
      
      // Anzeige erstellen
      const response = await fetch('http://localhost:8000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: 'autos',
          condition: formData.condition,
          location: formData.location,
          price: parseFloat(formData.price),
          attributes: {
            marke: formData.marke,
            modell: formData.modell,
            erstzulassung: parseInt(formData.erstzulassung),
            kilometerstand: parseInt(formData.kilometerstand),
            kraftstoff: formData.kraftstoff,
            getriebe: formData.getriebe,
            farbe: formData.farbe,
            leistung: parseInt(formData.leistung),
            unfallfrei: formData.unfallfrei
          },
          images: imageUrls
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/autos');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Fehler beim Erstellen der Anzeige');
      }
    } catch (error) {
      setError('Netzwerkfehler beim Erstellen der Anzeige');
    } finally {
      setLoading(false);
    }
  };

  // Zeige Vorschau wenn gewünscht
  if (showPreview) {
    return (
      <ListingPreview
        formData={formData}
        images={images}
        type="auto"
        onBack={() => setShowPreview(false)}
        onPublish={() => handleSubmit({} as React.FormEvent)}
        loading={loading}
      />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Layout mit Formular und Vorschau */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, 
        gap: 4,
        alignItems: 'start'
      }}>
        {/* Formular */}
        <Paper 
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'
          }}
        >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            color: '#1a1a1a', 
            mb: 1,
            textAlign: 'center'
          }}
        >
          Auto verkaufen
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 4, textAlign: 'center' }}
        >
          Füllen Sie alle erforderlichen Felder aus
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Anzeige erfolgreich erstellt! Sie werden zur Autos-Seite weitergeleitet.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Grundlegende Informationen */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.primary', 
                mb: 3, 
                fontWeight: 600,
                borderBottom: '2px solid',
                borderColor: 'divider',
                pb: 1
              }}
            >
              Grundlegende Informationen
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Titel *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'text.primary',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Preis (€) *"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'text.primary',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Standort *"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'text.primary',
                      },
                    },
                  },
                }}
              />

              <FormControl fullWidth size="medium">
                <InputLabel>Zustand *</InputLabel>
                <Select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  required
                  sx={{
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  {conditionOptions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Fahrzeug-Details */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.primary', 
                mb: 3, 
                fontWeight: 600,
                borderBottom: '2px solid',
                borderColor: 'divider',
                pb: 1
              }}
            >
              Fahrzeug-Details
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <FormControl fullWidth size="medium">
                <InputLabel>Marke *</InputLabel>
                <Select
                  value={formData.marke}
                  onChange={(e) => handleInputChange('marke', e.target.value)}
                  required
                  sx={{
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  {marken.map((marke) => (
                    <MenuItem key={marke} value={marke}>
                      {marke}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Modell *"
                value={formData.modell}
                onChange={(e) => handleInputChange('modell', e.target.value)}
                required
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'text.primary',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Erstzulassung *"
                type="number"
                value={formData.erstzulassung}
                onChange={(e) => handleInputChange('erstzulassung', e.target.value)}
                required
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'text.primary',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Kilometerstand *"
                type="number"
                value={formData.kilometerstand}
                onChange={(e) => handleInputChange('kilometerstand', e.target.value)}
                required
                inputProps={{ min: 0 }}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'text.primary',
                    },
                  },
                }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Kraftstoff *</InputLabel>
                  <Select
                    value={formData.kraftstoff}
                    onChange={(e) => handleInputChange('kraftstoff', e.target.value)}
                    required
                    sx={{
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'text.primary',
                      },
                    }}
                  >
                    {kraftstoffOptions.map((kraftstoff) => (
                      <MenuItem key={kraftstoff} value={kraftstoff}>
                        {kraftstoff}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="medium">
                  <InputLabel>Getriebe *</InputLabel>
                  <Select
                    value={formData.getriebe}
                    onChange={(e) => handleInputChange('getriebe', e.target.value)}
                    required
                    sx={{
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'text.primary',
                      },
                    }}
                  >
                    {getriebeOptions.map((getriebe) => (
                      <MenuItem key={getriebe} value={getriebe}>
                        {getriebe}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Farbe"
                  value={formData.farbe}
                  onChange={(e) => handleInputChange('farbe', e.target.value)}
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'text.primary',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Leistung (PS)"
                  type="number"
                  value={formData.leistung}
                  onChange={(e) => handleInputChange('leistung', e.target.value)}
                  inputProps={{ min: 0 }}
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'text.primary',
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.unfallfrei}
                    onChange={(e) => handleInputChange('unfallfrei', e.target.checked)}
                    color="primary"
                  />
                }
                label="Unfallfrei"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Beschreibung */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1a1a1a', 
                mb: 3, 
                fontWeight: 600,
                borderBottom: '2px solid #e5e7eb',
                pb: 1
              }}
            >
              Beschreibung
            </Typography>

            <TextField
              fullWidth
              label="Beschreibung *"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#1a1a1a',
                  },
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Bilder */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1a1a1a', 
                mb: 3, 
                fontWeight: 600,
                borderBottom: '2px solid #e5e7eb',
                pb: 1
              }}
            >
              Bilder (optional)
            </Typography>

            <Box
              sx={{
                border: '2px dashed #d1d5db',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                '&:hover': {
                  borderColor: '#1a1a1a',
                  backgroundColor: '#f3f4f6',
                },
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#1a1a1a',
                    color: '#1a1a1a',
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: '#f3f4f6',
                    },
                  }}
                >
                  + Bilder hinzufügen
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Maximal 10 Bilder (max. 5MB pro Bild)
              </Typography>
            </Box>

            {images.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {images.map((image, index) => (
                    <Chip
                      key={index}
                      label={image.name}
                      onDelete={() => removeImage(index)}
                      deleteIcon={<DeleteIcon />}
                      sx={{
                        borderRadius: 2,
                        '& .MuiChip-deleteIcon': {
                          color: '#ef4444',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/autos')}
              sx={{
                borderRadius: 2,
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                '&:hover': {
                  borderColor: '#000000',
                  backgroundColor: '#f3f4f6',
                },
              }}
            >
              Abbrechen
            </Button>
            <Button
              startIcon={<VisibilityIcon />}
              variant="outlined"
              onClick={() => setShowPreview(true)}
              sx={{
                borderRadius: 2,
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                '&:hover': {
                  borderColor: '#000000',
                  backgroundColor: '#f3f4f6',
                },
              }}
            >
              Vorschau
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: 2,
                backgroundColor: '#1a1a1a',
                '&:hover': {
                  backgroundColor: '#000000',
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Anzeige erstellen'
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Live-Vorschau wird zentral in CreateListingUnified verwaltet */}
    </Box>
  </Container>
  );
};

export default CreateListingOptimized; 