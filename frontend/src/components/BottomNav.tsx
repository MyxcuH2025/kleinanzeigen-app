import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFavorites } from '@/context/FavoritesContext';
import homeIcon from '@/assets/icons/home.svg';
import favoriteIcon from '@/assets/icons/favorite.svg';
import addIcon from '@/assets/icons/add.svg';
import chatIcon from '@/assets/icons/chat.svg';
import kategorienIcon from '@/assets/icons/kategorien.svg';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/favorites') return 1;
    if (path.startsWith('/create')) return 2;
    if (path === '/chat') return 3;
    if (path === '/dashboard') return 4;
    return 0;
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/favorites');
        break;
      case 2:
        navigate('/create-listing');
        break;
      case 3:
        navigate('/chat');
        break;
      case 4:
        navigate('/dashboard');
        break;
    }
  };

  return (
    <>
      <style>
        {`
          .MuiBottomNavigationAction-label {
            color: #000000 !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
          }
          .MuiBottomNavigationAction-root:not(.Mui-selected) .MuiBottomNavigationAction-label {
            color: #000000 !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .MuiBottomNavigationAction-root.Mui-selected .MuiBottomNavigationAction-label {
            color: #1976d2 !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
        `}
      </style>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          display: { xs: 'block', md: 'none' },
          elevation: 3
        }}
      >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        sx={{
          height: 90,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '12px 8px 8px',
            flexDirection: 'column'
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 500,
            marginTop: '4px'
          }
        }}
      >
        <BottomNavigationAction
          label="Start"
          icon={<img src={homeIcon} alt="Home" width="28" height="28" />}
        />
        <BottomNavigationAction
          label="Favoriten"
          icon={
            <Badge badgeContent={favorites.size} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', minWidth: '18px', height: '18px' } }}>
              <img src={favoriteIcon} alt="Favoriten" width="28" height="28" />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="Erstellen"
          icon={<img src={addIcon} alt="Erstellen" width="28" height="28" />}
        />
        <BottomNavigationAction
          label="Chat"
          icon={
            <Badge badgeContent="3" color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', minWidth: '18px', height: '18px' } }}>
              <img src={chatIcon} alt="Chat" width="28" height="28" />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="Dashboard"
          icon={
            <Badge badgeContent="2" color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', minWidth: '18px', height: '18px' } }}>
              <img src={kategorienIcon} alt="Dashboard" width="28" height="28" />
            </Badge>
          }
        />
      </BottomNavigation>
      </Paper>
    </>
  );
};
