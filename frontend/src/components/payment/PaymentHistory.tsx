/**
 * Payment History Component für Zahlungshistorie
 */
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
  Chip,
  IconButton,
  Pagination,
  Alert,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  CreditCard,
  PayPal,
  Receipt,
  Euro,
  Refresh
} from '@mui/icons-material';
import { paymentService, UserPayment } from '../../services/paymentService';

interface PaymentHistoryProps {
  onRefresh?: () => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ onRefresh }) => {
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPayments = async (pageNum: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getUserPayments(pageNum, 10);
      setPayments(response.payments);
      setTotalPages(Math.ceil(response.total / 10));
      setTotal(response.total);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Laden der Zahlungen';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(page);
  }, [page]);

  const handleRefresh = () => {
    loadPayments(page);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Abgeschlossen';
      case 'pending':
        return 'Ausstehend';
      case 'processing':
        return 'Verarbeitung';
      case 'failed':
        return 'Fehlgeschlagen';
      case 'cancelled':
        return 'Storniert';
      case 'refunded':
        return 'Erstattet';
      default:
        return status;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'stripe':
        return <CreditCard />;
      case 'paypal':
        return <PayPal />;
      default:
        return <Receipt />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && payments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <Typography variant="h5" component="h2">
          💳 Zahlungshistorie
        </Typography>
        <Tooltip title="Aktualisieren">
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {/* Payments Table */}
      {payments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', padding: 4 }}>
            <Receipt sx={{ fontSize: 64, color: 'text.secondary', marginBottom: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Keine Zahlungen gefunden
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ihre Zahlungshistorie wird hier angezeigt, sobald Sie eine Zahlung getätigt haben.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Zahlungsmethode</TableCell>
                  <TableCell>Betrag</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.payment_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getPaymentMethodIcon(payment.payment_method)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {payment.payment_method}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatAmount(payment.amount, payment.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(payment.status)}
                        color={getStatusColor(payment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(payment.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {payment.payment_id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                disabled={isLoading}
              />
            </Box>
          )}

          {/* Summary */}
          <Divider />
          <Box sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {total} Zahlung{total !== 1 ? 'en' : ''} insgesamt
            </Typography>
          </Box>
        </Card>
      )}
    </Box>
  );
};
