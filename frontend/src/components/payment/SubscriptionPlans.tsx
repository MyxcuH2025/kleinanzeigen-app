/**
 * Subscription Plans Component für Abonnement-Auswahl
 */
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle,
  Star,
  Business,
  Diamond,
  Euro
} from '@mui/icons-material';
import { paymentService, SubscriptionCreate } from '../../services/paymentService';

interface SubscriptionPlan {
  id: 'basic' | 'premium' | 'pro' | 'enterprise';
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    currency: 'EUR',
    period: 'Monat',
    description: 'Perfekt für Einzelpersonen',
    features: [
      'Bis zu 10 Anzeigen',
      'Standard-Support',
      'Basis-Suchfunktionen',
      'E-Mail-Benachrichtigungen'
    ],
    icon: <CheckCircle />,
    color: '#4caf50'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    currency: 'EUR',
    period: 'Monat',
    description: 'Ideal für aktive Nutzer',
    features: [
      'Bis zu 50 Anzeigen',
      'Prioritäts-Support',
      'Erweiterte Suchfunktionen',
      'Push-Benachrichtigungen',
      'Anzeigen-Hervorhebung'
    ],
    popular: true,
    icon: <Star />,
    color: '#ff9800'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39.99,
    currency: 'EUR',
    period: 'Monat',
    description: 'Für professionelle Nutzer',
    features: [
      'Unbegrenzte Anzeigen',
      'Premium-Support',
      'Alle Suchfunktionen',
      'Alle Benachrichtigungen',
      'Top-Anzeigen-Position',
      'Analytics-Dashboard'
    ],
    icon: <Business />,
    color: '#2196f3'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    currency: 'EUR',
    period: 'Monat',
    description: 'Für Unternehmen',
    features: [
      'Unbegrenzte Anzeigen',
      '24/7 Support',
      'Alle Features',
      'API-Zugang',
      'White-Label-Option',
      'Dedicated Account Manager'
    ],
    icon: <Diamond />,
    color: '#9c27b0'
  }
];

interface SubscriptionPlansProps {
  onSubscriptionSuccess?: (subscriptionId: string) => void;
  onSubscriptionError?: (error: string) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSubscriptionSuccess,
  onSubscriptionError
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedPlan(plan.id);

    try {
      const subscriptionData: SubscriptionCreate = {
        plan: plan.id,
        amount: plan.price * 100, // Convert to cents
        currency: plan.currency,
        billing_cycle: 'monthly'
      };

      const subscription = await paymentService.createSubscription(subscriptionData);
      
      setSuccess(`Abonnement erfolgreich erstellt: ${subscription.subscription_id}`);
      
      if (onSubscriptionSuccess) {
        onSubscriptionSuccess(subscription.subscription_id);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setError(errorMessage);
      
      if (onSubscriptionError) {
        onSubscriptionError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        🚀 Wählen Sie Ihr Abonnement
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ marginBottom: 4 }}>
        Entdecken Sie unsere flexiblen Pläne für jeden Bedarf
      </Typography>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ marginBottom: 3 }}>
          {success}
        </Alert>
      )}

      {/* Subscription Plans Grid */}
      <Grid container spacing={3} justifyContent="center">
        {subscriptionPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={3} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <Chip
                  label="Beliebt"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 20,
                    backgroundColor: plan.color,
                    color: 'white'
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, padding: 3 }}>
                {/* Plan Header */}
                <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
                  <Box sx={{ color: plan.color, marginBottom: 1 }}>
                    {plan.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {plan.description}
                  </Typography>
                </Box>

                {/* Price */}
                <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
                  <Typography variant="h3" component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Euro />
                    {plan.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    pro {plan.period}
                  </Typography>
                </Box>

                <Divider sx={{ marginBottom: 3 }} />

                {/* Features */}
                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ padding: 0, marginBottom: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              {/* Subscribe Button */}
              <Box sx={{ padding: 3, paddingTop: 0 }}>
                <Button
                  fullWidth
                  variant={plan.popular ? 'contained' : 'outlined'}
                  size="large"
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading && selectedPlan === plan.id}
                  sx={{
                    backgroundColor: plan.popular ? plan.color : 'transparent',
                    color: plan.popular ? 'white' : plan.color,
                    borderColor: plan.color,
                    '&:hover': {
                      backgroundColor: plan.popular ? plan.color : `${plan.color}20`,
                      borderColor: plan.color
                    }
                  }}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography>Wird verarbeitet...</Typography>
                    </Box>
                  ) : (
                    'Abonnieren'
                  )}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Security Notice */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', marginTop: 4 }}>
        🔒 Sichere Zahlungsabwicklung • Jederzeit kündbar • Keine versteckten Kosten
      </Typography>
    </Box>
  );
};
