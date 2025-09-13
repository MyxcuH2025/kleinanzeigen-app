// API Konfiguration
export const config = {
  apiBaseUrl: 'http://localhost:8000',
  apiTimeout: 10000,
  uploadMaxSize: 5 * 1024 * 1024, // 5MB
};

// Vollständige API-URL erstellen
export const getFullApiUrl = (endpoint: string): string => {
  const base = String(config.apiBaseUrl).replace(/\/+$/, '');
  const path = String(endpoint).replace(/^\/+/, '');
  return `${base}/${path}`;
};

// Umgebungsvariablen
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production'; 

// Zusätzliche, häufig verwendete Exporte für bestehende Imports
// Einheitliche Basis-URL als separate Konstante
export const API_BASE_URL = config.apiBaseUrl;

// Platzhalter-Bild für Listings ohne Bild
export const PLACEHOLDER_IMAGE_URL = '/images/noimage.jpeg';
