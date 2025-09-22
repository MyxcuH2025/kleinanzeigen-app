import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Chip,
  Rating,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Business,
  Star,
  Verified,
  ArrowBack,
  Message,
  Share,
  Work
} from '@mui/icons-material';
import CustomIcon from '../components/CustomIcon';

interface Provider {
  id: number;
  name: string;
  company: string;
  description: string;
  serviceType: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  experience: number;
  verified: boolean;
  available: boolean;
}

// Mock-Daten (sollte später durch echten Service ersetzt werden)
const mockProviders: Provider[] = [
  {
    id: 1,
    name: "Max Mustermann",
    company: "Handwerker-Service GmbH",
    description: "Professionelle Handwerkerdienstleistungen für Haus und Garten. Über 10 Jahre Erfahrung.",
    serviceType: "Handwerk",
    location: "Berlin",
    phone: "+49 30 12345678",
    email: "max@handwerker-service.de",
    rating: 4.8,
    reviewCount: 127,
    experience: 10,
    verified: true,
    available: true
  },
  {
    id: 2,
    name: "Anna Schmidt",
    company: "Design Studio Berlin",
    description: "Kreative Grafikdesign- und Webentwicklungsdienstleistungen. Moderne und innovative Lösungen.",
    serviceType: "Design",
    location: "Berlin",
    phone: "+49 30 87654321",
    email: "anna@design-studio.de",
    rating: 4.9,
    reviewCount: 89,
    experience: 7,
    verified: true,
    available: true
  },
  {
    id: 3,
    name: "Thomas Weber",
    company: "IT-Support Pro",
    description: "Schneller und zuverlässiger IT-Support für Unternehmen. 24/7 Verfügbarkeit.",
    serviceType: "IT-Support",
    location: "München",
    phone: "+49 89 11223344",
    email: "thomas@it-support-pro.de",
    rating: 4.7,
    reviewCount: 203,
    experience: 12,
    verified: true,
    available: false
  },
  {
    id: 4,
    name: "Lisa Müller",
    company: "Fitness & Wellness",
    description: "Personaltraining und Wellness-Massagen. Individuelle Betreuung für Ihre Gesundheit.",
    serviceType: "Fitness",
    location: "Hamburg",
    phone: "+49 40 55667788",
    email: "lisa@fitness-wellness.de",
    rating: 4.6,
    reviewCount: 156,
    experience: 8,
    verified: true,
    available: true
  },
  {
    id: 5,
    name: "Michael Bauer",
    company: "Bauberatung & Planung",
    description: "Architektur und Bauplanung. Von der ersten Idee bis zur Umsetzung.",
    serviceType: "Architektur",
    location: "Köln",
    phone: "+49 221 99887766",
    email: "michael@bauberatung.de",
    rating: 4.9,
    reviewCount: 94,
    experience: 15,
    verified: true,
    available: true
  }
];

const ProviderProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProvider(parseInt(id));
    }
  }, [id]);

  const loadProvider = async (providerId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock-Daten verwenden (sollte später durch echten Service ersetzt werden)
      const foundProvider = mockProviders.find(p => p.id === providerId);
      
      if (foundProvider) {
        setProvider(foundProvider);
      } else {
        setError('Dienstleister nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden des Dienstleisters:', error);
      setError('Fehler beim Laden des Dienstleisters');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContact = () => {
    if (provider?.email) {
      window.location.href = `mailto:${provider.email}`;
    }
  };

  const handleCall = () => {
    if (provider?.phone) {
      window.location.href = `tel:${provider.phone}`;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !provider) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Dienstleister nicht gefunden'}
        </Alert>
        <Button startIcon={<CustomIcon iconName="back" sx={{ fontSize: 20 }} />} onClick={handleBack}>
          Zurück
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<CustomIcon iconName="back" sx={{ fontSize: 20 }} />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Zurück
        </Button>
        
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'auto 1fr' }, gap: 2, alignItems: 'start' }}>
            <Box display="flex" justifyContent="center">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid #f3f4f6',
                  bgcolor: '#6b7280'
                }}
              >
                <Business sx={{ fontSize: 60 }} />
              </Avatar>
            </Box>
            
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                  {provider.name}
                </Typography>
                {provider.verified && (
                  <Tooltip title="Verifizierter Dienstleister">
                    <Verified sx={{ color: '#10b981', fontSize: 28 }} />
                  </Tooltip>
                )}
                {provider.available ? (
                  <Chip
                    label="Verfügbar"
                    size="small"
                    sx={{
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      fontWeight: 600
                    }}
                  />
                ) : (
                  <Chip
                    label="Nicht verfügbar"
                    size="small"
                    sx={{
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {provider.company}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {provider.serviceType} • {provider.location}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Rating value={provider.rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {provider.rating} ({provider.reviewCount} Bewertungen)
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {provider.description}
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<CustomIcon iconName="chat" sx={{ fontSize: 20 }} />}
                  onClick={handleContact}
                  disabled={!provider.available}
                  sx={{
                    backgroundColor: '#374151',
                    '&:hover': { backgroundColor: '#1f2937' }
                  }}
                >
                  Kontaktieren
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CustomIcon iconName="phone" sx={{ fontSize: 20 }} />}
                  onClick={handleCall}
                  disabled={!provider.available}
                >
                  Anrufen
                </Button>
                
                <IconButton>
                  <Share />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Details */}
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Dienstleister-Informationen
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <LocationOn color="action" />
              <Typography variant="body2" color="text.secondary">
                {provider.location}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CustomIcon iconName="briefcase" sx={{ fontSize: 20, color: '#6b7280' }} />
              <Typography variant="body2" color="text.secondary">
                {provider.experience} Jahre Erfahrung
              </Typography>
            </Box>
            
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label={provider.serviceType} size="small" />
              <Chip label="Dienstleister" size="small" />
            </Box>
          </Paper>
        </Box>
        
        <Box>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Statistiken
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Star color="action" />
              <Typography variant="body2">
                {provider.rating} von 5 Sternen
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" mb={1}>
              {provider.reviewCount} Bewertungen
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={1}>
              {provider.experience} Jahre Erfahrung
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              Status: {provider.available ? 'Verfügbar' : 'Nicht verfügbar'}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default ProviderProfilePage;
