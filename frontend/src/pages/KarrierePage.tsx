import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  Skeleton,
  MenuItem
} from '@mui/material';
import {
  Work as WorkIcon,
  People as PeopleIcon,
  Euro as EuroIcon,
  AccessTime as TimeIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockJobs, getMockData } from '../utils/mockData';
import type { JobPosition } from '../utils/mockData';

const KarrierePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Verwende globale Mock-Daten mit Caching für bessere Performance
    const jobsData = getMockData('jobs', mockJobs);
    setJobs(jobsData);
    setLoading(false);
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
      const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
      const matchesType = selectedType === 'all' || job.type === selectedType;
      
      return matchesSearch && matchesDepartment && matchesLocation && matchesType;
    });
  }, [jobs, searchTerm, selectedDepartment, selectedLocation, selectedType]);

  // Event-Handler mit useCallback optimieren
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDepartment(e.target.value);
  }, []);

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLocation(e.target.value);
  }, []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(e.target.value);
  }, []);

  const handleShowFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);



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
            Karriere bei uns
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Werden Sie Teil unseres Teams und gestalten Sie die Zukunft der Online-Plattformen
          </Typography>
        </Box>

        {/* Company Values */}
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
            Unsere Unternehmenswerte
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {[
              {
                icon: <PeopleIcon sx={{ fontSize: '2rem', color: '#667eea' }} />,
                title: 'Teamarbeit',
                description: 'Wir glauben an die Kraft der Zusammenarbeit und fördern eine offene, unterstützende Arbeitsumgebung.'
              },
              {
                icon: <WorkIcon sx={{ fontSize: '2rem', color: '#667eea' }} />,
                title: 'Innovation',
                description: 'Wir ermutigen kreatives Denken und experimentieren mit neuen Technologien und Lösungen.'
              },
              {
                icon: <EuroIcon sx={{ fontSize: '2rem', color: '#667eea' }} />,
                title: 'Wachstum',
                description: 'Wir investieren in die Entwicklung unserer Mitarbeiter und bieten kontinuierliche Lernmöglichkeiten.'
              }
            ].map((value, index) => (
              <Card key={index} sx={{ borderRadius: 2, textAlign: 'center' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ mb: 2 }}>
                    {value.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      color: '#2c3e50'
                    }}
                  >
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Benefits */}
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
            Was wir bieten
          </Typography>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {[
              {
                title: 'Flexible Arbeitszeiten',
                description: 'Arbeiten Sie, wann es für Sie am besten passt. Wir vertrauen auf Eigenverantwortung.'
              },
              {
                title: 'Homeoffice-Möglichkeit',
                description: 'Arbeiten Sie von zu Hause oder im Büro - wir bieten Ihnen die Flexibilität, die Sie brauchen.'
              },
              {
                title: 'Weiterbildungsbudget',
                description: 'Investieren Sie in Ihre Zukunft mit unserem jährlichen Weiterbildungsbudget.'
              },
              {
                title: 'Moderne Arbeitsumgebung',
                description: 'Arbeiten Sie mit den neuesten Technologien und Tools in einer inspirierenden Umgebung.'
              }
            ].map((benefit, index) => (
              <Accordion key={index} sx={{ mb: 1, borderRadius: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {benefit.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Job Search */}
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
            Offene Stellen
          </Typography>

          {/* Search and Filters */}
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            {isMobile ? (
              // Mobile Layout
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Nach Stellenangeboten suchen..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#ffffff'
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleShowFilters}
                    sx={{
                      bgcolor: '#f8f9fa',
                      border: '1px solid #e1e8ed',
                      '&:hover': { bgcolor: '#e9ecef' }
                    }}
                  >
                    <FilterIcon />
                  </IconButton>
                </Box>
                
                {showFilters && (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    p: 2,
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e1e8ed'
                  }}>
                    <TextField
                      select
                      label="Abteilung"
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      size="small"
                      sx={{ bgcolor: '#ffffff' }}
                    >
                      <MenuItem value="all">Alle Abteilungen</MenuItem>
                      <MenuItem value="Entwicklung">Entwicklung</MenuItem>
                      <MenuItem value="Design">Design</MenuItem>
                      <MenuItem value="Produkt">Produkt</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="IT">IT</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Standort"
                      value={selectedLocation}
                      onChange={handleLocationChange}
                      size="small"
                      sx={{ bgcolor: '#ffffff' }}
                    >
                      <MenuItem value="all">Alle Standorte</MenuItem>
                      <MenuItem value="München">München</MenuItem>
                      <MenuItem value="Berlin">Berlin</MenuItem>
                      <MenuItem value="Hamburg">Hamburg</MenuItem>
                      <MenuItem value="Köln">Köln</MenuItem>
                      <MenuItem value="Stuttgart">Stuttgart</MenuItem>
                    </TextField>
                  </Box>
                )}
              </Box>
            ) : (
              // Desktop Layout
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: 3,
                alignItems: 'end'
              }}>
                <TextField
                  fullWidth
                  placeholder="Nach Stellenangeboten suchen..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#ffffff'
                    }
                  }}
                />
                <TextField
                  select
                  label="Abteilung"
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  sx={{ minWidth: 150, bgcolor: '#ffffff' }}
                >
                  <MenuItem value="all">Alle Abteilungen</MenuItem>
                  <MenuItem value="Entwicklung">Entwicklung</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Produkt">Produkt</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Standort"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  sx={{ minWidth: 150, bgcolor: '#ffffff' }}
                >
                  <MenuItem value="all">Alle Standorte</MenuItem>
                  <MenuItem value="München">München</MenuItem>
                  <MenuItem value="Berlin">Berlin</MenuItem>
                  <MenuItem value="Hamburg">Hamburg</MenuItem>
                  <MenuItem value="Köln">Köln</MenuItem>
                  <MenuItem value="Stuttgart">Stuttgart</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Typ"
                  value={selectedType}
                  onChange={handleTypeChange}
                  sx={{ minWidth: 150, bgcolor: '#ffffff' }}
                >
                  <MenuItem value="all">Alle Typen</MenuItem>
                  <MenuItem value="full-time">Vollzeit</MenuItem>
                  <MenuItem value="part-time">Teilzeit</MenuItem>
                  <MenuItem value="internship">Praktikum</MenuItem>
                  <MenuItem value="remote">Remote</MenuItem>
                </TextField>
              </Box>
            )}
          </Box>

          {/* Results Count */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: { xs: 2, md: 3 }
          }}>
            <Typography variant="body2" color="text.secondary">
              {filteredJobs.length} Stellenangebote gefunden
            </Typography>
            <Button
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-listing')}
              sx={{
                bgcolor: '#28a745',
                borderRadius: 2,
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.5 },
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#218838' }
              }}
            >
              Initiativbewerbung
            </Button>
          </Box>

          {/* Loading Skeleton */}
          {loading && (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: { xs: 2, md: 3 }
            }}>
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Skeleton variant="rectangular" width={60} height={24} />
                      <Skeleton variant="rectangular" width={80} height={24} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Jobs Grid */}
          {!loading && (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: { xs: 2, md: 3 },
              mb: { xs: 3, md: 4 }
            }}>
              {filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
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
                    {/* Header with Badges */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant={isMobile ? 'h6' : 'h6'} 
                          component="h3" 
                          sx={{ 
                            mb: 1,
                            fontWeight: 600, 
                            color: '#2c3e50',
                            lineHeight: 1.3
                          }}
                        >
                          {job.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                        {job.urgent && (
                          <Chip
                            label="Dringend"
                            size="small"
                            sx={{
                              bgcolor: '#e74c3c',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                        {job.featured && (
                          <Chip
                            label="Empfohlen"
                            size="small"
                            sx={{
                              bgcolor: '#667eea',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    {/* Job Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <BusinessIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.department}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <LocationIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <TimeIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.type === 'full-time' ? 'Vollzeit' : 
                         job.type === 'part-time' ? 'Teilzeit' :
                         job.type === 'internship' ? 'Praktikum' : 'Remote'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <WorkIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.experience} Erfahrung
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EuroIcon sx={{ color: '#667eea', fontSize: '1rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.salary}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2, 
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {job.description}
                    </Typography>

                    {/* Requirements */}
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Anforderungen:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {job.requirements.slice(0, 2).map((requirement, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ 
                            width: 4, 
                            height: 4, 
                            borderRadius: '50%', 
                            bgcolor: '#667eea', 
                            mr: 1 
                          }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {requirement}
                          </Typography>
                        </Box>
                      ))}
                      {job.requirements.length > 2 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          +{job.requirements.length - 2} weitere...
                        </Typography>
                      )}
                    </Box>

                    {/* Benefits */}
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Vorteile:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {job.benefits.slice(0, 2).map((benefit, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ 
                            width: 4, 
                            height: 4, 
                            borderRadius: '50%', 
                            bgcolor: '#28a745', 
                            mr: 1 
                          }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {benefit}
                          </Typography>
                        </Box>
                      ))}
                      {job.benefits.length > 2 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          +{job.benefits.length - 2} weitere...
                        </Typography>
                      )}
                    </Box>

                    {/* CTA Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      onClick={() => navigate(`/karriere/${job.id}`)}
                      sx={{
                        bgcolor: '#667eea',
                        '&:hover': { bgcolor: '#5a6fd8' }
                      }}
                    >
                      Jetzt bewerben
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Pagination */}
          {!loading && filteredJobs.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredJobs.length / 8)}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 1
                  }
                }}
              />
            </Box>
          )}

          {/* No Results */}
          {!loading && filteredJobs.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: { xs: 6, md: 8 },
              color: '#7f8c8d'
            }}>
              <WorkIcon sx={{ fontSize: { xs: '4rem', md: '6rem' }, mb: 2, opacity: 0.5 }} />
              <Typography 
                variant={isMobile ? 'h6' : 'h5'} 
                sx={{ mb: 1, fontWeight: 500 }}
              >
                Keine Stellenangebote gefunden
              </Typography>
              <Typography variant="body2">
                Versuche es mit anderen Suchkriterien oder sende eine Initiativbewerbung.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Application Process */}
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
            Bewerbungsprozess
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 3 }
          }}>
            {[
              {
                step: '1',
                title: 'Bewerbung einreichen',
                description: 'Senden Sie Ihre Bewerbung über unser Online-Formular oder per E-Mail.'
              },
              {
                step: '2',
                title: 'Erste Prüfung',
                description: 'Unser HR-Team prüft Ihre Bewerbung und meldet sich innerhalb von 48 Stunden.'
              },
              {
                step: '3',
                title: 'Gespräch',
                description: 'Wir führen ein persönliches oder virtuelles Gespräch, um Sie kennenzulernen.'
              },
              {
                step: '4',
                title: 'Entscheidung',
                description: 'Nach erfolgreichem Gespräch erhalten Sie unser Angebot.'
              }
            ].map((process, index) => (
              <Card key={index} sx={{ borderRadius: 2, textAlign: 'center' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: '#667eea', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: '1.2rem',
                    fontWeight: 600
                  }}>
                    {process.step}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      color: '#2c3e50'
                    }}
                  >
                    {process.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {process.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default KarrierePage;
