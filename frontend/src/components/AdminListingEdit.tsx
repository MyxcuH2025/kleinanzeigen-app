import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';

interface AdminListingEditProps {
  open: boolean;
  onClose: () => void;
  listingId: number;
  listingData?: {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    condition: string;
    status: string;
    images: string;
  };
  onSuccess?: () => void;
}

export const AdminListingEdit: React.FC<AdminListingEditProps> = ({
  open,
  onClose,
  listingId,
  listingData,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    location: '',
    condition: 'Gebraucht',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (listingData) {
      setFormData({
        title: listingData.title || '',
        description: listingData.description || '',
        price: listingData.price || 0,
        category: listingData.category || '',
        location: listingData.location || '',
        condition: listingData.condition || 'Gebraucht',
        status: listingData.status || 'active'
      });
    }
  }, [listingData]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nicht angemeldet');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/admin/listings/${listingId}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Fehler beim Bearbeiten der Anzeige');
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten:', error);
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Edit color="primary" />
          <Typography variant="h6">Anzeige als Admin bearbeiten</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Anzeige erfolgreich bearbeitet!
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField
            label="Titel"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            fullWidth
            required
          />
          
          <TextField
            label="Beschreibung"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
          />
          
          <TextField
            label="Preis (€)"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            fullWidth
            required
          />
          
          <TextField
            label="Kategorie"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            fullWidth
            required
          />
          
          <TextField
            label="Standort"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            fullWidth
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>Zustand</InputLabel>
            <Select
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              label="Zustand"
            >
              <MenuItem value="Neu">Neu</MenuItem>
              <MenuItem value="Gebraucht">Gebraucht</MenuItem>
              <MenuItem value="Defekt">Defekt</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="active">
                <Chip label="Aktiv" color="success" size="small" />
              </MenuItem>
              <MenuItem value="pending">
                <Chip label="Ausstehend" color="warning" size="small" />
              </MenuItem>
              <MenuItem value="rejected">
                <Chip label="Abgelehnt" color="error" size="small" />
              </MenuItem>
              <MenuItem value="deleted">
                <Chip label="Gelöscht" color="default" size="small" />
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<Cancel />}
        >
          Abbrechen
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || success}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
        >
          {loading ? 'Speichern...' : 'Speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 