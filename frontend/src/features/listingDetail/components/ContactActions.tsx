import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ContactActionsProps } from '../types';

const ContactActions: React.FC<ContactActionsProps> = ({ 
  listing, 
  onStartChat, 
  onRevealPhone, 
  onSendEmail, 
  canContact, 
  phoneRevealed 
}) => {
  return (
    <Box sx={{ mb: 3, p: 3, border: '1px solid #f0f0f0', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Kontakt</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button 
          variant="contained" 
          onClick={onStartChat}
          sx={{ bgcolor: '#dcf8c6', color: '#1a1a1a' }}
        >
          Chat starten
        </Button>
        <Button variant="outlined" onClick={onRevealPhone}>
          Telefon anzeigen
        </Button>
        <Button variant="outlined" onClick={onSendEmail}>
          E-Mail senden
        </Button>
      </Box>
    </Box>
  );
};

export default ContactActions;
