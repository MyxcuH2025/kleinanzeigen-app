import React, { useState } from 'react';
import { Box, Container, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { DashboardLayout } from '../components/DashboardLayout';
import { FAQSection } from '../components/FAQ/FAQSection';
import { ContactForm } from '../components/FAQ/ContactForm';
import { ContactInfo } from '../components/FAQ/ContactInfo';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const FAQContactPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');

  const handleContactSubmit = async (data: ContactFormData): Promise<void> => {
    // Simuliere API-Aufruf
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Hier würde normalerweise der API-Aufruf stattfinden
 // Removed for performance
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              textAlign: 'center',
              mb: 2
            }}
          >
            Hilfe & Kontakt
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Finden Sie Antworten auf häufige Fragen oder kontaktieren Sie uns direkt. 
            Unser Support-Team hilft Ihnen gerne weiter.
          </Typography>
        </Box>

        {/* FAQ Sektion */}
        <FAQSection 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Kontakt Sektion */}
        <Box sx={{ mt: 6 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 4 }}>
            <Box>
              <ContactForm onSubmit={handleContactSubmit} />
            </Box>
            <Box>
              <ContactInfo />
            </Box>
          </Box>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default FAQContactPage;
