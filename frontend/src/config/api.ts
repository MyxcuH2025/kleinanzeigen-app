/**
 * Globale API-Konfiguration für Development und Production
 */

// Automatische API-URL basierend auf Environment
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://kleinanzeigen-backend.onrender.com'
  : 'http://localhost:8000';

// WebSocket-URL für Echtzeit-Features  
export const WS_BASE_URL = import.meta.env.PROD
  ? 'wss://kleinanzeigen-backend.onrender.com'
  : 'ws://localhost:8000';

// Helper-Funktionen
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return `${API_BASE_URL}/api/images/noimage.jpeg`;
  
  // Bereits vollständige URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Relative Pfade korrigieren
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const getWsUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${WS_BASE_URL}${cleanEndpoint}`;
};
