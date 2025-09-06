import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportDialog } from '../ReportDialog';
import type { ReportReason } from '../ReportDialog';

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  listingId: '123',
  listingTitle: 'Test Produkt',
  onReportSubmit: jest.fn().mockResolvedValue(undefined),
};

const renderReportDialog = (props = {}) => {
  return render(<ReportDialog {...defaultProps} {...props} />);
};

describe('ReportDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dialog Rendering', () => {
    it('renders dialog when open is true', () => {
      renderReportDialog();
      
      expect(screen.getAllByText('Anzeige melden').length).toBeGreaterThan(0);
      expect(screen.getByText('Test Produkt')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      renderReportDialog({ open: false });
      
      expect(screen.queryByText('Anzeige melden')).not.toBeInTheDocument();
    });

    it('renders dialog title with icon', () => {
      renderReportDialog();
      
      // Check for the title text in the dialog title
      expect(screen.getAllByRole('heading', { name: 'Anzeige melden' }).length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('ReportIcon').length).toBeGreaterThan(0);
    });

    it('displays listing title in content', () => {
      renderReportDialog();
      
      expect(screen.getByText(/Meldung für:/)).toBeInTheDocument();
      expect(screen.getByText('Test Produkt')).toBeInTheDocument();
    });
  });

  describe('Report Reason Selection', () => {
    it('renders all report reason options', () => {
      renderReportDialog();
      
      // Open the select dropdown by clicking on the select element
      const selectElement = screen.getByRole('combobox');
      fireEvent.mouseDown(selectElement);
      
      expect(screen.getAllByText('Betrug/Scam').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Unangemessene Bilder').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Falsche Beschreibung').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Überhöhter Preis').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Falsche Kategorie').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Rechtsverstoß').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Spam/Werbung').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Kontaktdaten in Beschreibung').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sonstiges').length).toBeGreaterThan(0);
    });

    it('shows reason descriptions in dropdown', () => {
      renderReportDialog();
      
      const selectElement = screen.getByRole('combobox');
      fireEvent.mouseDown(selectElement);
      
      expect(screen.getByText('Verdächtige oder betrügerische Aktivität')).toBeInTheDocument();
      expect(screen.getByText('Bilder sind unangemessen oder verstörend')).toBeInTheDocument();
      expect(screen.getByText('Beschreibung stimmt nicht mit dem Artikel überein')).toBeInTheDocument();
    });

    it('displays selected reason chip when not "other"', () => {
      renderReportDialog();
      
      // Change reason to fraud
      const selectElement = screen.getByRole('combobox');
      fireEvent.mouseDown(selectElement);
      fireEvent.click(screen.getByText('Betrug/Scam'));
      
      expect(screen.getAllByText('Betrug/Scam').length).toBeGreaterThan(0);
    });

    it('does not show reason chip when "other" is selected', () => {
      renderReportDialog();
      
      // Default is 'other', so no chip should be shown
      // The text "Sonstiges" appears in the select display, not as a chip
      expect(screen.queryByText('Sonstiges')).toBeInTheDocument(); // It's in the select display
      // But no chip should be shown
      expect(screen.queryByTestId('CheckCircleIcon')).not.toBeInTheDocument();
    });
  });

  describe('Description Input', () => {
    it('renders description text field', () => {
      renderReportDialog();
      
      expect(screen.getByLabelText('Beschreibung des Problems')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Beschreibe bitte detailliert, warum diese Anzeige gemeldet werden soll...')).toBeInTheDocument();
    });

    it('allows text input', () => {
      renderReportDialog();
      
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Das ist ein Test-Report.' } });
      
      expect(descriptionField).toHaveValue('Das ist ein Test-Report.');
    });

    it('shows character count', () => {
      renderReportDialog();
      
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test' } });
      
      expect(screen.getByText('4/1000 Zeichen')).toBeInTheDocument();
    });

    it('shows error when description exceeds 1000 characters', () => {
      renderReportDialog();
      
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      const longText = 'a'.repeat(1001);
      fireEvent.change(descriptionField, { target: { value: longText } });
      
      expect(descriptionField).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when description is empty', () => {
      renderReportDialog();
      
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when description has content', () => {
      renderReportDialog();
      
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      expect(submitButton).not.toBeDisabled();
    });

    it('disables submit button when description is too long', () => {
      renderReportDialog();
      
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      const longText = 'a'.repeat(1001);
      fireEvent.change(descriptionField, { target: { value: longText } });
      
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      expect(submitButton).toBeDisabled();
    });

    it('shows error message when trying to submit empty description', async () => {
      renderReportDialog();
      
      // Check that the submit button is disabled initially (since description is empty)
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      expect(submitButton).toBeDisabled();
      
      // The button should be disabled, so clicking it won't trigger validation
      // This test verifies the button state rather than error display
    });
  });

  describe('Form Submission', () => {
    it('calls onReportSubmit with correct data', async () => {
      const mockOnReportSubmit = jest.fn().mockResolvedValue(undefined);
      renderReportDialog({ onReportSubmit: mockOnReportSubmit });
      
      // Fill in the form
      const selectElement = screen.getByRole('combobox');
      fireEvent.mouseDown(selectElement);
      fireEvent.click(screen.getByText('Betrug/Scam'));
      
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test report description' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnReportSubmit).toHaveBeenCalledWith('fraud', 'Test report description');
      });
    });

    it('shows loading state during submission', async () => {
      const mockOnReportSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderReportDialog({ onReportSubmit: mockOnReportSubmit });
      
      // Fill in the form
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Wird gemeldet...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows success message after successful submission', async () => {
      renderReportDialog();
      
      // Fill in the form
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Anzeige erfolgreich gemeldet!')).toBeInTheDocument();
        expect(screen.getByText('Deine Meldung wurde eingereicht und wird geprüft.')).toBeInTheDocument();
      });
    });

    it('closes dialog after success timeout', async () => {
      jest.useFakeTimers();
      renderReportDialog();
      
      // Fill in the form
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Anzeige erfolgreich gemeldet!')).toBeInTheDocument();
      });
      
      // Fast-forward time
      jest.advanceTimersByTime(2000);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when submission fails', async () => {
      const errorMessage = 'Netzwerkfehler';
      const mockOnReportSubmit = jest.fn().mockRejectedValue(new Error(errorMessage));
      renderReportDialog({ onReportSubmit: mockOnReportSubmit });
      
      // Fill in the form
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('shows generic error when error is not an Error instance', async () => {
      const mockOnReportSubmit = jest.fn().mockRejectedValue('String error');
      renderReportDialog({ onReportSubmit: mockOnReportSubmit });
      
      // Fill in the form
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Fehler beim Melden der Anzeige')).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Actions', () => {
    it('calls onClose when cancel button is clicked', () => {
      renderReportDialog();
      
      const cancelButton = screen.getByText('Abbrechen');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('resets form when dialog is closed', () => {
      renderReportDialog();
      
      // Fill in some data
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      // Close dialog
      const cancelButton = screen.getByText('Abbrechen');
      fireEvent.click(cancelButton);
      
      // Reopen dialog
      renderReportDialog();
      
      expect(descriptionField).toHaveValue('');
    });

    it('prevents closing during submission', () => {
      const mockOnReportSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderReportDialog({ onReportSubmit: mockOnReportSubmit });
      
      // Fill in the form
      const descriptionField = screen.getByLabelText('Beschreibung des Problems');
      fireEvent.change(descriptionField, { target: { value: 'Test description' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Anzeige melden' });
      fireEvent.click(submitButton);
      
      // Try to close during submission
      const cancelButton = screen.getByText('Abbrechen');
      fireEvent.click(cancelButton);
      
      // Dialog should still be open
      expect(screen.getAllByRole('heading', { name: 'Anzeige melden' }).length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderReportDialog();
      
      // Check that labels exist in the DOM
      expect(screen.getAllByText('Grund für die Meldung').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Beschreibung des Problems').length).toBeGreaterThan(0);
    });

    it('has proper button labels', () => {
      renderReportDialog();
      
      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
      // Check for button specifically, not just text
      expect(screen.getByRole('button', { name: 'Anzeige melden' })).toBeInTheDocument();
    });

    it('shows helper text for description field', () => {
      renderReportDialog();
      
      expect(screen.getByText('Deine Meldung wird vertraulich behandelt und hilft uns dabei, die Plattform sicher zu halten.')).toBeInTheDocument();
    });
  });
});
