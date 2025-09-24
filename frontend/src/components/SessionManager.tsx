import React, { useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useSnackbar } from '@/context/SnackbarContext';

interface SessionManagerProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  timeoutMinutes = 30,
  warningMinutes = 5
}) => {
  const { logout } = useUser();
  const { showSnackbar } = useSnackbar();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimers = () => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Set new timers
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    const timeoutTime = timeoutMinutes * 60 * 1000;

    warningRef.current = setTimeout(() => {
      showSnackbar(
        `Ihre Sitzung läuft in ${warningMinutes} Minuten ab. Klicken Sie irgendwo, um aktiv zu bleiben.`,
        'warning'
      );
    }, warningTime);

    timeoutRef.current = setTimeout(() => {
      logout();
      showSnackbar('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.', 'info');
    }, timeoutTime);
  };

  const handleUserActivity = () => {
    resetTimers();
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Initial timer setup
    resetTimers();

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [timeoutMinutes, warningMinutes, logout, showSnackbar]);

  // Check for token expiration on mount and periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        // Prüfe ob es ein Mock-Token ist
        if (token === 'mock_token_123') {
          // Mock-Token ist immer gültig
          return;
        }
        
        // Für echte JWT-Tokens: Decode JWT token (basic check)
        if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
          console.warn('Invalid token format');
          return;
        }
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= expirationTime) {
          logout();
          showSnackbar('Ihr Token ist abgelaufen. Bitte melden Sie sich erneut an.', 'info');
        }
      } catch {
        // Invalid token - aber nicht bei Mock-Tokens
        if (token !== 'mock_token_123') {
          logout();
          showSnackbar('Ungültiger Token. Bitte melden Sie sich erneut an.', 'error');
        }
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [logout, showSnackbar]);

  return null; // This component doesn't render anything
};

export default SessionManager; 
