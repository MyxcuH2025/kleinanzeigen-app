import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { User } from '../../services/userService';
import { getImageUrl } from '@/utils/imageUtils';

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  anchorEl,
  open,
  onClose,
  user,
  onLogout
}) => {
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 2,
          minWidth: 280,
          borderRadius: 3,
          zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          bgcolor: '#ffffff',
          backdropFilter: 'blur(20px)'
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {[
        <MenuItem 
          key="dashboard"
          onClick={() => handleMenuClick('/dashboard')}
          sx={{ 
            py: 2, 
            px: 3,
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            '&:hover': { 
              backgroundColor: '#f8fafc',
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard" 
            primaryTypographyProps={{ 
              fontSize: '0.95rem', 
              fontWeight: 400,
              color: '#1f2937',
              letterSpacing: '0.01em'
            }} 
          />
        </MenuItem>,
        <MenuItem 
          key="listings"
          onClick={() => handleMenuClick('/listings')}
          sx={{ 
            py: 2, 
            px: 3,
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            '&:hover': { 
              backgroundColor: '#f8fafc',
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </ListItemIcon>
          <ListItemText 
            primary="Meine Anzeigen" 
            primaryTypographyProps={{ 
              fontSize: '0.95rem', 
              fontWeight: 400,
              color: '#1f2937',
              letterSpacing: '0.01em'
            }} 
          />
        </MenuItem>,
        <MenuItem 
          key="favorites"
          onClick={() => handleMenuClick('/favorites')}
          sx={{ 
            py: 2, 
            px: 3,
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            '&:hover': { 
              backgroundColor: '#f8fafc',
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21l-1.5-1.4C6 15.4 3 12.7 3 9.2 3 6.5 5.2 4.3 7.9 4.3c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2 2.7 0 4.9 2.2 4.9 4.9 0 3.5-3 6.2-7.5 10.4L12 21z"/>
            </svg>
          </ListItemIcon>
          <ListItemText 
            primary="Favoriten" 
            primaryTypographyProps={{ 
              fontSize: '0.95rem', 
              fontWeight: 400,
              color: '#1f2937',
              letterSpacing: '0.01em'
            }} 
          />
        </MenuItem>,
        <Divider key="divider" sx={{ my: 1, mx: 2, borderColor: '#e5e7eb' }} />,
        <MenuItem 
          key="settings"
          onClick={() => handleMenuClick('/settings')}
          sx={{ 
            py: 2, 
            px: 3,
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            '&:hover': { 
              backgroundColor: '#f8fafc',
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </ListItemIcon>
          <ListItemText 
            primary="Einstellungen" 
            primaryTypographyProps={{ 
              fontSize: '0.95rem', 
              fontWeight: 400,
              color: '#1f2937',
              letterSpacing: '0.01em'
            }} 
          />
        </MenuItem>,
        <MenuItem 
          key="logout"
          onClick={onLogout}
          sx={{ 
            py: 2, 
            px: 3,
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            '&:hover': { 
              backgroundColor: '#fef2f2',
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </ListItemIcon>
          <ListItemText 
            primary="Abmelden" 
            primaryTypographyProps={{ 
              fontSize: '0.95rem', 
              fontWeight: 400,
              color: '#dc2626',
              letterSpacing: '0.01em'
            }} 
          />
        </MenuItem>
      ]}
    </Menu>
  );
};
