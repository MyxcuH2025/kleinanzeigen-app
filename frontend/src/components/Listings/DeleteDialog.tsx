import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Listing {
  id: number;
  title: string;
  price: number;
  status: string;
}

interface DeleteDialogProps {
  open: boolean;
  listing: Listing | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  listing,
  onClose,
  onConfirm,
  loading = false
}) => {
  if (!listing) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1
      }}>
        <WarningIcon color="warning" />
        Anzeige löschen
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Diese Aktion kann nicht rückgängig gemacht werden!
        </Alert>
        
        <Typography variant="body1" gutterBottom>
          Möchtest du die folgende Anzeige wirklich löschen?
        </Typography>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 1, 
          mt: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {listing.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {listing.id} • Status: {listing.status}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Alle zugehörigen Daten (Bilder, Nachrichten, Favoriten) werden ebenfalls gelöscht.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          Abbrechen
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
        >
          {loading ? 'Lösche...' : 'Löschen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
