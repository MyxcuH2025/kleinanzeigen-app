import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Handshake as ServiceIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface VerificationRequest {
  id: number;
  user_id: number;
  user_email: string;
  verification_type: string;
  company_name: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

interface AdminVerificationPanelProps {
  isAdmin: boolean;
}

const AdminVerificationPanel: React.FC<AdminVerificationPanelProps> = ({ isAdmin }) => {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [decisionDialog, setDecisionDialog] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isAdmin) {
      loadVerifications();
    }
  }, [isAdmin, statusFilter]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`http://localhost:8000/api/admin/verifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Verifizierungen');
      }

      const data = await response.json();
      setVerifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async () => {
    if (!selectedVerification) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/verification/${selectedVerification.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          decision: decision,
          admin_notes: adminNotes,
          rejection_reason: decision === 'reject' ? rejectionReason : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Entscheidung');
      }

      // Verifizierungen neu laden
      await loadVerifications();
      setDecisionDialog(false);
      setSelectedVerification(null);
      setAdminNotes('');
      setRejectionReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setSubmitting(false);
    }
  };

  const openDecisionDialog = (verification: VerificationRequest, decisionType: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setDecision(decisionType);
    setDecisionDialog(true);
    setAdminNotes('');
    setRejectionReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In Bearbeitung';
      case 'approved':
        return 'Genehmigt';
      case 'rejected':
        return 'Abgelehnt';
      default:
        return 'Unbekannt';
    }
  };

  const getVerificationTypeIcon = (type: string) => {
    return type === 'shop' ? <BusinessIcon /> : <ServiceIcon />;
  };

  const getVerificationTypeText = (type: string) => {
    return type === 'shop' ? 'Geschäft' : 'Dienstleister';
  };

  if (!isAdmin) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error">
            Zugriff verweigert
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Verifizierungsverwaltung
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">Alle</MenuItem>
                  <MenuItem value="pending">In Bearbeitung</MenuItem>
                  <MenuItem value="approved">Genehmigt</MenuItem>
                  <MenuItem value="rejected">Abgelehnt</MenuItem>
                </Select>
              </FormControl>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadVerifications}
                variant="outlined"
                disabled={loading}
              >
                Aktualisieren
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Lade Verifizierungen...
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Typ</TableCell>
                    <TableCell>Unternehmen</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Eingereicht</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Keine Verifizierungen gefunden
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    verifications.map((verification) => (
                      <TableRow key={verification.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {verification.user_email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {verification.user_id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getVerificationTypeIcon(verification.verification_type)}
                            <Typography variant="body2">
                              {getVerificationTypeText(verification.verification_type)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {verification.company_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(verification.status)}
                            color={getStatusColor(verification.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(verification.submitted_at).toLocaleDateString('de-DE')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {verification.status === 'pending' && (
                              <>
                                <Tooltip title="Genehmigen">
                                  <IconButton
                                    color="success"
                                    size="small"
                                    onClick={() => openDecisionDialog(verification, 'approve')}
                                  >
                                    <ApproveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Ablehnen">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => openDecisionDialog(verification, 'reject')}
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="Details anzeigen">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => setSelectedVerification(verification)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Entscheidungs-Dialog */}
      <Dialog open={decisionDialog} onClose={() => setDecisionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decision === 'approve' ? 'Verifizierung genehmigen' : 'Verifizierung ablehnen'}
        </DialogTitle>
        <DialogContent>
          {selectedVerification && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>User:</strong> {selectedVerification.user_email}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Unternehmen:</strong> {selectedVerification.company_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Typ:</strong> {getVerificationTypeText(selectedVerification.verification_type)}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Admin-Notizen"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          {decision === 'reject' && (
            <TextField
              fullWidth
              label="Ablehnungsgrund (erforderlich)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={2}
              required
              error={!rejectionReason.trim()}
              helperText={!rejectionReason.trim() ? 'Ablehnungsgrund ist erforderlich' : ''}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecisionDialog(false)} disabled={submitting}>
            Abbrechen
          </Button>
          <Button
            onClick={handleDecision}
            variant="contained"
            color={decision === 'approve' ? 'success' : 'error'}
            disabled={submitting || (decision === 'reject' && !rejectionReason.trim())}
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : decision === 'approve' ? (
              'Genehmigen'
            ) : (
              'Ablehnen'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verifizierungsdetails-Dialog */}
      <Dialog open={!!selectedVerification && !decisionDialog} onClose={() => setSelectedVerification(null)} maxWidth="md" fullWidth>
        <DialogTitle>Verifizierungsdetails</DialogTitle>
        <DialogContent>
          {selectedVerification && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Antragsdaten</Typography>
                <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1 }}>
                  <Box sx={{ mb: 1 }}>
                    <strong>User ID:</strong> {selectedVerification.user_id}
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <strong>E-Mail:</strong> {selectedVerification.user_email}
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <strong>Verifizierungstyp:</strong> {getVerificationTypeText(selectedVerification.verification_type)}
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <strong>Unternehmensname:</strong> {selectedVerification.company_name}
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <strong>Status:</strong> 
                    <Chip
                      label={getStatusText(selectedVerification.status)}
                      color={getStatusColor(selectedVerification.status) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <strong>Eingereicht:</strong> {new Date(selectedVerification.submitted_at).toLocaleDateString('de-DE')}
                  </Box>
                  {selectedVerification.reviewed_at && (
                    <Box sx={{ mb: 1 }}>
                      <strong>Geprüft:</strong> {new Date(selectedVerification.reviewed_at).toLocaleDateString('de-DE')}
                    </Box>
                  )}
                </Box>
              </Box>

              {selectedVerification.admin_notes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Admin-Notizen</Typography>
                  <Typography variant="body2" sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1 }}>
                    {selectedVerification.admin_notes}
                  </Typography>
                </Box>
              )}

              {selectedVerification.rejection_reason && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Ablehnungsgrund</Typography>
                  <Typography variant="body2" sx={{ bgcolor: '#fff3cd', p: 2, borderRadius: 1, color: '#856404' }}>
                    {selectedVerification.rejection_reason}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVerification(null)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminVerificationPanel;
