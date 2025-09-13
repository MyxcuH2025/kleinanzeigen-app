// ============================================================================
// MOBILE NAVIGATION COMPONENT - Mobile Navigation mit Suchfeld
// ============================================================================

import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import NotificationBell from '../NotificationBell';
import homeIcon from '@/assets/icons/home.svg';
import chatIcon from '@/assets/icons/chat.svg';
import favoriteIcon from '@/assets/icons/favorite.svg';
import kategorienIcon from '@/assets/icons/kategorien.svg';
import profileIcon from '@/assets/icons/profile.svg';
import bookmarkIcon from '@/assets/icons/bookmark.svg';
import settingsIcon from '@/assets/icons/settings.svg';
import tagIcon from '@/assets/icons/tag.svg';

interface MobileNavigationProps {
  isMobile: boolean;
  searchValue: string;
  onSearchChange: (query: string) => void;
  mobileSidebarOpen: boolean;
  onMobileSidebarToggle: () => void;
  onMobileSidebarClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isMobile,
  searchValue,
  onSearchChange,
  mobileSidebarOpen,
  onMobileSidebarToggle,
  onMobileSidebarClose
}) => {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!isMobile) return null;

  const navigationItems = [
    { text: 'Startseite', icon: homeIcon, path: '/' },
    { text: 'Kategorien', icon: kategorienIcon, path: '/categories' },
    { text: 'Favoriten', icon: favoriteIcon, path: '/favorites' },
    { text: 'Chat', icon: chatIcon, path: '/chat' },
    { text: 'Meine Anzeigen', icon: tagIcon, path: '/my-listings' },
    { text: 'Gespeicherte', icon: bookmarkIcon, path: '/saved' },
    { text: 'Profil', icon: profileIcon, path: '/profile' },
    { text: 'Einstellungen', icon: settingsIcon, path: '/settings' }
  ];

  return (
    <>
      {/* Mobile Navigation Bar */}
      <Box sx={{ 
        position: 'fixed',
        top: '40px', // Unter der Entities Bar
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: '#ffffff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: { xs: 'block', md: 'none' },
        height: '150px', // 5 Zeilen * 30px
        maxHeight: '150px'
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          gap: 1
        }}>
          {/* Menu Button */}
          <IconButton onClick={onMobileSidebarToggle}>
            <MenuIcon />
          </IconButton>

          {/* Search Field */}
          <TextField
            fullWidth
            placeholder="Was suchst du?"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            multiline
            maxRows={5}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                maxHeight: '120px', // 4 Zeilen * 30px
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: '2px' }
              }
            }}
          />

          {/* Notifications */}
          <NotificationBell />
        </Box>
      </Box>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={mobileSidebarOpen}
        onClose={onMobileSidebarClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2 }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name || 'Benutzer'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'benutzer@example.com'}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </Box>

        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  onMobileSidebarClose();
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}
              >
                <ListItemIcon>
                  <img src={item.icon} alt={item.text} width={20} height={20} />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              navigate('/logout');
              onMobileSidebarClose();
            }}
            sx={{
              borderColor: '#d32f2f',
              color: '#d32f2f',
              '&:hover': {
                borderColor: '#b71c1c',
                backgroundColor: 'rgba(211, 47, 47, 0.08)'
              }
            }}
          >
            Abmelden
          </Button>
        </Box>
      </Drawer>
    </>
  );
};
