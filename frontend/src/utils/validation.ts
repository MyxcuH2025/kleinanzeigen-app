/**
 * Client-Side Validierung für Standard-Formulare
 * Grundlegende Validierungsfunktionen
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validiert E-Mail-Adressen
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validiert Passwörter
 */
export const validatePassword = (password: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!password || password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Passwort muss mindestens 8 Zeichen lang sein',
      code: 'MIN_LENGTH'
    });
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Passwort muss mindestens einen Kleinbuchstaben enthalten',
      code: 'LOWERCASE_REQUIRED'
    });
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Passwort muss mindestens einen Großbuchstaben enthalten',
      code: 'UPPERCASE_REQUIRED'
    });
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Passwort muss mindestens eine Zahl enthalten',
      code: 'NUMBER_REQUIRED'
    });
  }
  
  return errors;
};

/**
 * Validiert Telefonnummern
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validiert URLs
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validiert Preise
 */
export const validatePrice = (price: number): boolean => {
  return price >= 0 && price <= 999999999;
};

/**
 * Validiert Text-Längen
 */
export const validateTextLength = (text: string, minLength?: number, maxLength?: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (minLength !== undefined && text.length < minLength) {
    errors.push({
      field: 'text',
      message: `Text muss mindestens ${minLength} Zeichen lang sein`,
      code: 'MIN_LENGTH'
    });
  }
  
  if (maxLength !== undefined && text.length > maxLength) {
    errors.push({
      field: 'text',
      message: `Text darf maximal ${maxLength} Zeichen lang sein`,
      code: 'MAX_LENGTH'
    });
  }
  
  return errors;
};

/**
 * Validiert erforderliche Felder
 */
export const validateRequired = (value: any, fieldName: string): ValidationError[] => {
  if (value === undefined || value === null || value === '') {
    return [{
      field: fieldName,
      message: `Feld '${fieldName}' ist erforderlich`,
      code: 'REQUIRED'
    }];
  }
  return [];
};

/**
 * Kombiniert mehrere Validierungsergebnisse
 */
export const combineValidationResults = (...results: ValidationError[][]): ValidationError[] => {
  return results.flat();
};

/**
 * Erstellt ein ValidationResult-Objekt
 */
export const createValidationResult = (errors: ValidationError[]): ValidationResult => {
  return {
    valid: errors.length === 0,
    errors
  };
};
