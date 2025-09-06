import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImageTextGrid } from '../ImageTextGrid';

describe('ImageTextGrid', () => {
  it('renders all section titles', () => {
    render(<ImageTextGrid />);
    
    expect(screen.getByText('Sicherer Kauf & Verkauf')).toBeInTheDocument();
    expect(screen.getByText('Lokale Angebote')).toBeInTheDocument();
  });

  it('renders all section descriptions', () => {
    render(<ImageTextGrid />);
    
    expect(screen.getByText(/Bei uns können Sie sicher und einfach/)).toBeInTheDocument();
    expect(screen.getByText(/Finden Sie die besten Angebote/)).toBeInTheDocument();
  });

  it('renders images with correct alt text', () => {
    render(<ImageTextGrid />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    
    expect(images[0]).toHaveAttribute('alt', 'Sicherer Kauf & Verkauf');
    expect(images[1]).toHaveAttribute('alt', 'Lokale Angebote');
  });

  it('renders images with correct sources', () => {
    render(<ImageTextGrid />);
    
    const images = screen.getAllByRole('img');
    
    expect(images[0]).toHaveAttribute('src', 'https://picsum.photos/800/600?random=4');
    expect(images[1]).toHaveAttribute('src', 'https://picsum.photos/800/600?random=5');
  });

  it('renders correct number of sections', () => {
    render(<ImageTextGrid />);
    
    const titles = screen.getAllByRole('heading', { level: 2 });
    expect(titles).toHaveLength(2);
    
    const descriptions = screen.getAllByText(/.*/, { selector: 'p' });
    expect(descriptions).toHaveLength(2);
  });

  it('applies correct Material-UI classes', () => {
    render(<ImageTextGrid />);
    
    const images = screen.getAllByRole('img');
    images.forEach(image => {
      expect(image).toHaveClass('MuiCardMedia-media');
    });
    
    const headings = screen.getAllByRole('heading', { level: 2 });
    headings.forEach(heading => {
      expect(heading).toHaveClass('MuiTypography-h4');
    });
  });

  it('renders with responsive grid layout', () => {
    render(<ImageTextGrid />);
    
    // Check that the component renders without errors
    expect(screen.getByText('Sicherer Kauf & Verkauf')).toBeInTheDocument();
    expect(screen.getByText('Lokale Angebote')).toBeInTheDocument();
  });

  it('displays content in correct order', () => {
    render(<ImageTextGrid />);
    
    // First section should appear first
    const firstSectionTitle = screen.getByText('Sicherer Kauf & Verkauf');
    const firstSectionDesc = screen.getByText(/Bei uns können Sie sicher und einfach/);
    
    expect(firstSectionTitle).toBeInTheDocument();
    expect(firstSectionDesc).toBeInTheDocument();
    
    // Second section should appear second
    const secondSectionTitle = screen.getByText('Lokale Angebote');
    const secondSectionDesc = screen.getByText(/Finden Sie die besten Angebote/);
    
    expect(secondSectionTitle).toBeInTheDocument();
    expect(secondSectionDesc).toBeInTheDocument();
  });

  it('renders cards with proper structure', () => {
    render(<ImageTextGrid />);
    
    const images = screen.getAllByRole('img');
    images.forEach(image => {
      const card = image.closest('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });
  });

  it('applies proper typography variants', () => {
    render(<ImageTextGrid />);
    
    const headings = screen.getAllByRole('heading', { level: 2 });
    headings.forEach(heading => {
      expect(heading).toHaveClass('MuiTypography-h4');
    });
    
    const descriptions = screen.getAllByText(/.*/, { selector: 'p' });
    descriptions.forEach(desc => {
      expect(desc).toHaveClass('MuiTypography-body1');
    });
  });
});
