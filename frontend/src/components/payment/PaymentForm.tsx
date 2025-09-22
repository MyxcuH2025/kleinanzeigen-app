/**
 * Payment Form Component für Zahlungsabwicklung
 */
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import { CreditCard, PayPal, Euro } from '@mui/icons-material';
import { paymentService, PaymentCreate } from '../../services/paymentService';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'EUR',
  description,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      setError('Bitte geben Sie einen gültigen Betrag ein');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const paymentData: PaymentCreate = {
        amount: amount * 100, // Convert to cents
        currency,
        payment_method: paymentMethod,
        description: description || `Zahlung über ${amount} ${currency}`,
        metadata: {
          source: 'frontend',
          timestamp: new Date().toISOString()
        }
      };

      const payment = await paymentService.createPayment(paymentData);
      
      setSuccess(`Zahlung erfolgreich erstellt: ${payment.payment_id}`);
      
      if (onPaymentSuccess) {
        onPaymentSuccess(payment.payment_id);
      }

      // Redirect to payment gateway if needed
      if (payment.gateway_payment_id) {
        if (paymentMethod === 'stripe') {
          // Handle Stripe redirect
          console.log('Redirecting to Stripe...');
        } else if (paymentMethod === 'paypal') {
          // Handle PayPal redirect
          console.log('Redirecting to PayPal...');
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setError(errorMessage);
      
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '0 auto' }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          💳 Zahlung abwickeln
        </Typography>
        
        <Divider sx={{ marginBottom: 3 }} />

        {/* Amount Display */}
        <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
          <Typography variant="h4" color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Euro />
            {amount.toFixed(2)} {currency}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
              {description}
            </Typography>
          )}
        </Box>

        {/* Payment Method Selection */}
        <FormControl fullWidth sx={{ marginBottom: 3 }}>
          <InputLabel>Zahlungsmethode</InputLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'paypal')}
            label="Zahlungsmethode"
          >
            <MenuItem value="stripe">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard />
                <Typography>Kreditkarte (Stripe)</Typography>
              </Box>
            </MenuItem>
            <MenuItem value="paypal">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PayPal />
                <Typography>PayPal</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            {success}
          </Alert>
        )}

        {/* Payment Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handlePayment}
          disabled={isLoading || !amount || amount <= 0}
          sx={{ 
            marginTop: 2,
            backgroundColor: '#dcf8c6',
            color: '#000',
            '&:hover': {
              backgroundColor: '#c8f0a8'
            }
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography>Wird verarbeitet...</Typography>
            </Box>
          ) : (
            `Mit ${paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'} bezahlen`
          )}
        </Button>

        {/* Security Notice */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', marginTop: 2 }}>
          🔒 Ihre Zahlungsdaten werden sicher verarbeitet und nicht gespeichert
        </Typography>
      </CardContent>
    </Card>
  );
};
