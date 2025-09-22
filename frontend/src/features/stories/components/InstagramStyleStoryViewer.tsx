/**
 * InstagramStyleStoryViewer - Echter Instagram-Style Story-Viewer
 * Mit Swiper 3D Coverflow und klickbaren Thumbnails links/rechts
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Keyboard, Navigation } from 'swiper/modules';
import type { StoryGroup } from '../types/stories.types';
import { storiesApi } from '../services/stories.api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

// Custom CSS für Instagram-Style Story-Viewer
const instagramStoryStyles = `
  .instagram-story-swiper .swiper-slide {
    transition: all 0.3s ease;
  }
  
  .instagram-story-swiper .swiper-slide-active {
    transform: scale(1) !important;
    z-index: 10 !important;
  }
  
  .instagram-story-swiper .swiper-slide:not(.swiper-slide-active) {
    transform: scale(0.8) !important;
    opacity: 0.7 !important;
    z-index: 1 !important;
  }
  
  .instagram-story-swiper .swiper-wrapper {
    align-items: center !important;
    justify-content: center !important;
  }
`;

// CSS in den Head einfügen
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = instagramStoryStyles;
  document.head.appendChild(styleSheet);
}

interface InstagramStyleStoryViewerProps {
  storyGroups: StoryGroup[];
  currentUserId: string | null;
  currentStoryIndex: number;
  open: boolean;
  onClose: () => void;
  onNextUser: (userId: string) => void;
  onPrevUser: (userId: string) => void;
  onNextStory: (userId: string, storyIndex: number) => void;
  onPrevStory: (userId: string, storyIndex: number) => void;
}

export const InstagramStyleStoryViewer: React.FC<InstagramStyleStoryViewerProps> = ({
  storyGroups,
  currentUserId,
  currentStoryIndex,
  open,
  onClose,
  onNextUser,
  onPrevUser,
  onNextStory,
  onPrevStory,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Aktuelle Story finden
  const currentUserGroup = storyGroups.find(group => group.user_id === currentUserId);
  const currentStory = currentUserGroup?.stories[currentStoryIndex];
  // REPARIERT: Prüfe ob es sich wirklich um ein Video handelt (verursacht "Video loading error Stack")
  const isVideo = currentStory?.media_type === 'video' && 
    currentStory?.media_url && 
    !currentStory.media_url.includes('noimage.jpeg') &&
    !currentStory.media_url.includes('placeholder') &&
    !currentStory.media_url.endsWith('.jpg') &&
    !currentStory.media_url.endsWith('.jpeg') &&
    !currentStory.media_url.endsWith('.png');

  // Aktueller User-Index für Swiper
  const currentUserIndex = storyGroups.findIndex(group => group.user_id === currentUserId);

  // Progress-Timer für Stories
  useEffect(() => {
    setProgress(0);
    
    if (isPlaying && !isHolding && currentStory && open) {
      if (isVideo) {
        // Für Videos: Progress wird durch onTimeUpdate gesteuert
        return;
      } else {
        // Für Bilder: 5 Sekunden Timer
        const duration = 5;
        const intervalMs = 100;
        const totalSteps = (duration * 1000) / intervalMs;
        const progressStep = 100 / totalSteps;
        
        progressIntervalRef.current = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + progressStep;
            if (newProgress >= 100) {
              setTimeout(() => handleNext(), 0);
              return 0;
            }
            return newProgress;
          });
        }, intervalMs);

        return () => {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        };
      }
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  }, [isPlaying, isHolding, currentStory, open, currentUserId, currentStoryIndex]);

  // Keyboard-Navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Navigation-Handler
  const handleNext = () => {
    if (!currentUserGroup || !currentUserId) return;
    
    if (currentStoryIndex < currentUserGroup.stories.length - 1) {
      onNextStory(currentUserId, currentStoryIndex + 1);
    } else {
      const currentIndex = storyGroups.findIndex(group => group.user_id === currentUserId);
      const nextIndex = (currentIndex + 1) % storyGroups.length;
      if (nextIndex === 0) {
        onClose();
      } else {
        onNextUser(storyGroups[nextIndex].user_id);
      }
    }
  };

  const handlePrev = () => {
    if (!currentUserGroup || !currentUserId) return;
    
    if (currentStoryIndex > 0) {
      onPrevStory(currentUserId, currentStoryIndex - 1);
    } else {
      const currentIndex = storyGroups.findIndex(group => group.user_id === currentUserId);
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        onClose();
      } else {
        onPrevUser(storyGroups[prevIndex].user_id);
      }
    }
  };

  // Video-Events
  const handleVideoEnded = () => {
    handleNext();
  };

  const handleVideoError = (error: any) => {
    // REPARIERT: Video-Fehler besser handhaben (verursacht "Video loading error Stack")
    console.warn('⚠️ Video loading error - möglicherweise Bild statt Video:', error);
    
    // Prüfe ob es sich um ein Bild handelt, das als Video geladen wird
    if (currentStory?.media_url && (
      currentStory.media_url.includes('noimage.jpeg') ||
      currentStory.media_url.includes('placeholder') ||
      currentStory.media_url.endsWith('.jpg') ||
      currentStory.media_url.endsWith('.jpeg') ||
      currentStory.media_url.endsWith('.png')
    )) {
      console.info('ℹ️ Bild als Video erkannt - überspringe Video-Loading');
      return; // Nicht als Fehler behandeln
    }
    
    // Echte Video-Fehler behandeln
    setTimeout(handleNext, 1000);
  };

  // Touch/Mouse-Handler für Hold-to-Pause
  const handleTouchStart = () => {
    setIsHolding(true);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleTouchEnd = () => {
    setIsHolding(false);
    if (isVideo && videoRef.current && isPlaying) {
      videoRef.current.play();
    }
  };

  // Swiper-Events
  const handleSwiperSlideChange = (swiper: any) => {
    const newUserIndex = swiper.activeIndex;
    if (newUserIndex !== currentUserIndex) {
      onNextUser(storyGroups[newUserIndex].user_id);
    }
  };

  if (!open || !currentUserGroup || !currentStory) {
    return null;
  }

  const mediaUrl = currentStory.media_url ? storiesApi.getMediaUrl(currentStory.media_url) : '';
  const avatarUrl = currentUserGroup.user_avatar ? storiesApi.getMediaUrl(currentUserGroup.user_avatar) : undefined;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'black',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="instagram-story-viewer-title"
    >
      {/* Screen reader title */}
      <div id="instagram-story-viewer-title" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        Instagram Style Story Viewer
      </div>

      {/* Swiper Container für Story-Karten */}
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .swiper': {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          '& .swiper-slide': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          '& .swiper-wrapper': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 50,
            modifier: 1,
            slideShadows: false,
          }}
          initialSlide={currentUserIndex}
          keyboard={{
            enabled: true,
          }}
          navigation={false}
          modules={[EffectCoverflow, Keyboard, Navigation]}
          onSwiper={setSwiperInstance}
          onSlideChange={handleSwiperSlideChange}
          style={{
            width: '100%',
            height: '100%',
          }}
          className="instagram-story-swiper"
        >
          {storyGroups.map((storyGroup, groupIndex) => {
            const isActiveUser = groupIndex === currentUserIndex;
            return (
              <SwiperSlide
                key={storyGroup.user_id}
                style={{
                  width: isMobile ? '100vw' : 'min(400px, 90vw)',
                  height: isMobile ? '100vh' : 'min(600px, 90vh)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isActiveUser ? 'scale(1)' : 'scale(0.8)',
                  opacity: isActiveUser ? 1 : 0.7,
                  zIndex: isActiveUser ? 10 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
              {/* Story Container für jeden User */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  aspectRatio: '9/16',
                  bgcolor: 'black',
                  borderRadius: isMobile ? 0 : 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
        {/* Progress Bar */}
        <Box
          sx={{
            position: 'absolute',
            top: '10px',
            left: '20px',
            right: '20px',
            height: '3px',
            display: 'flex',
            gap: '4px',
            zIndex: 20,
          }}
        >
                  {storyGroup.stories.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: 1,
                        height: '100%',
                        bgcolor: 'rgba(255,255,255,0.3)',
                        borderRadius: '2px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Aktives Segment füllt sich */}
                      {index === currentStoryIndex && groupIndex === currentUserIndex && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${progress}%`,
                            bgcolor: 'rgba(255,255,255,1)',
                            borderRadius: '2px',
                            transition: isHolding ? 'none' : 'width 0.1s ease',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>

        {/* Header mit User-Info und Controls */}
        <Box
          sx={{
            position: 'absolute',
            top: '25px',
            left: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 20,
          }}
        >
                  {/* User Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={groupIndex === currentUserIndex ? avatarUrl : storiesApi.getMediaUrl(storyGroup.user_avatar || '')}
                      sx={{ width: 32, height: 32, border: '2px solid #dcf8c6' }}
                      alt={storyGroup.user_name}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {storyGroup.user_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {groupIndex === currentUserIndex && currentStory 
                          ? storiesApi.formatTimeAgo(currentStory.created_at)
                          : 'Story'
                        }
                      </Typography>
                    </Box>
                  </Box>

                  {/* Controls - nur für aktiven User */}
                  {groupIndex === currentUserIndex && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{ color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newIsPlaying = !isPlaying;
                          setIsPlaying(newIsPlaying);
                          
                          if (isVideo && videoRef.current) {
                            if (newIsPlaying) {
                              videoRef.current.play();
                            } else {
                              videoRef.current.pause();
                            }
                          }
                        }}
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                      {isVideo && (
                        <IconButton
                          size="small"
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted(!isMuted);
                          }}
                        >
                          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        sx={{ color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {/* Story Media - nur für aktiven User */}
                {groupIndex === currentUserIndex && currentStory && (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* REPARIERT: Immer Bild anzeigen, nie Video für Placeholder (verursacht "Video loading error Stack") */}
                    {isVideo && !mediaUrl.includes('noimage.jpeg') && !mediaUrl.includes('placeholder') ? (
                      <video
                        ref={videoRef}
                        src={mediaUrl}
                        autoPlay={isPlaying}
                        muted={isMuted}
                        loop={false}
                        playsInline={true}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onEnded={handleVideoEnded}
                        onError={handleVideoError}
                        onTimeUpdate={(e) => {
                          if (isPlaying && !isHolding) {
                            const video = e.target as HTMLVideoElement;
                            if (video.duration) {
                              const progress = (video.currentTime / video.duration) * 100;
                              setProgress(progress);
                            }
                          }
                        }}
                        onLoadedMetadata={(e) => {
                          const video = e.target as HTMLVideoElement;
                          console.log(`Video geladen: ${video.duration}s`);
                        }}
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={currentStory.caption || 'Story'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          console.warn('⚠️ Story-Bild konnte nicht geladen werden, verwende Placeholder:', mediaUrl);
                          // REPARIERT: Immer Backend-Placeholder verwenden, nie Base64 (verursacht "Video loading error Stack")
                          const target = e.target as HTMLImageElement;
                          target.src = 'http://localhost:8000/api/images/noimage.jpeg';
                        }}
                      />
                    )}
                  </Box>
                )}

        {/* Chat Input Field - nur für aktiven User */}
        {groupIndex === currentUserIndex && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '10px',
              left: '20px',
              right: '20px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        borderRadius: 3,
                        px: 2,
                        py: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '14px',
                          flex: 1,
                        }}
                      >
                        Antwort an {storyGroup.user_name}...
                      </Typography>
                    </Box>
                    <IconButton
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.8)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Heart Icon */}
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                              fill="white"
                            />
                          </svg>
                        </Box>
                        {/* Share Icon */}
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
                              fill="white"
                            />
                          </svg>
                        </Box>
                      </Box>
                    </IconButton>
                  </Box>
                )}

        {/* Navigation Hotzones - nur für aktiven User */}
        {groupIndex === currentUserIndex && (
          <>
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '30%',
                height: 'calc(100% - 60px)',
                cursor: 'pointer',
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '70%',
                height: 'calc(100% - 60px)',
                cursor: 'pointer',
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </>
        )}
              </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>

      {/* Hold-to-Pause Indicator */}
      {isHolding && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(0,0,0,0.7)',
            borderRadius: 2,
            p: 2,
          }}
        >
          <PauseIcon sx={{ color: 'white', fontSize: 40 }} />
          <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
            Gedrückt halten zum Pausieren
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InstagramStyleStoryViewer;
