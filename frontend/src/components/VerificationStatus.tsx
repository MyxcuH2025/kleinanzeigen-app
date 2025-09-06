import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

import {
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Email as EmailIcon
} from '@mui/icons-material';

interface VerificationStatusProps {
  userId: number;
}

interface VerificationData {
  id: number;
  verification_type: string;
  company_name: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
}

interface UserVerificationStatus {
  verification_state: string;
  verification: VerificationData | null;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ userId }) => {
  const [status, setStatus] = useState<UserVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVerificationStatus();
  }, [userId]);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/seller/verification/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden des Verifizierungsstatus');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'UNVERIFIED':
        return <ErrorIcon color="error" />;
      case 'EMAIL_VERIFIED':
        return <EmailIcon color="info" />;
      case 'SELLER_PENDING':
        return <PendingIcon color="warning" />;
      case 'SELLER_VERIFIED':
        return <CheckIcon color="success" />;
      case 'SELLER_REVOKED':
        return <ErrorIcon color="error" />;
      case 'BANNED':
        return <ErrorIcon color="error" />;
      default:
        return <ScheduleIcon color="disabled" />;
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'UNVERIFIED':
        return 'error';
      case 'EMAIL_VERIFIED':
        return 'info';
      case 'SELLER_PENDING':
        return 'warning';
      case 'SELLER_VERIFIED':
        return 'success';
      case 'SELLER_REVOKED':
        return 'error';
      case 'BANNED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (state: string) => {
    switch (state) {
      case 'UNVERIFIED':
        return 'Unverifiziert';
      case 'EMAIL_VERIFIED':
        return 'E-Mail verifiziert';
      case 'SELLER_PENDING':
        return 'Verkäufer-Verifizierung läuft';
      case 'SELLER_VERIFIED':
        return 'Verkäufer verifiziert';
      case 'SELLER_REVOKED':
        return 'Verifizierung entzogen';
      case 'BANNED':
        return 'Gesperrt';
      default:
        return 'Unbekannt';
    }
  };

  const getStatusDescription = (state: string) => {
    switch (state) {
      case 'UNVERIFIED':
        return 'Ihre E-Mail-Adresse wurde noch nicht verifiziert. Bitte bestätigen Sie zuerst Ihre E-Mail.';
      case 'EMAIL_VERIFIED':
        return 'Ihre E-Mail-Adresse ist verifiziert. Sie können jetzt einen Verifizierungsantrag als Verkäufer stellen.';
      case 'SELLER_PENDING':
        return 'Ihr Verifizierungsantrag wird derzeit von unserem Team geprüft. Dies kann 1-3 Werktage dauern.';
      case 'SELLER_VERIFIED':
        return 'Glückwunsch! Sie sind jetzt ein verifizierter Verkäufer und genießen das Vertrauen unserer Community.';
      case 'SELLER_REVOKED':
        return 'Ihre Verkäufer-Verifizierung wurde entzogen. Sie können einen neuen Antrag stellen.';
      case 'BANNED':
        return 'Ihr Account wurde gesperrt. Kontaktieren Sie unseren Support für weitere Informationen.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Lade Verifizierungsstatus...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={loadVerificationStatus} variant="outlined">
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <BusinessIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Verifizierungsstatus
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Überprüfen Sie Ihren aktuellen Verifizierungsstatus
          </Typography>
        </Box>

        {/* Aktueller Status */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {getStatusIcon(status.verification_state)}
            <Typography variant="h6">
              {getStatusText(status.verification_state)}
            </Typography>
            <Chip
              label={getStatusText(status.verification_state)}
              color={getStatusColor(status.verification_state) as any}
              variant="outlined"
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            {getStatusDescription(status.verification_state)}
          </Typography>
        </Box>

        {/* Verifizierungsprozess als einfache Schritte */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Verifizierungsprozess
          </Typography>
          
          {/* Schritt 1 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: status.verification_state !== 'UNVERIFIED' ? '#28a745' : '#6c757d',
              color: 'white',
              mr: 2
            }}>
              {status.verification_state !== 'UNVERIFIED' ? '✓' : '1'}
            </Box>
            <Box>
              <Typography variant="h6" component="span">
                E-Mail verifizieren
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bestätigen Sie Ihre E-Mail-Adresse
              </Typography>
            </Box>
          </Box>

          {/* Schritt 2 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: (status.verification_state === 'SELLER_PENDING' || status.verification_state === 'SELLER_VERIFIED') ? '#28a745' : '#6c757d',
              color: 'white',
              mr: 2
            }}>
              {(status.verification_state === 'SELLER_PENDING' || status.verification_state === 'SELLER_VERIFIED') ? '✓' : '2'}
            </Box>
            <Box>
              <Typography variant="h6" component="span">
                Verkäufer-Verifizierung
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reichen Sie Ihren Verifizierungsantrag ein
              </Typography>
            </Box>
          </Box>

          {/* Schritt 3 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: status.verification_state === 'SELLER_VERIFIED' ? '#28a745' : '#6c757d',
              color: 'white',
              mr: 2
            }}>
              {status.verification_state === 'SELLER_VERIFIED' ? '✓' : '3'}
            </Box>
            <Box>
              <Typography variant="h6" component="span">
                Verifizierung abgeschlossen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Werden Sie ein verifizierter Verkäufer
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Verifizierungsdetails */}
        {status.verification && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Verifizierungsdetails
            </Typography>
            <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1 }}>
              <Box sx={{ mb: 1 }}>
                <strong>Typ:</strong> {status.verification.verification_type === 'shop' ? 'Geschäft' : 'Dienstleister'}
              </Box>
              <Box sx={{ mb: 1 }}>
                <strong>Unternehmen:</strong> {status.verification.company_name}
              </Box>
              <Box sx={{ mb: 1 }}>
                <strong>Status:</strong> 
                <Chip
                  label={status.verification.status === 'pending' ? 'In Bearbeitung' : 
                         status.verification.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                  color={status.verification.status === 'pending' ? 'warning' : 
                         status.verification.status === 'approved' ? 'success' : 'error'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Box sx={{ mb: 1 }}>
                <strong>Eingereicht:</strong> {new Date(status.verification.submitted_at).toLocaleDateString('de-DE')}
              </Box>
              {status.verification.reviewed_at && (
                <Box sx={{ mb: 1 }}>
                  <strong>Geprüft:</strong> {new Date(status.verification.reviewed_at).toLocaleDateString('de-DE')}
                </Box>
              )}
              {status.verification.rejection_reason && (
                <Box sx={{ mb: 1 }}>
                  <strong>Ablehnungsgrund:</strong> {status.verification.rejection_reason}
                </Box>
              )}
              {status.verification.admin_notes && (
                <Box sx={{ mb: 1 }}>
                  <strong>Admin-Notizen:</strong> {status.verification.admin_notes}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Aktionen basierend auf Status */}
        <Box sx={{ textAlign: 'center' }}>
          {status.verification_state === 'EMAIL_VERIFIED' && (
            <Button
              variant="contained"
              size="large"
              href="/seller-verification"
              sx={{ bgcolor: '#28a745' }}
            >
              Verkäufer-Verifizierung beantragen
            </Button>
          )}
          
          {status.verification_state === 'SELLER_REVOKED' && (
            <Button
              variant="contained"
              size="large"
              href="/seller-verification"
              sx={{ bgcolor: '#28a745' }}
            >
              Neuen Verifizierungsantrag stellen
            </Button>
          )}

          {status.verification_state === 'SELLER_PENDING' && (
            <Alert severity="info" sx={{ textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Ihr Antrag wird geprüft</strong><br />
                Wir bearbeiten Ihren Verifizierungsantrag so schnell wie möglich. 
                Sie erhalten eine E-Mail, sobald eine Entscheidung getroffen wurde.
              </Typography>
            </Alert>
          )}

          {status.verification_state === 'SELLER_VERIFIED' && (
            <Alert severity="success" sx={{ textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Verifizierung erfolgreich!</strong><br />
                Sie sind jetzt ein verifizierter Verkäufer. Ihr Profil zeigt den blauen Verifizierungshaken 
                und Sie genießen das Vertrauen unserer Community.
              </Typography>
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
