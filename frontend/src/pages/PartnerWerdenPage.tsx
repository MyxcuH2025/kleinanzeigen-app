import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Business as BusinessIcon,
  Handshake as HandshakeIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface PartnershipOption {
  id: string;
  name: string;
  description: string;
  commission: string;
  investment: string;
  benefits: string[];
  requirements: string[];
  popular?: boolean;
}

interface SuccessStory {
  id: string;
  company: string;
  industry: string;
  description: string;
  results: string;
  testimonial: string;
  logo?: string;
}

const PartnerWerdenPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    message: '',
    agreeTerms: false
  });
  const [activeStep, setActiveStep] = useState(0);


  const partnershipOptions: PartnershipOption[] = [
    {
      id: '1',
      name: 'Basis-Partnerschaft',
      description: 'Ideal für kleine Unternehmen und Start-ups, die in die Online-Vermarktung einsteigen möchten.',
      commission: '15%',
      investment: 'Ab 500€',
      benefits: [
        'Eigene Verkäufer-Seite',
        'Basis-Statistiken',
        'E-Mail-Support',
        'Standard-Marketing-Material'
      ],
      requirements: [
        'Gewerblicher Verkäufer',
        'Mindestumsatz 5.000€/Jahr',
        'Qualitätsstandards einhalten'
      ]
    },
    {
      id: '2',
      name: 'Premium-Partnerschaft',
      description: 'Für etablierte Unternehmen, die eine umfassende Online-Präsenz aufbauen möchten.',
      commission: '12%',
      investment: 'Ab 1.500€',
      benefits: [
        'Alle Basis-Features',
        'Erweiterte Statistiken',
        'Prioritäts-Support',
        'Individuelles Marketing',
        'Bevorzugte Platzierung'
      ],
      requirements: [
        'Gewerblicher Verkäufer',
        'Mindestumsatz 25.000€/Jahr',
        'Qualitätsstandards einhalten',
        'Regelmäßige Aktivität'
      ],
      popular: true
    },
    {
      id: '3',
      name: 'Enterprise-Partnerschaft',
      description: 'Für große Unternehmen und Konzerne, die eine strategische Partnerschaft eingehen möchten.',
      commission: '10%',
      investment: 'Ab 5.000€',
      benefits: [
        'Alle Premium-Features',
        'Dedizierter Account Manager',
        'API-Zugang',
        'White-Label-Lösungen',
        'Individuelle Verträge'
      ],
      requirements: [
        'Gewerblicher Verkäufer',
        'Mindestumsatz 100.000€/Jahr',
        'Langfristige Partnerschaft',
        'Qualitätsstandards einhalten'
      ]
    }
  ];

  const successStories: SuccessStory[] = [
    {
      id: '1',
      company: 'AutoMax GmbH',
      industry: 'Automobil',
      description: 'AutoMax hat durch die Partnerschaft ihren Online-Umsatz um 300% gesteigert.',
      results: '300% Umsatzsteigerung, 500+ neue Kunden',
      testimonial: 'Die Partnerschaft hat unser Geschäft komplett verändert. Wir erreichen jetzt Kunden in ganz Deutschland.'
    },
    {
      id: '2',
      company: 'TechStore',
      industry: 'Elektronik',
      description: 'TechStore konnte durch die Plattform ihre Reichweite erheblich erweitern.',
      results: '200% Reichweitensteigerung, 300+ neue Kunden',
      testimonial: 'Die Plattform hat uns geholfen, unser Geschäft zu digitalisieren und neue Märkte zu erschließen.'
    },
    {
      id: '3',
      company: 'Fashion Boutique',
      industry: 'Mode',
      description: 'Die Mode-Boutique hat ihren Umsatz durch die Online-Präsenz verdoppelt.',
      results: '100% Umsatzsteigerung, 200+ neue Kunden',
      testimonial: 'Dank der Partnerschaft können wir unsere Kollektionen einem viel größeren Publikum präsentieren.'
    }
  ];

  const steps = [
    'Kontakt aufnehmen',
    'Anforderungen besprechen',
    'Partnerschaft vereinbaren',
    'Integration starten'
  ];



  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Hier würde die Formular-Verarbeitung implementiert
    console.log('Formular gesendet:', formData);
  }, [formData]);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);



  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', py: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl">
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
            Partner werden
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Werden Sie Teil unseres Erfolgs und profitieren Sie von einer starken Partnerschaft
          </Typography>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 3, md: 4 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Warum Partner werden?
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {[
              {
                icon: <TrendingIcon sx={{ fontSize: '2rem', color: '#667eea' }} />,
                title: 'Umsatzsteigerung',
                description: 'Erreichen Sie neue Kunden und steigern Sie Ihren Umsatz durch unsere Plattform.'
              },
              {
                icon: <BusinessIcon sx={{ fontSize: '2rem', color: '#667eea' }} />,
                title: 'Reichweite erweitern',
                description: 'Präsentieren Sie Ihre Produkte einem breiten Publikum in ganz Deutschland.'
              },
              {
                icon: <HandshakeIcon sx={{ fontSize: '2rem', color: '#667eea' }} />,
                title: 'Professioneller Support',
                description: 'Profitieren Sie von unserem erfahrenen Team und umfassenden Support.'
              }
            ].map((benefit, index) => (
              <Card key={index} sx={{ borderRadius: 2, textAlign: 'center' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ mb: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      color: '#2c3e50'
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Partnership Options */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 3, md: 4 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Partnerschaftsoptionen
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {partnershipOptions.map((option) => (
              <Card 
                key={option.id} 
                sx={{ 
                  borderRadius: 2,
                  border: option.popular ? '2px solid #667eea' : '1px solid #e1e8ed',
                  position: 'relative'
                }}
              >
                {option.popular && (
                  <Chip
                    label="Beliebt"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: '#667eea',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      color: '#2c3e50'
                    }}
                  >
                    {option.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2 }}
                  >
                    {option.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                      Kommission: {option.commission}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                      Investition: {option.investment}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Vorteile:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {option.benefits.map((benefit, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <CheckIcon sx={{ fontSize: '1rem', color: '#28a745', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {benefit}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Anforderungen:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {option.requirements.map((requirement, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <CheckIcon sx={{ fontSize: '1rem', color: '#667eea', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {requirement}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Process Steps */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 3, md: 4 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            So einfach wird es
          </Typography>
          <Stepper 
            activeStep={activeStep} 
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                {isMobile && (
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Schritt {index + 1}: {label}
                    </Typography>
                  </StepContent>
                )}
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Success Stories */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 3, md: 4 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Erfolgsgeschichten
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {successStories.map((story) => (
              <Card key={story.id} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      color: '#2c3e50'
                    }}
                  >
                    {story.company}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="primary" 
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    {story.industry}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2 }}
                  >
                    {story.description}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600,
                      color: '#28a745'
                    }}
                  >
                    {story.results}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ fontStyle: 'italic' }}
                  >
                    "{story.testimonial}"
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Contact Form */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 3, md: 4 },
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            Kontaktieren Sie uns
          </Typography>
          <Card sx={{ maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mb: 2
                }}>
                  <TextField
                    fullWidth
                    label="Firmenname"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Ansprechpartner"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    required
                    size="small"
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mb: 2
                }}>
                  <TextField
                    fullWidth
                    label="E-Mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    size="small"
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Branche"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  required
                  size="small"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Ihre Nachricht"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Erzählen Sie uns von Ihrem Unternehmen und Ihren Zielen..."
                  size="small"
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeTerms}
                      onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                      required
                    />
                  }
                  label="Ich stimme den Datenschutzbestimmungen zu"
                  sx={{ mb: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: '#667eea',
                    '&:hover': { bgcolor: '#5a6fd8' }
                  }}
                >
                  Anfrage senden
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default PartnerWerdenPage;
