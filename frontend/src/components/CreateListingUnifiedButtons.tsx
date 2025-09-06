import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useTheme
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import CreateListingOptimized from './CreateListingOptimized';
import CreateKleinanzeigenListingOptimized from './CreateKleinanzeigenListingOptimized';

const CreateListingUnifiedButtons: React.FC = () => {
  const theme = useTheme();
  const [selectedForm, setSelectedForm] = useState<'auto' | 'kleinanzeigen' | null>(null);

  const handleAutoClick = () => {
    setSelectedForm('auto');
  };

  const handleKleinanzeigenClick = () => {
    setSelectedForm('kleinanzeigen');
  };

  const handleBackClick = () => {
    setSelectedForm(null);
  };

  if (selectedForm === 'auto') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={handleBackClick}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Zurück zur Auswahl
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Auto verkaufen
          </Typography>
        </Box>
        <CreateListingOptimized />
      </Container>
    );
  }

  if (selectedForm === 'kleinanzeigen') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={handleBackClick}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Zurück zur Auswahl
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Kleinanzeige erstellen
          </Typography>
        </Box>
        <CreateKleinanzeigenListingOptimized />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
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
          Wähle die Kategorie für deine Anzeige
        </Typography>
      </Box>

      {/* Button Selection */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderColor: '#1a1a1a'
            }
          }}
          onClick={handleAutoClick}
        >
          <CarIcon
            sx={{
              fontSize: 64,
              color: '#1a1a1a',
              mb: 2
            }}
          />
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Auto verkaufen
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Erstelle eine detaillierte Anzeige für dein Fahrzeug mit allen wichtigen Informationen
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#1a1a1a',
              '&:hover': {
                backgroundColor: '#000000'
              }
            }}
          >
            Auto anzeigen
          </Button>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderColor: '#1a1a1a'
            }
          }}
          onClick={handleKleinanzeigenClick}
        >
          <StoreIcon
            sx={{
              fontSize: 64,
              color: '#1a1a1a',
              mb: 2
            }}
          />
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Kleinanzeige erstellen
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Verkaufe Artikel, Dienstleistungen oder finde das was du suchst
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#1a1a1a',
              '&:hover': {
                backgroundColor: '#000000'
              }
            }}
          >
            Kleinanzeige erstellen
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateListingUnifiedButtons; 