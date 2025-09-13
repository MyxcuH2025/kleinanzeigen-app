import { Box, Typography, Container, Paper } from '@mui/material';
import { LoginForm } from './LoginForm';

export const Login = () => {
  return (
    <Box sx={{ width: '100%', py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="lg" sx={{ px: 3 }}>
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
            Anmelden
          </Typography>
          
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <LoginForm />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}; 
