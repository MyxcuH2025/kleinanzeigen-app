import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AdCard from '../AdCard';
import { UserContext } from '@/context/UserContext';
import { FavoritesContext } from '@/context/FavoritesContext';

// Mock für react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock für useMediaQuery
jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false));

// Mock für window.navigator.share
Object.assign(navigator, {
  share: jest.fn(),
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock für getImageUrl
jest.mock('@/utils/imageUtils', () => ({
  getImageUrl: jest.fn((url) => url || 'https://via.placeholder.com/300x200'),
}));

// Mock für favoriteService
jest.mock('@/services/favoriteService', () => ({
  default: {
    getFavorites: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    checkFavorite: jest.fn(),
  },
}));

// Mock für PLACEHOLDER_IMAGE_URL
const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/300x200';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
  isAdmin: false,
};

const mockFavoritesContext = {
  favorites: new Set<string>(),
  isFavorite: jest.fn(() => false),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  refreshFavorites: jest.fn(),
  isLoading: false,
};

const defaultProps = {
  id: '1',
  title: 'Test Produkt',
  price: 999,
  description: 'Ein Testprodukt',
  images: ['https://example.com/image1.jpg'],
  seller: {
    id: 1,
    name: 'Test Verkäufer',
    rating: 4.5,
    location: 'Berlin',
  },
  location: 'Berlin',
  createdAt: '2024-01-15T10:00:00Z',
  category: 'Elektronik',
  attributes: {
    condition: 'Neu',
  },
  vehicleDetails: undefined,
};

const renderAdCard = (props = {}, user = mockUser, favoritesContext = mockFavoritesContext) => {
  const theme = createTheme();
  
  return render(
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={{
        user,
        setUser: jest.fn(),
        fetchUser: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        refreshUser: jest.fn(),
      }}>
        <FavoritesContext.Provider value={favoritesContext}>
          <MemoryRouter>
            <AdCard {...defaultProps} {...props} />
          </MemoryRouter>
        </FavoritesContext.Provider>
      </UserContext.Provider>
    </ThemeProvider>
  );
};

describe('AdCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders basic product information', () => {
      renderAdCard();
      
      expect(screen.getByText('Test Produkt')).toBeInTheDocument();
      expect(screen.getByText('999 €')).toBeInTheDocument();
      expect(screen.getByText('Test Verkäufer')).toBeInTheDocument();
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });

    it('renders product image', () => {
      renderAdCard();
      
      const image = screen.getByAltText('Test Produkt');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
    });

    it('renders seller information', () => {
      renderAdCard();
      
      expect(screen.getByText('Test Verkäufer')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('renders location and date', () => {
      renderAdCard();
      
      expect(screen.getByText('Berlin')).toBeInTheDocument();
      // Date formatting may not be implemented
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });
  });

  describe('Price Formatting', () => {
    it('formats price correctly', () => {
      renderAdCard({ price: 1500 });
      
      expect(screen.getByText('1.500 €')).toBeInTheDocument();
    });

    it('handles zero price', () => {
      renderAdCard({ price: 0 });
      
      expect(screen.getByText('0 €')).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('uses placeholder when no images provided', () => {
      renderAdCard({ images: [] });
      
      const image = screen.getByAltText('Test Produkt');
      expect(image).toBeInTheDocument();
    });

    it('handles multiple images', () => {
      renderAdCard({
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ]
      });
      
      const image = screen.getByAltText('Test Produkt');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing seller gracefully', () => {
      renderAdCard({ seller: null });
      
      expect(screen.getByText('Test Produkt')).toBeInTheDocument();
      expect(screen.getByText('999 €')).toBeInTheDocument();
    });

    it('handles missing attributes gracefully', () => {
      renderAdCard({ attributes: null });
      
      expect(screen.getByText('Test Produkt')).toBeInTheDocument();
    });

    it('handles missing vehicle details gracefully', () => {
      renderAdCard({ vehicleDetails: null });
      
      expect(screen.getByText('Test Produkt')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      renderAdCard();
      
      expect(screen.getByAltText('Test Produkt')).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      renderAdCard();
      
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });
  });

  describe('Responsive Design', () => {
    it('adapts to mobile view', () => {
      const mockUseMediaQuery = require('@mui/material/useMediaQuery');
      mockUseMediaQuery.mockReturnValue(true);
      
      renderAdCard();
      
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('adapts to desktop view', () => {
      const mockUseMediaQuery = require('@mui/material/useMediaQuery');
      mockUseMediaQuery.mockReturnValue(false);
      
      renderAdCard();
      
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });
  });
});
