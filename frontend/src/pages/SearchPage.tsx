import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Checkbox,
  Button,
  Pagination,
  Switch,
  Paper,
  Autocomplete,
  TextField,
  InputAdornment,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Euro as EuroIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as ShippingIcon,
  Handshake as NegotiableIcon,
  VerifiedUser as VerifiedIcon,
  Image as ImageIcon,
  CalendarToday as DateIcon,
  Business as BusinessIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { searchService, type SearchFilters, type SearchResponse } from '@/services/searchService';
import { categories } from '@/config/categoriesConfig';
import type { Ad } from '@/services/adService';
import AdCard from '@/components/AdCard';

interface LocalSearchFilters {
  query: string;
  category: string;
  subcategory: string;
  location: string;
  priceMin: number;
  priceMax: number;
  condition: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onlyVerified: boolean;
  onlyWithImages: boolean;
  radius: number;
  // Neue erweiterte Filter
  dateRange: string;
  status: string[];
  sellerType: string;
  hasWarranty: boolean;
  negotiable: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
}

const initialFilters: LocalSearchFilters = {
  query: '',
  category: '',
  subcategory: '',
  location: '',
  priceMin: 0,
  priceMax: 10000,
  condition: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
  onlyVerified: false,
  onlyWithImages: false,
  radius: 50,
  // Neue Filter Initialisierung
  dateRange: '',
  status: [],
  sellerType: '',
  hasWarranty: false,
  negotiable: false,
  deliveryAvailable: false,
  pickupAvailable: false
};

