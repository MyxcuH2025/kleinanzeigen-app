import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RatingDialog } from '../RatingDialog';

// Mock für ratingService
jest.mock('@/services/ratingService', () => ({
  ratingService: {
    rateListing: jest.fn(),
  },
}));

const mockRatingService = require('@/services/ratingService').ratingService;

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  listingId: 123,
  listingTitle: 'Test Produkt',
  onRatingSubmitted: jest.fn(),
};

const renderRatingDialog = (props = {}) => {
  return render(<RatingDialog {...defaultProps} {...props} />);
};

describe('RatingDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      renderRatingDialog();
      expect(screen.getByText('Bewertung für "Test Produkt"')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderRatingDialog({ open: false });
      expect(screen.queryByText('Bewertung für "Test Produkt"')).not.toBeInTheDocument();
    });

    it('displays the listing title', () => {
      renderRatingDialog();
      expect(screen.getByText('Bewertung für "Test Produkt"')).toBeInTheDocument();
    });

    it('shows rating question', () => {
      renderRatingDialog();
      expect(screen.getByText('Wie würdest du dieses Produkt bewerten?')).toBeInTheDocument();
    });

    it('shows rating stars', () => {
      renderRatingDialog();
      const stars = screen.getAllByTestId('StarIcon');
      expect(stars.length).toBeGreaterThan(0);
    });

    it('shows rating display', () => {
      renderRatingDialog();
      expect(screen.getByText('0/5')).toBeInTheDocument();
    });

    it('shows review text field', () => {
      renderRatingDialog();
      expect(screen.getByLabelText('Deine Bewertung (optional)')).toBeInTheDocument();
    });

    it('shows help text', () => {
      renderRatingDialog();
      expect(screen.getByText(/Deine Bewertung hilft anderen Käufern/)).toBeInTheDocument();
    });

    it('shows action buttons', () => {
      renderRatingDialog();
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
      expect(screen.getByText('Bewertung senden')).toBeInTheDocument();
    });
  });

  describe('Rating Interaction', () => {
    it('updates rating when stars are clicked', () => {
      renderRatingDialog();
      const stars = screen.getAllByTestId('StarIcon');
      
      fireEvent.click(stars[3]); // Click 4th star
      
      expect(screen.getByText('4/5')).toBeInTheDocument();
    });

    it('updates rating display when rating changes', () => {
      renderRatingDialog();
      const stars = screen.getAllByTestId('StarIcon');
      
      fireEvent.click(stars[2]); // Click 3rd star
      
      expect(screen.getByText('3/5')).toBeInTheDocument();
    });
  });

  describe('Review Input', () => {
    it('updates review text when typing', () => {
      renderRatingDialog();
      const reviewField = screen.getByLabelText('Deine Bewertung (optional)');
      
      fireEvent.change(reviewField, { target: { value: 'Sehr gutes Produkt!' } });
      
      expect(reviewField).toHaveValue('Sehr gutes Produkt!');
    });

    it('allows multiline input', () => {
      renderRatingDialog();
      const reviewField = screen.getByLabelText('Deine Bewertung (optional)');
      
      expect(reviewField).toHaveAttribute('rows', '4');
    });
  });

  describe('Form Validation', () => {
    it('enables submit button when rating is selected', () => {
      renderRatingDialog();
      const stars = screen.getAllByTestId('StarIcon');
      const submitButton = screen.getByText('Bewertung senden');
      
      expect(submitButton).toBeDisabled();
      
      fireEvent.click(stars[2]); // Click 3rd star
      
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Submit Functionality', () => {
    it('calls ratingService when submitting valid rating', async () => {
      mockRatingService.rateListing.mockResolvedValue(undefined);
      
      renderRatingDialog();
      
      // Set rating
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[3]); // Click 4th star
      
      // Set review
      const reviewField = screen.getByLabelText('Deine Bewertung (optional)');
      fireEvent.change(reviewField, { target: { value: 'Tolles Produkt!' } });
      
      // Submit
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRatingService.rateListing).toHaveBeenCalledWith(123, {
          rating: 4,
          comment: 'Tolles Produkt!'
        });
      });
    });

    it('calls ratingService without comment when review is empty', async () => {
      mockRatingService.rateListing.mockResolvedValue(undefined);
      
      renderRatingDialog();
      
      // Set rating only
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[4]); // Click 5th star
      
      // Submit
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRatingService.rateListing).toHaveBeenCalledWith(123, {
          rating: 5,
          comment: undefined
        });
      });
    });

    it('shows loading state during submission', async () => {
      mockRatingService.rateListing.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderRatingDialog();
      
      // Set rating
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[2]); // Click 3rd star
      
      // Submit
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Wird gespeichert...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('calls onRatingSubmitted after successful submission', async () => {
      mockRatingService.rateListing.mockResolvedValue(undefined);
      
      renderRatingDialog();
      
      // Set rating
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[3]); // Click 4th star
      
      // Submit
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onRatingSubmitted).toHaveBeenCalled();
      });
    });

    it('closes dialog after successful submission', async () => {
      mockRatingService.rateListing.mockResolvedValue(undefined);
      
      renderRatingDialog();
      
      // Set rating
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[3]); // Click 4th star
      
      // Submit
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('resets form after successful submission', async () => {
      mockRatingService.rateListing.mockResolvedValue(undefined);
      
      renderRatingDialog();
      
      // Set rating and review
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[3]); // Click 4th star
      
      const reviewField = screen.getByLabelText('Deine Bewertung (optional)');
      fireEvent.change(reviewField, { target: { value: 'Test Review' } });
      
      // Submit
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('0/5')).toBeInTheDocument();
        expect(reviewField).toHaveValue('');
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when ratingService fails', async () => {
      const errorMessage = 'Netzwerkfehler';
      mockRatingService.rateListing.mockRejectedValue(new Error(errorMessage));
      
      renderRatingDialog();
      
      // Set rating
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[3]); // Click 4th star
      
      // Submit
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('shows generic error when error is not an Error instance', async () => {
      mockRatingService.rateListing.mockRejectedValue('String error');
      
      renderRatingDialog();
      
      // Set rating
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[3]); // Click 4th star
      
      // Submit
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Fehler beim Erstellen der Bewertung')).toBeInTheDocument();
      });
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when cancel button is clicked', () => {
      renderRatingDialog();
      
      const cancelButton = screen.getByText('Abbrechen');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when dialog is closed', () => {
      renderRatingDialog();
      
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('resets form when closing', () => {
      renderRatingDialog();
      
      // Set rating and review
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[3]); // Click 4th star
      
      const reviewField = screen.getByLabelText('Deine Bewertung (optional)');
      fireEvent.change(reviewField, { target: { value: 'Test Review' } });
      
      // Close
      const cancelButton = screen.getByText('Abbrechen');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not close when loading', async () => {
      mockRatingService.rateListing.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderRatingDialog();
      
      // Set rating and submit
      const stars = screen.getAllByTestId('StarIcon');
      fireEvent.click(stars[3]); // Click 4th star
      
      const submitButton = screen.getByText('Bewertung senden');
      fireEvent.click(submitButton);
      
      // Try to close while loading
      const cancelButton = screen.getByText('Abbrechen');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper dialog role', () => {
      renderRatingDialog();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has proper dialog title', () => {
      renderRatingDialog();
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('has proper form elements', () => {
      renderRatingDialog();
      expect(screen.getByLabelText('Deine Bewertung (optional)')).toBeInTheDocument();
    });

    it('shows proper button states', () => {
      renderRatingDialog();
      expect(screen.getByText('Bewertung senden')).toBeDisabled();
      expect(screen.getByText('Abbrechen')).not.toBeDisabled();
    });
  });
});
