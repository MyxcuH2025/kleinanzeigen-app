import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Rating as MuiRating,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import { Verified, Person } from '@mui/icons-material';
import { ratingService } from '@/services/ratingService';
import type { Rating, RatingStats } from '@/services/ratingService';

interface RatingDisplayProps {
  listingId: number;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  listingId
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadRatings = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await ratingService.getListingRatings(listingId, pageNum, 10);
      
      if (pageNum === 1) {
        setRatings(response.ratings);
        setStats(response.stats);
      } else {
        setRatings(prev => [...prev, ...response.ratings]);
      }
      
      setHasMore(pageNum < response.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Bewertungen');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    loadRatings();
  }, [listingId, loadRatings]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadRatings(page + 1);
    }
  };



  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Ausgezeichnet';
    if (rating >= 4) return 'Sehr gut';
    if (rating >= 3) return 'Gut';
    if (rating >= 2) return 'Befriedigend';
    return 'Schlecht';
  };

  if (loading && page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats || stats.total_ratings === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Noch keine Bewertungen
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sei der Erste, der dieses Produkt bewertet!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Rating Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {stats.average_rating.toFixed(1)}
              </Typography>
              <MuiRating
                value={stats.average_rating}
                readOnly
                precision={0.1}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {getRatingText(stats.average_rating)}
              </Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem />
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {stats.total_ratings} Bewertungen
              </Typography>
              
              {/* Rating Distribution */}
              {stats.rating_distribution.map((dist) => (
                <Box key={dist.rating} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    {dist.rating} Sterne
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(dist.count / stats.total_ratings) * 100}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {dist.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Bewertungen ({stats.total_ratings})
        </Typography>
        
        {ratings.map((rating) => (
          <Card key={rating.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar>
                  <Person />
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MuiRating
                      value={rating.rating}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {rating.reviewer.name}
                    </Typography>
                    {rating.is_verified_purchase && (
                      <Chip
                        icon={<Verified />}
                        label="Verifizierter Kauf"
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                  
                  {rating.review && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {rating.review}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    {new Date(rating.created_at).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
        
        {hasMore && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outlined"
            >
              {loading ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Lädt...
                </>
              ) : (
                'Weitere Bewertungen laden'
              )}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}; 