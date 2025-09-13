import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

export type ListingStatus = 'active' | 'sold' | 'expired' | 'deleted' | 'pending';

interface ListingStatusSelectorProps {
  currentStatus: ListingStatus;
  listingId: string;
  onStatusChange: (newStatus: ListingStatus) => Promise<void>;
  disabled?: boolean;
}

const statusConfig = {
  active: {
    label: 'Verfügbar',
    color: 'success' as const,
    icon: CheckCircleIcon,
    description: 'Anzeige ist aktiv und sichtbar'
  },
  sold: {
    label: 'Verkauft',
    color: 'error' as const,
    icon: CancelIcon,
    description: 'Artikel wurde verkauft'
  },
  expired: {
    label: 'Abgelaufen',
    color: 'warning' as const,
    icon: ScheduleIcon,
    description: 'Anzeige ist abgelaufen'
  },
  deleted: {
    label: 'Gelöscht',
    color: 'default' as const,
    icon: DeleteIcon,
    description: 'Anzeige wurde gelöscht'
  },
  pending: {
    label: 'Wartend',
    color: 'info' as const,
    icon: ScheduleIcon,
    description: 'Anzeige wartet auf Freigabe'
  }
};

export const ListingStatusSelector: React.FC<ListingStatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentConfig = statusConfig[currentStatus];
  const IconComponent = currentConfig.icon;

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) {
      setOpen(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onStatusChange(selectedStatus);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Status');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setSelectedStatus(currentStatus);
    setError(null);
    setOpen(true);
  };

  return (
    <>
      <Chip
        icon={<IconComponent />}
        label={currentConfig.label}
        color={currentConfig.color}
        variant="outlined"
        onClick={handleOpen}
        disabled={disabled}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          '&:hover': disabled ? {} : { opacity: 0.8 }
        }}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon />
            <Typography variant="h6">Anzeige-Status ändern</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Wähle den neuen Status für deine Anzeige aus.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ListingStatus)}
              label="Status"
            >
              {Object.entries(statusConfig).map(([status, config]) => {
                const StatusIcon = config.icon;
                return (
                  <MenuItem key={status} value={status}>
                    <Box display="flex" alignItems="center" gap={2}>
                                              <StatusIcon color={config.color === 'default' ? 'inherit' : config.color} />
                      <Box>
                        <Typography variant="body1">{config.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {config.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {selectedStatus !== currentStatus && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Status wird von <strong>{statusConfig[currentStatus].label}</strong> zu{' '}
                <strong>{statusConfig[selectedStatus].label}</strong> geändert.
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            disabled={loading || selectedStatus === currentStatus}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Wird aktualisiert...' : 'Status ändern'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 
