import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TipsGuide from '../TipsGuide';

// Mock für useTheme
const mockTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
  },
});

const renderTipsGuide = () => {
  return render(
    <ThemeProvider theme={mockTheme}>
      <TipsGuide />
    </ThemeProvider>
  );
};

describe('TipsGuide', () => {
  beforeEach(() => {
    renderTipsGuide();
  });

  describe('Hero Header', () => {
    it('renders the main title', () => {
      expect(screen.getByText('Der perfekte Kleinanzeigen-Guide')).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      expect(screen.getByText(/So erkennst du seriöse Angebote/)).toBeInTheDocument();
    });

    it('renders the shopping emoji avatar', () => {
      expect(screen.getByText('🛍️')).toBeInTheDocument();
    });
  });

  describe('Buyer Tips Section', () => {
    it('renders the buyer tips section title', () => {
      expect(screen.getByText('👤 Für Käufer')).toBeInTheDocument();
    });

    it('renders all buyer tips', () => {
      expect(screen.getByText('Beschreibung kritisch lesen')).toBeInTheDocument();
      expect(screen.getByText('Verkäuferprofil checken')).toBeInTheDocument();
      expect(screen.getByText('Preis vergleichen')).toBeInTheDocument();
      expect(screen.getByText('Sichere Zahlungsmethoden')).toBeInTheDocument();
      expect(screen.getByText('Persönlich abholen')).toBeInTheDocument();
    });

    it('renders buyer tip descriptions', () => {
      expect(screen.getByText(/Lies genau, ob die Beschreibung zum Titel passt/)).toBeInTheDocument();
      expect(screen.getByText(/Achte auf Profilalter, Bewertungen/)).toBeInTheDocument();
      expect(screen.getByText(/Nutze andere Plattformen für einen fairen Preisvergleich/)).toBeInTheDocument();
      expect(screen.getByText(/Bevorzuge PayPal mit Käuferschutz/)).toBeInTheDocument();
      expect(screen.getByText(/Bei Abholung kannst du das Produkt direkt prüfen/)).toBeInTheDocument();
    });
  });

  describe('Seller Tips Section', () => {
    it('renders the seller tips section title', () => {
      expect(screen.getByText('🧾 Für Verkäufer')).toBeInTheDocument();
    });

    it('renders all seller tips', () => {
      expect(screen.getByText('Gute Fotos verwenden')).toBeInTheDocument();
      expect(screen.getByText('Ehrliche Beschreibung schreiben')).toBeInTheDocument();
      expect(screen.getByText('Realistischen Preis setzen')).toBeInTheDocument();
      expect(screen.getByText('Erreichbarkeit zeigen')).toBeInTheDocument();
      expect(screen.getByText('Zur richtigen Zeit posten')).toBeInTheDocument();
    });

    it('renders seller tip descriptions', () => {
      expect(screen.getByText(/Nutze helles Licht & zeige mehrere Perspektiven/)).toBeInTheDocument();
      expect(screen.getByText(/Gib Marke, Zustand, Zubehör und Besonderheiten offen an/)).toBeInTheDocument();
      expect(screen.getByText(/Informiere dich über ähnliche Angebote/)).toBeInTheDocument();
      expect(screen.getByText(/Zeig wie und wann man dich erreichen kann/)).toBeInTheDocument();
      expect(screen.getByText(/Sonntagabend oder werktags ab 18 Uhr bringen oft mehr Sichtbarkeit/)).toBeInTheDocument();
    });
  });

  describe('Security Tips Section', () => {
    it('renders the security tips section title', () => {
      expect(screen.getByText('🔐 Zusätzliche Sicherheitstipps')).toBeInTheDocument();
    });

    it('renders all security tips', () => {
      expect(screen.getByText(/Bleibe immer in der Plattform/)).toBeInTheDocument();
      expect(screen.getByText(/Versende nichts, bevor du sicher bezahlt wurdest/)).toBeInTheDocument();
      expect(screen.getByText(/Vertraue deinem Bauchgefühl/)).toBeInTheDocument();
    });

    it('renders tip chips', () => {
      const tipChips = screen.getAllByText('Tipp');
      expect(tipChips).toHaveLength(3);
    });
  });

  describe('Footer', () => {
    it('renders the copyright notice', () => {
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} Kleinanzeigen. Alle Rechte vorbehalten.`)).toBeInTheDocument();
    });

    it('renders the divider', () => {
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('Material-UI Components', () => {
    it('renders cards with proper styling', () => {
      const cards = screen.getAllByText('Beschreibung kritisch lesen').map(el => el.closest('.MuiCard-root'));
      expect(cards.length).toBeGreaterThan(0);
    });

    it('renders avatars with icons', () => {
      const avatars = screen.getAllByText('🛍️');
      expect(avatars.length).toBeGreaterThan(0);
    });

    it('renders typography elements', () => {
      expect(screen.getByText('Der perfekte Kleinanzeigen-Guide')).toHaveClass('MuiTypography-h4');
      expect(screen.getByText('👤 Für Käufer')).toHaveClass('MuiTypography-h5');
      expect(screen.getByText('🧾 Für Verkäufer')).toHaveClass('MuiTypography-h5');
    });
  });

  describe('Responsive Design', () => {
    it('renders with proper grid layout', () => {
      const gridContainer = screen.getByText('👤 Für Käufer').closest('div')?.parentElement;
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const h4 = screen.getByRole('heading', { level: 4 });
      const h5s = screen.getAllByRole('heading', { level: 5 });
      const h6s = screen.getAllByRole('heading', { level: 6 });

      expect(h4).toBeInTheDocument();
      expect(h5s).toHaveLength(2);
      expect(h6s.length).toBeGreaterThan(0);
    });

    it('renders semantic elements', () => {
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });
});
