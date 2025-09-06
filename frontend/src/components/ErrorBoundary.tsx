import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Hier könnte man den Fehler an einen Service wie Sentry senden
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={3}
          textAlign="center"
        >
          <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Ein Fehler ist aufgetreten
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Box mt={2} textAlign="left">
                <Typography variant="caption" component="pre" sx={{ 
                  backgroundColor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  overflow: 'auto'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
          </Alert>
          
          <Button
            variant="contained"
            onClick={() => {
              this.setState({ error: null, errorInfo: null });
              window.location.reload();
            }}
            sx={{ mt: 2 }}
          >
            Seite neu laden
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook für funktionale Komponenten
export const useErrorHandler = () => {
  const handleError = () => {
    // Hier könnte man den Fehler an einen Service senden
    // logErrorToService(error, errorInfo);
    
    // Optional: Zeige eine Benachrichtigung
    // showErrorNotification('Ein Fehler ist aufgetreten');
  };

  return { handleError };
}; 