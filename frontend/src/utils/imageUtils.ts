/**
 * Zentrale Funktionen für Bild-URLs mit intelligentem Fallback
 */

const API_BASE_URL = 'http://localhost:8000';
const SUPABASE_URL = 'https://hcwilqiczkmesxmetprm.supabase.co';

/**
 * Lädt ein Bild zum Server hoch
 * @param file - Die Datei die hochgeladen werden soll
 * @returns Promise mit der Bild-URL
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  // Token für authentifizierten Upload hinzufügen
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Lädt ein Profilbild hoch und aktualisiert den User-State
 * @param file - Die Datei die hochgeladen werden soll
 * @param updateUserAvatar - Callback zum Aktualisieren des User-States
 * @returns Promise mit der Bild-URL
 */
export const uploadProfileImage = async (file: File, updateUserAvatar?: (avatarUrl: string) => void): Promise<string> => {
  try {
    // Bild hochladen
    const avatarUrl = await uploadImage(file);
    
    // User-State aktualisieren wenn Callback vorhanden
    if (updateUserAvatar && avatarUrl) {
      console.log('Profilbild erfolgreich hochgeladen:', avatarUrl);
      updateUserAvatar(avatarUrl);
    }
    
    return avatarUrl;
  } catch (error) {
    console.error('Fehler beim Hochladen des Profilbildes:', error);
    throw error;
  }
};

/**
 * Erstellt eine Bild-URL mit Fallback auf den neuen intelligenten Endpunkt
 * @param imagePath - Der Bildpfad (kann mit /uploads/ beginnen oder nur der Dateiname sein)
 * @returns Vollständige URL zum Bild
 */
export const getImageUrl = (imagePath: string): string => {

  if (!imagePath || imagePath.trim() === '' || imagePath === '[' || imagePath === ']' || imagePath === '"[') {

    return '/images/noimage.jpeg';
  }

  // REPARIERT: WebP-Avatar-URLs korrekt handhaben
  if (imagePath.includes('avatars/') && imagePath.endsWith('.webp')) {
    // Für Avatar-WebP-Bilder: direkte URL zum Backend
    if (imagePath.startsWith('/uploads/avatars/')) {
      return `${API_BASE_URL}/api/images${imagePath}`;
    }
    // Für Avatar-WebP-Bilder ohne /uploads/ Präfix
    if (imagePath.startsWith('avatars/')) {
      return `${API_BASE_URL}/api/images/uploads/${imagePath}`;
    }
    // Für Avatar-WebP-Bilder als Dateiname
    if (imagePath.endsWith('.webp') && imagePath.includes('-')) {
      return `${API_BASE_URL}/api/images/uploads/avatars/${imagePath}`;
    }
  }

  // REPARIERT: Base64-Bilder durch Placeholder ersetzen (vermeidet "Image corrupt" Fehler)
  if (imagePath.startsWith('data:') || imagePath.includes('base64') || imagePath.includes('data:image/')) {
    console.warn('❌ Base64-Image erkannt, verwende Placeholder:', imagePath.substring(0, 50) + '...');
    return 'http://localhost:8000/api/images/noimage.jpeg'; // REPARIERT: Vollständige URL für Placeholder
  }

  // Wenn es bereits eine absolute URL ist, verwende sie direkt
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Supabase Storage URLs erkennen und verwenden
  if (imagePath.startsWith('kleinanzeigen-images/') || imagePath.includes('supabase.co')) {
    return `${SUPABASE_URL}/storage/v1/object/public/${imagePath}`;
  }

  // REPARIERT: Base64-Bilder durch Placeholder ersetzen (vermeidet "Image corrupt" Fehler)
  if (imagePath.startsWith('data:image/') || imagePath.includes('base64')) {
    console.warn('❌ Base64-Image erkannt, verwende Placeholder:', imagePath.substring(0, 50) + '...');
    return `${API_BASE_URL}/api/images/noimage.jpeg`;
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
  
  // REPARIERT: Korrekte URL-Generierung für Bilder
  // Wenn der Pfad bereits /api/images/ enthält, verwende ihn direkt
  if (cleanPath.startsWith('/api/images/')) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  
  // REPARIERT: Stelle sicher, dass der Pfad korrekt formatiert ist
  let finalUrl;
  if (cleanPath.includes('.') && !cleanPath.includes('/')) {
    // Einfacher Dateiname (z.B. "image.png")
    finalUrl = `${API_BASE_URL}/api/images/${cleanPath}`;
  } else if (cleanPath.startsWith('uploads/')) {
    // Pfad mit uploads/ Präfix
    finalUrl = `${API_BASE_URL}/api/images/${cleanPath}`;
  } else {
    // Andere Pfade
    finalUrl = `${API_BASE_URL}/api/images/${cleanPath}`;
  }

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
  if (typeof imagePath !== 'string' || imagePath.trim().length === 0) {
    return false;
  }
  
  // REPARIERT: Base64-Bilder als ungültig markieren (vermeidet "Image corrupt" Fehler)
  if (imagePath.startsWith('data:') || imagePath.includes('base64')) {
    console.warn('❌ Base64-Image in Array erkannt, ignoriere:', imagePath.substring(0, 50) + '...');
    return false;
  }
  
  return true;
};

/**
 * Erstellt eine Liste von Bild-URLs
 * @param imagePaths - Array von Bildpfaden
 * @returns Array von vollständigen Bild-URLs
 */
export const getImageUrls = (imagePaths: string[] | string): string[] => {
  // REPARIERT: Handle both arrays and JSON strings (verursacht "Image corrupt" Fehler)
  let paths: string[] = [];
  
  if (typeof imagePaths === 'string') {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(imagePaths);
      if (Array.isArray(parsed)) {
        paths = parsed;
      } else {
        return [];
      }
    } catch {
      // If not JSON, treat as single string
      paths = [imagePaths];
    }
  } else if (Array.isArray(imagePaths)) {
    paths = imagePaths;
  } else {
    return [];
  }
  
  // REPARIERT: Filter out empty and invalid paths
  const validPaths = paths.filter(path => 
    path && 
    typeof path === 'string' && 
    path.trim() !== '' && 
    path !== '[]' && 
    path !== '[""]' &&
    !path.startsWith('[') &&
    !path.endsWith(']')
  );
  
  return validPaths
    .filter(isValidImagePath)
    .map(getImageUrl);
};
