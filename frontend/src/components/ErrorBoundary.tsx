import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            p: 4
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(220, 248, 198, 0.2)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.06),
                0 2px 8px rgba(220, 248, 198, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: '#f44336',
                mb: 2
              }}
            />
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                mb: 1
              }}
            >
              Ein Fehler ist aufgetreten
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
            </Typography>

            {this.state.error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  textAlign: 'left',
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem'
                  }
                }}
              >
                <Typography variant="caption" component="div">
                  <strong>Fehler:</strong> {this.state.error.message}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                    <strong>Details:</strong> {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Alert>
            )}

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                px: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                boxShadow: `
                  0 4px 16px rgba(34, 197, 94, 0.3),
                  0 2px 8px rgba(34, 197, 94, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                border: '1px solid rgba(34, 197, 94, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: `
                    0 8px 24px rgba(34, 197, 94, 0.4),
                    0 4px 12px rgba(34, 197, 94, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                  `
                }
              }}
            >
              Erneut versuchen
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}