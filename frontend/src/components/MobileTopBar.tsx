import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  IconButton, 
  TextField, 
  InputAdornment, 
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  Typography,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconFilter, IconNotification } from './icons';
import { categories } from '@/config/categoriesConfig';

// Category icons mapping
const getCategoryIcon = (categorySlug: string) => {
  switch (categorySlug) {
    case 'autos':
      return '🚗';
    case 'kleinanzeigen':
      return '📱';
    default:
      return '📦';
  }
};

const getSubcategoryIcon = (categorySlug: string, subcategorySlug: string) => {
  if (categorySlug === 'autos') {
    switch (subcategorySlug) {
      case 'autos':
        return '🚗';
      case 'motorraeder':
        return '🏍️';
      case 'wohnmobil':
        return '🚐';
      case 'lkw':
        return '🚛';
      case 'ersatzteile':
        return '🔧';
      default:
        return '🚗';
    }
  } else if (categorySlug === 'kleinanzeigen') {
    switch (subcategorySlug) {
      case 'elektronik':
        return '📱';
      case 'haus-garten':
        return '🏠';
      case 'mode-beauty':
        return '👗';
      case 'sport-freizeit':
        return '⚽';
      case 'buecher-medien':
        return '📚';
      case 'spielzeug-spiele':
        return '🎮';
      case 'tiere-zubehoer':
        return '🐕';
      case 'musik-instrumente':
        return '🎸';
      default:
        return '📦';
    }
  }
  return '📦';
};