const conditions = ['Neu', 'Gebraucht', 'Defekt'];
const dateRanges = [
  { value: 'today', label: 'Heute' },
  { value: 'week', label: 'Letzte Woche' },
  { value: 'month', label: 'Letzter Monat' },
  { value: '3months', label: 'Letzte 3 Monate' }
];
const sellerTypes = [
  { value: 'private', label: 'Privat', icon: <PersonIcon /> },
  { value: 'business', label: 'Gewerblich', icon: <BusinessIcon /> },
  { value: 'verified', label: 'Verifiziert', icon: <VerifiedIcon /> }
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<LocalSearchFilters>(initialFilters);
  const [searchResults, setSearchResults] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>([
    'iPhone', 'Samsung', 'Laptop', 'Auto', 'Wohnung', 'Möbel',
    'Kleidung', 'Sport', 'Bücher', 'Musik', 'Spielzeug', 'Garten'
  ]);

  // Lade Suchverlauf
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // URL-Parameter in Filter umwandeln
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const condition = searchParams.get('condition')?.split(',') || [];
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    
    // Neue erweiterte Filter
    const dateRange = searchParams.get('dateRange') || '';
    const status = searchParams.get('status')?.split(',') || [];
    const sellerType = searchParams.get('sellerType') || '';
    const onlyVerified = searchParams.get('onlyVerified') === 'true';
    const onlyWithImages = searchParams.get('onlyWithImages') === 'true';
    const hasWarranty = searchParams.get('hasWarranty') === 'true';
    const negotiable = searchParams.get('negotiable') === 'true';
    const deliveryAvailable = searchParams.get('deliveryAvailable') === 'true';
    const pickupAvailable = searchParams.get('pickupAvailable') === 'true';

    setFilters(prev => ({
      ...prev,
      query,
      category,
      location,
      priceMin: priceMin ? parseInt(priceMin) : prev.priceMin,
      priceMax: priceMax ? parseInt(priceMax) : prev.priceMax,
      condition,
      sortBy,
      sortOrder,
      onlyVerified,
      onlyWithImages,
      dateRange,
      status,
      sellerType,
      hasWarranty,
      negotiable,
      deliveryAvailable,
      pickupAvailable
    }));

    setCurrentPage(page);
  }, [searchParams]);

  // Suchverlauf speichern
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Filter für API vorbereiten
  const getApiFilters = (): SearchFilters => ({
    query: filters.query,
    category: filters.category,
    subcategory: filters.subcategory,
    location: filters.location,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    condition: filters.condition,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    onlyVerified: filters.onlyVerified,
    onlyWithImages: filters.onlyWithImages,
    page: currentPage,
    limit: 20,
    // Neue erweiterte Filter
    dateRange: filters.dateRange,
    status: filters.status,
    sellerType: filters.sellerType,
    hasWarranty: filters.hasWarranty,
    negotiable: filters.negotiable,
    deliveryAvailable: filters.deliveryAvailable,
    pickupAvailable: filters.pickupAvailable
  });

  // Suche ausführen
  const performSearch = async (apiFilters: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      

      
      const results: SearchResponse = await searchService.searchListings(apiFilters);
      

      
      // Sicherstellen dass results.listings existiert
      if (!results || !results.listings) {
        throw new Error('Keine Suchergebnisse erhalten');
      }
      
      // Konvertiere zu Ad-Format
      const ads: Ad[] = (results.listings as unknown[]).map((listing: unknown) => ({
        id: (listing as Record<string, unknown>).id as string,
        title: (listing as Record<string, unknown>).title as string,
        description: (listing as Record<string, unknown>).description as string,
        price: (listing as Record<string, unknown>).price as number,
        category: (listing as Record<string, unknown>).category as string,
        location: (listing as Record<string, unknown>).location as string,
        images: (listing as Record<string, unknown>).images as string[],
        userId: (listing as Record<string, unknown>).userId as string,
        createdAt: (listing as Record<string, unknown>).createdAt as string,
        updatedAt: (listing as Record<string, unknown>).createdAt as string, // Fallback für updatedAt
        condition: (listing as Record<string, unknown>).condition as string,
        status: (listing as Record<string, unknown>).status as "active" | "expired" | "inactive" | "sold" | "pending" | "deleted",
        contactInfo: {} // Leeres Objekt als Fallback
      }));
      
      setSearchResults(ads);
      setTotalResults(results.pagination?.total || ads.length);
      

      
      // Suchverlauf speichern
      if (filters.query.trim()) {
        saveToHistory(filters.query.trim());
      }
      
    } catch (err) {
      console.error('SearchPage: Suchfehler:', err);
      setError(`Fehler bei der Suche: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Suche bei Filter-Änderungen
  useEffect(() => {
    const apiFilters = getApiFilters();
    if (filters.query || filters.category || filters.location) {
      performSearch(apiFilters);
    }
  }, [filters, currentPage]);

  // Filter ändern
  const handleFilterChange = (key: keyof LocalSearchFilters, value: string | number | boolean | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Zurück zur ersten Seite
  };

  // Filter zurücksetzen
  const clearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
    // URL-Parameter auch zurücksetzen
    setSearchParams({});
  };

  // Unterkategorien für ausgewählte Kategorie
  const getSubcategories = () => {
    const category = categories.find(c => c.slug === filters.category);
    return category?.subcategories || [];
  };

  // Seitenwechsel
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Aktive Filter zählen
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.location) count++;
    if (filters.priceMin > 0 || filters.priceMax < 10000) count++;
    if (filters.condition.length > 0) count++;
    if (filters.onlyVerified) count++;
    if (filters.onlyWithImages) count++;
    if (filters.dateRange) count++;
    if (filters.status.length > 0) count++;
    if (filters.sellerType) count++;
    if (filters.hasWarranty) count++;
    if (filters.negotiable) count++;
    if (filters.deliveryAvailable) count++;
    if (filters.pickupAvailable) count++;
    return count;
  }, [filters]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Suchergebnisse
        </Typography>
        {filters.query && (
          <Typography variant="body1" color="text.secondary">
            Suche nach: "{filters.query}"
          </Typography>
        )}
        {totalResults > 0 && (
          <Typography variant="body2" color="text.secondary">
            {totalResults} Ergebnis{totalResults !== 1 ? 'se' : ''} gefunden
          </Typography>
        )}
      </Box>

      {/* Erweiterte Suchleiste */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Autocomplete
              freeSolo
              options={[...searchHistory, ...trendingSearches]}
              value={filters.query}
              onChange={(_: unknown, newValue: string | null) => {
                if (typeof newValue === 'string') {
                  handleFilterChange('query', newValue);
                }
              }}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="Was suchen Sie?"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'divider',
                      },
                      '&:hover fieldset': {
                        borderColor: 'text.secondary',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              renderOption={(props: any, option: string) => {
                const isHistory = searchHistory.includes(option);
                return (
                  <ListItem {...props}>
                    <ListItemIcon>
                      {isHistory ? <HistoryIcon fontSize="small" sx={{ color: '#718096' }} /> : <TrendingUpIcon fontSize="small" sx={{ color: '#718096' }} />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={option}
                      secondary={isHistory ? 'Aus Suchverlauf' : 'Beliebte Suche'}
                    />
                  </ListItem>
                );
              }}
              groupBy={(option: string) => {
                return searchHistory.includes(option) ? 'Suchverlauf' : 'Beliebte Suchen';
              }}
            />
          </Box>
          
          <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <TextField
              fullWidth
              placeholder="Standort"
              value={filters.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('location', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon sx={{ color: '#718096' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <Tooltip title="Filter">
              <Badge badgeContent={activeFiltersCount} color="primary">
                <Button
                  variant={showFilters ? "contained" : "outlined"}
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterIcon />}
                >
                  Filter
                </Button>
              </Badge>
            </Tooltip>
            
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Zurücksetzen
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Erweiterte Filter */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Erweiterte Filter
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Kategorie & Unterkategorie */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Kategorie</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Kategorie"
                  >
                    <MenuItem value="">Alle Kategorien</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.slug} value={category.slug}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Unterkategorie</InputLabel>
                  <Select
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    label="Unterkategorie"
                    disabled={!filters.category}
                  >
                    <MenuItem value="">Alle Unterkategorien</MenuItem>
                    {getSubcategories().map((subcategory) => (
                      <MenuItem key={subcategory.slug} value={subcategory.slug}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Preisbereich */}
            <Box sx={{ flex: '1 1 100%' }}>
              <Typography gutterBottom>Preisbereich</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={[filters.priceMin, filters.priceMax]}
                  onChange={(_, newValue) => {
                    handleFilterChange('priceMin', newValue[0]);
                    handleFilterChange('priceMax', newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10000}
                  step={100}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">{filters.priceMin}€</Typography>
                  <Typography variant="body2">{filters.priceMax}€</Typography>
                </Box>
              </Box>
            </Box>

            {/* Zustand */}
            <Box sx={{ flex: '1 1 100%' }}>
              <FormControl fullWidth>
                <InputLabel>Zustand</InputLabel>
                <Select
                  multiple
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value as string[])}
                  label="Zustand"
                >
                  {conditions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Erweiterte Optionen */}
            <Box sx={{ flex: '1 1 100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Erweiterte Optionen
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.onlyVerified}
                        onChange={(e) => handleFilterChange('onlyVerified', e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedIcon fontSize="small" />
                        Nur verifizierte Verkäufer
                      </Box>
                    }
                  />
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.onlyWithImages}
                        onChange={(e) => handleFilterChange('onlyWithImages', e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon fontSize="small" />
                        Nur mit Bildern
                      </Box>
                    }
                  />
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.negotiable}
                        onChange={(e) => handleFilterChange('negotiable', e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NegotiableIcon fontSize="small" />
                        Preis verhandelbar
                      </Box>
                    }
                  />
                </Box>
                
                <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.deliveryAvailable}
                        onChange={(e) => handleFilterChange('deliveryAvailable', e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShippingIcon fontSize="small" />
                        Versand möglich
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </Box>

            {/* Zeitraum & Verkäufertyp */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Zeitraum</InputLabel>
                  <Select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    label="Zeitraum"
                  >
                    <MenuItem value="">Alle Zeiträume</MenuItem>
                    {dateRanges.map((range) => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Verkäufertyp</InputLabel>
                  <Select
                    value={filters.sellerType}
                    onChange={(e) => handleFilterChange('sellerType', e.target.value)}
                    label="Verkäufertyp"
                  >
                    <MenuItem value="">Alle Verkäufer</MenuItem>
                    {sellerTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Suchergebnisse */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : searchResults.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Keine Ergebnisse gefunden
          </Typography>
          <Typography color="text.secondary">
            Versuchen Sie andere Suchbegriffe oder erweitern Sie Ihre Filter.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Sortierung */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {totalResults} Ergebnis{totalResults !== 1 ? 'se' : ''} • Seite {currentPage}
            </Typography>
            
            <FormControl size="small">
              <InputLabel>Sortierung</InputLabel>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder as 'asc' | 'desc');
                }}
                label="Sortierung"
              >
                <MenuItem value="createdAt-desc">Neueste zuerst</MenuItem>
                <MenuItem value="createdAt-asc">Älteste zuerst</MenuItem>
                <MenuItem value="price-asc">Preis: Niedrig zu Hoch</MenuItem>
                <MenuItem value="price-desc">Preis: Hoch zu Niedrig</MenuItem>
                <MenuItem value="title-asc">Titel: A-Z</MenuItem>
                <MenuItem value="title-desc">Titel: Z-A</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Ergebnisliste */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(6, 1fr)' }, 
              gap: '16px',
              justifyContent: 'center'
            }}>
              {searchResults.map((ad: Ad) => (
                <Box key={ad.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <AdCard 
                    {...ad}
                  />
                </Box>
              ))}
            </Box>

          {/* Pagination */}
          {totalResults > 20 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(totalResults / 20)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}; 
