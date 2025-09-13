/**
 * Story-Viewer - Vollbild-Story-Anzeige wie Instagram
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Favorite as FavoriteIcon,
  ChatBubble as ChatIcon,
  Send as SendIcon
} from '@mui/icons-material';
import type { Story, StoryReactionType } from '../types/stories.types';
import { StoryProgress } from './StoryProgress';
// import { StoryReactions } from './StoryReactions';
import { storiesApi } from '../services/stories.api';

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onView: (storyId: number) => void;
  onReaction: (storyId: number, reaction: StoryReactionType) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onView,
  onReaction
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const currentStory = stories[currentIndex];
  
  if (!currentStory) {
    onClose();
    return null;
  }
  
  const isExpired = storiesApi.isStoryExpired(currentStory.expires_at);
  const isVideo = currentStory.media_type === 'video';
  const duration = currentStory.duration * 1000; // Convert to milliseconds
  
  // Video-spezifische Event-Handler
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    const handleLoadedData = () => {
      setVideoLoaded(true);
      setVideoError(false);
      if (isPlaying) {
        video.play().catch(console.error);
      }
    };

    const handleError = () => {
      setVideoError(true);
      setVideoLoaded(false);
      console.error('Video-Fehler:', currentStory.media_url);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onNext();
    };

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        const videoProgress = (video.currentTime / video.duration) * 100;
        setProgress(videoProgress);
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isVideo, isPlaying, onNext, currentStory.media_url]);

  // Progress-Animation für Bilder
  useEffect(() => {
    if (!isPlaying || isExpired || isVideo) return;
    
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        setIsPlaying(false);
        onNext();
      }
    }, 50);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, duration, onNext, isExpired, isVideo]);
  
  // Auto-hide Controls
  useEffect(() => {
    if (!showControls) return;
    
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [showControls]);
  
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
  };
  
  const handlePause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
    
    // Video-spezifische Pause/Play-Logik
    if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };
  
  const handleReaction = (reaction: StoryReactionType) => {
    onReaction(currentStory.id, reaction);
  };
  
  const mediaUrl = storiesApi.getMediaUrl(currentStory.media_url);
  const avatarUrl = currentStory.user_avatar 
    ? storiesApi.getMediaUrl(currentStory.user_avatar)
    : undefined;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'black',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseMove={handleMouseMove}
      onClick={handlePause}
    >
      {/* Header mit Progress */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          p: 2,
        }}
      >
        {/* Progress Bars */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {stories.map((_, index) => (
            <LinearProgress
              key={index}
              variant="determinate"
              value={
                index < currentIndex 
                  ? 100 
                  : index === currentIndex 
                    ? progress 
                    : 0
              }
              sx={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'white',
                },
              }}
            />
          ))}
        </Box>
        
        {/* Header Controls */}
        {showControls && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={avatarUrl}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid white',
                }}
              >
                {currentStory.user_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  {currentStory.user_name || 'User'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {storiesApi.getStoryAge(currentStory.created_at) < 1 
                    ? `${Math.round(storiesApi.getStoryAge(currentStory.created_at) * 60)}m`
                    : `${Math.round(storiesApi.getStoryAge(currentStory.created_at))}h`
                  } ago
                </Typography>
              </Box>
            </Box>
            
            {/* Close Button */}
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.5)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      
      {/* Media Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={mediaUrl}
              autoPlay
              loop={false}
              muted
              playsInline
              preload="metadata"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Video Loading Indicator */}
            {!videoLoaded && !videoError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  📹 Video wird geladen...
                </Typography>
                <LinearProgress
                  sx={{
                    width: 200,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                    },
                  }}
                />
              </Box>
            )}
            {/* Video Error Fallback */}
            {videoError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  ❌ Video-Fehler
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Video konnte nicht geladen werden
                </Typography>
              </Box>
            )}
            {/* Play/Pause Overlay */}
            {showControls && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: isPlaying ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              >
                <IconButton
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    width: 80,
                    height: 80,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    },
                  }}
                >
                  {isPlaying ? <CloseIcon /> : <ArrowForwardIcon />}
                </IconButton>
              </Box>
            )}
          </>
        ) : (
          <Box
            component="img"
            src={mediaUrl}
            alt={currentStory.caption || 'Story'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        
        {/* Navigation Arrows */}
        {showControls && (
          <>
            <IconButton
              onClick={onPrevious}
              disabled={currentIndex === 0}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.5)',
                },
                '&:disabled': {
                  opacity: 0.3,
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <IconButton
              onClick={onNext}
              disabled={currentIndex === stories.length - 1}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.5)',
                },
                '&:disabled': {
                  opacity: 0.3,
                },
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </>
        )}
      </Box>
      
      {/* Bottom Controls */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          }}
        >
          {/* Caption */}
          {currentStory.caption && (
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                mb: 2,
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              {currentStory.caption}
            </Typography>
          )}
          
          {/* Reaction Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {/* StoryReactions temporär deaktiviert */}
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Reactions: ❤️ {currentStory.reactions_count}
            </Typography>
          </Box>
          
          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, color: 'rgba(255,255,255,0.8)' }}>
            <Typography variant="caption">
              👀 {currentStory.views_count} views
            </Typography>
            <Typography variant="caption">
              ❤️ {currentStory.reactions_count} reactions
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StoryViewer;
