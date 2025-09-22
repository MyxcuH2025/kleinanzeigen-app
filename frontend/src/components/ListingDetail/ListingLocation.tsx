import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Share as ShareIcon,
  Directions as DirectionsIcon,
  Schedule as ScheduleIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

interface LocationInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  availableHours?: string;
}

interface ListingLocationProps {
  location: LocationInfo;
  contact: ContactInfo;
  sellerName?: string;
  onCall?: () => void;
  onEmail?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  onDirections?: () => void;
}

const ListingLocation: React.FC<ListingLocationProps> = ({
  location,
  contact,
  sellerName,
  onCall,
  onEmail,
  onMessage,
  onShare,
  onDirections
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleCall = () => {
    if (contact.phone) {
      window.open(`tel:${contact.phone}`);
      onCall?.();
    }
  };

  const handleEmail = () => {
    if (contact.email) {
      window.open(`mailto:${contact.email}`);
      onEmail?.();
    }
  };

  const handleDirections = () => {
    if (location.coordinates) {
      const { lat, lng } = location.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`);
    } else {
      const address = `${location.address}, ${location.postalCode} ${location.city}`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
    }
    onDirections?.();
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: '1px solid #f0f0f0', 
        borderRadius: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Standort & Kontakt
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Teilen">
            <IconButton onClick={onShare} size="small">
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 2 }}>
        {/* Location Info */}
        <Box>
          <Card sx={{ height: '100%', border: '1px solid #f0f0f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ mr: 1, color: '#dcf8c6' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Standort
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                {location.address}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {location.postalCode} {location.city}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {location.country}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<DirectionsIcon />}
                  onClick={handleDirections}
                  size="small"
                  sx={{
                    borderColor: '#dcf8c6',
                    color: '#dcf8c6',
                    '&:hover': {
                      borderColor: '#c8e6c9',
                      bgcolor: 'rgba(220, 248, 198, 0.1)'
                    }
                  }}
                >
                  Route
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Contact Info */}
        <Box>
          <Card sx={{ height: '100%', border: '1px solid #f0f8c6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MessageIcon sx={{ mr: 1, color: '#dcf8c6' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Kontakt
                </Typography>
                <VerifiedIcon sx={{ ml: 1, color: '#dcf8c6', fontSize: '1rem' }} />
              </Box>

              {sellerName && (
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                  Verkäufer: {sellerName}
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {contact.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon sx={{ color: '#dcf8c6' }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {contact.phone}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleCall}
                      size="small"
                      sx={{
                        bgcolor: '#dcf8c6',
                        color: '#1a1a1a',
                        '&:hover': { bgcolor: '#c8e6c9' }
                      }}
                    >
                      Anrufen
                    </Button>
                  </Box>
                )}

                {contact.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon sx={{ color: '#dcf8c6' }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {contact.email}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={handleEmail}
                      size="small"
                      sx={{
                        borderColor: '#dcf8c6',
                        color: '#dcf8c6',
                        '&:hover': {
                          borderColor: '#c8e6c9',
                          bgcolor: 'rgba(220, 248, 198, 0.1)'
                        }
                      }}
                    >
                      E-Mail
                    </Button>
                  </Box>
                )}

                <Button
                  variant="contained"
                  startIcon={<MessageIcon />}
                  onClick={onMessage}
                  fullWidth
                  sx={{
                    bgcolor: '#dcf8c6',
                    color: '#1a1a1a',
                    '&:hover': { bgcolor: '#c8e6c9' },
                    mt: 1
                  }}
                >
                  Nachricht senden
                </Button>
              </Box>

              {contact.availableHours && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(220, 248, 198, 0.1)', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1, color: '#dcf8c6', fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Verfügbarkeit
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {contact.availableHours}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Additional Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(220, 248, 198, 0.05)', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          💡 Tipp: Kontaktiere den Verkäufer für Fragen oder Terminvereinbarungen
        </Typography>
      </Box>
    </Paper>
  );
};

export default ListingLocation;
