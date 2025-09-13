import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';

interface ListingDescriptionProps {
  description: string;
  title?: string;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

const ListingDescription: React.FC<ListingDescriptionProps> = ({ 
  description, 
  title = "Beschreibung",
  onShare,
  onBookmark,
  isBookmarked = false
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shouldTruncate = description.length > 200;
  const displayText = expanded || !shouldTruncate 
    ? description 
    : `${description.substring(0, 200)}...`;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: '1px solid #f0f0f0', 
        borderRadius: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
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
              color: '#dcf8c6',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(220, 248, 198, 0.1)'
              }
            }}
          >
            {expanded ? 'Weniger anzeigen' : 'Vollständige Beschreibung anzeigen'}
          </Button>
        </Box>
      )}

      {/* Meta Info */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          label={`${description.length} Zeichen`} 
          size="small" 
          variant="outlined" 
        />
        <Chip 
          label={`${description.split(' ').length} Wörter`} 
          size="small" 
          variant="outlined" 
        />
        <Chip 
          label={`${description.split('\n').length} Absätze`} 
          size="small" 
          variant="outlined" 
        />
      </Box>
    </Paper>
  );
};

export default ListingDescription;
