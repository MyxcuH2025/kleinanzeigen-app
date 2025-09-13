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
        border: '1px solid rgba(0,0,0,0.08)', 
        borderRadius: 0,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 1 }}>
            Bewertungen & Erfahrungen
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating 
              value={averageRating} 
              readOnly 
              precision={0.1}
              sx={{ 
                '& .MuiRating-iconFilled': {
                  color: '#000000'
                }
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {averageRating.toFixed(1)} von 5 ({totalReviews} Bewertungen)
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          onClick={() => setShowAddReview(!showAddReview)}
          sx={{
            borderColor: '#000000',
            color: '#000000',
            '&:hover': {
              borderColor: '#333333',
              bgcolor: 'rgba(0,0,0,0.05)'
            },
            borderRadius: 1
          }}
        >
          Bewertung schreiben
        </Button>
      </Box>

      {/* Add Review Form */}
      {showAddReview && (
        <Card sx={{ mb: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 0 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>
              Ihre Bewertung
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Bewertung:
              </Typography>
              <Rating
                value={newRating}
                onChange={(_, value) => setNewRating(value || 0)}
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: '#000000'
                  }
                }}
              />
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Teilen Sie Ihre Erfahrung mit anderen Nutzern..."
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
                  bgcolor: '#000000',
                  color: '#ffffff',
                  '&:hover': { bgcolor: '#333333' },
                  '&:disabled': {
                    bgcolor: '#f0f0f0',
                    color: '#999999'
                  },
                  borderRadius: 1
                }}
              >
                Bewertung abschicken
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowAddReview(false)}
                sx={{
                  borderColor: '#000000',
                  color: '#000000',
                  '&:hover': {
                    borderColor: '#333333',
                    bgcolor: 'rgba(0,0,0,0.05)'
                  },
                  borderRadius: 1
                }}
              >
                Abbrechen
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <StarBorderIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Noch keine Bewertungen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seien Sie der Erste, der eine Bewertung für diese Anzeige schreibt.
          </Typography>
        </Box>
      ) : (
        <Box>
          {reviews.map((review, index) => (
            <Box key={review.id}>
              <Card sx={{ mb: 2, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 0 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar 
                      src={review.user.avatar}
                      sx={{ bgcolor: '#e8e8e8' }}
                    >
                      {review.user.name.charAt(0)}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000000' }}>
                          {review.user.name}
                        </Typography>
                        <Rating 
                          value={review.rating} 
                          readOnly 
                          size="small"
                          sx={{ 
                            '& .MuiRating-iconFilled': {
                              color: '#000000'
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(review.created_at)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {review.comment}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<ThumbUpIcon />}
                          onClick={() => onHelpful?.(review.id)}
                          sx={{
                            color: '#000000',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                          Hilfreich ({review.helpful || 0})
                        </Button>
                        
                        <Button
                          size="small"
                          startIcon={<ReplyIcon />}
                          onClick={() => setReplyTo(review.id)}
                          sx={{
                            color: '#000000',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                          Antworten
                        </Button>
                        
                        <IconButton size="small" sx={{ ml: 'auto' }}>
                          <FlagIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {/* Reply Form */}
                      {replyTo === review.id && (
                        <Box sx={{ mt: 2, pl: 4 }}>
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
                                bgcolor: '#000000',
                                color: '#ffffff',
                                '&:hover': { bgcolor: '#333333' },
                                '&:disabled': {
                                  bgcolor: '#f0f0f0',
                                  color: '#999999'
                                },
                                borderRadius: 1
                              }}
                            >
                              Antworten
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setReplyTo(null);
                                setReplyText('');
                              }}
                              sx={{
                                borderColor: '#000000',
                                color: '#000000',
                                '&:hover': {
                                  borderColor: '#333333',
                                  bgcolor: 'rgba(0,0,0,0.05)'
                                },
                                borderRadius: 1
                              }}
                            >
                              Abbrechen
                            </Button>
                          </Box>
                        </Box>
                      )}
                      
                      {/* Replies */}
                      {review.replies && review.replies.length > 0 && (
                        <Box sx={{ mt: 2, pl: 4 }}>
                          {review.replies.map((reply) => (
                            <Box key={reply.id} sx={{ mb: 2, pl: 2, borderLeft: '2px solid #f0f0f0' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar 
                                  src={reply.user.avatar}
                                  sx={{ width: 24, height: 24, bgcolor: '#e8e8e8' }}
                                >
                                  {reply.user.name.charAt(0)}
                                </Avatar>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#000000' }}>
                                  {reply.user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(reply.created_at)}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                                {reply.comment}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {index < reviews.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default ListingReviews;
