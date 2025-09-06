import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RatingDisplay } from '../RatingDisplay';

// Mock für ratingService
jest.mock('@/services/ratingService', () => ({
  ratingService: {
    getListingRatings: jest.fn(),
  },
}));

const mockRatingService = require('@/services/ratingService').ratingService;

const mockRatingStats = {
  total_ratings: 25,
  average_rating: 4.2,
  rating_distribution: [
    { rating: 5, count: 12 },
    { rating: 4, count: 8 },
    { rating: 3, count: 3 },
    { rating: 2, count: 1 },
    { rating: 1, count: 1 }
  ]
};

const mockRatings = [
  {
    id: 1,
    rating: 5,
    review: 'Sehr gutes Produkt, kann ich nur empfehlen!',
    reviewer: { name: 'Max Mustermann' },
    is_verified_purchase: true,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    rating: 4,
    review: 'Gute Qualität, schnelle Lieferung.',
    reviewer: { name: 'Anna Schmidt' },
    is_verified_purchase: false,
    created_at: '2024-01-14T15:45:00Z'
  }
];

const mockRatingResponse = {
  ratings: mockRatings,
  stats: mockRatingStats,
  pagination: {
    page: 1,
    pages: 3,
    per_page: 10,
    total: 25
  }
};

const defaultProps = {
  listingId: 123,
};

const renderRatingDisplay = (props = {}) => {
  return render(<RatingDisplay {...defaultProps} {...props} />);
};

