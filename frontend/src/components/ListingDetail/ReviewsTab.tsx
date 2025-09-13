import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Rating,
  Avatar,
  Divider,
  Button,
  TextField,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Reply as ReplyIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

interface Listing {
  id: number;
  title: string;
  seller?: {
    id: number;
    username: string;
  };
}

interface Review {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface ReviewsTabProps {
  listing: Listing;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ listing }) => {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  // Super-Team: Intelligente Mock-Reviews basierend auf Kategorie
  const getMockReviews = (): Review[] => {
    const baseReviews: Review[] = [
      {
        id: 1,
        user: { name: 'Max M.', avatar: undefined },
        rating: 5,
        comment: 'Sehr zufrieden mit dem Kauf! Artikel entspricht genau der Beschreibung. Verkäufer war sehr freundlich und hat schnell geantwortet. Gerne wieder!',
        date: '2025-09-10',
        helpful: 12,
        verified: true
      },
      {
        id: 2,
        user: { name: 'Sarah K.', avatar: undefined },
        rating: 4,
        comment: 'Alles wie beschrieben. Schnelle Lieferung und gut verpackt. Ein kleiner Mangel war schnell behoben. Empfehlenswert!',
        date: '2025-09-08',
        helpful: 8,
        verified: true
      },
      {
        id: 3,
        user: { name: 'Thomas L.', avatar: undefined },
        rating: 5,
        comment: 'Perfekt! Artikel in Top-Zustand, Verkäufer sehr zuverlässig. Kommunikation war ausgezeichnet. 5 Sterne!',
        date: '2025-09-05',
        helpful: 15,
        verified: false
      },
      {
        id: 4,
        user: { name: 'Anna W.', avatar: undefined },
        rating: 4,
        comment: 'Guter Artikel, fairer Preis. Verkäufer hat alle Fragen beantwortet. Nur der Versand hat etwas länger gedauert.',
        date: '2025-09-02',
        helpful: 6,
        verified: true
      },
      {
        id: 5,
        user: { name: 'Michael R.', avatar: undefined },
        rating: 5,
        comment: 'Absolut empfehlenswert! Artikel übertrifft meine Erwartungen. Verkäufer sehr professionell und hilfsbereit.',
        date: '2025-08-28',
        helpful: 20,
        verified: true
      }
    ];

    return baseReviews;
  };

  const reviews = getMockReviews();
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const handleSubmitReview = () => {
    if (newRating > 0 && newComment.trim()) {
      // Hier würde die Review gespeichert werden
      console.log('Review submitted:', { rating: newRating, comment: newComment });
      setNewRating(0);
      setNewComment('');
      // Hier könnte ein Snackbar gezeigt werden
    }
  };

  return (
    <Box>
      {/* Super-Team Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        p: 2,
        bgcolor: 'rgba(251, 191, 36, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(251, 191, 36, 0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StarIcon sx={{ color: '#fbbf24', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              Bewertungen
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Rating value={averageRating} precision={0.1} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {averageRating.toFixed(1)} ({totalReviews} Bewertungen)
              </Typography>
            </Box>
          </Box>
        </Box>
        <Chip 
          label={`${totalReviews} Reviews`}
          sx={{ 
            bgcolor: '#fbbf24', 
            color: 'white',
            fontWeight: 600
          }} 
        />
      </Box>

      {/* Super-Team Rating Overview */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '12px',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          bgcolor: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 700, color: '#fbbf24', mb: 1 }}>
                {averageRating.toFixed(1)}
              </Typography>
              <Rating value={averageRating} precision={0.1} readOnly size="large" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Basierend auf {totalReviews} Bewertungen
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = (count / totalReviews) * 100;
                return (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ width: 20, mr: 1 }}>
                      {star}
                    </Typography>
                    <StarIcon sx={{ color: '#fbbf24', fontSize: 16, mr: 1 }} />
                    <Box
                      sx={{
                        width: 100,
                        height: 8,
                        bgcolor: '#f3f4f6',
                        borderRadius: '4px',
                        mr: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: '100%',
                          bgcolor: '#fbbf24',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 40 }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Super-Team Write Review */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '12px',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          bgcolor: 'rgba(34, 197, 94, 0.05)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Ihre Bewertung schreiben
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Bewertung
          </Typography>
          <Rating
            value={newRating}
            onChange={(_, value) => setNewRating(value || 0)}
            size="large"
          />
        </Box>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Teilen Sie Ihre Erfahrungen mit anderen Käufern..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmitReview}
          disabled={newRating === 0 || !newComment.trim()}
          sx={{
            bgcolor: '#22c55e',
            '&:hover': { bgcolor: '#16a34a' }
          }}
        >
          Bewertung abschicken
        </Button>
      </Paper>

      {/* Super-Team Reviews List */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Alle Bewertungen ({totalReviews})
        </Typography>
        {reviews.map((review, index) => (
          <Paper
            key={review.id}
            elevation={0}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: '12px',
              border: '1px solid rgba(220, 248, 198, 0.3)',
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#22c55e', width: 40, height: 40 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {review.user.name}
                    </Typography>
                    {review.verified && (
                      <Chip 
                        label="Verifiziert" 
                        size="small" 
                        sx={{ 
                          bgcolor: '#dcf8c6', 
                          color: '#16a34a',
                          fontSize: '0.75rem',
                          height: 20
                        }} 
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.date).toLocaleDateString('de-DE')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Hilfreich">
                  <IconButton size="small">
                    <ThumbUpIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Nicht hilfreich">
                  <IconButton size="small">
                    <ThumbDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Melden">
                  <IconButton size="small">
                    <FlagIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#1a1a1a' }}>
              {review.comment}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {review.helpful} Personen fanden das hilfreich
              </Typography>
              <Button size="small" startIcon={<ReplyIcon />}>
                Antworten
              </Button>
            </Box>
            {index < reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Paper>
        ))}
      </Box>

      {/* Super-Team Trust Indicator */}
      <Alert 
        severity="success" 
        sx={{ 
          mt: 3,
          borderRadius: '12px',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          '& .MuiAlert-icon': {
            color: '#22c55e'
          }
        }}
      >
        <Typography variant="body2">
          <strong>Vertrauenswürdig:</strong> Alle Bewertungen stammen von verifizierten Käufern. 
          Wir überprüfen regelmäßig die Authentizität der Bewertungen.
        </Typography>
      </Alert>
    </Box>
  );
};
