/**
 * Simple Payment Form Component Test
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PaymentForm } from '../PaymentForm';

// Mock payment service
jest.mock('../../../services/paymentService', () => ({
  paymentService: {
    createPayment: jest.fn()
  }
}));

describe('PaymentForm - Simple Test', () => {
  it('renders payment form with amount', () => {
    render(
      <PaymentForm
        amount={25.99}
        currency="EUR"
        description="Test Payment"
      />
    );

    expect(screen.getByText('€25.99 EUR')).toBeInTheDocument();
    expect(screen.getByText('Test Payment')).toBeInTheDocument();
    expect(screen.getByText('Zahlung abwickeln')).toBeInTheDocument();
  });

  it('shows security notice', () => {
    render(
      <PaymentForm
        amount={10}
        currency="EUR"
      />
    );

    expect(screen.getByText(/Ihre Zahlungsdaten werden sicher verarbeitet/)).toBeInTheDocument();
  });
});
