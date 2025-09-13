import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { Verified, WorkspacePremium, ThumbUp } from '@mui/icons-material';
import { EntityBadges } from './types';

interface EntityBadgesProps {
  badges: EntityBadges;
}

export const EntityBadgesComponent: React.FC<EntityBadgesProps> = ({ badges }) => {
  const renderBadges = () => {
    const badgeElements = [];

    if (badges.verified) {
      badgeElements.push(
        <Tooltip key="verified" title="Verifiziert" arrow>
          <Chip
            icon={<Verified />}
            label="Verifiziert"
            size="small"
            color="success"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        </Tooltip>
      );
    }

    if (badges.certified) {
      badgeElements.push(
        <Tooltip key="certified" title="Zertifiziert" arrow>
          <Chip
            icon={<WorkspacePremium />}
            label="Zertifiziert"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        </Tooltip>
      );
    }

    if (badges.recommended) {
      badgeElements.push(
        <Tooltip key="recommended" title="Empfohlen" arrow>
          <Chip
            icon={<ThumbUp />}
            label="Empfohlen"
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        </Tooltip>
      );
    }

    return badgeElements;
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {renderBadges()}
    </Box>
  );
};

