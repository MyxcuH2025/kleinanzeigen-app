// ============================================================================
// LAYOUT OPTIMIZED - Modulare, wartbare Layout-Komponente
// ============================================================================

import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { DesktopNavigation } from '../DesktopNavigation';
import { BottomNav } from '../BottomNav';
import { MobileEntitiesBar } from './MobileEntitiesBar';
import { MobileNavigation } from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onSearchChange, 
  searchValue = '', 
  onSidebarToggle, 
  sidebarOpen 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  // Mobile Sidebar State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Bestimme, ob der Chat geöffnet ist
  const isChatOpen = location.pathname === '/chat';
  
  // Mobile Sidebar Handlers
  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  // Bestimme das Padding für den Hauptinhalt
  const getMainContentPadding = () => {
    if (isMobile) {
      return isChatOpen ? '80px' : '190px'; // 40px Entities + 150px Navigation
    }
    return '0px';
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      height: '100vh',
      bgcolor: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1
    }}>
      {/* Desktop Navigation - nur auf Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <DesktopNavigation 
          onSearchChange={onSearchChange}
          searchValue={searchValue}
          onSidebarToggle={onSidebarToggle}
          sidebarOpen={sidebarOpen}
        />
      </Box>

      {/* Mobile Entities Bar - nur auf Mobile */}
      <MobileEntitiesBar isMobile={isMobile} />

      {/* Mobile Navigation - nur auf Mobile */}
      <MobileNavigation
        isMobile={isMobile}
        searchValue={searchValue}
        onSearchChange={onSearchChange || (() => {})}
        mobileSidebarOpen={mobileSidebarOpen}
        onMobileSidebarToggle={handleMobileSidebarToggle}
        onMobileSidebarClose={handleMobileSidebarClose}
      />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          pt: getMainContentPadding(),
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {children}
      </Box>

      {/* Mobile Bottom Navigation - nur auf Mobile */}
      {isMobile && <BottomNav />}
    </Box>
  );
};
