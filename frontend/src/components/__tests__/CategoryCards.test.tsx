import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CategoryCards } from '../CategoryCards';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

const theme = createTheme();

const mockCategories = [
  {
    id: 1,
    name: 'Elektronik',
    slug: 'elektronik',
    icon: '/images/categories/iphone_electronics_icon.png',
    color: '#000000',
    bgColor: '#ffffff'
  },
  {
    id: 2,
    name: 'Haus & Garten',
    slug: 'haus-garten',
    icon: '/images/categories/Haus.png',
    color: '#000000',
    bgColor: '#ffffff'
  },
  {
    id: 3,
    name: 'Mode & Beauty',
    slug: 'mode-beauty',
    icon: '/images/categories/Mode.png',
    color: '#000000',
    bgColor: '#ffffff'
  }
];

const renderCategoryCards = (props: { theme: 'kleinanzeigen' | 'autos' } = { theme: 'kleinanzeigen' }) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <CategoryCards {...props} />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('CategoryCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Loading State', () => {
    it('shows loading spinner initially', () => {
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
      
      renderCategoryCards({ theme: 'kleinanzeigen' });
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('fetches categories from correct API endpoint for kleinanzeigen theme', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories })
      });

      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/categories/kleinanzeigen');
      });
    });

    it('fetches categories from correct API endpoint for autos theme', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories })
      });

      renderCategoryCards({ theme: 'autos' });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/categories/autos');
      });
    });

    it('handles successful API response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories })
      });

      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        expect(screen.getByText('Elektronik')).toBeInTheDocument();
        expect(screen.getByText('Haus & Garten')).toBeInTheDocument();
        expect(screen.getByText('Mode & Beauty')).toBeInTheDocument();
      });
    });

    it('handles API error response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        expect(screen.getByText('Fehler beim Laden der Kategorien')).toBeInTheDocument();
      });
    });

    it('handles network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('handles unknown error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce('Unknown error');

      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        expect(screen.getByText('Unbekannter Fehler')).toBeInTheDocument();
      });
    });
  });

  describe('Category Display', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories })
      });
    });

    it('renders all categories with correct names', async () => {
      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        expect(screen.getByText('Elektronik')).toBeInTheDocument();
        expect(screen.getByText('Haus & Garten')).toBeInTheDocument();
        expect(screen.getByText('Mode & Beauty')).toBeInTheDocument();
      });
    });

    it('renders category images with correct alt text', async () => {
      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(3);
        expect(images[0]).toHaveAttribute('alt', 'Elektronik');
        expect(images[1]).toHaveAttribute('alt', 'Haus & Garten');
        expect(images[2]).toHaveAttribute('alt', 'Mode & Beauty');
      });
    });

    it('applies correct image mapping for known categories', async () => {
      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images[0]).toHaveAttribute('src', '/images/categories/iphone_electronics_icon.png');
        expect(images[1]).toHaveAttribute('src', '/images/categories/Haus.png');
        expect(images[2]).toHaveAttribute('src', '/images/categories/Mode.png');
      });
    });

    it('handles empty categories array', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: [] })
      });

      renderCategoryCards({ theme: 'kleinanzeigen' });

      await waitFor(() => {
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
      });
    });
  });














});
