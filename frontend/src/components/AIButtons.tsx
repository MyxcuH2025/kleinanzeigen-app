import React, { useState } from 'react';
import {
  Box,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  AutoFixHigh as AIIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Label as TagIcon
} from '@mui/icons-material';
import { aiService } from '../services/aiService';

interface AIButtonsProps {
  title: string;
  description: string;
  category: string;
  onDescriptionOptimized: (optimizedDescription: string) => void;
  onCategorySuggested: (suggestedCategory: string) => void;
  onTagsGenerated?: (tags: string[]) => void;
  onSpamDetected?: (spamData: any) => void;
}

const AIButtons: React.FC<AIButtonsProps> = ({
  title,
  description,
  category,
  onDescriptionOptimized,
  onCategorySuggested,
  onTagsGenerated,
  onSpamDetected
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleOptimizeDescription = async () => {
    if (!title.trim()) {
      showError('Bitte geben Sie einen Titel ein');
      return;
    }

    setLoading('description');
    try {
      const result = await aiService.optimizeDescription({
        title,
        description: description || 'Keine Beschreibung vorhanden',
        category: category || 'Allgemein'
      });
      
      onDescriptionOptimized(result.optimized_description);
      showSuccess('Beschreibung erfolgreich optimiert!');
    } catch (error) {
      showError('AI-Service ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.');
      console.error('Description optimization error:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleSuggestCategory = async () => {
    if (!title.trim()) {
      showError('Bitte geben Sie einen Titel ein');
      return;
    }

    setLoading('category');
    try {
      const result = await aiService.suggestCategory({
        title,
        description: description || 'Keine Beschreibung vorhanden'
      });
      
      onCategorySuggested(result.suggested_category);
      showSuccess('Kategorie erfolgreich vorgeschlagen!');
    } catch (error) {
      showError('AI-Service ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.');
      console.error('Category suggestion error:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateTags = async () => {
    if (!title.trim() || !description.trim()) {
      showError('Bitte füllen Sie Titel und Beschreibung aus');
      return;
    }

    setLoading('tags');
    try {
      const result = await aiService.generateTags({
        title,
        description,
        category: category || 'Allgemein'
      });
      
      if (onTagsGenerated) {
        onTagsGenerated(result.tags);
        showSuccess('Tags erfolgreich generiert!');
      }
    } catch (error) {
      showError('Fehler beim Generieren der Tags');
      console.error('Tag generation error:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDetectSpam = async () => {
    if (!title.trim() || !description.trim()) {
      showError('Bitte füllen Sie Titel und Beschreibung aus');
      return;
    }

    setLoading('spam');
    try {
      const result = await aiService.detectSpam({
        title,
        description
      });
      
      if (onSpamDetected) {
        onSpamDetected(result);
        showSuccess(`Spam-Analyse abgeschlossen: ${result.recommendation}`);
      }
    } catch (error) {
      showError('Fehler bei der Spam-Erkennung');
      console.error('Spam detection error:', error);
    } finally {
      setLoading(null);
    }
  };

  const isDisabled = !title.trim();

  return (
    <Box>
      {/* AI Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        flexWrap: 'wrap',
        mb: 2,
        p: 2,
        backgroundColor: '#f8fafc',
        borderRadius: 2,
        border: '1px solid #e2e8f0'
      }}>
        <Tooltip title="Beschreibung mit KI optimieren">
          <Button
            variant="outlined"
            size="small"
            startIcon={loading === 'description' ? <CircularProgress size={16} /> : <AIIcon />}
            onClick={handleOptimizeDescription}
            disabled={isDisabled || loading !== null}
            sx={{
              borderColor: '#3b82f6',
              color: '#3b82f6',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#eff6ff'
              }
            }}
          >
            Beschreibung optimieren
          </Button>
        </Tooltip>

        <Tooltip title="Passende Kategorie vorschlagen">
          <Button
            variant="outlined"
            size="small"
            startIcon={loading === 'category' ? <CircularProgress size={16} /> : <CategoryIcon />}
            onClick={handleSuggestCategory}
            disabled={isDisabled || loading !== null}
            sx={{
              borderColor: '#10b981',
              color: '#10b981',
              '&:hover': {
                borderColor: '#059669',
                backgroundColor: '#ecfdf5'
              }
            }}
          >
            Kategorie vorschlagen
          </Button>
        </Tooltip>

        {onTagsGenerated && (
          <Tooltip title="Relevante Tags generieren">
            <Button
              variant="outlined"
              size="small"
              startIcon={loading === 'tags' ? <CircularProgress size={16} /> : <TagIcon />}
              onClick={handleGenerateTags}
              disabled={isDisabled || loading !== null}
              sx={{
                borderColor: '#f59e0b',
                color: '#f59e0b',
                '&:hover': {
                  borderColor: '#d97706',
                  backgroundColor: '#fffbeb'
                }
              }}
            >
              Tags generieren
            </Button>
          </Tooltip>
        )}

        {onSpamDetected && (
          <Tooltip title="Spam-Erkennung">
            <Button
              variant="outlined"
              size="small"
              startIcon={loading === 'spam' ? <CircularProgress size={16} /> : <SecurityIcon />}
              onClick={handleDetectSpam}
              disabled={isDisabled || loading !== null}
              sx={{
                borderColor: '#ef4444',
                color: '#ef4444',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              Spam prüfen
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIButtons;
