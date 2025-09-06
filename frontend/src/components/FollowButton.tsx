import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { PersonAdd, PersonRemove, Check } from '@mui/icons-material';
import { useUser } from '../context/UserContext';

interface FollowButtonProps {
  userId: number;
  isFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  showIcon?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing: initialIsFollowing = false,
  onFollowChange,
  size = 'medium',
  variant = 'contained',
  showIcon = true
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useUser();

  // Update local state when prop changes
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  // Load follow status from backend (always check to ensure accuracy)
  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!user || !userId || userId === user.id) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        console.log('FollowButton - Loading follow status for user:', userId);
        
        const response = await fetch(`http://localhost:8000/api/users/${userId}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          const isFollowing = userData.user?.is_following;
          if (isFollowing !== undefined && isFollowing !== null) {
            setIsFollowing(Boolean(isFollowing));
            console.log('FollowButton - Loaded follow status from backend:', isFollowing);
          }
        } else {
          console.error('FollowButton - Failed to load follow status:', response.status);
        }
      } catch (error) {
        console.error('Error loading follow status in FollowButton:', error);
      }
    };
    
    loadFollowStatus();
  }, [user, userId]);



  const handleFollowToggle = async () => {
    if (!user) {
      console.error('User not logged in');
      setSuccessMessage('Bitte logge dich ein');
      setShowSuccess(true);
      return;
    }

    if (userId === user.id) {
      console.error('Cannot follow yourself');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        setSuccessMessage('Bitte logge dich erneut ein');
        setShowSuccess(true);
        return;
      }

      console.log('Using token:', token.substring(0, 20) + '...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (isFollowing) {
        // Unfollow
        console.log('Unfollowing user:', userId);
        const response = await fetch(`http://localhost:8000/api/users/${userId}/follow`, {
          method: 'DELETE',
          headers
        });

        console.log('Unfollow response status:', response.status);

        if (response.ok) {
          setIsFollowing(false);
          setSuccessMessage('Erfolgreich entfolgt');
          setShowSuccess(true);
          onFollowChange?.(false);
        } else {
          const error = await response.json();
          console.error('Unfollow error:', error);
          setSuccessMessage(`Fehler: ${error.detail || 'Unbekannter Fehler'}`);
          setShowSuccess(true);
        }
      } else {
        // Follow
        console.log('Following user:', userId);
        const response = await fetch(`http://localhost:8000/api/users/${userId}/follow`, {
          method: 'POST',
          headers
        });

        console.log('Follow response status:', response.status);

        if (response.ok) {
          setIsFollowing(true);
          setSuccessMessage('Erfolgreich gefolgt');
          setShowSuccess(true);
          onFollowChange?.(true);
        } else {
          const error = await response.json();
          console.error('Follow error:', error);
          
          // Spezielle Behandlung für "bereits gefolgt" Fehler
          if (error.detail === "Du folgst diesem Account bereits") {
            setIsFollowing(true);
            setSuccessMessage('Du folgst diesem Account bereits');
            setShowSuccess(true);
            onFollowChange?.(true);
          } else {
            setSuccessMessage(`Fehler: ${error.detail || 'Unbekannter Fehler'}`);
            setShowSuccess(true);
          }
        }
      }
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
      setSuccessMessage('Netzwerkfehler - bitte versuche es erneut');
      setShowSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug: Log user and token info
  useEffect(() => {
    console.log('FollowButton - User:', user);
    console.log('FollowButton - Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
    console.log('FollowButton - UserId to follow:', userId);
    console.log('FollowButton - initialIsFollowing:', initialIsFollowing);
    console.log('FollowButton - isFollowing state:', isFollowing);
  }, [user, userId, initialIsFollowing, isFollowing]);

  // Don't show button if user is not logged in or trying to follow themselves
  if (!user || userId === user.id) {
    console.log('FollowButton - Not showing button. User:', user, 'UserId:', userId);
    return null;
  }

  const getButtonText = () => {
    if (isLoading) return '';
    return isFollowing ? 'Entfolgen' : 'Folgen';
  };

  const getButtonIcon = () => {
    if (isLoading) return <CircularProgress size={16} />;
    if (isFollowing) return <PersonRemove />;
    return <PersonAdd />;
  };

  const getButtonColor = () => {
    if (isFollowing) return 'secondary';
    return 'primary';
  };

  return (
    <>
      <Button
        variant={isFollowing ? 'outlined' : variant}
        color={getButtonColor()}
        size={size}
        onClick={handleFollowToggle}
        disabled={isLoading}
        startIcon={showIcon ? getButtonIcon() : undefined}
        sx={{
          minWidth: 100,
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 2,
          ...(isFollowing && {
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'primary.light',
              color: 'primary.dark'
            }
          })
        }}
      >
        {getButtonText()}
      </Button>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          variant="filled"
          icon={<Check />}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FollowButton;
