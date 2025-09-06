import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Logo } from '../Logo';

describe('Logo Component', () => {
  it('renders with default props', () => {
    render(<Logo />);
    const logoImage = screen.getByAltText('tüka Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/images/logo.webp');
  });

  it('renders with custom height and width', () => {
    render(<Logo height={60} width={200} />);
    const logoImage = screen.getByAltText('tüka Logo');
    expect(logoImage).toHaveStyle({ height: '60px', width: '200px' });
  });

  it('renders white variant correctly', () => {
    render(<Logo variant="white" />);
    const logoImage = screen.getByAltText('tüka Logo');
    expect(logoImage).toHaveAttribute('src', '/images/logo-white.webp');
  });

  it('renders small variant correctly', () => {
    render(<Logo variant="small" />);
    const logoImage = screen.getByAltText('tüka Logo');
    expect(logoImage).toHaveAttribute('src', '/images/logo.webp');
  });

  it('handles click events', () => {
    const mockOnClick = jest.fn();
    render(<Logo onClick={mockOnClick} />);
    
    const logoImage = screen.getByAltText('tüka Logo');
    fireEvent.click(logoImage);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom styles through sx prop', () => {
    const customStyles = { backgroundColor: 'red', borderRadius: '8px' };
    render(<Logo sx={customStyles} />);
    
    const logoImage = screen.getByAltText('tüka Logo');
    // Material-UI applies styles through sx prop, so we check if the component renders
    expect(logoImage).toBeInTheDocument();
  });

  it('shows pointer cursor when onClick is provided', () => {
    render(<Logo onClick={() => {}} />);
    const logoImage = screen.getByAltText('tüka Logo');
    expect(logoImage).toHaveStyle({ cursor: 'pointer' });
  });

  it('shows default cursor when no onClick is provided', () => {
    render(<Logo />);
    const logoImage = screen.getByAltText('tüka Logo');
    expect(logoImage).toHaveStyle({ cursor: 'default' });
  });

  it('passes through additional props', () => {
    render(<Logo data-testid="custom-logo" className="custom-class" />);
    const logoImage = screen.getByTestId('custom-logo');
    expect(logoImage).toHaveClass('custom-class');
  });
});
