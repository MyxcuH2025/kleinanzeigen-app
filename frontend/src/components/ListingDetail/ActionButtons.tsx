import React from 'react';
import {
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Bookmark as BookmarkIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  Flag as FlagIcon,
  Block as BlockIcon
} from '@mui/icons-material';

interface ActionButtonsProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onReport: () => void;
  onBlock?: () => void;
  onBookmark?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onCopyLink?: () => void;
  onFlag?: () => void;
  isBookmarked?: boolean;
  canShare?: boolean;
  canReport?: boolean;
  canBlock?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isFavorite,
  onToggleFavorite,
  onShare,
  onReport,
  onBlock,
  onBookmark,
  onPrint,
  onDownload,
  onCopyLink,
  onFlag,
  isBookmarked = false,
  canShare = true,
  canReport = true,
  canBlock = false
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      flexWrap: 'wrap'
    }}>
      {/* Favoriten */}
      <Tooltip title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}>
        <IconButton
          onClick={onToggleFavorite}
          sx={{
            color: isFavorite ? '#e91e63' : '#666',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: isFavorite ? '#c2185b' : '#e91e63',
              transform: 'scale(1.1)'
            }
          }}
        >
          <FavoriteIcon />
        </IconButton>
      </Tooltip>

      {/* Teilen */}
      {canShare && (
        <Tooltip title="Teilen">
          <IconButton
            onClick={onShare}
            sx={{
              color: '#666',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#1976d2',
                transform: 'scale(1.1)'
              }
            }}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Mehr Optionen */}
      <Tooltip title="Weitere Optionen">
        <IconButton
          onClick={onReport}
          sx={{
            color: '#666',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#ff9800',
              transform: 'scale(1.1)'
            }
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      {/* Lesezeichen */}
      {onBookmark && (
        <Tooltip title={isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen hinzufügen'}>
          <IconButton
            onClick={onBookmark}
            sx={{
              color: isBookmarked ? '#ff9800' : '#666',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: isBookmarked ? '#f57c00' : '#ff9800',
                transform: 'scale(1.1)'
              }
            }}
          >
            <BookmarkIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Drucken */}
      {onPrint && (
        <Tooltip title="Drucken">
          <IconButton
            onClick={onPrint}
            sx={{
              color: '#666',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#4caf50',
                transform: 'scale(1.1)'
              }
            }}
          >
            <PrintIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Download */}
      {onDownload && (
        <Tooltip title="Download">
          <IconButton
            onClick={onDownload}
            sx={{
              color: '#666',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#2196f3',
                transform: 'scale(1.1)'
              }
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Link kopieren */}
      {onCopyLink && (
        <Tooltip title="Link kopieren">
          <IconButton
            onClick={onCopyLink}
            sx={{
              color: '#666',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#9c27b0',
                transform: 'scale(1.1)'
              }
            }}
          >
            <LinkIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Melden */}
      {canReport && onFlag && (
        <Tooltip title="Melden">
          <IconButton
            onClick={onFlag}
            sx={{
              color: '#666',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#f44336',
                transform: 'scale(1.1)'
              }
            }}
          >
            <FlagIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Blockieren */}
      {canBlock && onBlock && (
        <Tooltip title="Blockieren">
          <IconButton
            onClick={onBlock}
            sx={{
              color: '#666',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#f44336',
                transform: 'scale(1.1)'
              }
            }}
          >
            <BlockIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};