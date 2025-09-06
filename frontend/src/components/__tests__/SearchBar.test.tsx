import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SearchBar } from '../SearchBar';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/services/searchService', () => ({
  searchService: {
    searchListings: jest.fn(),
  },
}));

jest.mock('@/config/categoriesConfig', () => ({
  categories: [
    {
      id: 1,
      name: "Autos",
      slug: "autos",
      description: "Fahrzeuge, Ersatzteile & Zubehör",
      icon: "/images/categories/bmw_156x90_enhanced.png",
      sort_order: 1,
      subcategories: [
        { id: 201, name: "Autos", slug: "autos", parent_id: 1 },
        { id: 202, name: "Motorräder", slug: "motorraeder", parent_id: 1 },
      ]
    },
    {
      id: 2,
      name: "Elektronik",
      slug: "elektronik",
      description: "Smartphones, Laptops & mehr",
      icon: "/images/categories/iphone_electronics_icon.png",
      sort_order: 2,
      subcategories: [
        { id: 101, name: "Smartphones", slug: "smartphones", parent_id: 2 },
        { id: 102, name: "Laptops", slug: "laptops", parent_id: 2 },
      ]
    }
  ],
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
});

const theme = createTheme();

const renderSearchBar = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <SearchBar {...props} />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
    const { searchService } = require('@/services/searchService');
    searchService.searchListings.mockResolvedValue({
      listings: [
        { title: 'iPhone 13' },
        { title: 'Samsung Galaxy' }
      ],
      pagination: { total: 2, page: 1, limit: 5, pages: 1 }
    });
  });

  describe('Basic Rendering', () => {
    it('renders the search bar with logo', () => {
      renderSearchBar();
      
      expect(screen.getByText('Kleinanzeigen')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Suche nach Anzeigen...')).toBeInTheDocument();
      expect(screen.getByText('Suchen')).toBeInTheDocument();
    });

    it('renders category button', () => {
      renderSearchBar();
      
      expect(screen.getByText('Alle Kategorien')).toBeInTheDocument();
    });

    it('renders region button with default region', () => {
      renderSearchBar();
      
      expect(screen.getByText('Deutschland')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('handles search input changes', () => {
      renderSearchBar();
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      
      expect(searchInput).toHaveValue('iPhone');
    });

    it('submits search form', async () => {
      const mockOnSearch = jest.fn();
      renderSearchBar({ onSearch: mockOnSearch });
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      const searchButton = screen.getByText('Suchen');
      
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('iPhone');
        expect(mockNavigate).toHaveBeenCalledWith('/search?q=iPhone');
      });
    });

    it('clears search input', () => {
      renderSearchBar();
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      
      const clearButton = screen.getByTestId('ClearIcon').closest('button');
      fireEvent.click(clearButton!);
      
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Category Menu', () => {
    it('opens category menu on click', () => {
      renderSearchBar();
      
      const categoryButton = screen.getByText('Alle Kategorien');
      fireEvent.click(categoryButton);
      
      expect(screen.getByText('Autos')).toBeInTheDocument();
      expect(screen.getByText('Elektronik')).toBeInTheDocument();
    });

    it('closes category menu when clicking outside', () => {
      renderSearchBar();
      
      const categoryButton = screen.getByText('Alle Kategorien');
      fireEvent.click(categoryButton);
      
      expect(screen.getByText('Autos')).toBeInTheDocument();
      
      fireEvent.mouseDown(document.body);
      
      expect(screen.queryByText('Autos')).not.toBeInTheDocument();
    });

    it('navigates to category page on category click', () => {
      const mockOnCategorySelect = jest.fn();
      renderSearchBar({ onCategorySelect: mockOnCategorySelect });
      
      const categoryButton = screen.getByText('Alle Kategorien');
      fireEvent.click(categoryButton);
      
      const autoCategory = screen.getByText('Autos');
      fireEvent.click(autoCategory);
      
      expect(mockOnCategorySelect).toHaveBeenCalledWith({
        id: 1,
        name: "Autos",
        slug: "autos",
        description: "Fahrzeuge, Ersatzteile & Zubehör",
        icon: "/images/categories/bmw_156x90_enhanced.png",
        sort_order: 1,
        subcategories: [
          { id: 201, name: "Autos", slug: "autos", parent_id: 1 },
          { id: 202, name: "Motorräder", slug: "motorraeder", parent_id: 1 },
        ]
      });
      expect(mockNavigate).toHaveBeenCalledWith('/category/autos');
    });

    it('shows subcategories on hover', async () => {
      renderSearchBar();
      
      const categoryButton = screen.getByText('Alle Kategorien');
      fireEvent.click(categoryButton);
      
      const autoCategory = screen.getByText('Autos');
      fireEvent.mouseEnter(autoCategory);
      
      await waitFor(() => {
        expect(screen.getByText('Alle Autos')).toBeInTheDocument();
        expect(screen.getByText('Motorräder')).toBeInTheDocument();
      });
    });
  });

  describe('Region Selection', () => {
    it('opens region menu on click', () => {
      renderSearchBar();
      
      const regionButton = screen.getByText('Deutschland');
      fireEvent.click(regionButton);
      
      expect(screen.getByText('Bayern')).toBeInTheDocument();
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });

    it('selects region and calls callback', () => {
      const mockOnRegionSelect = jest.fn();
      renderSearchBar({ onRegionSelect: mockOnRegionSelect });
      
      const regionButton = screen.getByText('Deutschland');
      fireEvent.click(regionButton);
      
      const berlinRegion = screen.getByText('Berlin');
      fireEvent.click(berlinRegion);
      
      expect(mockOnRegionSelect).toHaveBeenCalledWith('Berlin');
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });
  });

  describe('Search Suggestions', () => {
    it('shows search history when input is focused and empty', () => {
      localStorageMock.getItem.mockReturnValue('["iPhone", "Laptop"]');
      renderSearchBar();
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      fireEvent.focus(searchInput);
      
      expect(screen.getByText('Suchverlauf')).toBeInTheDocument();
      expect(screen.getByText('iPhone')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    it('shows API suggestions when typing', async () => {
      renderSearchBar();
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      
      await waitFor(() => {
        expect(screen.getByText('Suchergebnisse')).toBeInTheDocument();
        expect(screen.getByText('iPhone 13')).toBeInTheDocument();
        expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
      });
    });

    it('shows trending searches when no API suggestions', async () => {
      const { searchService } = require('@/services/searchService');
      searchService.searchListings.mockResolvedValue({
        listings: [],
        pagination: { total: 0, page: 1, limit: 5, pages: 0 }
      });
      
      renderSearchBar();
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      
      await waitFor(() => {
        expect(screen.getByText('Beliebte Suchen')).toBeInTheDocument();
        expect(screen.getByText('iPhone')).toBeInTheDocument();
      });
    });

    it('handles suggestion click', async () => {
      const mockOnSearch = jest.fn();
      renderSearchBar({ onSearch: mockOnSearch });
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      
      await waitFor(() => {
        const suggestion = screen.getByText('iPhone 13');
        fireEvent.click(suggestion);
        
        expect(mockOnSearch).toHaveBeenCalledWith('iPhone 13');
        expect(mockNavigate).toHaveBeenCalledWith('/search?q=iPhone%2013');
      });
    });
  });

  describe('Search History', () => {
    it('saves search to history', async () => {
      const mockOnSearch = jest.fn();
      renderSearchBar({ onSearch: mockOnSearch });
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      const searchButton = screen.getByText('Suchen');
      
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'searchHistory',
          JSON.stringify(['iPhone'])
        );
      });
    });

    it('limits history to 10 items', async () => {
      const mockOnSearch = jest.fn();
      const longHistory = Array.from({ length: 15 }, (_, i) => `Search${i}`);
      localStorageMock.getItem.mockReturnValue(JSON.stringify(longHistory));
      
      renderSearchBar({ onSearch: mockOnSearch });
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      const searchButton = screen.getByText('Suchen');
      
      fireEvent.change(searchInput, { target: { value: 'NewSearch' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const savedHistory = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(savedHistory).toHaveLength(10);
        expect(savedHistory[0]).toBe('NewSearch');
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner during search', async () => {
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      const { searchService } = require('@/services/searchService');
      searchService.searchListings.mockReturnValue(searchPromise);
      
      renderSearchBar();
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
      });
      
      resolveSearch!({
        listings: [],
        pagination: { total: 0, page: 1, limit: 5, pages: 0 }
      });
    });
  });

  describe('Error Handling', () => {
    it('falls back to trending searches on API error', async () => {
      const { searchService } = require('@/services/searchService');
      searchService.searchListings.mockRejectedValue(new Error('API Error'));
      
      renderSearchBar();
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      
      await waitFor(() => {
        expect(screen.getByText('Beliebte Suchen')).toBeInTheDocument();
        expect(screen.getByText('iPhone')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('shows mobile close button on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      });
      
      renderSearchBar();
      
      const categoryButton = screen.getByText('Alle Kategorien');
      fireEvent.click(categoryButton);
      
      expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      renderSearchBar();
      
      const form = screen.getByRole('button', { name: 'Suchen' }).closest('form');
      expect(form).toBeInTheDocument();
      
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      expect(searchInput).toBeInTheDocument();
      
      const searchButton = screen.getByRole('button', { name: 'Suchen' });
      expect(searchButton).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      renderSearchBar();
      
      expect(screen.getByRole('button', { name: /alle kategorien/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deutschland/i })).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('integrates with all callbacks', async () => {
      const mockOnSearch = jest.fn();
      const mockOnCategorySelect = jest.fn();
      const mockOnRegionSelect = jest.fn();
      
      renderSearchBar({
        onSearch: mockOnSearch,
        onCategorySelect: mockOnCategorySelect,
        onRegionSelect: mockOnRegionSelect,
      });
      
      // Test search
      const searchInput = screen.getByPlaceholderText('Suche nach Anzeigen...');
      const searchButton = screen.getByText('Suchen');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      fireEvent.click(searchButton);
      
      // Test category selection
      const categoryButton = screen.getByText('Alle Kategorien');
      fireEvent.click(categoryButton);
      const autoCategory = screen.getByText('Autos');
      fireEvent.click(autoCategory);
      
      // Test region selection
      const regionButton = screen.getByText('Deutschland');
      fireEvent.click(regionButton);
      const berlinRegion = screen.getByText('Berlin');
      fireEvent.click(berlinRegion);
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('iPhone');
        expect(mockOnCategorySelect).toHaveBeenCalledWith({
          id: 1,
          name: "Autos",
          slug: "autos",
          description: "Fahrzeuge, Ersatzteile & Zubehör",
          icon: "/images/categories/bmw_156x90_enhanced.png",
          sort_order: 1,
          subcategories: [
            { id: 201, name: "Autos", slug: "autos", parent_id: 1 },
            { id: 202, name: "Motorräder", slug: "motorraeder", parent_id: 1 },
          ]
        });
        expect(mockOnRegionSelect).toHaveBeenCalledWith('Berlin');
      });
    });
  });
});
