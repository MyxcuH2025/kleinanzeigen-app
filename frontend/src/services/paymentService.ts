/**
 * Payment Service für Frontend-Integration
 */

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

// Helper function für API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
}

export interface PaymentCreate {
  amount: number;
  currency: string;
  payment_method: 'stripe' | 'paypal';
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  payment_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  payment_method: 'stripe' | 'paypal';
  gateway_payment_id?: string;
  created_at: string;
  expires_at?: string;
}

export interface SubscriptionCreate {
  plan: 'basic' | 'premium' | 'pro' | 'enterprise';
  amount: number;
  currency: string;
  billing_cycle: string;
}

export interface SubscriptionResponse {
  subscription_id: string;
  plan: 'basic' | 'premium' | 'pro' | 'enterprise';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  next_billing_date?: string;
  created_at: string;
}

export interface UserPayment {
  payment_id: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string;
  created_at: string;
}

export interface UserSubscription {
  subscription_id: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  next_billing_date?: string;
  created_at: string;
}

class PaymentService {
  /**
   * Erstelle neue Zahlung
   */
  async createPayment(paymentData: PaymentCreate): Promise<PaymentResponse> {
    try {
      const response = await apiCall('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      return response;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw new Error('Zahlung konnte nicht erstellt werden');
    }
  }

  /**
   * Hole Payment-Details
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await apiCall(`/api/payments/${paymentId}`);
      return response;
    } catch (error) {
      console.error('Payment retrieval failed:', error);
      throw new Error('Zahlungsdetails konnten nicht abgerufen werden');
    }
  }

  /**
   * Bestätige Payment
   */
  async confirmPayment(paymentId: string): Promise<{ payment_id: string; status: string; processed_at?: string }> {
    try {
      const response = await apiCall(`/api/payments/${paymentId}/confirm`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw new Error('Zahlung konnte nicht bestätigt werden');
    }
  }

  /**
   * Erstelle neue Subscription
   */
  async createSubscription(subscriptionData: SubscriptionCreate): Promise<SubscriptionResponse> {
    try {
      const response = await apiCall('/api/payments/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify(subscriptionData),
      });
      return response;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw new Error('Abonnement konnte nicht erstellt werden');
    }
  }

  /**
   * Hole Subscription-Details
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
      const response = await apiCall(`/api/payments/subscriptions/${subscriptionId}`);
      return response;
    } catch (error) {
      console.error('Subscription retrieval failed:', error);
      throw new Error('Abonnement-Details konnten nicht abgerufen werden');
    }
  }

  /**
   * Hole alle Payments des Users
   */
  async getUserPayments(page: number = 1, pageSize: number = 20): Promise<{
    payments: UserPayment[];
    page: number;
    page_size: number;
    total: number;
  }> {
    try {
      const response = await apiCall(`/api/payments/user/payments?page=${page}&page_size=${pageSize}`);
      return response;
    } catch (error) {
      console.error('User payments retrieval failed:', error);
      throw new Error('Zahlungshistorie konnte nicht abgerufen werden');
    }
  }

  /**
   * Hole alle Subscriptions des Users
   */
  async getUserSubscriptions(): Promise<{
    subscriptions: UserSubscription[];
    total: number;
  }> {
    try {
      const response = await apiCall('/api/payments/user/subscriptions');
      return response;
    } catch (error) {
      console.error('User subscriptions retrieval failed:', error);
      throw new Error('Abonnement-Liste konnte nicht abgerufen werden');
    }
  }

  /**
   * Stripe Payment Intent erstellen
   */
  async createStripePaymentIntent(amount: number, currency: string = 'EUR'): Promise<{
    client_secret: string;
    payment_intent_id: string;
  }> {
    try {
      const response = await apiCall('/api/payments/stripe/create-intent', {
        method: 'POST',
        body: JSON.stringify({ amount, currency }),
      });
      return response;
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new Error('Stripe-Zahlung konnte nicht erstellt werden');
    }
  }

  /**
   * PayPal Payment erstellen
   */
  async createPayPalPayment(amount: number, currency: string = 'EUR'): Promise<{
    payment_id: string;
    approval_url: string;
  }> {
    try {
      const response = await apiCall('/api/payments/paypal/create', {
        method: 'POST',
        body: JSON.stringify({ amount, currency }),
      });
      return response;
    } catch (error) {
      console.error('PayPal payment creation failed:', error);
      throw new Error('PayPal-Zahlung konnte nicht erstellt werden');
    }
  }
}

export const paymentService = new PaymentService();
