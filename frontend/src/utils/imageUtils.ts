/**
 * Zentrale Funktionen für Bild-URLs mit intelligentem Fallback
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Erstellt eine Bild-URL mit Fallback auf den neuen intelligenten Endpunkt
 * @param imagePath - Der Bildpfad (kann mit /uploads/ beginnen oder nur der Dateiname sein)
 * @returns Vollständige URL zum Bild
 */
export const getImageUrl = (imagePath: string): string => {
  console.log(`getImageUrl called with: "${imagePath}"`);
  if (!imagePath || imagePath.trim() === '' || imagePath === '[' || imagePath === ']' || imagePath === '"[') {
    console.log('Invalid imagePath, returning placeholder');
    return '/images/noimage.jpeg';
  }

  // Wenn es bereits eine absolute URL ist, verwende sie direkt
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Wenn es der Platzhalter ist, verwende ihn direkt
  if (imagePath === '/images/noimage.jpeg' || imagePath === 'noimage.jpeg') {
    return '/images/noimage.jpeg';
  }

  // Entferne verschiedene Präfixe falls vorhanden
  let cleanPath = imagePath;
  
  // Entferne /api/uploads/ Präfix
  if (cleanPath.startsWith('/api/uploads/')) {
    cleanPath = cleanPath.replace('/api/uploads/', '');
  }
  // Entferne /uploads/ Präfix
  else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.replace('/uploads/', '');
  }
  // Entferne api/uploads/ Präfix (ohne führenden Schrägstrich)
  else if (cleanPath.startsWith('api/uploads/')) {
    cleanPath = cleanPath.replace('api/uploads/', '');
  }
  
  // Wenn der Pfad bereits ein Dateiname ist (ohne Präfix), verwende ihn direkt
  
  const finalUrl = `${API_BASE_URL}/api/images/${cleanPath}`;
  console.log(`Final URL: ${finalUrl}`);
  return finalUrl;
};

/**
 * Erstellt eine Bild-URL für den Upload-Endpunkt (für neue Uploads)
 * @param filename - Der Dateiname
 * @returns Vollständige URL zum Upload
 */
export const getUploadUrl = (filename: string): string => {
  return `${API_BASE_URL}/uploads/${filename}`;
};

/**
 * Prüft ob ein Bildpfad gültig ist
 * @param imagePath - Der zu prüfende Bildpfad
 * @returns true wenn der Pfad gültig ist
 */
export const isValidImagePath = (imagePath: string | boolean): boolean => {
  return typeof imagePath === 'string' && imagePath.trim().length > 0;
};

/**
 * Erstellt eine Liste von Bild-URLs
 * @param imagePaths - Array von Bildpfaden
 * @returns Array von vollständigen Bild-URLs
 */
export const getImageUrls = (imagePaths: string[]): string[] => {
  if (!Array.isArray(imagePaths)) return [];
  return imagePaths
    .filter(isValidImagePath)
    .map(getImageUrl);
};
