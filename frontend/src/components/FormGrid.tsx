import { Box, TextField, Button } from '@mui/material';

export const FormGrid = () => {
  return (
    <Box
      component="form"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)'
        },
        gap: 2,
        p: 2,
        '& .full-width': {
          gridColumn: { xs: '1', md: '1 / -1' }
        }
      }}
    >
      <TextField
        label="Vorname"
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Nachname"
        variant="outlined"
        fullWidth
      />
      <TextField
        label="E-Mail"
        type="email"
        variant="outlined"
        fullWidth
        className="full-width"
      />
      <TextField
        label="Telefon"
        type="tel"
        variant="outlined"
        fullWidth
        className="full-width"
      />
      <TextField
        label="Adresse"
        variant="outlined"
        fullWidth
        className="full-width"
      />
      <TextField
        label="PLZ"
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Stadt"
        variant="outlined"
        fullWidth
      />
      <Box sx={{ 
        gridColumn: { xs: '1', md: '1 / -1' },
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2
      }}>
        <Button variant="outlined">Abbrechen</Button>
        <Button variant="contained">Speichern</Button>
      </Box>
    </Box>
  );
}; 