import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EmailVerification } from '@/components/EmailVerification';

export const EmailVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const handleResendVerification = async (email: string) => {
    const response = await fetch('http://localhost:8000/api/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Fehler beim erneuten Senden der E-Mail');
    }

    return response.json();
  };

  // Wenn keine E-Mail vorhanden ist, zur Registrierung weiterleiten
  if (!email) {
    navigate('/register');
    return null;
  }

  return (
    <EmailVerification
      email={email}
      onResendVerification={handleResendVerification}
    />
  );
}; 