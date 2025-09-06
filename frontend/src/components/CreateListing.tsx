import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  Divider,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Switch,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Breadcrumb from './Breadcrumb';
import { breadcrumbService } from '@/services/breadcrumbService';

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  // Einzelne State-Variablen für bessere Performance
  const [title, setTitle] = useState('iPhone 12 verkaufen');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState<'offer' | 'request'>('offer');
  const [priceType, setPriceType] = useState('fixed');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [contactName, setContactName] = useState('test');
  const [contactEmail, setContactEmail] = useState('test@example.com');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  // Kategorie aus URL-State oder Standardwert
  const [category, setCategory] = useState(() => {
    const state = location.state as any;
    return state?.category || 'jobs';
  });
  
  // Unterkategorie und Typ aus URL-State
  const [subcategory, setSubcategory] = useState(() => {
    const state = location.state as any;
    return state?.subcategory || null;
  });
  
  const [selectedItem, setSelectedItem] = useState(() => {
    const state = location.state as any;
    return state?.item || null;
  });
  const [images, setImages] = useState<File[]>([]);
  
  // Backend-Integration States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState<any[]>([]);

  // Backend-Funktionen
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    let skippedTooLarge = 0;
    let skippedWrongType = 0;
    
    for (const image of images) {
      // Clientseitige Validierung
      if (!image.type || !image.type.startsWith('image/')) {
        skippedWrongType += 1;
        console.warn('Übersprungen (kein Bild):', image.name);
        continue;
      }
      if (image.size > MAX_SIZE) {
        skippedTooLarge += 1;
        console.warn('Übersprungen (Datei zu groß >5MB):', image.name);
        continue;
      }
      const formData = new FormData();
      formData.append('file', image);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.url || `http://localhost:8000/api/uploads/${data.filename}`;
          uploadedUrls.push(imageUrl);
        } else {
          const errText = await response.text();
          console.error('Error uploading image:', response.status, errText);
          // Weiter mit den restlichen Dateien
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    if (skippedTooLarge || skippedWrongType) {
      const parts: string[] = [];
      if (skippedTooLarge) parts.push(`${skippedTooLarge} Datei(en) > 5MB`);
      if (skippedWrongType) parts.push(`${skippedWrongType} ungültige Datei(en)`);
      setError(`Bild-Upload: ${parts.join(', ')} übersprungen.`);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError('Bitte akzeptieren Sie die Nutzungsbedingungen');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Bilder hochladen
      const imageUrls = await uploadImages();
      console.log('Uploaded image URLs:', imageUrls);
      
      // Listing erstellen
      const listingData = {
        title: title,
        description: description,
        category: category,
        condition: 'Gebraucht',
        location: `${postalCode} ${city}`,
        price: priceType === 'free' ? 0 : parseFloat(price),
        priceType: priceType,
        listingType: listingType,
        images: imageUrls,
        attributes: {
          showFullAddress: showFullAddress,
          street: street
        },
        contact: {
          name: contactName,
          email: contactEmail
        }
      };
      
      console.log('Listing data to send:', listingData);
      
      const response = await fetch('http://localhost:8000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(listingData)
      });
      
      if (response.ok) {
        const listingData = await response.json();
        setSuccess(true);
        setTimeout(() => {
          navigate(`/listing/${listingData.id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        // Sicherstellen, dass error ein String ist
        let errorMessage = 'Fehler beim Erstellen der Anzeige';
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === 'object') {
          if (errorData.detail && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (errorData.message && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (Array.isArray(errorData.detail)) {
            // Wenn detail ein Array von Validierungsfehlern ist
            errorMessage = errorData.detail.map((err: any) => 
              typeof err === 'string' ? err : err.msg || err.message || 'Validierungsfehler'
            ).join(', ');
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setError('Fehler beim Erstellen der Anzeige');
    } finally {
      setLoading(false);
    }
  };

  // Bild-Upload Funktionen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 20) {
      console.error('Maximal 20 Bilder erlaubt');
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 12 * 1024 * 1024) {
        console.error(`Bild ${file.name} ist zu groß (max. 12MB)`);
        return false;
      }
      return true;
    });
    
    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Breadcrumb-Pfad aktualisieren
  const updateBreadcrumb = async (
    categoryValue: string, 
    listingType: 'offer' | 'request' = 'offer',
    subcategoryValue?: string | null,
    itemValue?: string | null
  ) => {
    await breadcrumbService.loadCategories();
    const breadcrumbPath = breadcrumbService.getCreateListingBreadcrumb(
      categoryValue, 
      listingType, 
      subcategoryValue, 
      itemValue
    );
    setBreadcrumbItems(breadcrumbPath);
  };

  // Breadcrumb-Pfad beim Laden und bei Änderungen aktualisieren
  useEffect(() => {
    updateBreadcrumb(category, listingType, subcategory, selectedItem);
  }, [category, listingType, subcategory, selectedItem]);

  // Kategorie aus URL-State aktualisieren, wenn sich die Location ändert
  useEffect(() => {
    const state = location.state as any;
    if (state?.category && state.category !== category) {
      setCategory(state.category);
    }
    if (state?.subcategory && state.subcategory !== subcategory) {
      setSubcategory(state.subcategory);
    }
    if (state?.item && state.item !== selectedItem) {
      setSelectedItem(state.item);
    }
  }, [location.state, category, subcategory, selectedItem]);

  // Live-Vorschau der Anzeige
  const LivePreview = () => (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
        <VisibilityIcon sx={{ mr: 1, color: 'primary.main' }} />
        Live-Vorschau
      </Typography>
      
      {/* Anzeigen-Karte */}
      <Card elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Hauptbild */}
        <Box sx={{ 
          height: 200, 
          bgcolor: 'grey.100', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative'
        }}>
          <PhotoCameraIcon sx={{ fontSize: 48, color: 'grey.400' }} />
          
          {/* Typ-Badge */}
          <Box sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: listingType === 'offer' ? 'success.main' : 'warning.main',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {listingType === 'offer' ? 'Ich biete' : 'Ich suche'}
          </Box>
        </Box>

        {/* Anzeigen-Content */}
        <CardContent sx={{ p: 2 }}>
          {/* Titel */}
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            mb: 1,
            minHeight: 24,
            ...(title ? {} : { color: 'text.disabled', fontStyle: 'italic' })
          }}>
            {title || 'Titel der Anzeige'}
          </Typography>

          {/* Preis */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              mr: 1
            }}>
              {priceType === 'free' ? 'Zu verschenken' : 
               price ? `${price} EUR` : 'Preis'}
            </Typography>
            {priceType === 'negotiable' && (
              <Chip label="VB" size="small" color="warning" variant="outlined" />
            )}
          </Box>

          {/* Beschreibung */}
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            mb: 2,
            minHeight: 40,
            ...(description ? {} : { color: 'text.disabled', fontStyle: 'italic' })
          }}>
            {description || 'Beschreibung der Anzeige...'}
          </Typography>

          {/* Standort */}
          {(postalCode || city) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {postalCode} {city}
              </Typography>
            </Box>
          )}

          {/* Action-Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <FavoriteIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <ShareIcon />
              </IconButton>
            </Box>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
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
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Grundinformationen
            </Typography>
            
            {/* Gebot/Gesuch */}
            <Box sx={{ mb: 4 }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                Gebot / Gesuch
              </FormLabel>
              <RadioGroup
                row
                value={listingType}
                onChange={(e) => setListingType(e.target.value as 'offer' | 'request')}
              >
                <FormControlLabel
                  value="offer"
                  control={<Radio sx={{ color: 'primary.main' }} />}
                  label="Ich biete"
                  sx={{ mr: 4 }}
                />
                <FormControlLabel
                  value="request"
                  control={<Radio sx={{ color: 'primary.main' }} />}
                  label="Ich suche"
                />
              </RadioGroup>
            </Box>

            {/* Titel */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Typography sx={{ pt: 2, fontWeight: 500, fontSize: '0.875rem' }}>
                  Titel
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    sx={{ width: '100%' }}
                  />
                  {/* Neue Breadcrumb-Komponente */}
                  {breadcrumbItems.length > 0 && (
                    <Breadcrumb 
                      items={breadcrumbItems}
                      variant="create-listing"
                      showChangeLink={true}
                      onChangeClick={() => navigate('/category-selection')}
                    />
                  )}
                </Box>
                <Box sx={{ color: 'text.secondary', pt: 2 }}>
                  <Typography variant="caption">
                    <strong>Tipp:</strong> Mit einem aussagekräftigen Titel verkaufst du besser.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Preis */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Typography sx={{ pt: 2, fontWeight: 500, fontSize: '0.875rem' }}>
                  Preis
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <TextField
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required={priceType !== 'free'}
                    disabled={priceType === 'free'}
                    sx={{ width: '120px' }}
                  />
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    ,00 EUR
                  </Typography>
                  <FormControl sx={{ width: '150px' }}>
                    <Select
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value as 'fixed' | 'negotiable' | 'free')}
                    >
                      <MenuItem value="fixed">Festpreis</MenuItem>
                      <MenuItem value="negotiable">Verhandlungsbasis</MenuItem>
                      <MenuItem value="free">Zu verschenken</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box></Box>
              </Box>
            </Box>

            {/* Beschreibung */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Typography sx={{ pt: 2, fontWeight: 500, fontSize: '0.875rem' }}>
                  Beschreibung
                </Typography>
                <TextField
                  multiline
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  helperText={`${description.length}/4000 Zeichen`}
                  inputProps={{ maxLength: 4000 }}
                  sx={{ width: '100%' }}
                />
                <Box></Box>
              </Box>
            </Box>

            {/* Bilder */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
              Bilder (empfohlen)
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '10% 60% 30%', 
              gap: 2, 
              alignItems: 'flex-start' 
            }}>
              <Box></Box>
              <Box sx={{ width: '100%' }}>
                {/* Bild-Upload und Thumbnails in einer Reihe - wie kleinanzeigen.de */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  {/* Upload-Feld - immer an erster Stelle */}
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      flexShrink: 0,
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50',
                      }
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
                    <label htmlFor="image-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <PhotoCameraIcon sx={{ fontSize: 20, color: 'grey.500' }} />
                        <Typography sx={{ fontSize: 24, color: 'grey.500', lineHeight: 1 }}>+</Typography>
                      </Box>
                    </label>
                  </Box>
                  
                  {/* Thumbnails - direkt nach dem Upload-Feld */}
                  {images.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'grey.300',
                        flexShrink: 0
                      }}
                    >
                      <Box
                        component="img"
                        src={URL.createObjectURL(image)}
                        alt={`Bild ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <Box
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.9)'
                          }
                        }}
                      >
                        <img 
                          src="/src/assets/icons/delete.svg?v=2" 
                          alt="Löschen" 
                          style={{ 
                            width: '16px', 
                            height: '16px', 
                            filter: 'invert(1)',
                            transform: 'scale(1)'
                          }} 
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
                
                {images.length > 0 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    → Verschieben, um die Reihenfolge zu ändern
                  </Typography>
                )}
              </Box>
              
              {/* Tipp rechts */}
              <Box sx={{ color: 'text.secondary' }}>
                <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                  <strong>Tipp:</strong> Füge bis zu 20 Bilder (max. 12 MB) per Upload oder Drag & Drop hinzu. Für bessere Ergebnisse helfen dir unsere{' '}
                  <Button
                    component="a"
                    href="/fototipps"
                    target="_blank"
                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none', fontSize: 'inherit', color: 'primary.main' }}
                  >
                    Fototipps
                  </Button>
                  .
                </Typography>
              </Box>
            </Box>

            {/* Standort */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Standort
            </Typography>
            
            {/* PLZ und Stadt */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Typography sx={{ pt: 2, fontWeight: 500, fontSize: '0.875rem' }}>
                  PLZ
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                  <TextField
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    sx={{ width: '120px' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    sx={{ width: '200px' }}
                  />
                </Box>
                <Box></Box>
              </Box>
            </Box>

            {/* Straße */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Typography sx={{ pt: 2, fontWeight: 500, fontSize: '0.875rem' }}>
                  Straße/Nr.
                </Typography>
                <TextField
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  sx={{ width: '100%' }}
                />
                <Box sx={{ color: 'text.secondary' }}>
                  <Typography variant="caption">
                    <strong>Tipp:</strong> Standardmäßig zeigen wir nur die Postleitzahl und den Ort an. Wenn du die vollständige Adresse anzeigen lassen möchtest, setze bitte einen Haken im Kasten.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Vollständige Adresse anzeigen */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Box></Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showFullAddress}
                      onChange={(e) => setShowFullAddress(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Vollständige Adresse anzeigen"
                />
                <Box></Box>
              </Box>
            </Box>

            {/* Kontaktdaten */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Deine Angaben
            </Typography>
            
            {/* Name */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Typography sx={{ pt: 2, fontWeight: 500, fontSize: '0.875rem' }}>
                  Name
                </Typography>
                <TextField
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  sx={{ width: '200px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ color: 'text.secondary' }}>
                  <Typography variant="caption">
                    <strong>Tipp:</strong> Du kannst deinen Profilnamen jederzeit in den Einstellungen ändern.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* E-Mail */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Typography sx={{ pt: 2, fontWeight: 500, fontSize: '0.875rem' }}>
                  E-Mail
                </Typography>
                <TextField
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  type="email"
                  sx={{ width: '100%' }}
                />
                <Box></Box>
              </Box>
            </Box>

            {/* Veröffentliche deine Anzeige */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              Veröffentliche deine Anzeige
            </Typography>

            {/* Nutzungsbedingungen */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Box></Box>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Es gelten unsere Nutzungsbedingungen. Informationen zur Verarbeitung deiner Daten findest du in unserer Datenschutzerklärung.
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        color="primary"
                        required
                      />
                    }
                    label="Ich akzeptiere die Nutzungsbedingungen und Datenschutzerklärung"
                  />
                </Box>
                <Box></Box>
              </Box>
            </Box>

            {/* Marketing */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '10% 60% 30%', 
                gap: 2, 
                alignItems: 'flex-start' 
              }}>
                <Box></Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={acceptMarketing}
                      onChange={(e) => setAcceptMarketing(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Ja, zu regelmäßigen E-Mails mit Produktinfos, Tipps, Aktionen und spannenden Geschichten über uns und mobile.de - Abmelden geht jederzeit"
                />
                <Box></Box>
              </Box>
            </Box>

            {/* Submit Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ minWidth: 120 }}
              >
                Abbrechen
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                disabled={!acceptTerms || loading}
                endIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                sx={{ minWidth: 180 }}
              >
                {loading ? 'Wird veröffentlicht...' : 'Anzeige veröffentlichen'}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Rechte Spalte - Live-Vorschau */}
        <Box sx={{ position: 'sticky', top: 24 }}>
          <LivePreview />
        </Box>
      </Box>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Anzeige erfolgreich erstellt! Weiterleitung zur Detailseite...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateListing;
