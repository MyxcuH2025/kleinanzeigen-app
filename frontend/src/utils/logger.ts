// Einfacher Logger für die Anwendung
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    // Always log in development, can be controlled by environment variable
    console.log(`[INFO] ${message}`, ...args);
  },
  
  error: (message: string, ...args: unknown[]) => {
    // Always log errors
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: unknown[]) => {
    // Always log warnings
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  debug: (message: string, ...args: unknown[]) => {
    // Always log debug messages
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}; 