import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  ContactSupport as ContactSupportIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  AccountCircle as AccountIcon,
  ShoppingCart as ShoppingIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Book as BookIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HilfePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleAccordionChange = useCallback((panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  }, []);

  // Event-Handler mit useCallback optimieren
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const faqData = [
    {
      id: 'panel1',
      title: 'Wie erstelle ich eine Anzeige?',
      content: 'Um eine Anzeige zu erstellen, klicken Sie auf den "Anzeige erstellen" Button in der oberen Navigation. Wählen Sie die passende Kategorie und füllen Sie alle erforderlichen Felder aus. Laden Sie Bilder hoch und klicken Sie auf "Vorschau" um Ihre Anzeige zu überprüfen, bevor Sie sie veröffentlichen.',
      tags: ['Anzeige', 'Erstellen', 'Bilder']
    },
    {
      id: 'panel2',
      title: 'Wie kann ich mit einem Verkäufer in Kontakt treten?',
      content: 'Sie können den Verkäufer über verschiedene Wege kontaktieren: Über die "Nachricht senden" Funktion, per E-Mail oder telefonisch (falls angegeben). Alle Kontaktmöglichkeiten finden Sie auf der Anzeigenseite.',
      tags: ['Kontakt', 'Verkäufer', 'Nachricht']
    },
    {
      id: 'panel3',
      title: 'Was passiert bei Problemen mit einer Transaktion?',
      content: 'Bei Problemen mit einer Transaktion können Sie sich an unseren Support wenden. Wir vermitteln zwischen Käufer und Verkäufer und helfen bei der Lösung von Streitigkeiten. Dokumentieren Sie alle Kommunikation und Transaktionen.',
      tags: ['Probleme', 'Transaktion', 'Support']
    },
    {
      id: 'panel4',
      title: 'Wie funktioniert das Bewertungssystem?',
      content: 'Nach einer abgeschlossenen Transaktion können Sie den Verkäufer/Käufer bewerten. Bewertungen basieren auf Kommunikation, Artikelbeschreibung, Versand und Gesamtzufriedenheit. Faire Bewertungen helfen der Community.',
      tags: ['Bewertung', 'Transaktion', 'Community']
    },
    {
      id: 'panel5',
      title: 'Wie kann ich meine Anzeige bearbeiten oder löschen?',
      content: 'Gehen Sie zu Ihrem Dashboard und wählen Sie "Meine Anzeigen". Dort können Sie bestehende Anzeigen bearbeiten oder löschen. Bearbeitungen werden sofort angezeigt, Löschungen sind endgültig.',
      tags: ['Bearbeiten', 'Löschen', 'Dashboard']
    },
    {
      id: 'panel6',
      title: 'Welche Zahlungsmethoden werden akzeptiert?',
      content: 'Wir empfehlen sichere Zahlungsmethoden wie Überweisung, PayPal oder Barzahlung bei Abholung. Vermeiden Sie Vorkasse bei unbekannten Verkäufern. Nutzen Sie unsere sicheren Zahlungsoptionen.',
      tags: ['Zahlung', 'Sicherheit', 'PayPal']
    }
  ];

  const helpCategories = [
    {
      title: 'Erste Schritte',
      icon: <HelpIcon />,
      description: 'Grundlegende Informationen für neue Benutzer',
      items: [
        'Registrierung & Anmeldung',
        'Profil einrichten',
        'Erste Anzeige erstellen',
        'Navigation verstehen'
      ]
    },
    {
      title: 'Anzeigen verwalten',
      icon: <ShoppingIcon />,
      description: 'Alles rund um das Erstellen und Verwalten von Anzeigen',
      items: [
        'Anzeige erstellen',
        'Bilder hochladen',
        'Anzeige bearbeiten',
        'Anzeige löschen'
      ]
    },
    {
      title: 'Sicherheit & Vertrauen',
      icon: <SecurityIcon />,
      description: 'Wie Sie sicher handeln und betrogen werden',
      items: [
        'Sichere Kommunikation',
        'Betrug erkennen',
        'Verifizierte Verkäufer',
        'Melden von Problemen'
      ]
    },
    {
      title: 'Zahlung & Versand',
      icon: <PaymentIcon />,
      description: 'Informationen zu Zahlungsmethoden und Versand',
      items: [
        'Zahlungsmethoden',
        'Versandoptionen',
        'Versicherung',
        'Rückgabe & Umtausch'
      ]
    },
    {
      title: 'Konto & Profil',
      icon: <AccountIcon />,
      description: 'Verwalten Sie Ihr Konto und Profil',
      items: [
        'Profil bearbeiten',
        'Einstellungen',
        'Privatsphäre',
        'Konto löschen'
      ]
    },
    {
      title: 'Community & Support',
      icon: <ContactSupportIcon />,
      description: 'Hilfe von der Community und unserem Support',
      items: [
        'FAQ durchsuchen',
        'Community Forum',
        'Support kontaktieren',
        'Feedback geben'
      ]
    }
  ];

  const contactMethods = [
    {
      title: 'Live-Chat',
      icon: <ChatIcon />,
      description: 'Sofortige Hilfe von unserem Support-Team',
      action: () => navigate('/support/live-chat'),
      buttonText: 'Chat starten',
      color: 'primary'
    },
    {
      title: 'E-Mail Support',
      icon: <EmailIcon />,
      description: 'Detaillierte Anfragen per E-Mail',
      action: () => navigate('/support/email'),
      buttonText: 'E-Mail senden',
      color: 'secondary'
    },
    {
      title: 'Telefon Support',
      icon: <PhoneIcon />,
      description: 'Persönliche Beratung am Telefon',
      action: () => navigate('/support/telefon'),
      buttonText: 'Anrufen',
      color: 'success'
    }
  ];

  const additionalResources = [
    {
      title: 'Benutzerhandbuch',
      icon: <ArticleIcon />,
      description: 'Detaillierte Anleitungen für alle Funktionen',
      action: () => navigate('/hilfe/benutzerhandbuch'),
      buttonText: 'Herunterladen'
    },
    {
      title: 'Video-Tutorials',
      icon: <VideoIcon />,
      description: 'Schritt-für-Schritt Anleitungen in Videoform',
      action: () => navigate('/hilfe/video-tutorials'),
      buttonText: 'Ansehen'
    },
    {
      title: 'Community Forum',
      icon: <BookIcon />,
      description: 'Tauschen Sie sich mit anderen Benutzern aus',
      action: () => navigate('/hilfe/community-forum'),
      buttonText: 'Beitreten'
    },
    {
      title: 'Support-Ticket',
      icon: <ContactSupportIcon />,
      description: 'Erstellen Sie ein Support-Ticket für komplexe Probleme',
      action: () => navigate('/support/ticket'),
      buttonText: 'Erstellen'
    }
  ];



  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', py: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant={isMobile ? 'h4' : 'h3'} 
            component="h1" 
            sx={{ 
              mb: { xs: 1, md: 2 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Hilfe & Support
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Finden Sie schnell Antworten auf Ihre Fragen oder kontaktieren Sie unseren Support
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <TextField
            fullWidth
            placeholder="Suchen Sie nach Hilfe..."
            value={searchTerm}
                              onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#ffffff',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea'
                  }
                }
              }
            }}
          />
        </Box>

        {/* Help Categories */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: { xs: 2, md: 3 },
          mb: { xs: 3, md: 4 }
        }}>
          {helpCategories.map((category, index) => (
            <Card 
              key={index} 
              sx={{ 
                borderRadius: 2,
                border: '1px solid #e1e8ed',
                '&:hover': {
                  boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: '#667eea'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ 
                    color: '#667eea', 
                    mr: 1.5,
                    '& .MuiSvgIcon-root': { fontSize: isMobile ? '1.5rem' : '1.75rem' }
                  }}>
                    {category.icon}
                  </Box>
                  <Typography 
                    variant={isMobile ? 'h6' : 'h6'} 
                    sx={{ fontWeight: 600, color: '#2c3e50' }}
                  >
                    {category.title}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2, lineHeight: 1.5 }}
                >
                  {category.description}
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {category.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Box sx={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          bgcolor: '#667eea' 
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          sx: { fontSize: '0.875rem' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* FAQ Section */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            component="h2" 
            sx={{ 
              mb: { xs: 2, md: 3 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Häufig gestellte Fragen
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {faqData.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expanded === faq.id}
                onChange={handleAccordionChange(faq.id)}
                sx={{
                  borderRadius: 2,
                  border: '1px solid #e1e8ed',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    borderColor: '#667eea'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      my: { xs: 1, md: 1.5 }
                    }
                  }}
                >
                  <Typography 
                    variant={isMobile ? 'body1' : 'h6'} 
                    sx={{ fontWeight: 500, color: '#2c3e50' }}
                  >
                    {faq.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: { xs: 1.5, md: 2 } }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, lineHeight: 1.6 }}
                  >
                    {faq.content}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {faq.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: '#f8f9fa',
                          color: '#667eea',
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Contact Section */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            component="h2" 
            sx={{ 
              mb: { xs: 2, md: 3 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Direkter Kontakt
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {contactMethods.map((method, index) => (
              <Card 
                key={index} 
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid #e1e8ed',
                  '&:hover': {
                    boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#667eea'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.5 }, textAlign: 'center' }}>
                  <Box sx={{ 
                    color: '#667eea', 
                    mb: 1.5,
                    '& .MuiSvgIcon-root': { fontSize: isMobile ? '2rem' : '2.5rem' }
                  }}>
                    {method.icon}
                  </Box>
                  <Typography 
                    variant={isMobile ? 'h6' : 'h6'} 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600, 
                      color: '#2c3e50' 
                    }}
                  >
                    {method.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2 }}
                  >
                    {method.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={method.action}
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': {
                        bgcolor: '#667eea',
                        color: 'white'
                      }
                    }}
                  >
                    {method.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Additional Resources */}
        <Box>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            component="h2" 
            sx={{ 
              mb: { xs: 2, md: 3 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Weitere Ressourcen
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {additionalResources.map((resource, index) => (
              <Card 
                key={index} 
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid #e1e8ed',
                  '&:hover': {
                    boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#667eea'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.5 }, textAlign: 'center' }}>
                  <Box sx={{ 
                    color: '#667eea', 
                    mb: 1.5,
                    '& .MuiSvgIcon-root': { fontSize: isMobile ? '1.75rem' : '2rem' }
                  }}>
                    {resource.icon}
                  </Box>
                  <Typography 
                    variant={isMobile ? 'body1' : 'h6'} 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600, 
                      color: '#2c3e50' 
                    }}
                  >
                    {resource.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, fontSize: '0.875rem' }}
                  >
                    {resource.description}
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={resource.action}
                    sx={{
                      color: '#667eea',
                      '&:hover': {
                        bgcolor: 'rgba(102, 126, 234, 0.1)'
                      }
                    }}
                  >
                    {resource.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HilfePage;
