import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating as MuiRating,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { ratingService } from '@/services/ratingService';
import type { RatingCreate } from '@/services/ratingService';

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  listingId: number;
  listingTitle: string;
  onRatingSubmitted?: () => void;
}

export const RatingDialog: React.FC<RatingDialogProps> = ({
  open,
  onClose,
  listingId,
  listingTitle,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Bitte wähle eine Bewertung aus');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ratingData: RatingCreate = {
        rating: rating,
        comment: review.trim() || undefined
      };

      await ratingService.rateListing(listingId, ratingData);
      
      // Reset form
      setRating(0);
      setReview('');
      
      onRatingSubmitted?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen der Bewertung');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setReview('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Bewertung für "{listingTitle}"
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Wie würdest du dieses Produkt bewerten?
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MuiRating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
              icon={<Star sx={{ fontSize: 40 }} />}
              emptyIcon={<Star sx={{ fontSize: 40, color: 'grey.300' }} />}
            />
            <Typography variant="h6" color="text.secondary">
              {rating}/5
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Deine Bewertung (optional)"
          placeholder="Teile deine Erfahrungen mit diesem Produkt..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary">
          Deine Bewertung hilft anderen Käufern bei ihrer Entscheidung.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || rating === 0}
        >
          {loading ? 'Wird gespeichert...' : 'Bewertung senden'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 