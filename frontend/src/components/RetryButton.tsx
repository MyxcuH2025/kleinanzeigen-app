import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  error?: string;
  maxRetries?: number;
  retryDelay?: number;
  children?: React.ReactNode;
}

const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  error,
  maxRetries = 3,
  retryDelay = 1000,
  children
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
      // Erfolg - Reset retry count
      setRetryCount(0);
    } catch {
      // Fehler - Warte vor dem nächsten Versuch
      if (retryCount < maxRetries - 1) {
        setTimeout(() => {
          setIsRetrying(false);
        }, retryDelay);
      } else {
        setIsRetrying(false);
      }
    }
  };

  const canRetry = retryCount < maxRetries;

  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {retryCount > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Versuch {retryCount} von {maxRetries}
        </Typography>
      )}

      {children}

      {canRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
          disabled={isRetrying}
          sx={{ mt: 2 }}
        >
          {isRetrying ? 'Wird wiederholt...' : 'Erneut versuchen'}
        </Button>
      )}

      {!canRetry && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          Maximale Anzahl von Versuchen erreicht. Bitte versuchen Sie es später erneut.
        </Typography>
      )}
    </Box>
  );
};

export default RetryButton; 