describe('RatingDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRatingService.getListingRatings.mockResolvedValue(mockRatingResponse);
  });

  describe('Loading State', () => {
    it('shows loading spinner on initial load', () => {
      renderRatingDisplay();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when API fails', async () => {
      const errorMessage = 'Netzwerkfehler';
      mockRatingService.getListingRatings.mockRejectedValue(new Error(errorMessage));
      
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('shows generic error when error is not an Error instance', async () => {
      mockRatingService.getListingRatings.mockRejectedValue('String error');
      
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Fehler beim Laden der Bewertungen')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no ratings exist', async () => {
      mockRatingService.getListingRatings.mockResolvedValue({
        ratings: [],
        stats: { total_ratings: 0, average_rating: 0, rating_distribution: [] },
        pagination: { page: 1, pages: 1, per_page: 10, total: 0 }
      });
      
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Noch keine Bewertungen')).toBeInTheDocument();
        expect(screen.getByText('Sei der Erste, der dieses Produkt bewertet!')).toBeInTheDocument();
      });
    });
  });

  describe('Rating Statistics', () => {
    it('displays average rating correctly', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('4.2')).toBeInTheDocument();
      });
    });

    it('displays total ratings count', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('25 Bewertungen')).toBeInTheDocument();
      });
    });

    it('displays rating text based on average', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Sehr gut')).toBeInTheDocument();
      });
    });

    it('shows rating distribution bars', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('5 Sterne')).toBeInTheDocument();
        expect(screen.getByText('4 Sterne')).toBeInTheDocument();
        expect(screen.getByText('3 Sterne')).toBeInTheDocument();
        expect(screen.getByText('2 Sterne')).toBeInTheDocument();
        expect(screen.getByText('1 Sterne')).toBeInTheDocument();
      });
    });

    it('displays rating counts', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('Reviews List', () => {
    it('displays reviews title with count', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Bewertungen (25)')).toBeInTheDocument();
      });
    });

    it('renders individual rating cards', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Sehr gutes Produkt, kann ich nur empfehlen!')).toBeInTheDocument();
        expect(screen.getByText('Gute Qualität, schnelle Lieferung.')).toBeInTheDocument();
      });
    });

    it('displays reviewer names', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Max Mustermann')).toBeInTheDocument();
        expect(screen.getByText('Anna Schmidt')).toBeInTheDocument();
      });
    });

    it('shows verified purchase badge when applicable', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Verifizierter Kauf')).toBeInTheDocument();
      });
    });

    it('displays review dates in German format', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText(/15\. Januar 2024/)).toBeInTheDocument();
        expect(screen.getByText(/14\. Januar 2024/)).toBeInTheDocument();
      });
    });

    it('shows star ratings for each review', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        const starIcons = screen.getAllByTestId('StarIcon');
        expect(starIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Pagination', () => {
    it('shows load more button when more pages exist', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Weitere Bewertungen laden')).toBeInTheDocument();
      });
    });

    it('loads more ratings when load more button is clicked', async () => {
      const nextPageResponse = {
        ratings: [
          {
            id: 3,
            rating: 3,
            review: 'Dritter Review',
            reviewer: { name: 'Test User' },
            is_verified_purchase: false,
            created_at: '2024-01-13T12:00:00Z'
          }
        ],
        stats: mockRatingStats,
        pagination: { page: 2, pages: 3, per_page: 10, total: 25 }
      };

      mockRatingService.getListingRatings
        .mockResolvedValueOnce(mockRatingResponse)
        .mockResolvedValueOnce(nextPageResponse);

      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Weitere Bewertungen laden')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText('Weitere Bewertungen laden');
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(mockRatingService.getListingRatings).toHaveBeenCalledWith(123, 2, 10);
      });
    });

    it('hides load more button when no more pages exist', async () => {
      mockRatingService.getListingRatings.mockResolvedValue({
        ...mockRatingResponse,
        pagination: { page: 1, pages: 1, per_page: 10, total: 25 }
      });

      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.queryByText('Weitere Bewertungen laden')).not.toBeInTheDocument();
      });
    });

    it('shows loading state on load more button when loading', async () => {
      mockRatingService.getListingRatings
        .mockResolvedValueOnce(mockRatingResponse)
        .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Weitere Bewertungen laden')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText('Weitere Bewertungen laden');
      fireEvent.click(loadMoreButton);

      // Check for loading spinner instead of text
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Rating Text Logic', () => {
    it('shows "Ausgezeichnet" for ratings >= 4.5', async () => {
      mockRatingService.getListingRatings.mockResolvedValue({
        ...mockRatingResponse,
        stats: { ...mockRatingStats, average_rating: 4.8 }
      });

      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Ausgezeichnet')).toBeInTheDocument();
      });
    });

    it('shows "Sehr gut" for ratings >= 4.0', async () => {
      mockRatingService.getListingRatings.mockResolvedValue({
        ...mockRatingResponse,
        stats: { ...mockRatingStats, average_rating: 4.2 }
      });

      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Sehr gut')).toBeInTheDocument();
      });
    });

    it('shows "Gut" for ratings >= 3.0', async () => {
      mockRatingService.getListingRatings.mockResolvedValue({
        ...mockRatingResponse,
        stats: { ...mockRatingStats, average_rating: 3.5 }
      });

      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Gut')).toBeInTheDocument();
      });
    });

    it('shows "Befriedigend" for ratings >= 2.0', async () => {
      mockRatingService.getListingRatings.mockResolvedValue({
        ...mockRatingResponse,
        stats: { ...mockRatingStats, average_rating: 2.3 }
      });

      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Befriedigend')).toBeInTheDocument();
      });
    });

    it('shows "Schlecht" for ratings < 2.0', async () => {
      mockRatingService.getListingRatings.mockResolvedValue({
        ...mockRatingResponse,
        stats: { ...mockRatingStats, average_rating: 1.8 }
      });

      renderRatingDisplay();
      
      await waitFor(() => {
        expect(screen.getByText('Schlecht')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('calls ratingService with correct parameters', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        expect(mockRatingService.getListingRatings).toHaveBeenCalledWith(123, 1, 10);
      });
    });

    it('updates ratings when listingId changes', async () => {
      const { rerender } = renderRatingDisplay();
      
      await waitFor(() => {
        expect(mockRatingService.getListingRatings).toHaveBeenCalledWith(123, 1, 10);
      });

      rerender(<RatingDisplay listingId={456} />);

      await waitFor(() => {
        expect(mockRatingService.getListingRatings).toHaveBeenCalledWith(456, 1, 10);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('shows progress indicators', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });

    it('displays proper button states', async () => {
      renderRatingDisplay();
      
      await waitFor(() => {
        const loadMoreButton = screen.getByText('Weitere Bewertungen laden');
        expect(loadMoreButton).not.toBeDisabled();
      });
    });
  });
});
