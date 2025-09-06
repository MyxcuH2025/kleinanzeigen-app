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
  Store as StoreIcon
} from '@mui/icons-material';
import { categories, type Category as ConfigCategory } from '@/config/categoriesConfig';
import './HomeSearchBar.css';

interface SearchSuggestion {
  text: string;
  type: 'title' | 'category' | 'location' | 'history' | 'trending';
  icon?: React.ReactNode;
}

interface HomeSearchBarProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: ConfigCategory) => void;
  onRegionSelect?: (region: string) => void;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
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

  // Debounced search suggestions
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      setLoading(true);
      debounceTimeoutRef.current = setTimeout(() => {
        // Mock suggestions based on query
        const mockSuggestions: SearchSuggestion[] = [
          { text: `${searchQuery} in ${selectedRegion}`, type: 'location' },
          { text: `${searchQuery} - Neu`, type: 'title' },
          { text: `${searchQuery} - Günstig`, type: 'title' },
          { text: `${searchQuery} - Top Zustand`, type: 'title' }
        ];
        setSuggestions(mockSuggestions);
        setLoading(false);
      }, 300);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  }, [searchQuery, selectedRegion]);

  const saveToHistory = useCallback((query: string) => {
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
      return newHistory;
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery.trim());
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    saveToHistory(suggestion.text);
    if (onSearch) {
      onSearch(suggestion.text);
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
    }
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleCategoryClick = (category: ConfigCategory) => {
    setSelectedCategory(category);
    setIsCategoryMenuOpen(false);
    if (onCategorySelect) {
      onCategorySelect(category);
    } else {
      navigate(`/category/${category.slug}`);
    }
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setIsRegionMenuOpen(false);
    if (onRegionSelect) {
      onRegionSelect(region);
    }
  };

  const handleCategoryMouseEnter = (category: ConfigCategory) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(category);
    }, 150);
  };

  const handleCategoryMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(null);
  };

  // Mock data for regions
  const regions = [
    'Deutschland', 'Bayern', 'Berlin', 'Hamburg', 'Hessen', 'Niedersachsen',
    'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
    'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
  ];

  const getCategoryIcon = (categorySlug: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'autos': <CarIcon />,
      'kleinanzeigen': <StoreIcon />,
      'elektronik': <ElectronicsIcon />,
      'haus-garten': <GardenIcon />,
      'mode-beauty': <ClothesIcon />,
      'sport-freizeit': <SportIcon />,
      'familie-kind-baby': <ChildIcon />,
      'jobs-business': <WorkIcon />
    };
    return iconMap[categorySlug] || <GridIcon />;
  };

  return (
    <div className="home-search-container">
      <div className="home-search-bar">
        {/* Kategorie Button */}
        <div className="home-category-button-container" ref={categoryMenuRef}>
          <button
            className={`home-category-button ${isCategoryMenuOpen ? 'active' : ''}`}
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            onMouseEnter={() => handleCategoryMouseEnter(selectedCategory || categoriesList[0])}
            onMouseLeave={handleCategoryMouseLeave}
          >
            <span className="home-category-icon">
              {selectedCategory ? getCategoryIcon(selectedCategory.slug) : <GridIcon />}
            </span>
            <span>{selectedCategory ? selectedCategory.name : 'Alle Kategorien'}</span>
            <span className={`home-arrow-icon ${isCategoryMenuOpen ? 'rotated' : ''}`}>
              <ArrowDownIcon />
            </span>
          </button>

          {/* Kategorie Dropdown */}
          {isCategoryMenuOpen && (
            <div className="home-category-dropdown">
              <div className="home-category-menu">
                <div className="home-main-categories">
                  {categoriesList.map((category) => (
                    <div
                      key={category.slug}
                      className={`home-main-category ${hoveredCategory?.slug === category.slug ? 'hovered' : ''} ${selectedCategory?.slug === category.slug ? 'selected' : ''}`}
                      onClick={() => handleCategoryClick(category)}
                      onMouseEnter={() => handleCategoryMouseEnter(category)}
                      onMouseLeave={handleCategoryMouseLeave}
                    >
                      <span className="home-category-icon">
                        {getCategoryIcon(category.slug)}
                      </span>
                      <span>{category.name}</span>
                    </div>
                  ))}
                </div>

                <div className="home-subcategories">
                  <h3>Beliebte Unterkategorien</h3>
                  <div className="home-subcategory-list">
                    {hoveredCategory?.subcategories?.slice(0, 8).map((subcategory) => (
                      <div
                        key={subcategory.slug}
                        className="home-subcategory-item"
                        onClick={() => {
                          handleCategoryClick(hoveredCategory);
                          navigate(`/category/${hoveredCategory.slug}/${subcategory.slug}`);
                        }}
                      >
                        {subcategory.name}
                      </div>
                    )) || (
                      <>
                        <div className="home-subcategory-item">Elektronik</div>
                        <div className="home-subcategory-item">Möbel</div>
                        <div className="home-subcategory-item">Kleidung</div>
                        <div className="home-subcategory-item">Sport</div>
                        <div className="home-subcategory-item">Bücher</div>
                        <div className="home-subcategory-item">Spielzeug</div>
                        <div className="home-subcategory-item">Garten</div>
                        <div className="home-subcategory-item">Auto</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="home-services-section">
                  <h3>Services</h3>
                  <div className="home-service-items">
                    <div className="home-service-item">
                      <HomeIcon />
                      <span>Immobilien</span>
                    </div>
                    <div className="home-service-item">
                      <WorkIcon />
                      <span>Jobs</span>
                    </div>
                    <div className="home-service-item">
                      <BuildIcon />
                      <span>Dienstleistungen</span>
                    </div>
                    <div className="home-service-item">
                      <TransportIcon />
                      <span>Transport</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suchformular */}
        <form className="home-search-form" onSubmit={handleSearch}>
          <div className="home-search-input-container">
            <SearchIcon className="home-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="home-search-input"
              placeholder="Suche nach Anzeigen..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            {loading && (
              <div className="home-search-loading">
                <div className="home-loading-spinner"></div>
              </div>
            )}
            {searchQuery && (
              <button type="button" className="home-search-clear" onClick={() => { setSearchQuery(''); setSuggestions([]); searchInputRef.current?.focus(); }}>
                <ClearIcon fontSize="small" />
              </button>
            )}
          </div>
          <button type="submit" className="home-search-button">
            Suchen
          </button>
        </form>

        {/* Auto-Complete Dropdown */}
        {showSuggestions && (
          <div className="home-search-suggestions">
            {/* Suchverlauf */}
            {searchHistory.length > 0 && searchQuery.length < 2 && (
              <div className="home-suggestion-group">
                <div className="home-suggestion-group-header">
                  <HistoryIcon />
                  <span>Suchverlauf</span>
                </div>
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    className="home-suggestion-item"
                    onClick={() => handleSuggestionClick({ text: item, type: 'history' })}
                  >
                    <HistoryIcon />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* API-Vorschläge */}
            {suggestions.length > 0 && (
              <div className="home-suggestion-group">
                <div className="home-suggestion-group-header">
                  <SearchIcon />
                  <span>Vorschläge</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="home-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <SearchIcon />
                    <span>{suggestion.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {searchQuery.length < 2 && (
              <div className="home-suggestion-group">
                <div className="home-suggestion-group-header">
                  <TrendingUpIcon />
                  <span>Trending</span>
                </div>
                {trendingSearches.slice(0, 6).map((term, index) => (
                  <div
                    key={index}
                    className="home-suggestion-item"
                    onClick={() => handleSuggestionClick({ text: term, type: 'trending' })}
                  >
                    <TrendingUpIcon />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Region Button */}
        <div className="home-region-button-container" ref={regionMenuRef}>
          <button
            className={`home-region-button ${isRegionMenuOpen ? 'active' : ''}`}
            onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
          >
            <span className="home-location-icon">
              <LocationIcon />
            </span>
            <span>{selectedRegion}</span>
            <span className={`home-arrow-icon ${isRegionMenuOpen ? 'rotated' : ''}`}>
              <ArrowDownIcon />
            </span>
          </button>

          {/* Region Dropdown */}
          {isRegionMenuOpen && (
            <div className="home-region-dropdown">
              {regions.map((region) => (
                <div
                  key={region}
                  className={`home-region-item ${selectedRegion === region ? 'selected' : ''}`}
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