import React from 'react';
import { render, screen } from '@testing-library/react';
import { Section } from '../Section';

describe('Section', () => {
  it('renders with title and children', () => {
    render(
      <Section title="Test Section">
        <div>Test content</div>
      </Section>
    );
    
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with complex children', () => {
    render(
      <Section title="Complex Section">
        <div>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <button>Click me</button>
        </div>
      </Section>
    );
    
    expect(screen.getByText('Complex Section')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with empty children', () => {
    render(
      <Section title="Empty Section">
        {null}
      </Section>
    );
    
    expect(screen.getByText('Empty Section')).toBeInTheDocument();
  });

  it('renders with multiple children', () => {
    render(
      <Section title="Multiple Children">
        <span>Child 1</span>
        <span>Child 2</span>
        <span>Child 3</span>
      </Section>
    );
    
    expect(screen.getByText('Multiple Children')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(
      <Section title="Styled Section">
        <div>Content</div>
      </Section>
    );
    
    const title = screen.getByText('Styled Section');
    expect(title).toHaveClass('MuiTypography-h5');
    
    const content = screen.getByText('Content');
    expect(content).toBeInTheDocument();
  });

  it('handles long titles', () => {
    const longTitle = 'This is a very long section title that might wrap to multiple lines';
    
    render(
      <Section title={longTitle}>
        <div>Content</div>
      </Section>
    );
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('renders with special characters in title', () => {
    const specialTitle = 'Section with special chars: äöüß & < > " \'';
    
    render(
      <Section title={specialTitle}>
        <div>Content</div>
      </Section>
    );
    
    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });
});
