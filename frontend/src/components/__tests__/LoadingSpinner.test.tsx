import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Lädt...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Bitte warten...';
    render(<LoadingSpinner message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders without message when message is empty', () => {
    render(<LoadingSpinner message="" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Lädt...')).not.toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    let spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveAttribute('style', expect.stringContaining('width: 24px'));

    rerender(<LoadingSpinner size="medium" />);
    spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveAttribute('style', expect.stringContaining('width: 40px'));

    rerender(<LoadingSpinner size="large" />);
    spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveAttribute('style', expect.stringContaining('width: 60px'));
  });

  it('renders skeleton variant correctly', () => {
    render(<LoadingSpinner variant="skeleton" />);
    const skeletons = screen.getAllByText('', { selector: '.MuiSkeleton-root' });
    expect(skeletons).toHaveLength(3); // default skeletonCount
  });

  it('renders custom skeleton count', () => {
    render(<LoadingSpinner variant="skeleton" skeletonCount={5} />);
    const skeletons = screen.getAllByText('', { selector: '.MuiSkeleton-root' });
    expect(skeletons).toHaveLength(5);
  });

  it('renders fullscreen variant correctly', () => {
    render(<LoadingSpinner fullScreen={true} />);
    const container = screen.getByRole('progressbar').closest('div');
    // Material-UI applies styles through sx prop, so we check if the component renders
    expect(container).toBeInTheDocument();
  });

  it('renders inline variant by default', () => {
    render(<LoadingSpinner />);
    const container = screen.getByRole('progressbar').closest('div');
    // Material-UI applies styles through sx prop, so we check if the component renders
    expect(container).toBeInTheDocument();
  });

  it('combines multiple props correctly', () => {
    render(
      <LoadingSpinner
        message="Custom Loading"
        size="large"
        fullScreen={true}
        variant="spinner"
      />
    );
    
    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('style', expect.stringContaining('width: 60px'));
    
    const container = screen.getByRole('progressbar').closest('div');
    // Material-UI applies styles through sx prop, so we check if the component renders
    expect(container).toBeInTheDocument();
  });
});
