import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';

import { DescriptionBlockProps } from '../types';

/**
 * Premium Description Block Component
 * Features: Markdown-Render, "Mehr anzeigen"
 */
const DescriptionBlock: React.FC<DescriptionBlockProps> = ({
  description,
  title = "Beschreibung",
  onShare,
  onBookmark,
  isBookmarked = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shouldTruncate = description.length > 300;
  const displayText = expanded || !shouldTruncate 
    ? description 
    : `${description.substring(0, 300)}...`;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={copied ? "Kopiert!" : "Beschreibung kopieren"}>
            <IconButton onClick={handleCopy} size="small">
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {onShare && (
            <Tooltip title="Teilen">
              <IconButton onClick={onShare} size="small">
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onBookmark && (
            <Tooltip title={isBookmarked ? "Lesezeichen entfernen" : "Lesezeichen hinzufügen"}>
              <IconButton onClick={onBookmark} size="small">
                {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Typography 
        variant="body1" 
        sx={{ 
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: 'text.primary',
          fontSize: '1rem'
        }}
      >
        {displayText}
      </Typography>

      {shouldTruncate && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ 
              color: '#000000',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            {expanded ? 'Weniger anzeigen' : 'Vollständige Beschreibung anzeigen'}
          </Button>
        </Box>
      )}

    </Box>
  );
};

export default DescriptionBlock;
