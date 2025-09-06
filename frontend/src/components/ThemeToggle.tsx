import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { 
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle: React.FC = () => {

  const handleToggle = () => {
    // Da wir nur Light Theme haben, zeigen wir immer das Light Icon
    console.log('Theme toggle clicked - currently only light theme supported');
  };

  const getIcon = () => {
    // Da wir nur Light Theme haben, zeigen wir immer das Light Icon
    return <LightModeIcon />;
  };

  const getTooltip = () => {
    return 'Nur Light Theme verfügbar';
  };

  return (
    <Tooltip title={getTooltip()} placement="bottom">
      <IconButton
        onClick={handleToggle}
        sx={{
          color: 'inherit',
          minWidth: { xs: '48px', sm: '40px' },
          minHeight: { xs: '48px', sm: '40px' },
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};
