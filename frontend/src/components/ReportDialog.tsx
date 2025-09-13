import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Report as ReportIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

export type ReportReason = 
  | 'fraud'
  | 'inappropriate_images'
  | 'false_description'
  | 'overpriced'
  | 'wrong_category'
  | 'illegal'
  | 'spam'
  | 'contact_in_description'
  | 'other';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  onReportSubmit: (reason: ReportReason, description: string) => Promise<void>;
}

const reportReasons = {
  fraud: {
    label: 'Betrug/Scam',
    description: 'Verdächtige oder betrügerische Aktivität',
    icon: WarningIcon,
    color: 'error' as const
  },
  inappropriate_images: {
    label: 'Unangemessene Bilder',
    description: 'Bilder sind unangemessen oder verstörend',
    icon: WarningIcon,
    color: 'warning' as const
  },
  false_description: {
    label: 'Falsche Beschreibung',
    description: 'Beschreibung stimmt nicht mit dem Artikel überein',
    icon: WarningIcon,
    color: 'warning' as const
  },
  overpriced: {
    label: 'Überhöhter Preis',
    description: 'Preis ist deutlich über dem Marktwert',
    icon: WarningIcon,
    color: 'info' as const
  },
  wrong_category: {
    label: 'Falsche Kategorie',
    description: 'Artikel ist in der falschen Kategorie',
    icon: WarningIcon,
    color: 'info' as const
  },
  illegal: {
    label: 'Rechtsverstoß',
    description: 'Artikel oder Aktivität verstößt gegen Gesetze',
    icon: WarningIcon,
    color: 'error' as const
  },
  spam: {
    label: 'Spam/Werbung',
    description: 'Unerwünschte Werbung oder Spam',
    icon: WarningIcon,
    color: 'warning' as const
  },
  contact_in_description: {
    label: 'Kontaktdaten in Beschreibung',
    description: 'Telefonnummer oder E-Mail in der Beschreibung',
    icon: WarningIcon,
    color: 'info' as const
  },
  other: {
    label: 'Sonstiges',
    description: 'Anderer Grund',
    icon: WarningIcon,
    color: 'default' as const
  }
};

export const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onClose,
  listingTitle,
  onReportSubmit
}) => {
  const [reason, setReason] = useState<ReportReason>('other');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Bitte beschreibe das Problem');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onReportSubmit(reason, description);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setDescription('');
        setReason('other');
      }, 2000);
    } catch (err) {
      console.error('Report error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Melden der Anzeige';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setDescription('');
      setReason('other');
      setError(null);
      setSuccess(false);
    }
  };

  const selectedReason = reportReasons[reason];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ReportIcon color="error" />
          <Typography variant="h6">Anzeige melden</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Box textAlign="center" py={3}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              Anzeige erfolgreich gemeldet!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Deine Meldung wurde eingereicht und wird geprüft.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Meldung für: <strong>{listingTitle}</strong>
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Grund für die Meldung</InputLabel>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                label="Grund für die Meldung"
              >
                {Object.entries(reportReasons).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <MenuItem key={key} value={key}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <IconComponent color={config.color === 'default' ? 'inherit' : config.color} />
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

            {reason !== 'other' && (
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<selectedReason.icon />}
                  label={selectedReason.label}
                  color={selectedReason.color}
                  variant="outlined"
                />
              </Box>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Beschreibung des Problems"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibe bitte detailliert, warum diese Anzeige gemeldet werden soll..."
              helperText={`${description.length}/1000 Zeichen`}
              error={description.length > 1000}
              disabled={loading}
            />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Deine Meldung wird vertraulich behandelt und hilft uns dabei, die Plattform sicher zu halten.
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading || success}>
          Abbrechen
        </Button>
        {!success && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={loading || !description.trim() || description.length > 1000}
            startIcon={loading ? <CircularProgress size={16} /> : <ReportIcon />}
          >
            {loading ? 'Wird gemeldet...' : 'Anzeige melden'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}; 
