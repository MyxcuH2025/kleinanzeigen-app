import React from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { Message, Visibility } from '@mui/icons-material';
import { Entity, EntityCardProps } from './types';

interface EntityActionsProps extends Pick<EntityCardProps, 'onView' | 'onMessage' | 'onProfile'> {
  entity: Entity;
}

export const EntityActions: React.FC<EntityActionsProps> = ({
  entity,
  onView,
  onMessage,
  onProfile
}) => {
  const handleProfileClick = () => {
    if (onProfile) {
      onProfile(entity);
    }
  };

  const handleViewClick = () => {
    if (onView) {
      onView(entity);
    }
  };

  const handleMessageClick = () => {
    if (onMessage) {
      onMessage(entity);
    }
  };

  const renderActionButtons = () => {
    return (
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {onView && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            onClick={handleViewClick}
            sx={{ flex: 1 }}
          >
            Ansehen
          </Button>
        )}
        
        {onMessage && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Message />}
            onClick={handleMessageClick}
            sx={{ flex: 1 }}
          >
            Nachricht
          </Button>
        )}
      </Box>
    );
  };

  const renderContactButtons = () => {
    if (!entity.contact) return null;

    return (
      <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'center' }}>
        {entity.contact.phone && (
          <Tooltip title="Anrufen" arrow>
            <IconButton size="small" color="primary">
              📞
            </IconButton>
          </Tooltip>
        )}
        
        {entity.contact.email && (
          <Tooltip title="E-Mail senden" arrow>
            <IconButton size="small" color="primary">
              ✉️
            </IconButton>
          </Tooltip>
        )}
        
        {entity.contact.website && (
          <Tooltip title="Website besuchen" arrow>
            <IconButton size="small" color="primary">
              🌐
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {renderActionButtons()}
      {renderContactButtons()}
    </Box>
  );
};

