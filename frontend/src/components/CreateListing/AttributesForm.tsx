import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Alert
} from '@mui/material';
import { type AttributesConfig } from '@/config/attributesConfig';

interface AttributesFormProps {
  categoryAttributes: AttributesConfig;
  attributes: Record<string, any>;
  setAttributes: (attributes: Record<string, any>) => void;
  errors: { [key: string]: string };
}

const AttributesForm: React.FC<AttributesFormProps> = ({
  categoryAttributes,
  attributes,
  setAttributes,
  errors
}) => {
  // Handler für Attribut-Änderungen
  const handleAttributeChange = (key: string, value: any) => {
    setAttributes({
      ...attributes,
      [key]: value
    });
  };

  // Render-Funktion für verschiedene Attribut-Typen
  const renderAttributeField = (key: string, config: any) => {
    const errorKey = `attribute_${key}`;
    const hasError = !!errors[errorKey];
    const value = attributes[key] || '';

    switch (config.type) {
      case 'string':
        if (config.options) {
          // Select-Dropdown für String mit Optionen
          return (
            <FormControl fullWidth error={hasError} key={key}>
              <InputLabel>{config.label}</InputLabel>
              <Select
                value={value}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
                label={config.label}
              >
                {config.options.map((option: string) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {hasError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors[errorKey]}
                </Alert>
              )}
            </FormControl>
          );
        } else {
          // Textfeld für String ohne Optionen
          return (
            <TextField
              key={key}
              fullWidth
              label={config.label}
              value={value}
              onChange={(e) => handleAttributeChange(key, e.target.value)}
              placeholder={config.placeholder}
              error={hasError}
              helperText={hasError ? errors[errorKey] : ''}
              required={config.required}
            />
          );
        }

      case 'integer':
        return (
          <TextField
            key={key}
            fullWidth
            label={config.label}
            type="number"
            value={value}
            onChange={(e) => handleAttributeChange(key, e.target.value)}
            placeholder={config.placeholder}
            error={hasError}
            helperText={hasError ? errors[errorKey] : ''}
            required={config.required}
            inputProps={{
              min: config.min,
              max: config.max
            }}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={value || false}
                onChange={(e) => handleAttributeChange(key, e.target.checked)}
                color="primary"
              />
            }
            label={config.label}
            sx={{ 
              width: '100%',
              justifyContent: 'space-between',
              margin: 0,
              padding: '8px 0'
            }}
          />
        );

      default:
        return null;
    }
  };

  // Keine Attribute verfügbar
  if (Object.keys(categoryAttributes).length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
        Zusätzliche Details
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
        gap: 3 
      }}>
        {Object.entries(categoryAttributes).map(([key, config]) => (
          <Box key={key}>
            {renderAttributeField(key, config)}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AttributesForm;
