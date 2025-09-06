import { 
  validateEmail, 
  validatePassword, 
  validatePhone, 
  validateUrl, 
  validatePrice, 
  validateTextLength
} from '../validation';
import type { ValidationError } from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('handles edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('   ')).toBe(false);
      expect(validateEmail('a@b.c')).toBe(true); // Minimal valid email
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'MySecurePass1',
        'Complex123!',
        'Abcdefgh1'
      ];

      strongPasswords.forEach(password => {
        const errors = validatePassword(password);
        expect(errors).toHaveLength(0);
      });
    });

    it('detects missing lowercase letters', () => {
      const password = 'PASSWORD123';
      const errors = validatePassword(password);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('LOWERCASE_REQUIRED');
      expect(errors[0].message).toBe('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    });

    it('detects missing uppercase letters', () => {
      const password = 'password123';
      const errors = validatePassword(password);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('UPPERCASE_REQUIRED');
      expect(errors[0].message).toBe('Passwort muss mindestens einen Großbuchstaben enthalten');
    });

    it('detects missing numbers', () => {
      const password = 'Password';
      const errors = validatePassword(password);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('NUMBER_REQUIRED');
      expect(errors[0].message).toBe('Passwort muss mindestens eine Zahl enthalten');
    });

    it('detects insufficient length', () => {
      const password = 'Pass1';
      const errors = validatePassword(password);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('MIN_LENGTH');
      expect(errors[0].message).toBe('Passwort muss mindestens 8 Zeichen lang sein');
    });

    it('detects multiple validation errors', () => {
      const password = 'pass';
      const errors = validatePassword(password);
      
      expect(errors).toHaveLength(3);
      expect(errors.some(e => e.code === 'MIN_LENGTH')).toBe(true);
      expect(errors.some(e => e.code === 'UPPERCASE_REQUIRED')).toBe(true);
      expect(errors.some(e => e.code === 'NUMBER_REQUIRED')).toBe(true);
    });

    it('handles empty password', () => {
      const errors = validatePassword('');
      expect(errors).toHaveLength(4); // Empty password triggers all validation rules
      expect(errors.some(e => e.code === 'MIN_LENGTH')).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('validates correct phone numbers', () => {
      const validPhones = [
        '0123456789',
        '+49123456789',
        '0123 456 789',
        '0123-456-789',
        '(0123) 456-789',
        '+49 123 456 789'
      ];

      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it('rejects invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        'abc',
        '123abc',
        '123-',
        '+',
        ''
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(false);
      });
    });
  });

  describe('validateUrl', () => {
    it('validates correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.org',
        'https://www.example.com/path',
        'https://example.com?param=value',
        'ftp://example.com'
      ];

      validUrls.forEach(url => {
        expect(validateUrl(url)).toBe(true);
      });
    });

    it('rejects invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://',
        'example.com',
        'ftp://',
        ''
      ];

      invalidUrls.forEach(url => {
        expect(validateUrl(url)).toBe(false);
      });
    });
  });

  describe('validatePrice', () => {
    it('validates correct prices', () => {
      expect(validatePrice(0)).toBe(true);
      expect(validatePrice(100)).toBe(true);
      expect(validatePrice(999999999)).toBe(true);
      expect(validatePrice(99.99)).toBe(true);
    });

    it('rejects invalid prices', () => {
      expect(validatePrice(-1)).toBe(false);
      expect(validatePrice(-100)).toBe(false);
      expect(validatePrice(1000000000)).toBe(false);
      expect(validatePrice(Infinity)).toBe(false);
      expect(validatePrice(-Infinity)).toBe(false);
    });
  });

  describe('validateTextLength', () => {
    it('validates text within length limits', () => {
      const text = 'This is a test text';
      
      // Test with min length only
      expect(validateTextLength(text, 10)).toHaveLength(0);
      
      // Test with max length only
      expect(validateTextLength(text, undefined, 50)).toHaveLength(0);
      
      // Test with both limits
      expect(validateTextLength(text, 10, 50)).toHaveLength(0);
    });

    it('detects text too short', () => {
      const text = 'Short';
      const errors = validateTextLength(text, 10);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('MIN_LENGTH');
      expect(errors[0].field).toBe('text');
    });

    it('detects text too long', () => {
      const text = 'This is a very long text that exceeds the maximum length limit';
      const errors = validateTextLength(text, undefined, 20);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('MAX_LENGTH');
      expect(errors[0].field).toBe('text');
    });

    it('handles edge cases', () => {
      expect(validateTextLength('', 0, 10)).toHaveLength(0);
      expect(validateTextLength('', 1, 10)).toHaveLength(1);
      expect(validateTextLength('test', 4, 4)).toHaveLength(0);
    });
  });
});