export const MobileTopBar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPLZRange, setSelectedPLZRange] = useState('');
  const [customPLZ, setCustomPLZ] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [filterErrors, setFilterErrors] = useState<string[]>([]);

  // European countries with major cities and postal code ranges
  const countries = {
    'deutschland': {
      name: 'Deutschland',
      cities: ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Mannheim'],
      plzRanges: ['01000-01999', '20000-29999', '30000-39999', '40000-49999', '50000-59999', '60000-69999', '70000-79999', '80000-89999', '90000-99999']
    },
    'oesterreich': {
      name: 'Österreich',
      cities: ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn'],
      plzRanges: ['1000-1999', '2000-2999', '3000-3999', '4000-4999', '5000-5999', '6000-6999', '7000-7999', '8000-8999', '9000-9999']
    },
    'schweiz': {
      name: 'Schweiz',
      cities: ['Zürich', 'Genf', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Luzern', 'St. Gallen', 'Lugano', 'Biel'],
      plzRanges: ['1000-1999', '2000-2999', '3000-3999', '4000-4999', '5000-5999', '6000-6999', '7000-7999', '8000-8999', '9000-9999']
    },
    'niederlande': {
      name: 'Niederlande',
      cities: ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen'],
      plzRanges: ['1000-1999', '2000-2999', '3000-3999', '4000-4999', '5000-5999', '6000-6999', '7000-7999', '8000-8999', '9000-9999']
    },
    'belgien': {
      name: 'Belgien',
      cities: ['Brüssel', 'Antwerpen', 'Gent', 'Charleroi', 'Lüttich', 'Brugge', 'Namur', 'Leuven', 'Mons', 'Aalst'],
      plzRanges: ['1000-1999', '2000-2999', '3000-3999', '4000-3999', '5000-5999', '6000-6999', '7000-7999', '8000-8999', '9000-9999']
    },
    'frankreich': {
      name: 'Frankreich',
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nizza', 'Nantes', 'Straßburg', 'Montpellier', 'Bordeaux', 'Lille'],
      plzRanges: ['01000-01999', '20000-29999', '30000-39999', '40000-49999', '50000-59999', '60000-69999', '70000-79999', '80000-89999', '90000-99999']
    },
    'italien': {
      name: 'Italien',
      cities: ['Rom', 'Mailand', 'Neapel', 'Turin', 'Palermo', 'Genua', 'Bologna', 'Florenz', 'Bari', 'Catania'],
      plzRanges: ['00010-00999', '10000-19999', '20000-29999', '30000-39999', '40000-49999', '50000-59999', '60000-69999', '70000-79999', '80000-89999', '90000-99999']
    },
    'spanien': {
      name: 'Spanien',
      cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
      plzRanges: ['01000-01999', '02000-02999', '03000-03999', '04000-04999', '05000-05999', '06000-06999', '07000-07999', '08000-08999', '09000-09999', '10000-99999']
    },
    'polen': {
      name: 'Polen',
      cities: ['Warschau', 'Krakau', 'Łódź', 'Wrocław', 'Posen', 'Danzig', 'Stettin', 'Bydgoszcz', 'Lublin', 'Katowice'],
      plzRanges: ['00-000-09-999', '10-000-19-999', '20-000-29-999', '30-000-39-999', '40-000-49-999', '50-000-59-999', '60-000-69-999', '70-000-79-999', '80-000-89-999', '90-000-99-999']
    },
    'tschechien': {
      name: 'Tschechien',
      cities: ['Prag', 'Brünn', 'Ostrava', 'Pilsen', 'Liberec', 'Olomouc', 'Ústí nad Labem', 'České Budějovice', 'Hradec Králové', 'Pardubice'],
      plzRanges: ['10000-19999', '20000-29999', '30000-39999', '40000-49999', '50000-59999', '60000-69999', '70000-79999', '80000-89999', '90000-99999']
    }
  };

  // Load filters from localStorage on component mount
  React.useEffect(() => {
    const savedFilters = localStorage.getItem('kleinanzeigen-filters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSelectedCategory(filters.category || '');
        setSelectedSubCategory(filters.subcategory || '');
        setPriceRange(filters.priceRange || '');
        setSelectedCountry(filters.country || '');
        setSelectedCity(filters.city || '');
        setSelectedPLZRange(filters.plzRange || '');
        setCustomCity(filters.customCity || '');
        setCustomPLZ(filters.customPLZ || '');
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  React.useEffect(() => {
    const filters = {
      category: selectedCategory,
      subcategory: selectedSubCategory,
      priceRange,
      country: selectedCountry,
      city: selectedCity,
      plzRange: selectedPLZRange,
      customCity,
      customPLZ
    };
    localStorage.setItem('kleinanzeigen-filters', JSON.stringify(filters));
  }, [selectedCategory, selectedSubCategory, priceRange, selectedCountry, selectedCity, selectedPLZRange, customCity, customPLZ]);

  // Validate filters before search
  const validateFilters = (): boolean => {
    const errors: string[] = [];

    // Validate price range
    if (priceRange) {
      const [von, bis] = priceRange.split('-');
      if (von && bis && parseFloat(von) >= parseFloat(bis)) {
        errors.push('Der "Von"-Preis muss kleiner als der "Bis"-Preis sein');
      }
      if (von && parseFloat(von) < 0) {
        errors.push('Der "Von"-Preis darf nicht negativ sein');
      }
      if (bis && parseFloat(bis) < 0) {
        errors.push('Der "Bis"-Preis darf nicht negativ sein');
      }
    }

    // Validate PLZ format
    if (customPLZ) {
      const plzRegex = /^\d{4,5}$/;
      if (!plzRegex.test(customPLZ)) {
        errors.push('PLZ muss 4-5 Ziffern haben');
      }
    }

    setFilterErrors(errors);
    return errors.length === 0;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFilters()) {
      return; // Don't search if validation fails
    }

    if (query.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('q', query.trim());
      if (selectedCategory) searchParams.set('category', selectedCategory);
      if (selectedSubCategory) searchParams.set('subcategory', selectedSubCategory);
      if (priceRange) searchParams.set('price', priceRange);
      if (selectedCountry) searchParams.set('country', selectedCountry);
      
      // Add city (either selected or custom)
      if (selectedCity) searchParams.set('city', selectedCity);
      if (customCity) searchParams.set('customCity', customCity);
      if (selectedPLZRange) searchParams.set('plzRange', selectedPLZRange);
      if (customPLZ) searchParams.set('plz', customPLZ);
      
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  const handleFilterClick = () => {
    setFilterDialogOpen(true);
  };

  const handleFilterClose = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterApply = () => {
    if (validateFilters()) {
      setFilterDialogOpen(false);
      // Filter wird beim nächsten Suchen angewendet
    }
  };

  const handleFilterReset = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setPriceRange('');
    setSelectedCountry('');
    setSelectedCity('');
    setSelectedPLZRange('');
    setCustomCity('');
    setCustomPLZ('');
    setFilterErrors([]);
    // Clear localStorage
    localStorage.removeItem('kleinanzeigen-filters');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(''); // Reset subcategory when main category changes
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity(''); // Reset city when country changes
    setSelectedPLZRange(''); // Reset PLZ range
    setCustomCity(''); // Reset custom city
    setCustomPLZ(''); // Reset custom PLZ
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedPLZRange(''); // Reset PLZ range when city changes
  };

  // Get subcategories for selected category
  const getSubCategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find(cat => cat.slug === selectedCategory);
    return category?.subcategories || [];
  };

  // Get cities for selected country
  const getCities = () => {
    if (!selectedCountry) return [];
    return countries[selectedCountry as keyof typeof countries]?.cities || [];
  };

  // Get PLZ ranges for selected country
  const getPLZRanges = () => {
    if (!selectedCountry) return [];
    return countries[selectedCountry as keyof typeof countries]?.plzRanges || [];
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          top: 0,
          zIndex: 1100,
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Toolbar sx={{ gap: 1, py: 1.5 }}>
          {/* Left side: Filter icon */}
          <IconButton 
            color="default" 
            aria-label="Filter" 
            sx={{ mr: 1 }}
            onClick={handleFilterClick}
          >
            <IconFilter size={22} color={theme.palette.text.primary} />
          </IconButton>

          {/* Center search bar with start search icon */}
          <Box component="form" onSubmit={handleSearch} sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              inputProps={{ 'aria-label': 'Suche' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: 4,
                  bgcolor: '#ffffff',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'grey.400' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Right side: Notifications icon */}
          <IconButton 
            color="default" 
            aria-label="Benachrichtigungen" 
            sx={{ ml: 0.5 }} 
            onClick={() => navigate('/notifications')}
          >
            <IconNotification size={22} color={theme.palette.text.primary} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Filter Dialog */}
      <Dialog 
        open={filterDialogOpen} 
        onClose={handleFilterClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter anpassen</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Main Category */}
            <FormControl fullWidth>
              <InputLabel>Hauptkategorie</InputLabel>
              <Select
                value={selectedCategory}
                label="Hauptkategorie"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <MenuItem value="">Alle Kategorien</MenuItem>
                                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.slug}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '1.2rem' }}>{getCategoryIcon(category.slug)}</Avatar>
                        {category.name}
                      </Stack>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Sub Category - only show if main category is selected */}
            {selectedCategory && (
              <FormControl fullWidth>
                <InputLabel>Unterkategorie</InputLabel>
                <Select
                  value={selectedSubCategory}
                  label="Unterkategorie"
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                >
                  <MenuItem value="">Alle Unterkategorien</MenuItem>
                                      {getSubCategories().map((subCategory) => (
                      <MenuItem key={subCategory.id} value={subCategory.slug}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '1.2rem' }}>{getSubcategoryIcon(selectedCategory, subCategory.slug)}</Avatar>
                          {subCategory.name}
                        </Stack>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            <Divider />

            {/* Price Range - Custom input fields */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Preisbereich
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Von"
                  value={priceRange.split('-')[0] || ''}
                  onChange={(e) => {
                    const bis = priceRange.split('-')[1] || '';
                    setPriceRange(`${e.target.value}-${bis}`);
                  }}
                  InputProps={{
                    endAdornment: <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>€</Box>
                  }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      height: 40,
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  bis
                </Typography>
                <TextField
                  size="small"
                  placeholder="Bis"
                  value={priceRange.split('-')[1] || ''}
                  onChange={(e) => {
                    const von = priceRange.split('-')[0] || '';
                    setPriceRange(`${von}-${e.target.value}`);
                  }}
                  InputProps={{
                    endAdornment: <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>€</Box>
                  }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      height: 40,
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Location */}
            <FormControl fullWidth>
              <InputLabel>Land</InputLabel>
              <Select
                value={selectedCountry}
                label="Land"
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                <MenuItem value="">Alle Länder</MenuItem>
                {Object.entries(countries).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* City - only show if country is selected */}
            {selectedCountry && (
              <FormControl fullWidth>
                <InputLabel>Stadt</InputLabel>
                <Select
                  value={selectedCity}
                  label="Stadt"
                  onChange={(e) => handleCityChange(e.target.value)}
                >
                  <MenuItem value="">Alle Städte</MenuItem>
                  {getCities().map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

                         {/* Custom City Input */}
             {selectedCountry && (
               <TextField
                 fullWidth
                 size="small"
                 placeholder="z.B. Berlin"
                 value={customCity}
                 onChange={(e) => setCustomCity(e.target.value)}
                 label="Eigene Stadt"
                 sx={{
                   '& .MuiOutlinedInput-root': {
                     height: 40,
                     borderRadius: 4
                   }
                 }}
               />
             )}

                          {/* PLZ Range Dropdown - only show if city is selected */}
             {selectedCountry && selectedCity && (
               <FormControl fullWidth>
                 <InputLabel>PLZ-Bereich</InputLabel>
                 <Select
                   value={selectedPLZRange}
                   label="PLZ-Bereich"
                   onChange={(e) => setSelectedPLZRange(e.target.value)}
                 >
                   <MenuItem value="">Alle PLZ-Bereiche</MenuItem>
                   {getPLZRanges().map((plzRange) => (
                     <MenuItem key={plzRange} value={plzRange}>
                       {plzRange}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             )}

             {/* Custom PLZ Input */}
             {selectedCountry && (
               <TextField
                 fullWidth
                 size="small"
                 placeholder="z.B. 10115"
                 value={customPLZ}
                 onChange={(e) => setCustomPLZ(e.target.value)}
                 label="PLZ"
                 sx={{
                   '& .MuiOutlinedInput-root': {
                     height: 40,
                     borderRadius: 4
                   }
                 }}
               />
             )}

             {/* Error Display */}
             {filterErrors.length > 0 && (
               <Box sx={{ mt: 2 }}>
                 {filterErrors.map((error, index) => (
                   <Typography 
                     key={index} 
                     variant="body2" 
                     color="error" 
                     sx={{ mb: 1, fontSize: '0.875rem' }}
                   >
                     ⚠️ {error}
                   </Typography>
                 ))}
               </Box>
             )}

             {/* Active Filters Display */}
            {(selectedCategory || selectedSubCategory || priceRange || selectedCountry || selectedCity || customCity || customPLZ || selectedPLZRange) && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Aktive Filter:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selectedCategory && (
                    <Chip 
                      label={`Kategorie: ${categories.find(c => c.slug === selectedCategory)?.name}`} 
                      onDelete={() => handleCategoryChange('')}
                      size="small"
                      color="primary"
                    />
                  )}
                  {selectedSubCategory && (
                    <Chip 
                      label={`Unterkategorie: ${getSubCategories().find(s => s.slug === selectedSubCategory)?.name}`} 
                      onDelete={() => setSelectedSubCategory('')}
                      size="small"
                      color="secondary"
                    />
                  )}
                  {priceRange && (
                    <Chip 
                      label={`Preis: ${priceRange}`} 
                      onDelete={() => setPriceRange('')}
                      size="small"
                    />
                  )}
                  {selectedCountry && (
                    <Chip 
                      label={`Land: ${countries[selectedCountry as keyof typeof countries]?.name}`} 
                      onDelete={() => handleCountryChange('')}
                      size="small"
                    />
                  )}
                  {selectedCity && (
                    <Chip 
                      label={`Stadt: ${selectedCity}`} 
                      onDelete={() => setSelectedCity('')}
                      size="small"
                    />
                  )}
                  {customCity && (
                    <Chip 
                      label={`Stadt: ${customCity}`} 
                      onDelete={() => setCustomCity('')}
                      size="small"
                    />
                  )}
                  {customPLZ && (
                    <Chip 
                      label={`PLZ: ${customPLZ}`} 
                      onDelete={() => setCustomPLZ('')}
                      size="small"
                    />
                  )}
                  {selectedPLZRange && (
                    <Chip 
                      label={`PLZ-Bereich: ${selectedPLZRange}`} 
                      onDelete={() => setSelectedPLZRange('')}
                      size="small"
                    />
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleFilterReset} color="inherit">
            Zurücksetzen
          </Button>
          <Button onClick={handleFilterClose} color="inherit">
            Abbrechen
          </Button>
          <Button onClick={handleFilterApply} variant="contained">
            Anwenden
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
