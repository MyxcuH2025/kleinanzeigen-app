import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  Divider,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  useTheme
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Reply as ReplyIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

interface Review {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
  helpful?: number;
  replies?: Review[];
}

interface ListingReviewsProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
  onAddReview?: (rating: number, comment: string) => void;
  onHelpful?: (reviewId: number) => void;
  onReply?: (reviewId: number, reply: string) => void;
}

const ListingReviews: React.FC<ListingReviewsProps> = ({
  reviews,
  averageRating = 0,
  totalReviews = 0,
  onAddReview,
  onHelpful,
  onReply
}) => {
  const theme = useTheme();
  const [showAddReview, setShowAddReview] = React.useState(false);
  const [newRating, setNewRating] = React.useState(0);
  const [newComment, setNewComment] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<number | null>(null);
  const [replyText, setReplyText] = React.useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmitReview = () => {
    if (newRating > 0 && newComment.trim()) {
      onAddReview?.(newRating, newComment);
      setNewRating(0);
      setNewComment('');
      setShowAddReview(false);
    }
  };

  const handleSubmitReply = (reviewId: number) => {
    if (replyText.trim()) {
      onReply?.(reviewId, replyText);
      setReplyText('');
      setReplyTo(null);
    }
  };

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Bewertungen ({totalReviews})
        </Typography>
        
        <Button
          variant="contained"
          onClick={() => setShowAddReview(!showAddReview)}
          sx={{
            bgcolor: '#dcf8c6',
            color: '#1a1a1a',
            '&:hover': { bgcolor: '#c8e6c9' }
          }}
        >
          Bewertung schreiben
        </Button>
      </Box>

      {/* Average Rating */}
      {averageRating > 0 && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(220, 248, 198, 0.1)', borderRadius: 2 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#dcf8c6' }}>
                {averageRating.toFixed(1)}
              </Typography>
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={averageRating} readOnly precision={0.1} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({totalReviews} Bewertungen)
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Basierend auf {totalReviews} Kundenbewertungen
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Add Review Form */}
      {showAddReview && (
        <Card sx={{ mb: 3, border: '1px solid #dcf8c6' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Deine Bewertung
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Bewertung:
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
              rows={4}
              placeholder="Teile deine Erfahrungen mit anderen..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSubmitReview}
                disabled={newRating === 0 || !newComment.trim()}
                sx={{
                  bgcolor: '#dcf8c6',
                  color: '#1a1a1a',
                  '&:hover': { bgcolor: '#c8e6c9' }
                }}
              >
                Bewertung veröffentlichen
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowAddReview(false)}
              >
                Abbrechen
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Box sx={{ space: 2 }}>
        {reviews.map((review) => (
          <Card key={review.id} sx={{ mb: 2, border: '1px solid #f0f0f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar 
                  src={review.user.avatar} 
                  sx={{ mr: 2, bgcolor: '#dcf8c6' }}
                >
                  {review.user.name.charAt(0)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                      {review.user.name}
                    </Typography>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {formatDate(review.created_at)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {review.comment}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Tooltip title="Hilfreich">
                      <IconButton 
                        size="small" 
                        onClick={() => onHelpful?.(review.id)}
                      >
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption">
                      {review.helpful || 0} hilfreich
                    </Typography>
                    
                    <Tooltip title="Antworten">
                      <IconButton 
                        size="small" 
                        onClick={() => setReplyTo(replyTo === review.id ? null : review.id)}
                      >
                        <ReplyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Melden">
                      <IconButton size="small">
                        <FlagIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {/* Reply Form */}
              {replyTo === review.id && (
                <Box sx={{ ml: 6, mt: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Antwort schreiben..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleSubmitReply(review.id)}
                      disabled={!replyText.trim()}
                      sx={{
                        bgcolor: '#dcf8c6',
                        color: '#1a1a1a',
                        '&:hover': { bgcolor: '#c8e6c9' }
                      }}
                    >
                      Antworten
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setReplyTo(null)}
                    >
                      Abbrechen
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Replies */}
              {review.replies && review.replies.length > 0 && (
                <Box sx={{ ml: 6, mt: 2 }}>
                  {review.replies.map((reply) => (
                    <Box key={reply.id} sx={{ mb: 1, p: 2, bgcolor: 'rgba(220, 248, 198, 0.05)', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar src={reply.user.avatar} sx={{ width: 24, height: 24, mr: 1 }}>
                          {reply.user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {reply.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {formatDate(reply.created_at)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {reply.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {reviews.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <StarBorderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Noch keine Bewertungen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sei der Erste, der eine Bewertung schreibt!
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ListingReviews;
