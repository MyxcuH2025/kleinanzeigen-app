import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface CreateKleinanzeigenListingProps {}

const CreateKleinanzeigenListing: React.FC<CreateKleinanzeigenListingProps> = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Formular-Daten
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    condition: '',
    // Kleinanzeigen-spezifische Felder
    kategorie: '',
    versand: true,
    garantie: false,
    abholung: true,
    verhandelbar: true
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Kategorie-Optionen
  const kategorieOptions = [
    'Elektronik',
    'Haus & Garten',
    'Mode & Beauty',
    'Sport & Hobby',
    'Bücher & Medien'
  ];

  // Zustand-Optionen
  const conditionOptions = [
    'Neu',
    'Gebraucht',
    'Defekt'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 10) {
      setError('Maximal 10 Bilder erlaubt');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      
      const response = await fetch('http://localhost:8000/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        uploadedUrls.push(data.url);
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
      
      // Kleinanzeigen-spezifische Attribute erstellen
      const attributes = {
        zustand: formData.condition,
        versand: formData.versand,
        garantie: formData.garantie,
        kategorie: formData.kategorie,
        abholung: formData.abholung,
        verhandelbar: formData.verhandelbar
      };

      // Listing erstellen
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: 'kleinanzeigen',
        condition: formData.condition,
        location: formData.location,
        price: parseFloat(formData.price),
        attributes: attributes,
        images: imageUrls
      };

      const response = await fetch('http://localhost:8000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(listingData)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/kleinanzeigen');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Fehler beim Erstellen der Anzeige');
      }
    } catch (error) {
      setError('Fehler beim Erstellen der Anzeige');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Card elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1e293b', fontWeight: 600 }}>
          Kleinanzeigen Anzeige erstellen
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
          Füllen Sie alle erforderlichen Felder aus
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Anzeige erfolgreich erstellt! Sie werden zur Kleinanzeigen-Seite weitergeleitet.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            {/* Grundlegende Informationen */}
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="h6" sx={{ color: '#1e293b', mb: 2 }}>
                Grundlegende Informationen
              </Typography>
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <TextField
                fullWidth
                label="Titel *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <TextField
                fullWidth
                label="Preis (€) *"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <TextField
                fullWidth
                label="Standort *"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Zustand *</InputLabel>
                <Select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  required
                >
                  {conditionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Kategorie *</InputLabel>
                <Select
                  value={formData.kategorie}
                  onChange={(e) => handleInputChange('kategorie', e.target.value)}
                  required
                >
                  {kategorieOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                label="Beschreibung *"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Kleinanzeigen-spezifische Optionen */}
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="h6" sx={{ color: '#1e293b', mb: 2 }}>
                Weitere Optionen
              </Typography>
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.versand}
                    onChange={(e) => handleInputChange('versand', e.target.checked)}
                  />
                }
                label="Versand möglich"
              />
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.garantie}
                    onChange={(e) => handleInputChange('garantie', e.target.checked)}
                  />
                }
                label="Garantie vorhanden"
              />
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.abholung}
                    onChange={(e) => handleInputChange('abholung', e.target.checked)}
                  />
                }
                label="Abholung möglich"
              />
            </Box>

            <Box sx={{ gridColumn: 'span 12 md:span 6' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.verhandelbar}
                    onChange={(e) => handleInputChange('verhandelbar', e.target.checked)}
                  />
                }
                label="Preis verhandelbar"
              />
            </Box>

            {/* Bilder-Upload */}
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="h6" sx={{ color: '#1e293b', mb: 2 }}>
                Bilder (optional)
              </Typography>
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AddIcon />}
                  sx={{ mb: 2 }}
                >
                  Bilder hinzufügen
                </Button>
              </label>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {images.map((image, index) => (
                  <Chip
                    key={index}
                    label={image.name}
                    onDelete={() => removeImage(index)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
            </Box>

            {/* Submit Button */}
            <Box sx={{ gridColumn: 'span 12', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/kleinanzeigen')}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Erstelle...' : 'Anzeige erstellen'}
                </Button>
              </Box>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default CreateKleinanzeigenListing; 