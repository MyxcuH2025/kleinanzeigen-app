import React, { useState } from 'react';
import {
  Box,
  Button,
  Alert,
  Collapse,
  Typography
} from '@mui/material';
import { getFullApiUrl } from '@/config/config';

interface ResendVerificationProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
}

const ResendVerification: React.FC<ResendVerificationProps> = ({ 
  email, 
  isOpen, 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(getFullApiUrl('api/resend-verification'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.msg || 'Verifikations-E-Mail wurde erneut gesendet');
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setMessage(data.detail || 'Fehler beim Senden der E-Mail');
      }
    } catch (error) {
      setMessage('Verbindungsfehler. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapse in={isOpen}>
      <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Haben Sie keine E-Mail erhalten? Klicken Sie auf den Button unten, um eine neue Verifikations-E-Mail zu erhalten.
        </Typography>
        
        {message && (
          <Alert severity={message.includes('Fehler') ? 'error' : 'success'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? 'Wird gesendet...' : 'E-Mail erneut senden'}
          </Button>
          
          <Button
            variant="text"
            size="small"
            onClick={onClose}
            disabled={loading}
          >
            Schließen
          </Button>
        </Box>
      </Box>
    </Collapse>
  );
};

export default ResendVerification; 
