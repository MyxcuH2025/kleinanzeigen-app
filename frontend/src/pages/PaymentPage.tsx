/**
 * Payment Page für Zahlungsabwicklung
 */
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CreditCard,
  Receipt,
  Star,
  Euro
} from '@mui/icons-material';
import { PaymentForm } from '../components/payment/PaymentForm';
import { PaymentHistory } from '../components/payment/PaymentHistory';
import { SubscriptionPlans } from '../components/payment/SubscriptionPlans';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ padding: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const PaymentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDescription, setPaymentDescription] = useState<string>('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setPaymentDialogOpen(false);
    // Refresh payment history if on that tab
    if (activeTab === 1) {
      // Trigger refresh in PaymentHistory component
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    console.log('Subscription successful:', subscriptionId);
  };

  const handleSubscriptionError = (error: string) => {
    console.error('Subscription error:', error);
  };

  const openPaymentDialog = (amount: number, description: string) => {
    setPaymentAmount(amount);
    setPaymentDescription(description);
    setPaymentDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 4 }}>
      {/* Page Header */}
      <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          💳 Zahlungen & Abonnements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verwalten Sie Ihre Zahlungen und wählen Sie das passende Abonnement
        </Typography>
      </Box>

      {/* Quick Payment Options */}
      <Paper sx={{ padding: 3, marginBottom: 4, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>
          🚀 Schnellzahlung
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Euro />}
            onClick={() => openPaymentDialog(5, 'Kleinanzeigen-Guthaben')}
          >
            5€ Guthaben
          </Button>
          <Button
            variant="outlined"
            startIcon={<Euro />}
            onClick={() => openPaymentDialog(10, 'Kleinanzeigen-Guthaben')}
          >
            10€ Guthaben
          </Button>
          <Button
            variant="outlined"
            startIcon={<Euro />}
            onClick={() => openPaymentDialog(25, 'Kleinanzeigen-Guthaben')}
          >
            25€ Guthaben
          </Button>
          <Button
            variant="outlined"
            startIcon={<Star />}
            onClick={() => openPaymentDialog(9.99, 'Premium-Upgrade')}
          >
            Premium Upgrade
          </Button>
        </Box>
      </Paper>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="payment tabs">
            <Tab
              icon={<CreditCard />}
              label="Einmalzahlung"
              id="payment-tab-0"
              aria-controls="payment-tabpanel-0"
            />
            <Tab
              icon={<Receipt />}
              label="Zahlungshistorie"
              id="payment-tab-1"
              aria-controls="payment-tabpanel-1"
            />
            <Tab
              icon={<Star />}
              label="Abonnements"
              id="payment-tab-2"
              aria-controls="payment-tabpanel-2"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <PaymentForm
            amount={paymentAmount}
            description={paymentDescription}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PaymentHistory onRefresh={() => console.log('Refreshing payment history')} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <SubscriptionPlans
            onSubscriptionSuccess={handleSubscriptionSuccess}
            onSubscriptionError={handleSubscriptionError}
          />
        </TabPanel>
      </Paper>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Zahlung abwickeln
        </DialogTitle>
        <DialogContent>
          <PaymentForm
            amount={paymentAmount}
            description={paymentDescription}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            Abbrechen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Security Notice */}
      <Alert severity="info" sx={{ marginTop: 4 }}>
        <Typography variant="body2">
          🔒 <strong>Sichere Zahlungsabwicklung:</strong> Alle Zahlungen werden über verschlüsselte Verbindungen 
          abgewickelt. Ihre Zahlungsdaten werden nicht auf unseren Servern gespeichert.
        </Typography>
      </Alert>
    </Container>
  );
};
