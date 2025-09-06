import { logger } from '../logger';

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

describe('Logger Utility', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console methods
    Object.defineProperty(global, 'console', {
      value: mockConsole,
      writable: true
    });
  });

  afterEach(() => {
    // Restore original console
    Object.defineProperty(global, 'console', {
      value: originalConsole,
      writable: true
    });
  });

  describe('info', () => {
    it('logs info messages with prefix', () => {
      logger.info('Test message');
      
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] Test message');
    });

    it('handles additional arguments', () => {
      const data = { id: 1, name: 'Test' };
      const error = new Error('Test error');
      
      logger.info('User created', data, error);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[INFO] User created',
        data,
        error
      );
    });

    it('handles empty message', () => {
      logger.info('');
      
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] ');
    });

    it('handles special characters in message', () => {
      logger.info('Special chars: äöüß€$%&');
      
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] Special chars: äöüß€$%&');
    });
  });

  describe('error', () => {
    it('logs error messages with prefix', () => {
      logger.error('Test error');
      
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test error');
    });

    it('handles additional arguments', () => {
      const error = new Error('Database connection failed');
      const context = { userId: 123, action: 'login' };
      
      logger.error('Database error occurred', error, context);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[ERROR] Database error occurred',
        error,
        context
      );
    });

    it('handles error objects', () => {
      const error = new Error('Network timeout');
      logger.error('API call failed', error);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[ERROR] API call failed',
        error
      );
    });
  });

  describe('warn', () => {
    it('logs warning messages with prefix', () => {
      logger.warn('Test warning');
      
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Test warning');
    });

    it('handles additional arguments', () => {
      const data = { field: 'email', value: 'invalid@' };
      
      logger.warn('Validation warning', data);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '[WARN] Validation warning',
        data
      );
    });

    it('handles multiple arguments', () => {
      logger.warn('Multiple args', 'arg1', 'arg2', 123, true);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '[WARN] Multiple args',
        'arg1',
        'arg2',
        123,
        true
      );
    });
  });

  describe('debug', () => {
    it('logs debug messages with prefix', () => {
      logger.debug('Test debug');
      
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Test debug');
    });

    it('handles additional arguments', () => {
      const state = { loading: true, data: null };
      const timestamp = Date.now();
      
      logger.debug('Component state changed', state, timestamp);
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        '[DEBUG] Component state changed',
        state,
        timestamp
      );
    });

    it('handles complex objects', () => {
      const complexObj = {
        user: { id: 1, name: 'John' },
        permissions: ['read', 'write'],
        metadata: { createdAt: new Date(), version: '1.0.0' }
      };
      
      logger.debug('Complex object logged', complexObj);
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        '[DEBUG] Complex object logged',
        complexObj
      );
    });
  });

  describe('Integration tests', () => {
    it('logs different message types correctly', () => {
      logger.info('User logged in');
      logger.warn('Session expiring soon');
      logger.error('Failed to save data');
      logger.debug('Current user state');
      
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] User logged in');
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Session expiring soon');
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Failed to save data');
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Current user state');
    });

    it('maintains correct prefix format', () => {
      const prefixes = ['[INFO]', '[WARN]', '[ERROR]', '[DEBUG]'];
      
      logger.info('Test message');
      logger.warn('Test message');
      logger.error('Test message');
      logger.debug('Test message');
      
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] Test message');
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Test message');
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test message');
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Test message');
    });
  });

  describe('Edge cases', () => {
    it('handles null and undefined arguments', () => {
      logger.info('Message with null', null);
      logger.warn('Message with undefined', undefined);
      
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] Message with null', null);
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Message with undefined', undefined);
    });

    it('handles empty string arguments', () => {
      logger.info('Message', '', 'end');
      
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] Message', '', 'end');
    });

    it('handles zero and false values', () => {
      logger.debug('Message', 0, false);
      
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Message', 0, false);
    });

    it('handles very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      logger.info(longMessage);
      
      expect(mockConsole.log).toHaveBeenCalledWith(`[INFO] ${longMessage}`);
    });

    it('handles messages with newlines', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      logger.warn(multilineMessage);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(`[WARN] ${multilineMessage}`);
    });
  });

  describe('Performance considerations', () => {
    it('handles rapid successive calls', () => {
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`);
      }
      
      expect(mockConsole.log).toHaveBeenCalledTimes(100);
      expect(mockConsole.log).toHaveBeenLastCalledWith('[INFO] Message 99');
    });

    it('handles all log levels in sequence', () => {
      const messages = [
        { method: 'info', message: 'Info message' },
        { method: 'warn', message: 'Warning message' },
        { method: 'error', message: 'Error message' },
        { method: 'debug', message: 'Debug message' }
      ];

      messages.forEach(({ method, message }) => {
        (logger as any)[method](message);
      });

      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] Info message');
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Warning message');
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Error message');
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Debug message');
    });
  });
});
