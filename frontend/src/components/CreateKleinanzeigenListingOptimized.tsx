import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  Divider, 
  Alert, 
  CircularProgress,
  Chip
} from '@mui/material';
import { CloudUpload, Delete, Add, Visibility as VisibilityIcon } from '@mui/icons-material';
import { getCategoriesByTheme } from '@/utils/categories';
import ListingPreview from './ListingPreview';
import AIButtons from './AIButtons';

interface CreateKleinanzeigenListingProps {
  onFormDataUpdate?: (data: any, images: File[]) => void;
}

const CreateKleinanzeigenListingOptimized: React.FC<CreateKleinanzeigenListingProps> = ({ onFormDataUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Formular-Daten
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    condition: '',
    category: '', // Geändert von kategorie zu category
    // Neue strukturierte Felder für Chips
    brand: '',
    model: '',
    size: '',
    type: '',
    storage: '',
    age: '',
    versand: false,
    garantie: false,
    abholung: true,
    verhandelbar: true
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Kategorien vom Backend laden
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('http://localhost:8000/api/categories/kleinanzeigen');
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Kategorien');
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err);
        // Fallback zu lokalen Kategorien
        setCategories(getCategoriesByTheme('kleinanzeigen'));
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Zustand-Optionen
  const conditionOptions = [
    'Neu',
    'Gebraucht',
    'Defekt'
  ];

  const handleInputChange = (field: string, value: any) => {
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
          category: 'kleinanzeigen',
          condition: formData.condition,
          location: formData.location,
          price: parseFloat(formData.price),
          attributes: {
            category: formData.category,
            condition: formData.condition,
            // Neue strukturierte Felder für Chips
            brand: formData.brand,
            model: formData.model,
            size: formData.size,
            type: formData.type,
            storage: formData.storage,
            age: formData.age,
            versand: formData.versand,
            garantie: formData.garantie,
            abholung: formData.abholung,
            verhandelbar: formData.verhandelbar
          },
          images: imageUrls
        })
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
        type="kleinanzeigen"
        onBack={() => setShowPreview(false)}
        onPublish={() => handleSubmit({} as React.FormEvent)}
        loading={loading}
      />
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Layout mit Formular und Vorschau */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, 
        gap: 4,
        alignItems: 'start'
      }}>
        {/* Formular */}
        <Box 
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
          Kleinanzeige erstellen
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
            Anzeige erfolgreich erstellt! Sie werden zur Kleinanzeigen-Seite weitergeleitet.
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

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
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
                      borderColor: 'text.primary',
                    },
                  },
                }}
              />

              <FormControl fullWidth size="medium">
                <InputLabel>Kategorie *</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  sx={{
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  {categoriesLoading ? (
                    <MenuItem value="">Lade Kategorien...</MenuItem>
                  ) : categories.length === 0 ? (
                    <MenuItem value="">Keine Kategorien gefunden</MenuItem>
                  ) : (
                    categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

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

            {/* AI Buttons */}
            <AIButtons
              title={formData.title}
              description={formData.description}
              category={formData.category}
              onDescriptionOptimized={(optimizedDescription) => {
                handleInputChange('description', optimizedDescription);
              }}
              onCategorySuggested={(suggestedCategory) => {
                handleInputChange('category', suggestedCategory);
              }}
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Produktdetails für Chips */}
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
              Produktdetails (werden als Chips angezeigt)
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              <TextField
                fullWidth
                label="Marke"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
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
                label="Modell"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
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
                label="Größe/Größe"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                size="medium"
                placeholder="z.B. M, 41, 160x200"
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
                label="Typ"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                size="medium"
                placeholder="z.B. Noise-Cancelling, Action Camera"
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
                label="Speicher"
                value={formData.storage}
                onChange={(e) => handleInputChange('storage', e.target.value)}
                size="medium"
                placeholder="z.B. 64GB, 256GB"
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
                label="Alter"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                size="medium"
                placeholder="z.B. 2 Jahre, 10 Wochen"
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

          <Divider sx={{ my: 4 }} />

          {/* Weitere Optionen */}
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
              Weitere Optionen
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.versand}
                    onChange={(e) => handleInputChange('versand', e.target.checked)}
                    color="primary"
                  />
                }
                label="Versand möglich"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.garantie}
                    onChange={(e) => handleInputChange('garantie', e.target.checked)}
                    color="primary"
                  />
                }
                label="Garantie vorhanden"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.abholung}
                    onChange={(e) => handleInputChange('abholung', e.target.checked)}
                    color="primary"
                  />
                }
                label="Abholung möglich"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.verhandelbar}
                    onChange={(e) => handleInputChange('verhandelbar', e.target.checked)}
                    color="primary"
                  />
                }
                label="Preis verhandelbar"
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
                  startIcon={<CloudUpload />}
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
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 1 }}>
                  {images.map((image, index) => (
                    <Chip
                      key={index}
                      label={image.name}
                      onDelete={() => removeImage(index)}
                      deleteIcon={<Delete />}
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
              onClick={() => navigate('/kleinanzeigen')}
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
      </Box>

      {/* Live-Vorschau wird zentral in CreateListingUnified verwaltet */}
    </Box>
  </Box>
  );
};

export default CreateKleinanzeigenListingOptimized; 