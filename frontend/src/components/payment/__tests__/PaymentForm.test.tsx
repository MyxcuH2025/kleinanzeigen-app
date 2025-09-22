/**
 * Payment Form Component Tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentForm } from '../PaymentForm';

// Mock payment service
jest.mock('../../../services/paymentService', () => ({
  paymentService: {
    createPayment: jest.fn()
  }
}));

describe('PaymentForm', () => {
  const mockOnPaymentSuccess = jest.fn();
  const mockOnPaymentError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment form with correct amount', () => {
    render(
      <PaymentForm
        amount={25.99}
        currency="EUR"
        description="Test Payment"
        onPaymentSuccess={mockOnPaymentSuccess}
        onPaymentError={mockOnPaymentError}
      />
    );

    expect(screen.getByText('€25.99 EUR')).toBeInTheDocument();
    expect(screen.getByText('Test Payment')).toBeInTheDocument();
    expect(screen.getByText('Zahlung abwickeln')).toBeInTheDocument();
  });

  it('shows error for invalid amount', () => {
    render(
      <PaymentForm
        amount={0}
        currency="EUR"
        onPaymentSuccess={mockOnPaymentSuccess}
        onPaymentError={mockOnPaymentError}
      />
    );

    const payButton = screen.getByText(/Mit.*bezahlen/);
    expect(payButton).toBeDisabled();
  });

  it('allows payment method selection', () => {
    render(
      <PaymentForm
        amount={10}
        currency="EUR"
        onPaymentSuccess={mockOnPaymentSuccess}
        onPaymentError={mockOnPaymentError}
      />
    );

    const methodSelect = screen.getByLabelText('Zahlungsmethode');
    expect(methodSelect).toBeInTheDocument();
    
    // Should default to Stripe
    expect(screen.getByText('Kreditkarte (Stripe)')).toBeInTheDocument();
  });

  it('shows security notice', () => {
    render(
      <PaymentForm
        amount={10}
        currency="EUR"
        onPaymentSuccess={mockOnPaymentSuccess}
        onPaymentError={mockOnPaymentError}
      />
    );

    expect(screen.getByText(/Ihre Zahlungsdaten werden sicher verarbeitet/)).toBeInTheDocument();
  });
});
