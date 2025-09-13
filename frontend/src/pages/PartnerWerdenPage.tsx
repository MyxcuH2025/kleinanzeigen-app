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

  }, [formData]);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);



  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.6) 100%)',
        backdropFilter: 'blur(20px)',
        zIndex: 0
      }
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 }, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5 } }}>
          <Typography 
            variant={isMobile ? 'h4' : 'h3'} 
            component="h1" 
            sx={{ 
              mb: { xs: 2, md: 3 },
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Partner werden
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              color: '#64748b'
            }}
          >
            Werden Sie Teil unseres Erfolgs und profitieren Sie von einer starken Partnerschaft
          </Typography>
        </Box>

        {/* Benefits Section - Premium Glasmorphism */}
        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 4, md: 5 },
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em'
            }}
          >
            Warum Partner werden?
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 }
          }}>
            {[
              {
                icon: <TrendingIcon sx={{ fontSize: '2.5rem', color: '#059669' }} />,
                title: 'Umsatzsteigerung',
                description: 'Erreichen Sie neue Kunden und steigern Sie Ihren Umsatz durch unsere Plattform.'
              },
              {
                icon: <BusinessIcon sx={{ fontSize: '2.5rem', color: '#059669' }} />,
                title: 'Reichweite erweitern',
                description: 'Präsentieren Sie Ihre Produkte einem breiten Publikum in ganz Deutschland.'
              },
              {
                icon: <HandshakeIcon sx={{ fontSize: '2.5rem', color: '#059669' }} />,
                title: 'Professioneller Support',
                description: 'Profitieren Sie von unserem erfahrenen Team und umfassenden Support.'
              }
            ].map((benefit, index) => (
              <Card 
                key={index} 
                sx={{ 
                  borderRadius: 1,
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 4px 20px rgba(0,0,0,0.08),
                    0 1px 3px rgba(0,0,0,0.1),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                    zIndex: 1
                  },
                  '&:hover': {
                    transform: 'none',
                    boxShadow: `
                      0 20px 40px rgba(0,0,0,0.12),
                      0 8px 16px rgba(0,0,0,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `,
                    borderColor: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.85)'
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ 
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    border: '1px solid rgba(5, 150, 105, 0.2)',
                    boxShadow: `
                      0 4px 12px rgba(5, 150, 105, 0.1),
                      inset 0 1px 0 rgba(255,255,255,0.6)
                    `,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'none',
                      boxShadow: `
                        0 8px 20px rgba(5, 150, 105, 0.2),
                        inset 0 1px 0 rgba(255,255,255,0.8)
                      `
                    }
                  }}>
                    {benefit.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                      color: '#0f172a',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.6,
                      color: '#64748b',
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Partnership Options - Premium Glasmorphism */}
        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 4, md: 5 },
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em'
            }}
          >
            Partnerschaftsoptionen
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 }
          }}>
            {partnershipOptions.map((option) => (
              <Card 
                key={option.id} 
                sx={{ 
                  borderRadius: 1,
                  border: option.popular 
                    ? '2px solid rgba(5, 150, 105, 0.3)' 
                    : '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: option.popular
                    ? `
                        0 8px 32px rgba(5, 150, 105, 0.15),
                        0 4px 16px rgba(5, 150, 105, 0.1),
                        inset 0 1px 0 rgba(255,255,255,0.6)
                      `
                    : `
                        0 4px 20px rgba(0,0,0,0.08),
                        0 1px 3px rgba(0,0,0,0.1),
                        inset 0 1px 0 rgba(255,255,255,0.6)
                      `,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                    zIndex: 1
                  },
                  '&:hover': {
                    transform: 'none',
                    boxShadow: option.popular
                      ? `
                          0 20px 40px rgba(5, 150, 105, 0.2),
                          0 8px 16px rgba(5, 150, 105, 0.15),
                          inset 0 1px 0 rgba(255,255,255,0.8)
                        `
                      : `
                          0 20px 40px rgba(0,0,0,0.12),
                          0 8px 16px rgba(0,0,0,0.08),
                          inset 0 1px 0 rgba(255,255,255,0.8)
                        `,
                    borderColor: option.popular 
                      ? 'rgba(5, 150, 105, 0.5)' 
                      : 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.85)'
                  }
                }}
              >
                {option.popular && (
                  <Chip
                    label="Beliebt"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 0.5,
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: `
                        0 4px 12px rgba(5, 150, 105, 0.3),
                        inset 0 1px 0 rgba(255,255,255,0.2)
                      `,
                      zIndex: 2
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

        {/* Success Stories - Premium Glasmorphism */}
        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 4, md: 5 },
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em'
            }}
          >
            Erfolgsgeschichten
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 }
          }}>
            {successStories.map((story) => (
              <Card 
                key={story.id} 
                sx={{ 
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 4px 20px rgba(0,0,0,0.08),
                    0 1px 3px rgba(0,0,0,0.1),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                    zIndex: 1
                  },
                  '&:hover': {
                    transform: 'none',
                    boxShadow: `
                      0 20px 40px rgba(0,0,0,0.12),
                      0 8px 16px rgba(0,0,0,0.08),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `,
                    borderColor: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.85)'
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                      color: '#0f172a',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {story.company}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600,
                      color: '#059669',
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    {story.industry}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      lineHeight: 1.6,
                      color: '#64748b',
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    {story.description}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 700,
                      color: '#059669',
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    {story.results}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: '#64748b',
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    "{story.testimonial}"
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Contact Form - Premium Glasmorphism */}
        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            sx={{ 
              textAlign: 'center', 
              mb: { xs: 4, md: 5 },
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em'
            }}
          >
            Kontaktieren Sie uns
          </Typography>
          <Card sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            borderRadius: 1,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.08),
              0 2px 8px rgba(0,0,0,0.05),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              zIndex: 1
            }
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                  mb: 3
                }}>
                  <TextField
                    fullWidth
                    label="Firmenname"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 1,
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: `
                          0 4px 12px rgba(0,0,0,0.05),
                          inset 0 1px 0 rgba(255,255,255,0.6)
                        `,
                        transition: 'all 0.2s ease',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)',
                          boxShadow: `
                            0 6px 16px rgba(0,0,0,0.08),
                            inset 0 1px 0 rgba(255,255,255,0.8)
                          `
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(55, 65, 81, 0.6)',
                          borderWidth: 2,
                          boxShadow: `
                            0 8px 20px rgba(0,0,0,0.1),
                            inset 0 1px 0 rgba(255,255,255,0.8)
                          `
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748b',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#374151',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Ansprechpartner"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    required
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 1,
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: `
                          0 4px 12px rgba(0,0,0,0.05),
                          inset 0 1px 0 rgba(255,255,255,0.6)
                        `,
                        transition: 'all 0.2s ease',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)',
                          boxShadow: `
                            0 6px 16px rgba(0,0,0,0.08),
                            inset 0 1px 0 rgba(255,255,255,0.8)
                          `
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(55, 65, 81, 0.6)',
                          borderWidth: 2,
                          boxShadow: `
                            0 8px 20px rgba(0,0,0,0.1),
                            inset 0 1px 0 rgba(255,255,255,0.8)
                          `
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748b',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#374151',
                        },
                      },
                    }}
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                  mb: 3
                }}>
                  <TextField
                    fullWidth
                    label="E-Mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 1,
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: `
                          0 4px 12px rgba(0,0,0,0.05),
                          inset 0 1px 0 rgba(255,255,255,0.6)
                        `,
                        transition: 'all 0.2s ease',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)',
                          boxShadow: `
                            0 6px 16px rgba(0,0,0,0.08),
                            inset 0 1px 0 rgba(255,255,255,0.8)
                          `
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(55, 65, 81, 0.6)',
                          borderWidth: 2,
                          boxShadow: `
                            0 8px 20px rgba(0,0,0,0.1),
                            inset 0 1px 0 rgba(255,255,255,0.8)
                          `
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748b',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#374151',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 1,
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: `
                          0 4px 12px rgba(0,0,0,0.05),
                          inset 0 1px 0 rgba(255,255,255,0.6)
                        `,
                        transition: 'all 0.2s ease',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)',
                          boxShadow: `
                            0 6px 16px rgba(0,0,0,0.08),
                            inset 0 1px 0 rgba(255,255,255,0.8)
                          `
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(55, 65, 81, 0.6)',
                          borderWidth: 2,
                          boxShadow: `
                            0 8px 20px rgba(0,0,0,0.1),
                            inset 0 1px 0 rgba(255,255,255,0.8)
                          `
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748b',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#374151',
                        },
                      },
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Branche"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  required
                  size="small"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 1,
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: `
                        0 4px 12px rgba(0,0,0,0.05),
                        inset 0 1px 0 rgba(255,255,255,0.6)
                      `,
                      transition: 'all 0.2s ease',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.5)',
                        boxShadow: `
                          0 6px 16px rgba(0,0,0,0.08),
                          inset 0 1px 0 rgba(255,255,255,0.8)
                        `
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(55, 65, 81, 0.6)',
                        borderWidth: 2,
                        boxShadow: `
                          0 8px 20px rgba(0,0,0,0.1),
                          inset 0 1px 0 rgba(255,255,255,0.8)
                        `
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#374151',
                      },
                    },
                  }}
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
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 1,
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: `
                        0 4px 12px rgba(0,0,0,0.05),
                        inset 0 1px 0 rgba(255,255,255,0.6)
                      `,
                      transition: 'all 0.2s ease',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.5)',
                        boxShadow: `
                          0 6px 16px rgba(0,0,0,0.08),
                          inset 0 1px 0 rgba(255,255,255,0.8)
                        `
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(55, 65, 81, 0.6)',
                        borderWidth: 2,
                        boxShadow: `
                          0 8px 20px rgba(0,0,0,0.1),
                          inset 0 1px 0 rgba(255,255,255,0.8)
                        `
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#374151',
                      },
                    },
                  }}
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
                  sx={{ 
                    mb: 3,
                    '& .MuiFormControlLabel-label': {
                      color: '#64748b',
                      fontWeight: 500
                    }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    borderRadius: 1,
                    py: 2,
                    fontWeight: 700,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    textTransform: 'none',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: `
                      0 8px 32px rgba(5, 150, 105, 0.3),
                      0 2px 8px rgba(5, 150, 105, 0.2),
                      inset 0 1px 0 rgba(255,255,255,0.2)
                    `,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                      transform: 'none',
                      boxShadow: `
                        0 12px 40px rgba(5, 150, 105, 0.4),
                        0 4px 12px rgba(5, 150, 105, 0.3),
                        inset 0 1px 0 rgba(255,255,255,0.3)
                      `
                    }
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
