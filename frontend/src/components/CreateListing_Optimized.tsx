import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Breadcrumb from './Breadcrumb';
import { breadcrumbService } from '@/services/breadcrumbService';

// Modulare Komponenten
import { BasicInfoForm, PriceLocationForm, ImageUploadForm, AttributesForm } from './CreateListing/index';

// Backend-synchronisierte Attribute-Konfiguration
import { getCategoryAttributes, type AttributesConfig } from '@/config/attributesConfig';

const CreateListing_Optimized: React.FC = () => {
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { user } = useUser();
  
  // State für Formulardaten
  const [title, setTitle] = useState('iPhone 12 verkaufen');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<'offer' | 'request'>('offer');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'free'>('fixed');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [item, setItem] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]); // REPARIERT: Hochgeladene URLs
  
  // Backend-synchronisierte Attribute
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [categoryAttributes, setCategoryAttributes] = useState<AttributesConfig>({});
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [breadcrumbItems, setBreadcrumbItems] = useState<any[]>([]);

  // Breadcrumb-Service initialisieren
  useEffect(() => {
    const breadcrumb = breadcrumbService.getBreadcrumbPath('create-listing');
    setBreadcrumbItems(breadcrumb);
  }, []);

  // Backend-Attribute laden basierend auf Kategorie
  useEffect(() => {
    if (category) {
      const attrs = getCategoryAttributes(category);
      setCategoryAttributes(attrs);
      
      // Attribute-State mit Standardwerten initialisieren
      const initialAttributes: Record<string, any> = {};
      Object.entries(attrs).forEach(([key, config]) => {
        if (config && typeof config === 'object' && 'default' in config && config.default !== undefined) {
          initialAttributes[key] = config.default;
        }
      });
      setAttributes(initialAttributes);
    }
  }, [category]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Grundlegende Validierung
    if (!title.trim()) newErrors.title = 'Titel ist erforderlich';
    if (!description.trim()) newErrors.description = 'Beschreibung ist erforderlich';
    if (!price.trim() && priceType !== 'free') newErrors.price = 'Preis ist erforderlich';
    if (!location.trim()) newErrors.location = 'Standort ist erforderlich';
    if (!category) newErrors.category = 'Kategorie ist erforderlich';
    if (images.length === 0) newErrors.images = 'Mindestens ein Bild ist erforderlich';

    // Backend-Attribute-Validierung
    Object.entries(categoryAttributes).forEach(([key, config]) => {
      if (config.required && (!attributes[key] || attributes[key] === '')) {
        newErrors[`attribute_${key}`] = `${config.label} ist erforderlich`;
      }
      
      // Typ-spezifische Validierung
      if (attributes[key] !== undefined && attributes[key] !== '') {
        if (config.type === 'integer') {
          const value = parseInt(attributes[key]);
          if (isNaN(value)) {
            newErrors[`attribute_${key}`] = `${config.label} muss eine Zahl sein`;
          } else {
            if (config.min !== undefined && value < config.min) {
              newErrors[`attribute_${key}`] = `${config.label} muss mindestens ${config.min} sein`;
            }
            if (config.max !== undefined && value > config.max) {
              newErrors[`attribute_${key}`] = `${config.label} darf höchstens ${config.max} sein`;
            }
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Bitte füllen Sie alle erforderlichen Felder aus',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Backend-synchronisierte Daten für API-Anfrage vorbereiten
      const listingData = {
        title,
        description,
        price: priceType === 'free' ? 0 : parseFloat(price),
        location,
        category,
        subcategory: subcategory || null,
        item: item || null,
        condition: attributes.zustand || 'Gut', // Fallback für Kleinanzeigen
        images: uploadedUrls, // REPARIERT: Verwende hochgeladene URLs statt Base64-Previews
        attributes: attributes, // Backend-synchronisierte Attribute
        highlighted: isHighlighted,
        listingType
      };

      console.log('Listing-Daten (Backend-synchronisiert):', listingData);
      
      // Echte API-Anfrage mit User-ID
      const response = await fetch('http://localhost:8000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(listingData)
      });

      if (!response.ok) {
        // 401 Unauthenticated ist normal - User ist nicht eingeloggt
        if (response.status === 401) {
          setSnackbar({
            open: true,
            message: 'Bitte loggen Sie sich ein, um eine Anzeige zu erstellen',
            severity: 'error'
          });
          return;
        }
        throw new Error('Fehler beim Erstellen der Anzeige');
      }

      const createdListing = await response.json();
      
      setSnackbar({
        open: true,
        message: 'Anzeige erfolgreich erstellt!',
        severity: 'success'
      });
      
      // Nach 2 Sekunden zur Anzeige weiterleiten
      setTimeout(() => {
        navigate('/listings');
      }, 2000);
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Fehler beim Erstellen der Anzeige',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          Anzeige erstellen
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Erstelle eine professionelle Anzeige mit Live-Vorschau
        </Typography>
      </Box>

      {/* Hauptinhalt - 2-Spalten Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, gap: 4 }}>
        {/* Linke Spalte - Formular */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <form onSubmit={handleSubmit}>
            {/* Grundlegende Informationen */}
            <BasicInfoForm
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              listingType={listingType}
              setListingType={setListingType}
              category={category}
              setCategory={setCategory}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              item={item}
              setItem={setItem}
              isHighlighted={isHighlighted}
              setIsHighlighted={setIsHighlighted}
              errors={errors}
            />

            <Divider sx={{ my: 4 }} />

            {/* Preis & Standort */}
            <PriceLocationForm
              price={price}
              setPrice={setPrice}
              location={location}
              setLocation={setLocation}
              priceType={priceType}
              setPriceType={setPriceType}
              errors={errors}
            />

            <Divider sx={{ my: 4 }} />

            {/* Backend-synchronisierte Attribute */}
            {category && (
              <>
                <AttributesForm
                  categoryAttributes={categoryAttributes}
                  attributes={attributes}
                  setAttributes={setAttributes}
                  errors={errors}
                />
                <Divider sx={{ my: 4 }} />
              </>
            )}

            {/* Bilder */}
            <ImageUploadForm
              images={images}
              setImages={setImages}
              imagePreviews={imagePreviews}
              setImagePreviews={setImagePreviews}
              uploadedUrls={uploadedUrls}
              setUploadedUrls={setUploadedUrls}
              errors={errors}
            />

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Erstelle Anzeige...
                  </>
                ) : (
                  'Anzeige erstellen'
                )}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/listings')}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Abbrechen
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Rechte Spalte - Vorschau */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Live-Vorschau
          </Typography>
          
          {/* Hier würde die Vorschau-Komponente stehen */}
          <Box sx={{ 
            p: 3, 
            border: '2px dashed', 
            borderColor: 'divider', 
            borderRadius: 2,
            textAlign: 'center',
            color: 'text.secondary'
          }}>
            <Typography variant="body2">
              Vorschau wird hier angezeigt
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateListing_Optimized;
