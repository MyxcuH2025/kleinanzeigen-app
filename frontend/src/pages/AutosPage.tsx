import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  FormControl,
  Select,
  MenuItem,
  TextField,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  TwoWheeler as MotorcycleIcon,
  LocalShipping as TruckIcon,
  DirectionsCarFilled as CamperIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import AdCard from '@/components/AdCard';
import { useNavigate, useLocation } from 'react-router-dom';
import { PLACEHOLDER_IMAGE_URL } from '@/config/config';
import { getFullApiUrl } from '@/config/config';

interface Auto {
  id: number;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  features: string[];
  available: string;
  vehicleDetails?: {
    marke: string;
    modell: string;
    erstzulassung: string | number;
    kilometerstand: string | number;
    kraftstoff: string;
    getriebe: string;
    leistung: string | number;
    tueren: string | number;
    sitze: string | number;
    farbe: string;
    unfallfrei: boolean;
    erstbesitzer: boolean;
    serviceheft: boolean;
    tuev: string;
    haendler: boolean;
  };
}

// Backend-Daten-Interfaces
interface CarData {
  brands: Array<{ value: string; label: string }>;
  vehicle_types: Array<{ value: string; label: string; icon?: string }>;
  fuel_types: Array<{ value: string; label: string }>;
  transmission_types: Array<{ value: string; label: string }>;
  registration_years: Array<{ value: string; label: string }>;
  price_ranges: Array<{ value: string; label: string }>;
}

