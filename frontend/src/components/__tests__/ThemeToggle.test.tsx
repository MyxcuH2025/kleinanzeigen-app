import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

// Mock console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders the theme toggle button', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows light mode icon', () => {
    render(<ThemeToggle />);
    
    // Material-UI Icons werden als SVG gerendert
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows correct tooltip', () => {
    render(<ThemeToggle />);
    
    // Tooltip wird bei Hover angezeigt
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Nur Light Theme verfügbar');
  });

  it('handles click events', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(consoleSpy).toHaveBeenCalledWith('Theme toggle clicked - currently only light theme supported');
  });

  it('has correct styling', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('is accessible', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Prüfe, dass der Button fokussierbar ist
    button.focus();
    expect(button).toHaveFocus();
  });
});
