import React from 'react';
import { render, screen } from '@testing-library/react';
import { ListingStatusBadge, type ListingStatus } from '../ListingStatusBadge';

const renderListingStatusBadge = (props: {
  status: ListingStatus;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  showIcon?: boolean;
}) => {
  return render(<ListingStatusBadge {...props} />);
};

describe('ListingStatusBadge', () => {
  describe('Status Display', () => {
    it('displays "Verfügbar" for active status', () => {
      renderListingStatusBadge({ status: 'active' });
      expect(screen.getByText('Verfügbar')).toBeInTheDocument();
    });

    it('displays "Verkauft" for sold status', () => {
      renderListingStatusBadge({ status: 'sold' });
      expect(screen.getByText('Verkauft')).toBeInTheDocument();
    });

    it('displays "Abgelaufen" for expired status', () => {
      renderListingStatusBadge({ status: 'expired' });
      expect(screen.getByText('Abgelaufen')).toBeInTheDocument();
    });

    it('displays "Gelöscht" for deleted status', () => {
      renderListingStatusBadge({ status: 'deleted' });
      expect(screen.getByText('Gelöscht')).toBeInTheDocument();
    });

    it('displays "Wartend" for pending status', () => {
      renderListingStatusBadge({ status: 'pending' });
      expect(screen.getByText('Wartend')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('shows icon by default', () => {
      renderListingStatusBadge({ status: 'active' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      renderListingStatusBadge({ status: 'active', showIcon: false });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      // When showIcon is false, the icon should not be present
      expect(chip).toBeInTheDocument();
    });

    it('shows icon when showIcon is true', () => {
      renderListingStatusBadge({ status: 'active', showIcon: true });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies small size by default', () => {
      renderListingStatusBadge({ status: 'active' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-sizeSmall');
    });

    it('applies small size when explicitly set', () => {
      renderListingStatusBadge({ status: 'active', size: 'small' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-sizeSmall');
    });

    it('applies medium size when set', () => {
      renderListingStatusBadge({ status: 'active', size: 'medium' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-sizeMedium');
    });
  });

  describe('Variant Styles', () => {
    it('applies filled variant by default', () => {
      renderListingStatusBadge({ status: 'active' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-filled');
    });

    it('applies filled variant when explicitly set', () => {
      renderListingStatusBadge({ status: 'active', variant: 'filled' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-filled');
    });

    it('applies outlined variant when set', () => {
      renderListingStatusBadge({ status: 'active', variant: 'outlined' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-outlined');
    });
  });

  describe('Color Schemes', () => {
    it('applies success color for active status', () => {
      renderListingStatusBadge({ status: 'active' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorSuccess');
    });

    it('applies error color for sold status', () => {
      renderListingStatusBadge({ status: 'sold' });
      const chip = screen.getByText('Verkauft').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorError');
    });

    it('applies warning color for expired status', () => {
      renderListingStatusBadge({ status: 'expired' });
      const chip = screen.getByText('Abgelaufen').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorWarning');
    });

    it('applies default color for deleted status', () => {
      renderListingStatusBadge({ status: 'deleted' });
      const chip = screen.getByText('Gelöscht').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorDefault');
    });

    it('applies info color for pending status', () => {
      renderListingStatusBadge({ status: 'pending' });
      const chip = screen.getByText('Wartend').closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorInfo');
    });
  });

  describe('Typography Styling', () => {
    it('applies correct font weight', () => {
      renderListingStatusBadge({ status: 'active' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveStyle({ fontWeight: 500 });
    });

    it('applies small font size for small size', () => {
      renderListingStatusBadge({ status: 'active', size: 'small' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveStyle({ fontSize: '0.75rem' });
    });

    it('applies medium font size for medium size', () => {
      renderListingStatusBadge({ status: 'active', size: 'medium' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toHaveStyle({ fontSize: '0.875rem' });
    });
  });

  describe('Component Structure', () => {
    it('renders as a Chip component', () => {
      renderListingStatusBadge({ status: 'active' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      renderListingStatusBadge({ status: 'active' });
      const chip = screen.getByText('Verfügbar').closest('.MuiChip-root');
      expect(chip).toBeInTheDocument();
    });

    it('renders with all required props', () => {
      renderListingStatusBadge({ 
        status: 'active', 
        size: 'medium', 
        variant: 'outlined', 
        showIcon: false 
      });
      
      expect(screen.getByText('Verfügbar')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles all status types correctly', () => {
      const statuses: ListingStatus[] = ['active', 'sold', 'expired', 'deleted', 'pending'];
      
      statuses.forEach(status => {
        const { unmount } = renderListingStatusBadge({ status });
        expect(screen.getByText(statusConfig[status].label)).toBeInTheDocument();
        unmount();
      });
    });

    it('maintains consistent styling across different statuses', () => {
      const statuses: ListingStatus[] = ['active', 'sold', 'expired', 'deleted', 'pending'];
      
      statuses.forEach(status => {
        const { unmount } = renderListingStatusBadge({ status, size: 'medium', variant: 'outlined' });
        const chip = screen.getByText(statusConfig[status].label).closest('.MuiChip-root');
        expect(chip).toHaveClass('MuiChip-sizeMedium');
        expect(chip).toHaveClass('MuiChip-outlined');
        unmount();
      });
    });
  });
});

// Helper object for testing
const statusConfig = {
  active: { label: 'Verfügbar' },
  sold: { label: 'Verkauft' },
  expired: { label: 'Abgelaufen' },
  deleted: { label: 'Gelöscht' },
  pending: { label: 'Wartend' }
};
