import { createTheme } from '@mui/material/styles';

// Google Fonts importieren
const fontImports = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Source+Sans+Pro:wght@300;400;600;700&display=swap');
`;

// Font-Imports zum <head> hinzufügen
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fontImports;
  document.head.appendChild(style);
}

// Premium Light Theme mit moderner Farbpalette und Design-System
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#059669', // Modern Green (elegant und professionell)
      light: '#10b981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc2626', // Red für CTAs
      light: '#ef4444',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Sehr helles Blau-Grau
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Dunkles Slate
      secondary: '#64748b', // Mittleres Slate
    },
    divider: '#e2e8f0',
    action: {
      hover: '#f1f5f9',
      selected: '#dbeafe',
      active: '#3b82f6',
    },
    success: {
      main: '#10b981', // Modern Green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Modern Orange
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // Modern Red
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#059669', // Modern Green
      light: '#10b981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    // Erweiterte Farbpalette für Design-System
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  // Design-System: Spacing-Scale
  spacing: (factor: number) => `${factor * 4}px`, // 4px base unit
  // Design-System: Breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    // Design-System: Typography-Scale
    h1: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 800,
      fontSize: '2.5rem', // 40px
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 700,
      fontSize: '2rem', // 32px
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 700,
      fontSize: '1.75rem', // 28px
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem', // 24px
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem', // 20px
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem', // 18px
      lineHeight: 1.4,
    },
    // Design-System: Body Text
    body1: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '1rem', // 16px
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
      fontWeight: 400,
    },
    // Design-System: Small Text
    subtitle1: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '1rem', // 16px
      lineHeight: 1.5,
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.875rem', // 14px
      lineHeight: 1.5,
      fontWeight: 500,
    },
    // Design-System: Interactive Elements
    button: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.025em',
      fontSize: '0.875rem', // 14px
    },
    // Design-System: Small Text
    caption: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.75rem', // 12px
      fontWeight: 500,
      letterSpacing: '0.025em',
    },
    overline: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.75rem', // 12px
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    // Design-System: Border-Radius-Scale
    borderRadius: 8, // Base radius
  },
  components: {
    // Design-System: Button-Komponenten
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px', // Bessere Touch-Targets
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          minHeight: '44px', // WCAG-konform
          '&:hover': {
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 20px rgba(5, 150, 105, 0.25)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        // Design-System: Button-Größen
        sizeSmall: {
          padding: '8px 16px',
          minHeight: '36px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '16px 32px',
          minHeight: '52px',
          fontSize: '1rem',
        },
      },
    },
    // Design-System: Card-Komponenten
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Einheitlicher Radius
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Design-System: IconButton-Komponenten
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          minWidth: '44px', // WCAG-konform
          minHeight: '44px',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
        sizeSmall: {
          minWidth: '32px',
          minHeight: '32px',
        },
        sizeLarge: {
          minWidth: '56px',
          minHeight: '56px',
        },
      },
    },
    // Design-System: TextField-Komponenten
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // Einheitlicher Radius
            transition: 'all 0.2s ease-in-out',
            minHeight: '44px', // WCAG-konform
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#10b981',
              borderWidth: '1.5px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#059669',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    // Design-System: Chip-Komponenten
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Einheitlicher Radius
          fontWeight: 500,
          fontSize: '0.875rem',
          height: '32px', // Konsistente Höhe
        },
      },
    },
    // Design-System: Paper-Komponenten
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Einheitlicher Radius
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    // Design-System: AppBar-Komponenten
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    // Design-System: Fab-Komponenten
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
          minWidth: '56px', // WCAG-konform
          minHeight: '56px',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(5, 150, 105, 0.35)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

// Dark Theme (für zukünftige Verwendung)
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    divider: '#334155',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
});

// Default Theme (Light)
export const theme = lightTheme; 
