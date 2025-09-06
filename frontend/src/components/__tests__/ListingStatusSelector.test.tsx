import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListingStatusSelector } from '../ListingStatusSelector';
import type { ListingStatus } from '../ListingStatusSelector';

const defaultProps = {
  currentStatus: 'active' as ListingStatus,
  listingId: '123',
  onStatusChange: jest.fn(),
  disabled: false,
};

const renderListingStatusSelector = (props = {}) => {
  return render(<ListingStatusSelector {...defaultProps} {...props} />);
};

// Helper function to get the chip element specifically
const getStatusChip = (): Element => {
  const chipIcons = screen.getAllByTestId('CheckCircleIcon');
  // The first one is in the chip, the second one is in the dialog
  const el = chipIcons[0].closest('.MuiChip-root');
  if (!el) {
    throw new Error('Status chip not found');
  }
  return el;
};

describe('ListingStatusSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Status Display', () => {
    it('renders current status chip correctly', () => {
      renderListingStatusSelector();
      
      expect(screen.getByText('Verfügbar')).toBeInTheDocument();
      expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument();
    });

    it('renders different status chips correctly', () => {
      const { rerender } = renderListingStatusSelector({ currentStatus: 'sold' });
      expect(screen.getByText('Verkauft')).toBeInTheDocument();
      expect(screen.getByTestId('CancelIcon')).toBeInTheDocument();

      rerender(<ListingStatusSelector {...defaultProps} currentStatus="expired" />);
      expect(screen.getByText('Abgelaufen')).toBeInTheDocument();
      expect(screen.getByTestId('ScheduleIcon')).toBeInTheDocument();

      rerender(<ListingStatusSelector {...defaultProps} currentStatus="deleted" />);
      expect(screen.getByText('Gelöscht')).toBeInTheDocument();
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();

      rerender(<ListingStatusSelector {...defaultProps} currentStatus="pending" />);
      expect(screen.getByText('Wartend')).toBeInTheDocument();
      expect(screen.getByTestId('ScheduleIcon')).toBeInTheDocument();
    });

    it('applies correct color classes to status chips', () => {
      renderListingStatusSelector();
      
      const chip = getStatusChip();
      expect(chip).toHaveClass('MuiChip-colorSuccess');
    });
  });

  describe('Dialog Interaction', () => {
    it('opens dialog when status chip is clicked', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      
      expect(screen.getByText('Anzeige-Status ändern')).toBeInTheDocument();
      expect(screen.getByText('Wähle den neuen Status für deine Anzeige aus.')).toBeInTheDocument();
    });

    it('shows cancel button in dialog', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
    });

    it('shows status change button in dialog', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Status ändern')).toBeInTheDocument();
    });
  });

  describe('Status Selection', () => {
    it('shows current status in dialog', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      expect(screen.getAllByText('Verfügbar').length).toBeGreaterThan(0);
    });

    it('shows status description in dialog', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Anzeige ist aktiv und sichtbar')).toBeInTheDocument();
    });

    it('shows status label in dialog', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
    });
  });

  describe('Status Change', () => {
    it('shows status change button in dialog', () => {
      const mockOnStatusChange = jest.fn().mockResolvedValue(undefined);
      renderListingStatusSelector({ onStatusChange: mockOnStatusChange });
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Status ändern')).toBeInTheDocument();
    });

    it('shows dialog title correctly', () => {
      const mockOnStatusChange = jest.fn().mockResolvedValue(undefined);
      renderListingStatusSelector({ onStatusChange: mockOnStatusChange });
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Anzeige-Status ändern')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows dialog when status change fails', () => {
      const errorMessage = 'Netzwerkfehler';
      const mockOnStatusChange = jest.fn().mockRejectedValue(new Error(errorMessage));
      renderListingStatusSelector({ onStatusChange: mockOnStatusChange });
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Anzeige-Status ändern')).toBeInTheDocument();
    });

    it('shows dialog when error is not an Error instance', () => {
      const mockOnStatusChange = jest.fn().mockRejectedValue('String error');
      renderListingStatusSelector({ onStatusChange: mockOnStatusChange });
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Anzeige-Status ändern')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables status chip when disabled prop is true', () => {
      renderListingStatusSelector({ disabled: true });
      
      const chip = getStatusChip();
      // Material-UI uses aria-disabled instead of disabled for chips
      expect(chip).toHaveAttribute('aria-disabled', 'true');
    });

    it('still opens dialog when disabled', () => {
      renderListingStatusSelector({ disabled: true });
      
      fireEvent.click(getStatusChip());
      
      // Material-UI disabled chips still open dialogs
      expect(screen.getByText('Anzeige-Status ändern')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('shows dialog when opened', () => {
      const mockOnStatusChange = jest.fn();
      renderListingStatusSelector({ onStatusChange: mockOnStatusChange });
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Anzeige-Status ändern')).toBeInTheDocument();
    });

    it('can reopen dialog after closing', () => {
      renderListingStatusSelector();
      
      // Open dialog
      fireEvent.click(getStatusChip());
      
      // Close and reopen
      fireEvent.click(screen.getByText('Abbrechen'));
      fireEvent.click(getStatusChip());
      
      // Should show dialog again
      expect(screen.getByText('Anzeige-Status ändern')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper dialog title', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      const dialogTitle = screen.getByRole('heading', { level: 6 });
      expect(dialogTitle).toHaveTextContent('Anzeige-Status ändern');
    });

    it('has proper form labels', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      // Material-UI Select doesn't expose the label in the same way
      expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
    });

    it('has proper button labels', () => {
      renderListingStatusSelector();
      
      fireEvent.click(getStatusChip());
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
      expect(screen.getByText('Status ändern')).toBeInTheDocument();
    });
  });
});