const AutosPage: React.FC = () => {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({
    paymentType: 'kaufen',
    onlineKauf: false,
    elektro: false,
    marke: '',
    modell: '',
    erstzulassung: '',
    preis: ''
  });
  const [selectedType, setSelectedType] = useState('auto');
  
  // Backend-Daten-States
  const [carData, setCarData] = useState<CarData | null>(null);
  const [carDataLoading, setCarDataLoading] = useState(true);
  const [carDataError, setCarDataError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Backend-Daten laden
  const loadCarData = async () => {
    try {
      setCarDataLoading(true);
      setCarDataError(null);
      const response = await fetch(getFullApiUrl('api/car-data'));
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Auto-Daten');
      }
      const data = await response.json();
      setCarData(data);
    } catch (err) {
      console.error('Fehler beim Laden der Auto-Daten:', err);
      setCarDataError('Fehler beim Laden der Filter-Daten');
    } finally {
      setCarDataLoading(false);
    }
  };

  // Backend-Daten beim Laden der Komponente abrufen
  useEffect(() => {
    loadCarData();
  }, []);

  // Filter-Handler
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Wenn Marke geändert wird, Modell zurücksetzen
    if (key === 'marke') {
      setFilters(prev => ({
        ...prev,
        modell: ''
      }));
    }
  };

  // Verfügbare Modelle basierend auf ausgewählter Marke
  const getAvailableModels = () => {
    if (!filters.marke || !carData) return [];
    
    // Hier könntest du eine API für spezifische Modelle pro Marke implementieren
    // Für jetzt verwenden wir statische Modelle basierend auf der Marke
    const modelMap: Record<string, Array<{value: string, label: string}>> = {
    'bmw': [
        { value: '1er', label: '1er' },
        { value: '2er', label: '2er' },
        { value: '3er', label: '3er' },
        { value: '4er', label: '4er' },
        { value: '5er', label: '5er' },
        { value: '6er', label: '6er' },
        { value: '7er', label: '7er' },
        { value: 'x1', label: 'X1' },
        { value: 'x3', label: 'X3' },
        { value: 'x5', label: 'X5' },
        { value: 'x7', label: 'X7' },
        { value: 'z4', label: 'Z4' },
        { value: 'i3', label: 'i3' },
        { value: 'i8', label: 'i8' }
    ],
    'mercedes': [
        { value: 'a-klasse', label: 'A-Klasse' },
        { value: 'b-klasse', label: 'B-Klasse' },
        { value: 'c-klasse', label: 'C-Klasse' },
        { value: 'e-klasse', label: 'E-Klasse' },
        { value: 's-klasse', label: 'S-Klasse' },
        { value: 'gla', label: 'GLA' },
        { value: 'glb', label: 'GLB' },
        { value: 'glc', label: 'GLC' },
        { value: 'gle', label: 'GLE' },
        { value: 'gls', label: 'GLS' },
        { value: 'g-klasse', label: 'G-Klasse' },
        { value: 'sl', label: 'SL' },
        { value: 'slk', label: 'SLK' },
        { value: 'amg', label: 'AMG' }
      ],
      'audi': [
        { value: 'a1', label: 'A1' },
        { value: 'a3', label: 'A3' },
        { value: 'a4', label: 'A4' },
        { value: 'a5', label: 'A5' },
        { value: 'a6', label: 'A6' },
        { value: 'a7', label: 'A7' },
        { value: 'a8', label: 'A8' },
        { value: 'q2', label: 'Q2' },
        { value: 'q3', label: 'Q3' },
        { value: 'q5', label: 'Q5' },
        { value: 'q7', label: 'Q7' },
        { value: 'q8', label: 'Q8' },
        { value: 'tt', label: 'TT' },
        { value: 'r8', label: 'R8' },
        { value: 'e-tron', label: 'e-tron' }
    ],
    'volkswagen': [
        { value: 'polo', label: 'Polo' },
        { value: 'golf', label: 'Golf' },
        { value: 'passat', label: 'Passat' },
        { value: 'arteon', label: 'Arteon' },
        { value: 'tiguan', label: 'Tiguan' },
        { value: 'touareg', label: 'Touareg' },
        { value: 't-cross', label: 'T-Cross' },
        { value: 't-roc', label: 'T-Roc' },
        { value: 'id3', label: 'ID.3' },
        { value: 'id4', label: 'ID.4' },
        { value: 'up', label: 'up!' },
        { value: 'caddy', label: 'Caddy' },
        { value: 'transporter', label: 'Transporter' }
    ],
    'porsche': [
        { value: '911', label: '911' },
        { value: 'cayenne', label: 'Cayenne' },
        { value: 'macan', label: 'Macan' },
        { value: 'panamera', label: 'Panamera' },
        { value: 'taycan', label: 'Taycan' },
        { value: 'boxster', label: 'Boxster' },
        { value: 'cayman', label: 'Cayman' },
        { value: '718', label: '718' }
      ]
    };
    
    return modelMap[filters.marke] || [];
  };

  // Mock-Daten für Autos
  const mockAutos: Auto[] = [
    {
      id: 1,
      title: 'BMW 3er Limousine 320d',
      location: 'München',
      price: 28900,
      rating: 4.5,
      reviews: 23,
      image: '/images/bmw-3er.jpg',
      images: ['/images/bmw-3er.jpg', '/images/bmw-3er-2.jpg'],
      type: 'Limousine',
      seats: 5,
      transmission: 'Automatik',
      fuel: 'Diesel',
      features: ['Klimaanlage', 'Bluetooth', 'Navi'],
      available: 'Sofort verfügbar',
      vehicleDetails: {
        marke: 'BMW',
        modell: '3er',
        erstzulassung: 2019,
        kilometerstand: 45000,
        kraftstoff: 'Diesel',
        getriebe: 'Automatik',
        leistung: '190 PS',
        tueren: 4,
        sitze: 5,
        farbe: 'Schwarz',
        unfallfrei: true,
        erstbesitzer: false,
        serviceheft: true,
        tuev: '2024',
        haendler: true
      }
    },
    {
      id: 2,
      title: 'Mercedes C-Klasse C200',
      location: 'Berlin',
      price: 32500,
      rating: 4.3,
      reviews: 18,
      image: '/images/mercedes-c.jpg',
      images: ['/images/mercedes-c.jpg'],
      type: 'Limousine',
      seats: 5,
      transmission: 'Automatik',
      fuel: 'Benzin',
      features: ['LED-Scheinwerfer', 'Parkassistent', 'Tempomat'],
      available: 'Sofort verfügbar',
      vehicleDetails: {
        marke: 'Mercedes',
        modell: 'C-Klasse',
        erstzulassung: 2020,
        kilometerstand: 32000,
        kraftstoff: 'Benzin',
        getriebe: 'Automatik',
        leistung: '184 PS',
        tueren: 4,
        sitze: 5,
        farbe: 'Weiß',
        unfallfrei: true,
        erstbesitzer: true,
        serviceheft: true,
        tuev: '2025',
        haendler: false
      }
    },
    {
      id: 3,
      title: 'Audi A4 Avant 2.0 TDI',
      location: 'Hamburg',
      price: 26900,
      rating: 4.7,
      reviews: 31,
      image: '/images/audi-a4.jpg',
      images: ['/images/audi-a4.jpg'],
      type: 'Kombi',
      seats: 5,
      transmission: 'Manuell',
      fuel: 'Diesel',
      features: ['Quattro', 'Virtual Cockpit', 'Bang & Olufsen'],
      available: 'Sofort verfügbar',
      vehicleDetails: {
        marke: 'Audi',
        modell: 'A4',
        erstzulassung: 2018,
        kilometerstand: 52000,
        kraftstoff: 'Diesel',
        getriebe: 'Manuell',
        leistung: '150 PS',
        tueren: 5,
        sitze: 5,
        farbe: 'Grau',
        unfallfrei: true,
        erstbesitzer: false,
        serviceheft: true,
        tuev: '2024',
        haendler: true
      }
    }
  ];

  // Filter-Logik für Autos
  const getFilteredAutos = () => {
    let filtered = [...mockAutos];

    // Marke filtern
    if (filters.marke) {
      filtered = filtered.filter(auto => 
        auto.title.toLowerCase().includes(filters.marke.toLowerCase())
      );
    }

    // Modell filtern
    if (filters.modell) {
      filtered = filtered.filter(auto => 
        auto.title.toLowerCase().includes(filters.modell.toLowerCase())
      );
    }

    // Erstzulassung filtern
    if (filters.erstzulassung) {
      filtered = filtered.filter(auto => 
        auto.vehicleDetails?.erstzulassung && 
        parseInt(auto.vehicleDetails.erstzulassung.toString()) >= parseInt(filters.erstzulassung)
      );
    }

    // Preis filtern
    if (filters.preis) {
      const [minPrice, maxPrice] = filters.preis.split('-').map((p: string) => 
        p === '+' ? Infinity : parseInt(p.replace(/\D/g, ''))
      );
      filtered = filtered.filter(auto => {
        const price = auto.price;
        return price >= minPrice && (maxPrice === Infinity || price <= maxPrice);
      });
    }

    // Online-Kauf filtern
    if (filters.onlineKauf) {
      // Hier könntest du eine Online-Kauf-Eigenschaft hinzufügen
      // filtered = filtered.filter(auto => auto.onlineKauf);
    }

    // Elektro filtern
    if (filters.elektro) {
      filtered = filtered.filter(auto => 
        auto.fuel.toLowerCase().includes('elektro') || 
        auto.fuel.toLowerCase().includes('hybrid')
      );
    }

    return filtered;
  };

  // Gefilterte Autos
  const filteredAutos = getFilteredAutos();

  // Such-Handler
  const handleSearch = () => {
    // Die Filter werden bereits durch getFilteredAutos() angewendet
    // Hier könntest du zusätzliche Logik hinzufügen (z.B. API-Aufruf)

  };

  // Filter zurücksetzen
  const handleResetFilters = () => {
    setFilters({
      paymentType: 'kaufen',
      onlineKauf: false,
      elektro: false,
      marke: '',
      modell: '',
      erstzulassung: '',
      preis: ''
    });
  };


  useEffect(() => {
    const loadAutos = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAutos(mockAutos);
    } catch (err) {
        setError('Fehler beim Laden der Autos');
    } finally {
      setLoading(false);
    }
  };

    loadAutos();
  }, []);

  const clearFilters = () => {
    setFilters({
      paymentType: 'kaufen',
      onlineKauf: false,
      elektro: false
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Leere Leiste anstelle der Auto/Kleinanzeigen Buttons */}
              <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        py: 2
      }}>
        <Container maxWidth="lg">
          {/* Leere Leiste - nur für Spacing */}
          <Box sx={{ height: 20 }} />
        </Container>
              </Box>

      {/* Verbundener Filter Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 3, borderBottom: '1px solid', borderColor: 'grey.300' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {carDataError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {carDataError}
            </Alert>
          )}
                          <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
            bgcolor: 'white', 
            border: '1px solid', 
            borderColor: 'grey.300',
            borderRadius: 2,
            overflow: 'hidden',
            boxSizing: 'border-box',
            willChange: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* Left Sidebar - Vehicle Types */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'row', md: 'column' },
              minWidth: { xs: 'auto', md: 50 },
              width: { xs: '100%', md: 'auto' },
              borderRight: 'none',
              borderBottom: 'none',
              borderColor: 'grey.300',
              boxSizing: 'border-box',
              bgcolor: 'grey.50'
            }}>
                    <Button
                variant="text"
                onClick={() => setSelectedType('auto')}
                      sx={{
                  minWidth: { xs: 60, md: 40 },
                  height: { xs: 50, md: 45 },
                  borderRadius: 0,
                  bgcolor: selectedType === 'auto' ? 'white' : 'grey.200',
                  color: selectedType === 'auto' ? 'primary.main' : 'text.primary',
                  border: 'none',
                  borderBottom: 'none',
                  borderRight: { xs: '1px solid', md: 'none' },
                  borderRightColor: { xs: 'grey.400', md: 'transparent' },
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  flex: { xs: 1, md: 'none' },
                        '&:hover': {
                    bgcolor: selectedType === 'auto' ? 'grey.50' : 'grey.100',
                    color: 'primary.main'
                        }
                      }}
                    >
                <CarIcon />
                    </Button>
              <Button
                variant="text"
                onClick={() => setSelectedType('motorrad')}
                         sx={{
                  minWidth: { xs: 60, md: 40 },
                  height: { xs: 50, md: 45 },
                  borderRadius: 0,
                  bgcolor: selectedType === 'motorrad' ? 'white' : 'grey.200',
                  color: selectedType === 'motorrad' ? 'primary.main' : 'text.primary',
                  border: 'none',
                  borderBottom: 'none',
                  borderRight: { xs: '1px solid', md: 'none' },
                  borderRightColor: { xs: 'grey.400', md: 'transparent' },
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  flex: { xs: 1, md: 'none' },
                  '&:hover': {
                    bgcolor: selectedType === 'motorrad' ? 'grey.50' : 'grey.100',
                    color: 'primary.main'
                  }
                }}
              >
                <MotorcycleIcon />
              </Button>
              <Button
                variant="text"
                onClick={() => setSelectedType('wohnmobil')}
                         sx={{
                  minWidth: { xs: 60, md: 40 },
                  height: { xs: 50, md: 45 },
                  borderRadius: 0,
                  bgcolor: selectedType === 'wohnmobil' ? 'white' : 'grey.200',
                  color: selectedType === 'wohnmobil' ? 'primary.main' : 'text.primary',
                  border: 'none',
                  borderBottom: 'none',
                  borderRight: { xs: '1px solid', md: 'none' },
                  borderRightColor: { xs: 'grey.400', md: 'transparent' },
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  flex: { xs: 1, md: 'none' },
                  '&:hover': {
                    bgcolor: selectedType === 'wohnmobil' ? 'grey.50' : 'grey.100',
                    color: 'primary.main'
                  }
                }}
              >
                <CamperIcon />
              </Button>
              <Button
                variant="text"
                onClick={() => setSelectedType('lkw')}
                sx={{
                  minWidth: { xs: 60, md: 40 },
                  height: { xs: 50, md: 45 },
                  borderRadius: 0,
                  bgcolor: selectedType === 'lkw' ? 'white' : 'grey.200',
                  color: selectedType === 'lkw' ? 'primary.main' : 'text.primary',
                  border: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  flex: { xs: 1, md: 'none' },
                  '&:hover': {
                    bgcolor: selectedType === 'lkw' ? 'grey.50' : 'grey.100',
                    color: 'primary.main'
                  }
                }}
              >
                <TruckIcon />
              </Button>
                   </Box>

            {/* Main Filter Panel */}
            <Box sx={{ 
              flexGrow: 1, 
              bgcolor: 'white', 
              p: { xs: 1.5, md: 2 }
            }}>
              {/* Top Row */}
              <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1.5 }, mb: 1.5, flexWrap: { xs: 'wrap', md: 'nowrap' }, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: { xs: 120, sm: 140, md: 140 }, maxWidth: { md: 160 }, flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 8px)', md: 'none' } }}>
                  <TextField
                    select
                         size="small"
                    value={filters.marke || ''}
                    onChange={(e) => handleFilterChange('marke', e.target.value)}
                         sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        boxSizing: 'border-box',
                        height: 40,
                        '& fieldset': { 
                          borderColor: 'grey.300', 
                          borderWidth: '1px',
                          transition: 'all 0.2s ease'
                        },
                        '&:hover fieldset': { 
                          borderColor: 'primary.main', 
                          borderWidth: '1px' 
                        },
                        '&.Mui-focused fieldset': { 
                          borderColor: 'primary.main', 
                          borderWidth: '2px' 
                        }
                      },
                      '& .MuiSelect-select': {
                        padding: '8px 12px',
                        fontSize: '14px'
                      }
                    }}
                  >
                    <MenuItem value="">Marke</MenuItem>
                    {carDataLoading ? (
                      <MenuItem disabled>Lade Marken...</MenuItem>
                    ) : carData?.brands ? (
                      carData.brands.map((brand) => (
                        <MenuItem key={brand.value} value={brand.value}>
                          {brand.label}
                         </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Keine Marken verfügbar</MenuItem>
                    )}
                  </TextField>
                     </FormControl>
                <FormControl sx={{ minWidth: { xs: 120, sm: 140, md: 140 }, maxWidth: { md: 160 }, flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 8px)', md: 'none' } }}>
                    <TextField
                    select
                         size="small"
                    value={filters.modell || ''}
                    onChange={(e) => handleFilterChange('modell', e.target.value)}
                    disabled={!filters.marke}
                         sx={{
                        '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        '& fieldset': { borderColor: 'grey.300' },
                        '&:hover fieldset': { borderColor: 'grey.400' },
                        '&.Mui-focused fieldset': { borderColor: 'orange.main' }
                      }
                    }}
                  >
                    <MenuItem value="">Modell</MenuItem>
                    {!filters.marke ? (
                      <MenuItem disabled>Wähle zuerst eine Marke</MenuItem>
                    ) : (
                      getAvailableModels().map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                     </FormControl>
                <FormControl sx={{ minWidth: { xs: 120, sm: 140, md: 140 }, maxWidth: { md: 160 }, flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 8px)', md: 'none' } }}>
                    <TextField
                    select
                         size="small"
                    value={filters.erstzulassung || ''}
                    onChange={(e) => handleFilterChange('erstzulassung', e.target.value)}
                         sx={{
                        '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        '& fieldset': { borderColor: 'black', borderWidth: '1px' },
                        '&:hover fieldset': { borderColor: 'black', borderWidth: '1px' },
                        '&.Mui-focused fieldset': { borderColor: 'black', borderWidth: '2px' }
                      }
                    }}
                  >
                    <MenuItem value="">Erstzulassung ab</MenuItem>
                    {carDataLoading ? (
                      <MenuItem disabled>Lade Jahre...</MenuItem>
                    ) : carData?.registration_years ? (
                      carData.registration_years.map((year) => (
                        <MenuItem key={year.value} value={year.value}>
                          {year.label}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Keine Jahre verfügbar</MenuItem>
                    )}
                  </TextField>
                     </FormControl>
                <FormControl sx={{ minWidth: { xs: 120, sm: 140, md: 140 }, maxWidth: { md: 160 }, flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 8px)', md: 'none' } }}>
                    <TextField
                    select
                      size="small"
                    value={filters.mileage || ''}
                    onChange={(e) => setFilters({ ...filters, mileage: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        boxSizing: 'border-box',
                        '& fieldset': { 
                          borderColor: 'black', 
                          borderWidth: '1px',
                          transition: 'border-width 0.1s ease'
                        },
                        '&:hover fieldset': { 
                          borderColor: 'black', 
                          borderWidth: '1px' 
                        },
                        '&.Mui-focused fieldset': { 
                          borderColor: 'black', 
                          borderWidth: '2px' 
                        }
                      }
                    }}
                  >
                    <MenuItem value="">Kilometer bis</MenuItem>
                    <MenuItem value="10000">10.000 km</MenuItem>
                    <MenuItem value="25000">25.000 km</MenuItem>
                    <MenuItem value="50000">50.000 km</MenuItem>
                    <MenuItem value="100000">100.000 km</MenuItem>
                    <MenuItem value="150000">150.000 km</MenuItem>
                    <MenuItem value="200000">200.000 km</MenuItem>
                  </TextField>
                     </FormControl>
                  </Box>

              {/* Middle Row */}
              <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1.5 }, mb: 1.5, flexWrap: { xs: 'wrap', md: 'nowrap' }, alignItems: 'center' }}>
                {/* Payment Type Toggle */}
                <Box sx={{ display: 'flex', bgcolor: 'white', border: '1px solid', borderColor: 'grey.300', borderRadius: 1, overflow: 'hidden' }}>
                  <Button
                    variant={filters.paymentType === 'kaufen' ? 'contained' : 'text'}
                    onClick={() => setFilters({ ...filters, paymentType: 'kaufen' })}
                         sx={{
                      bgcolor: filters.paymentType === 'kaufen' ? 'primary.main' : 'white',
                      color: filters.paymentType === 'kaufen' ? 'white' : 'text.primary',
                      borderRadius: 0,
                      px: 3,
                      py: 0.5,
                      minHeight: 40,
                      textTransform: 'none',
                      fontWeight: 600,
                      border: 'none',
                      '&:hover': {
                        bgcolor: filters.paymentType === 'kaufen' ? 'primary.dark' : 'grey.100'
                      }
                    }}
                  >
                    Kaufen
                  </Button>
                  <Button
                    variant={filters.paymentType === 'leasen' ? 'contained' : 'text'}
                    onClick={() => setFilters({ ...filters, paymentType: 'leasen' })}
                         sx={{
                      bgcolor: filters.paymentType === 'leasen' ? 'primary.main' : 'white',
                      color: filters.paymentType === 'leasen' ? 'white' : 'text.primary',
                      borderRadius: 0,
                      px: 3,
                      py: 0.5,
                      minHeight: 40,
                      textTransform: 'none',
                      fontWeight: 600,
                      border: 'none',
                      '&:hover': {
                        bgcolor: filters.paymentType === 'leasen' ? 'primary.dark' : 'grey.100'
                      }
                    }}
                  >
                    Leasen
                  </Button>
                   </Box>

                <FormControl sx={{ minWidth: { xs: 120, sm: 140, md: 140 }, maxWidth: { md: 160 }, flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 8px)', md: 'none' } }}>
                  <TextField
                    select
                         size="small"
                    value={filters.preis || ''}
                    onChange={(e) => handleFilterChange('preis', e.target.value)}
                         sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        boxSizing: 'border-box',
                        height: 40,
                        '& fieldset': { 
                          borderColor: 'grey.300', 
                          borderWidth: '1px',
                          transition: 'all 0.2s ease'
                        },
                        '&:hover fieldset': { 
                          borderColor: 'primary.main', 
                          borderWidth: '1px' 
                        },
                        '&.Mui-focused fieldset': { 
                          borderColor: 'primary.main', 
                          borderWidth: '2px' 
                        }
                      },
                      '& .MuiSelect-select': {
                        padding: '8px 12px',
                        fontSize: '14px'
                      }
                    }}
                  >
                    <MenuItem value="">Preis bis</MenuItem>
                    {carDataLoading ? (
                      <MenuItem disabled>Lade Preise...</MenuItem>
                    ) : carData?.price_ranges ? (
                      carData.price_ranges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Keine Preise verfügbar</MenuItem>
                    )}
                  </TextField>
                     </FormControl>

                <TextField
                         size="small"
                  placeholder="Ort oder PLZ"
                         sx={{
                    minWidth: { xs: 140, sm: 160, md: 160 },
                    maxWidth: { md: 180 },
                    flex: { xs: '1 1 100%', sm: '1 1 auto', md: 'none' },
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      boxSizing: 'border-box',
                      height: 40,
                      '& fieldset': { 
                        borderColor: 'grey.300', 
                        borderWidth: '1px',
                        transition: 'all 0.2s ease'
                      },
                      '&:hover fieldset': { 
                        borderColor: 'primary.main', 
                        borderWidth: '1px' 
                      },
                      '&.Mui-focused fieldset': { 
                        borderColor: 'primary.main', 
                        borderWidth: '2px' 
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '8px 12px',
                      fontSize: '14px'
                    }
                  }}
                  InputProps={{
                    endAdornment: <LocationIcon color="action" />
                  }}
                />

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    sx={{
                    bgcolor: 'primary.main',
                      color: 'white',
                      px: 2,
                    py: 0.5,
                    minHeight: 40,
                    fontWeight: 600,
                    textTransform: 'none',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    whiteSpace: 'nowrap',
                      '&:hover': {
                      bgcolor: 'primary.dark'
                      }
                    }}
                  >
                    {filteredAutos.length} Autos
                  </Button>
                </Box>

              {/* Bottom Row */}
              <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.5 }, alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    id="online-kauf"
                    checked={filters.onlineKauf || false}
                    onChange={(e) => setFilters({ ...filters, onlineKauf: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="online-kauf" style={{ color: 'text.primary', fontSize: '14px' }}>
                    Online-Kauf
                  </label>
              </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    id="elektro"
                    checked={filters.elektro || false}
                    onChange={(e) => setFilters({ ...filters, elektro: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="elektro" style={{ color: 'text.primary', fontSize: '14px' }}>
                    Nur Elektroautos
                  </label>
            </Box>
        <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
              sx={{
                    flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' },
                    minWidth: { xs: 'auto', sm: 'auto' },
                    color: 'text.primary', 
            textTransform: 'none',
                    borderColor: 'grey.300',
                    minHeight: 40,
            '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'grey.100'
            }
          }}
                  onClick={handleResetFilters}
        >
                  Zurücksetzen
        </Button>
        <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterIcon />}
              sx={{
                    flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' },
                    minWidth: { xs: 'auto', sm: 'auto' },
                    color: 'text.primary', 
            textTransform: 'none',
                    borderColor: 'grey.300',
                    minHeight: 40,
            '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'grey.100'
            }
          }}
        >
                  Weitere Filter
        </Button>
      </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3
        }}>
          <Typography variant="h6" fontWeight={600}>
            Neueste Autos
          </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
            onClick={() => console.log('Aktualisieren')}
        >
          Aktualisieren
        </Button>
      </Box>

      {/* Autos Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          }, 
          gap: 3.5 
        }}>
          {filteredAutos.map((auto) => (
              <AdCard
              key={auto.id}
                id={auto.id.toString()}
                title={auto.title}
                price={auto.price}
                location={auto.location}
              images={auto.images}
                category="autos"
                status="active"
              views={Math.floor(Math.random() * 1000)}
              created_at={new Date().toISOString()}
              attributes={{}}
                seller={{
                name: 'max.mueller',
                avatar: ''
                }}
                vehicleDetails={auto.vehicleDetails}
              />
          ))}
            </Box>
    </Container>
        </Box>
  );
}; 

export default AutosPage;
