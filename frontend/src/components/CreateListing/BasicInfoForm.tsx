import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  FormControlLabel as SwitchLabel,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface BasicInfoFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  listingType: 'offer' | 'request';
  setListingType: (type: 'offer' | 'request') => void;
  category: string;
  setCategory: (category: string) => void;
  isHighlighted: boolean;
  setIsHighlighted: (highlighted: boolean) => void;
  errors: { [key: string]: string };
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  listingType,
  setListingType,
  category,
  setCategory,
  isHighlighted,
  setIsHighlighted,
  errors
}) => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
        Grundinformationen
      </Typography>
      
      {/* Kategorie */}
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth error={!!errors.category}>
          <InputLabel>Kategorie</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Kategorie"
          >
            <MenuItem value="autos">Autos</MenuItem>
            <MenuItem value="kleinanzeigen">Kleinanzeigen</MenuItem>
          </Select>
          {errors.category && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.category}
            </Typography>
          )}
        </FormControl>
      </Box>

      {/* Gebot/Gesuch */}
      <Box sx={{ mb: 4 }}>
        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
          Gebot / Gesuch
        </FormLabel>
        <RadioGroup
          row
          value={listingType}
          onChange={(e) => setListingType(e.target.value as 'offer' | 'request')}
        >
          <FormControlLabel
            value="offer"
            control={<Radio sx={{ color: 'primary.main' }} />}
            label="Ich biete"
            sx={{ mr: 4 }}
          />
          <FormControlLabel
            value="request"
            control={<Radio sx={{ color: 'primary.main' }} />}
            label="Ich suche"
          />
        </RadioGroup>
      </Box>

      {/* Titel */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Titel *
          </Typography>
        </Box>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. iPhone 12 Pro Max 256GB, sehr guter Zustand"
          error={!!errors.title}
          helperText={errors.title || 'Beschreiben Sie Ihr Angebot präzise'}
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

      {/* Beschreibung */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Beschreibung *
          </Typography>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreiben Sie Ihr Angebot ausführlich..."
          error={!!errors.description}
          helperText={errors.description || 'Detaillierte Beschreibung erhöht die Verkaufschancen'}
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

      {/* Hervorheben */}
      <Box sx={{ mb: 4 }}>
        <SwitchLabel
          control={
            <Switch
              checked={isHighlighted}
              onChange={(e) => setIsHighlighted(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Anzeige hervorheben
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Ihre Anzeige wird prominent angezeigt (kostenpflichtig)
              </Typography>
            </Box>
          }
        />
      </Box>
    </>
  );
};
