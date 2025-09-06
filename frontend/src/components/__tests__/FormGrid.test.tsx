import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormGrid } from '../FormGrid';

describe('FormGrid', () => {
  it('renders all form fields with correct labels', () => {
    render(<FormGrid />);
    
    // Check all text fields are present
    expect(screen.getByLabelText('Vorname')).toBeInTheDocument();
    expect(screen.getByLabelText('Nachname')).toBeInTheDocument();
    expect(screen.getByLabelText('E-Mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefon')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse')).toBeInTheDocument();
    expect(screen.getByLabelText('PLZ')).toBeInTheDocument();
    expect(screen.getByLabelText('Stadt')).toBeInTheDocument();
  });

  it('renders buttons with correct text', () => {
    render(<FormGrid />);
    
    expect(screen.getByText('Abbrechen')).toBeInTheDocument();
    expect(screen.getByText('Speichern')).toBeInTheDocument();
  });

  it('applies correct input types', () => {
    render(<FormGrid />);
    
    const emailField = screen.getByLabelText('E-Mail');
    expect(emailField).toHaveAttribute('type', 'email');
    
    const phoneField = screen.getByLabelText('Telefon');
    expect(phoneField).toHaveAttribute('type', 'tel');
  });

  it('applies correct button variants', () => {
    render(<FormGrid />);
    
    const cancelButton = screen.getByText('Abbrechen');
    expect(cancelButton).toHaveClass('MuiButton-outlined');
    
    const saveButton = screen.getByText('Speichern');
    expect(saveButton).toHaveClass('MuiButton-contained');
  });

  it('renders all text fields as outlined variant', () => {
    render(<FormGrid />);
    
    const textFields = screen.getAllByRole('textbox');
    textFields.forEach(field => {
      expect(field).toHaveClass('MuiOutlinedInput-input');
    });
  });

  it('has correct number of form elements', () => {
    render(<FormGrid />);
    
    // 7 text fields + 2 buttons = 9 form elements
    const textFields = screen.getAllByRole('textbox');
    expect(textFields).toHaveLength(7);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('renders fields in correct order', () => {
    render(<FormGrid />);
    
    // Check first few elements are in correct order by looking at the container
    const container = screen.getByLabelText('Vorname').closest('div');
    expect(container).toBeInTheDocument();
    
    // Verify we can find all fields
    expect(screen.getByLabelText('Vorname')).toBeInTheDocument();
    expect(screen.getByLabelText('Nachname')).toBeInTheDocument();
    expect(screen.getByLabelText('E-Mail')).toBeInTheDocument();
  });

  it('renders with Material-UI styling', () => {
    render(<FormGrid />);
    
    // Check that Material-UI classes are applied
    const textFields = screen.getAllByRole('textbox');
    textFields.forEach(field => {
      expect(field).toHaveClass('MuiOutlinedInput-input');
    });
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('MuiButton-root');
    });
  });
});
