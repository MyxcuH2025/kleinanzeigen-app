import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

export const ContactInfo: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const contactMethods = [
    {
      title: 'E-Mail Support',
      description: 'Schreiben Sie uns eine E-Mail und wir antworten innerhalb von 24 Stunden',
      icon: <EmailIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      details: 'support@kleinanzeigen.de',
      responseTime: '24 Stunden'
    },
    {
      title: 'Telefon Support',
      description: 'Rufen Sie uns an für dringende Anfragen und technische Probleme',
      icon: <PhoneIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      details: '+49 (0) 30 12345678',
      responseTime: 'Mo-Fr 9-18 Uhr'
    },
    {
      title: 'Live Chat',
      description: 'Chatten Sie direkt mit unserem Support-Team für schnelle Hilfe',
      icon: <SupportIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      details: 'Verfügbar in der App',
      responseTime: 'Sofort'
    }
  ];

  const officeInfo = [
    {
      title: 'Hauptsitz Berlin',
      address: 'Musterstraße 123\n10115 Berlin',
      hours: 'Mo-Fr: 9:00 - 18:00\nSa: 10:00 - 16:00',
      phone: '+49 (0) 30 12345678'
    },
    {
      title: 'Niederlassung München',
      address: 'Beispielweg 456\n80331 München',
      hours: 'Mo-Fr: 9:00 - 17:00',
      phone: '+49 (0) 89 98765432'
    }
  ];

  const features = [
    {
      title: '24/7 Sicherheit',
      description: 'Unser Sicherheitsteam überwacht die Plattform rund um die Uhr',
      icon: <SecurityIcon sx={{ color: theme.palette.success.main }} />
    },
    {
      title: 'Schnelle Antworten',
      description: 'Durchschnittliche Antwortzeit: unter 2 Stunden',
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
    },
    {
      title: 'Mehrsprachig',
      description: 'Support auf Deutsch, Englisch und Französisch',
      icon: <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ 
        fontWeight: 600, 
        color: theme.palette.primary.main,
        mb: 3,
        textAlign: 'center'
      }}>
        Kontaktinformationen
      </Typography>

      {/* Kontaktmethoden */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        {contactMethods.map((method, index) => (
          <Box key={index}>
            <Card elevation={2} sx={{ 
              height: '100%', 
              borderRadius: 3,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8]
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {method.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {method.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {method.description}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  {method.details}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {method.responseTime}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Bürostandorte */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ 
          fontWeight: 600, 
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <LocationIcon color="primary" />
          Unsere Standorte
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
          {officeInfo.map((office, index) => (
            <Box key={index}>
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" component="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {office.title}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                  {office.address}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                  {office.hours}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {office.phone}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Features */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ 
          fontWeight: 600, 
          mb: 3,
          textAlign: 'center'
        }}>
          Warum unser Support?
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          {features.map((feature, index) => (
            <Box key={index}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.grey[50]
              }}>
                {feature.icon}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};
