import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip
} from '@mui/material';
import { Euro as EuroIcon, LocationOn as LocationIcon } from '@mui/icons-material';

interface PriceLocationFormProps {
  price: string;
  setPrice: (price: string) => void;
  location: string;
  setLocation: (location: string) => void;
  priceType: 'fixed' | 'negotiable' | 'free';
  setPriceType: (type: 'fixed' | 'negotiable' | 'free') => void;
  errors: { [key: string]: string };
}

export const PriceLocationForm: React.FC<PriceLocationFormProps> = ({
  price,
  setPrice,
  location,
  setLocation,
  priceType,
  setPriceType,
  errors
}) => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
        Preis & Standort
      </Typography>

      {/* Preis */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Preis *
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            error={!!errors.price}
            helperText={errors.price}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EuroIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Preistyp</InputLabel>
            <Select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as 'fixed' | 'negotiable' | 'free')}
              label="Preistyp"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="fixed">Festpreis</MenuItem>
              <MenuItem value="negotiable">Verhandlungsbasis</MenuItem>
              <MenuItem value="free">Kostenlos</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {priceType === 'free' && (
          <Chip
            label="Kostenlos"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {/* Standort */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Standort *
          </Typography>
        </Box>
        <TextField
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="z.B. Berlin, Mitte"
          error={!!errors.location}
          helperText={errors.location || 'Stadt oder Stadtteil'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
      </Box>
    </>
  );
};
