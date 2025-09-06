import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon, 
  KeyboardArrowDown as ArrowDownIcon,
  GridView as GridIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Build as BuildIcon,
  Checkroom as ClothesIcon,
  Yard as GardenIcon,
  PhoneAndroid as ElectronicsIcon,
  SportsEsports as HobbyIcon,
  Pets as PetsIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  ChildCare as ChildIcon,
  SportsSoccer as SportIcon,
  LocalShipping as TransportIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Clear as ClearIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { categories, type Category as ConfigCategory } from '@/config/categoriesConfig';
import { searchService, type SearchFilters } from '@/services/searchService';
import './SearchBar.css';

interface SearchSuggestion {
  text: string;
  type: 'title' | 'category' | 'location' | 'history' | 'trending' | 'api';
  icon?: React.ReactNode;
  count?: number;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: ConfigCategory) => void;
  onRegionSelect?: (region: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCategorySelect,
  onRegionSelect
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Deutschland');
  const [selectedCategory, setSelectedCategory] = useState<ConfigCategory | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<ConfigCategory | null>(null);
  
  // Auto-Complete States
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>([
    'iPhone', 'Samsung', 'Laptop', 'Auto', 'Wohnung', 'Möbel',
    'Kleidung', 'Sport', 'Bücher', 'Musik', 'Spielzeug', 'Garten'
  ]);
  
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Kategorien werden jetzt aus der Konfiguration geladen
  const [categoriesList] = useState<ConfigCategory[]>(categories);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (regionMenuRef.current && !regionMenuRef.current.contains(event.target as Node)) {
        setIsRegionMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Lade Suchverlauf aus localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Erweiterte Suchvorschläge mit API-Aufrufen
  const fetchSearchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) return [];
    
    try {
      setLoading(true);
      
      // API-Suche für Vorschläge
      const searchFilters: SearchFilters = {
        query: query,
        limit: 5
      };
      
      const results = await searchService.searchListings(searchFilters);
      
      // Erstelle Vorschläge aus den Suchergebnissen
      const apiSuggestions: SearchSuggestion[] = (results.listings as unknown[]).map((listing: unknown) => ({
        text: String((listing as Record<string, unknown>).title || ''),
        type: 'api' as const,
        icon: <SearchIcon fontSize="small" />,
        count: results.pagination.total
      }));
      
      // Kombiniere mit Trending-Suchen
      const trendingMatches = trendingSearches
        .filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .map(term => ({
          text: term,
          type: 'trending' as const,
          icon: <TrendingUpIcon fontSize="small" />
        }));
      
      // Entferne Duplikate und kombiniere
      const allSuggestions = [...apiSuggestions, ...trendingMatches];
      const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
      );
      
      return uniqueSuggestions.slice(0, 8);
    } catch (error) {
      console.error('Fehler beim Laden der Suchvorschläge:', error);
      // Fallback zu Mock-Vorschlägen
      return trendingSearches
        .filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .map(term => ({
          text: term,
          type: 'trending' as const,
          icon: <TrendingUpIcon fontSize="small" />
        }));
    } finally {
      setLoading(false);
    }
  }, [trendingSearches]);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      const newSuggestions = await fetchSearchSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    }, 300);
  }, [searchQuery, fetchSearchSuggestions]);

  // Suchverlauf speichern
  const saveToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery.trim());
      onSearch?.(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    saveToHistory(suggestion.text);
    onSearch?.(suggestion.text);
    navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2 || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Verzögerung, damit Klicks auf Vorschläge funktionieren
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleCategoryClick = (category: ConfigCategory) => {
    setSelectedCategory(category);
    onCategorySelect?.(category);
    navigate(`/category/${category.slug}`);
    setIsCategoryMenuOpen(false);
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    onRegionSelect?.(region);
    setIsRegionMenuOpen(false);
  };

  // Verzögertes Schließen der Unterkategorien
  const handleCategoryMouseEnter = (category: ConfigCategory) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredCategory(category);
  };

  const handleCategoryMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 500); // 500ms Verzögerung für bessere UX
  };

  const regions = [
    'Deutschland',
    'Bayern',
    'Berlin',
    'Hamburg',
    'Hessen',
    'Niedersachsen',
    'Nordrhein-Westfalen',
    'Sachsen',
    'Thüringen'
  ];

  // Funktion um passende Icons für Kategorien zu bekommen
  const getCategoryIcon = (categorySlug: string) => {
    switch (categorySlug) {
      case 'elektronik':
        return <ElectronicsIcon className="category-icon-material electronics" />;
      case 'auto-motorrad':
        return <CarIcon className="category-icon-material auto" />;
      case 'immobilien':
        return <ApartmentIcon className="category-icon-material real-estate" />;
      case 'haus-garten':
        return <GardenIcon className="category-icon-material garden" />;
      case 'mode-beauty':
        return <ClothesIcon className="category-icon-material fashion" />;
      case 'sport-freizeit':
        return <SportIcon className="category-icon-material sport" />;
      case 'familie-kind-baby':
        return <ChildIcon className="category-icon-material family" />;
      case 'tiere':
        return <PetsIcon className="category-icon-material pets" />;
      case 'jobs-business':
        return <WorkIcon className="category-icon-material jobs" />;
      case 'dienstleistungen':
        return <BuildIcon className="category-icon-material services" />;
      default:
        return <GridIcon className="category-icon-material" />;
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        {/* Logo */}
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-icon">
            <div className="logo-dot logo-dot-1"></div>
            <div className="logo-dot logo-dot-2"></div>
          </div>
          <span className="logo-text">Kleinanzeigen</span>
        </div>

        {/* Kategorie Button */}
        <div className="category-button-container" ref={categoryMenuRef}>
          <button
            className={`category-button ${isCategoryMenuOpen ? 'active' : ''}`}
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
          >
            <GridIcon className="category-icon" />
            <span>Alle Kategorien</span>
            <ArrowDownIcon className={`arrow-icon ${isCategoryMenuOpen ? 'rotated' : ''}`} />
          </button>

          {/* Kategorie Dropdown */}
          {isCategoryMenuOpen && (
            <div className="category-dropdown">
              <div className="category-menu">
                {/* Mobile Close Button */}
                <button
                  className="mobile-close-button"
                  onClick={() => setIsCategoryMenuOpen(false)}
                  style={{ 
                    display: window.innerWidth <= 768 ? 'flex' : 'none'
                  }}
                >
                  <CloseIcon />
                </button>
                
                {/* Linke Spalte - Hauptkategorien */}
                <div className="main-categories">
                  {categoriesList.map((category) => (
                     <div
                       key={category.id}
                       className={`main-category-item ${hoveredCategory?.id === category.id ? 'hovered' : ''}`}
                       onMouseEnter={() => handleCategoryMouseEnter(category)}
                       onMouseLeave={handleCategoryMouseLeave}
                       onClick={() => handleCategoryClick(category)}
                     >
                       <div className="category-icon-container">
                         {getCategoryIcon(category.slug)}
                       </div>
                       <span className="category-name">{category.name}</span>
                       <ArrowDownIcon className="category-arrow" />
                     </div>
                  ))}
                </div>

                {/* Rechte Spalte - Unterkategorien */}
                <div 
                  className="subcategories"
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                      hoverTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  {hoveredCategory && (
                    <div className="subcategory-section">
                      <h3 className="subcategory-title">{hoveredCategory.name}</h3>
                      <div className="subcategory-grid">
                        {/* "Alle" Option */}
                        <div 
                          className="subcategory-item"
                          onClick={() => {
                            navigate(`/category/${hoveredCategory.slug}`);
                            setIsCategoryMenuOpen(false);
                          }}
                        >
                          <span>Alle {hoveredCategory.name}</span>
                        </div>
                        {/* Echte Unterkategorien */}
                        {hoveredCategory.subcategories && hoveredCategory.subcategories.map((subcategory) => (
                          <div 
                            key={subcategory.id} 
                            className="subcategory-item"
                            onClick={() => {
                              navigate(`/category/${hoveredCategory.slug}/${subcategory.slug}`);
                              setIsCategoryMenuOpen(false);
                            }}
                          >
                            <span>{subcategory.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Services Spalte */}
                <div className="services-section">
                  <h3 className="services-title">Services</h3>
                  <div className="services-list">
                    <div className="service-item">
                      <span>Kategorie-Übersicht</span>
                    </div>
                    <div className="service-item">
                      <span>Beliebte Anzeigen</span>
                    </div>
                    <div className="service-item">
                      <span>Neue Anzeigen</span>
                    </div>
                    <div className="service-item">
                      <span>Hilfe & Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suchformular */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <SearchIcon className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Suche nach Anzeigen..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            {loading && (
              <div className="search-loading">
                <div className="loading-spinner"></div>
              </div>
            )}
            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  searchInputRef.current?.focus();
                }}
              >
                <ClearIcon fontSize="small" />
              </button>
            )}
          </div>
          <button type="submit" className="search-button">
            Suchen
          </button>
        </form>

        {/* Auto-Complete Dropdown */}
        {showSuggestions && (
          <div className="search-suggestions">
            {/* Suchverlauf */}
            {searchHistory.length > 0 && searchQuery.length < 2 && (
              <div className="suggestion-group">
                <div className="suggestion-group-header">
                  <HistoryIcon fontSize="small" />
                  <span>Suchverlauf</span>
                </div>
                {searchHistory.slice(0, 5).map((term, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick({ text: term, type: 'history' })}
                  >
                    <HistoryIcon fontSize="small" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            )}

            {/* API-Vorschläge */}
            {suggestions.length > 0 && (
              <div className="suggestion-group">
                <div className="suggestion-group-header">
                  <SearchIcon fontSize="small" />
                  <span>Suchergebnisse</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.icon || <SearchIcon fontSize="small" />}
                    <span>{suggestion.text}</span>
                    {suggestion.count && (
                      <span className="suggestion-count">({suggestion.count})</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Trending Searches (nur wenn keine API-Vorschläge vorhanden) */}
            {suggestions.length === 0 && searchQuery.length >= 2 && (
              <div className="suggestion-group">
                <div className="suggestion-group-header">
                  <TrendingUpIcon fontSize="small" />
                  <span>Beliebte Suchen</span>
                </div>
                {trendingSearches
                  .filter(term => term.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map((term, index) => (
                    <div
                      key={index}
                      className="suggestion-item trending"
                      onClick={() => handleSuggestionClick({ text: term, type: 'trending' })}
                    >
                      <TrendingUpIcon fontSize="small" />
                      <span>{term}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Region Button */}
        <div className="region-button-container" ref={regionMenuRef}>
          <button
            className={`region-button ${isRegionMenuOpen ? 'active' : ''}`}
            onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
          >
            <LocationIcon className="location-icon" />
            <span>{selectedRegion}</span>
            <ArrowDownIcon className={`arrow-icon ${isRegionMenuOpen ? 'rotated' : ''}`} />
          </button>

          {/* Region Dropdown */}
          {isRegionMenuOpen && (
            <div className="region-dropdown">
              {regions.map((region) => (
                <div
                  key={region}
                  className={`region-item ${selectedRegion === region ? 'selected' : ''}`}
                  onClick={() => handleRegionSelect(region)}
                >
                  {region}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 