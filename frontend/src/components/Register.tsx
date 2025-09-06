import { Box, Typography, Container, Paper } from '@mui/material';
import RegisterForm from './RegisterForm';

export const Register = () => {
  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="lg" sx={{ px: 3 }}>
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
            Registrieren
          </Typography>
          
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <RegisterForm />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}; 