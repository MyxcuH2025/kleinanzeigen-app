/**
 * SuperTeamStoryViewer - Lösung von 100 Top-Experten weltweit
 * Instagram-Style Story-Viewer mit perfekter Zentrierung
 */
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Send as SendIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import type { StoryGroup } from '../types/stories.types';
import { storiesApi } from '../services/stories.api';
import { storiesWebSocket } from '../services/stories.websocket';
import { useStoriesStore } from '../store/stories.store';

interface SuperTeamStoryViewerProps {
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

export const SuperTeamStoryViewer: React.FC<SuperTeamStoryViewerProps> = ({
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
  
  // Store
  const { deleteStory } = useStoriesStore();
  
  // State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [swipeStartY, setSwipeStartY] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const isAutoAdvancingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Aktueller User-Index
  const currentUserIndex = storyGroups.findIndex(group => group.user_id === currentUserId);

  // Insights State
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Progress-Timer für Stories
  useEffect(() => {
    setProgress(0);
    
    if (isPlaying && !isHolding && currentStory && open) {
      if (isVideo) {
        return; // Video steuert Progress selbst
      } else {
        const duration = 5;
        const intervalMs = 100;
        const totalSteps = (duration * 1000) / intervalMs;
        const progressStep = 100 / totalSteps;
        
        progressIntervalRef.current = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + progressStep;
            if (newProgress >= 100) {
              // Bild fertig: Timer stoppen und automatisch weiter
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
              setTimeout(() => handleAutoAdvance(), 0);
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

  // Auto-Advance ohne Blockade durch Transition-Guard
  const handleAutoAdvance = () => {
    if (isAutoAdvancingRef.current) return;
    isAutoAdvancingRef.current = true;

    if (!currentUserGroup || !currentUserId) {
      isAutoAdvancingRef.current = false;
      return;
    }

    setIsTransitioning(true);

    if (currentStoryIndex < currentUserGroup.stories.length - 1) {
      onNextStory(currentUserId, currentStoryIndex + 1);
    } else {
      const currentIndex = storyGroups.findIndex(group => group.user_id === currentUserId);
      const nextIndex = currentIndex + 1;
      if (nextIndex >= storyGroups.length) {
        onClose();
      } else {
        onNextUser(storyGroups[nextIndex].user_id);
      }
    }

    setTimeout(() => {
      setIsTransitioning(false);
      isAutoAdvancingRef.current = false;
    }, 300);
  };

  // Keyboard-Navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      
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
  }, [open, onClose, isTransitioning]);

  // Navigation-Handler mit Animation
  const handleNext = () => {
    if (isTransitioning || !currentUserGroup || !currentUserId) return;
    
    setIsTransitioning(true);
    
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
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrev = () => {
    if (isTransitioning || !currentUserGroup || !currentUserId) return;
    
    setIsTransitioning(true);
    
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
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Video-Events
  const handleVideoEnded = () => {
    handleAutoAdvance();
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

  // Story-View tracking
  useEffect(() => {
    if (currentStory && currentUserId) {
      // Story als gesehen markieren (für Insights)
      storiesApi.viewStory(parseInt(currentStory.id)).catch(console.error);
    }
  }, [currentStory, currentUserId]);

  // Keyboard shortcut für Desktop (I für Insights - nur für eigene Stories)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isOwnStory = currentStory && currentUserId && String(currentStory.user_id) === String(currentUserId);
      if ((e.key === 'i' || e.key === 'I') && isOwnStory) {
        setInsightsOpen(true);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [open, currentStory, currentUserId]);

  // Touch/Mouse-Handler
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHolding(true);
    setSwipeStartY(e.touches[0].clientY);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHolding(false);
    if (isVideo && videoRef.current && isPlaying) {
      videoRef.current.play();
    }

      // Swipe-Up für Insights prüfen (nur für eigene Stories)
      if (swipeStartY && currentStory) {
        const isOwnStory = currentStory && currentUserId && String(currentStory.user_id) === String(currentUserId);
        if (isOwnStory) {
          const touchEndY = e.changedTouches[0].clientY;
          const swipeDistance = swipeStartY - touchEndY;
          
          // Swipe up (mindestens 100px) öffnet Insights
          if (swipeDistance > 100) {
            setInsightsOpen(true);
          }
        }
      }
    
    setSwipeStartY(null);
  };

  const handleStoryDeleted = (deletedStoryId: string) => {
    console.log('🗑️ Story wurde gelöscht:', deletedStoryId);
    setInsightsOpen(false);
    
    // Story aus Store entfernen
    if (currentStory) {
      console.log('🗑️ Store: Story wird aus Store entfernt:', { 
        userId: currentStory.user_id, 
        storyId: deletedStoryId 
      });
      // Store deleteStory aufrufen um UI zu aktualisieren
      deleteStory(deletedStoryId);
    }
    
    // Zur nächsten Story wechseln oder Viewer schließen
    handleNext();
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentStory) {
      handleStoryDeleted(currentStory.id);
    }
  };

  // Prüfe ob aktuelle Story dem User gehört
  const isOwnStory = currentStory && currentUserId && String(currentStory.user_id) === String(currentUserId);

  // Load Insights Function
  const loadInsights = async () => {
    if (!currentStory || !isOwnStory) return;
    
    setInsightsLoading(true);
    try {
      const data = await storiesApi.getStoryInsights(parseInt(currentStory.id));
      setInsights(data);
    } catch (err: any) {
      console.warn('⚠️ Story-Insights konnten nicht geladen werden:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Handle Insights Open/Close
  const handleInsightsOpen = () => {
    if (isOwnStory) {
      // Pausiere Video
      if (isVideo && videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      
      // Lade Insights
      loadInsights();
      setInsightsOpen(true);
    }
  };

  const handleInsightsClose = () => {
    setInsightsOpen(false);
    setInsights(null);
    setActiveTab(0);
    
    // Setze Video fort
    if (isVideo && videoRef.current) {
      videoRef.current.play();
    }
    setIsPlaying(true);
  };

  // Helper Functions für Insights
  const formatViewTime = (viewedAt: string) => {
    const date = new Date(viewedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'vor wenigen Minuten';
    } else if (diffHours < 24) {
      return `vor ${diffHours}h`;
    } else {
      return `vor ${diffDays}d`;
    }
  };

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl || avatarUrl === 'null') {
      return '/images/@noimage.jpeg';
    }
    return storiesApi.getMediaUrl(avatarUrl);
  };

  // Body-Scroll-Lock und Portal-basierte Lösung - VOR Early Return
  useEffect(() => {
    if (!open) return;
    
    // Body-Scroll-Lock
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Verstecke alle störenden Elemente
    const hideElements = () => {
      const elementsToHide = [
        '.MuiBottomNavigation-root',
        '.MuiAppBar-root',
        '[data-testid="mobile-navigation"]',
        '[data-testid="mobile-entities-bar"]',
        'header',
        '[role="banner"]',
        '[data-testid="header"]',
        '[data-testid="navigation"]'
      ];
      
      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).setAttribute('data-story-hidden', 'true');
        });
      });
    };
    
    hideElements();
    
    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      // Restore hidden elements
      const elementsToShow = document.querySelectorAll('[data-story-hidden="true"]');
      elementsToShow.forEach(el => {
        (el as HTMLElement).style.display = '';
        (el as HTMLElement).removeAttribute('data-story-hidden');
      });
    };
  }, [open]);

  if (!open || !currentUserGroup || !currentStory) {
    return null;
  }

  const mediaUrl = currentStory.media_url ? storiesApi.getMediaUrl(currentStory.media_url) : '';
  const avatarUrl = currentUserGroup.user_avatar ? storiesApi.getMediaUrl(currentUserGroup.user_avatar) : undefined;
  const currentStoryId = currentStory ? Number(currentStory.id) : undefined;

  const storyViewerContent = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'black',
        zIndex: 999999, // Höchster Z-Index
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="super-team-story-viewer-title"
    >
      {/* Screen reader title */}
      <div id="super-team-story-viewer-title" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        Super Team Story Viewer
      </div>

      {/* Container für alle Stories */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: isMobile ? '60px' : '0', // Mobile: Platz für Header
          paddingBottom: isMobile ? '80px' : '0', // Mobile: Platz für Input
        }}
      >
        {/* Story-Karten Container - Instagram-Style mit mehreren sichtbaren Stories */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: isMobile ? 'calc(100% - 140px)' : '100%', // Mobile: Weniger Höhe für UI-Elemente
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Alle Story-Gruppen - Instagram-Style mit 5 sichtbaren Stories */}
          {storyGroups.map((storyGroup, groupIndex) => {
            const isActive = groupIndex === currentUserIndex;
            const isLeft1 = groupIndex === currentUserIndex - 1;
            const isLeft2 = groupIndex === currentUserIndex - 2;
            const isRight1 = groupIndex === currentUserIndex + 1;
            const isRight2 = groupIndex === currentUserIndex + 2;
            // Alle Stories rendern für echte 5-Story-Carousel
            // Kein Conditional Rendering - alle Stories werden gerendert
            
            return (
              <Box
                key={`story-group-${storyGroup.user_id}-${groupIndex}`}
                sx={{
                  position: 'absolute',
                  width: isMobile ? '90vw' : 'min(400px, 90vw)', // Mobile: 90% statt 100%
                  height: isMobile ? 'calc(100vh - 200px)' : 'min(600px, 90vh)', // Mobile: Mehr Platz für UI-Elemente
                  aspectRatio: '9/16',
                  bgcolor: 'black',
                  borderRadius: isMobile ? 0 : 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive 
                    ? 'scale(1.0) translateX(0)' // Mobile: Kein Scale, damit UI sichtbar bleibt
                    : isLeft1 
                      ? `scale(0.8) translateX(-${isMobile ? '90vw' : '580px'})`
                      : isLeft2
                        ? `scale(0.6) translateX(-${isMobile ? '175vw' : '1150px'})`
                        : isRight1
                          ? `scale(0.8) translateX(${isMobile ? '90vw' : '580px'})`
                          : isRight2
                            ? `scale(0.6) translateX(${isMobile ? '175vw' : '1150px'})`
                            : groupIndex < currentUserIndex - 2
                              ? `scale(0.4) translateX(-${isMobile ? '220vw' : '1450px'})`
                              : groupIndex > currentUserIndex + 2
                                ? `scale(0.4) translateX(${isMobile ? '220vw' : '1450px'})`
                                : 'scale(0.25) translateX(0)',
                  opacity: isActive ? 1 : isLeft1 || isRight1 ? 0.95 : isLeft2 || isRight2 ? 0.75 : 0.4,
                  zIndex: isActive ? 10 : isLeft1 || isRight1 ? 8 : isLeft2 || isRight2 ? 6 : 3,
                  '&:hover': {
                    opacity: isActive ? 1 : 0.9,
                    // Kein Transform-Zoom mehr - nur Opacity-Änderung
                  },
                }}
                onClick={() => {
                  if (!isActive) {
                    onNextUser(storyGroup.user_id);
                  }
                }}
              >
                {/* Thumbnail Content für nicht-aktive Stories - Instagram-Style */}
                {!isActive && (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.9)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, 
                          rgba(220, 248, 198, 0.1) 0%, 
                          rgba(0,0,0,0.9) 50%, 
                          rgba(220, 248, 198, 0.1) 100%)`,
                        borderRadius: 'inherit',
                      },
                    }}
                  >
                    <Avatar
                      src={storiesApi.getMediaUrl(storyGroup.user_avatar || '')}
                      sx={{ 
                        width: isActive ? 110 : isLeft1 || isRight1 ? 70 : isLeft2 || isRight2 ? 55 : 40, 
                        height: isActive ? 110 : isLeft1 || isRight1 ? 70 : isLeft2 || isRight2 ? 55 : 40, 
                        border: `3px solid ${isActive ? '#dcf8c6' : isLeft1 || isRight1 ? '#dcf8c6' : isLeft2 || isRight2 ? 'rgba(220, 248, 198, 0.7)' : 'rgba(255,255,255,0.4)'}`, 
                        mb: 2,
                        transition: 'all 0.3s ease',
                      }}
                      alt={storyGroup.user_name}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: isActive ? '20px' : isLeft1 || isRight1 ? '14px' : isLeft2 || isRight2 ? '12px' : '11px',
                        textAlign: 'center',
                      }}
                    >
                      {storyGroup.user_name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: isActive ? '16px' : isLeft1 || isRight1 ? '12px' : isLeft2 || isRight2 ? '11px' : '10px',
                      }}
                    >
                      {storyGroup.stories.length} {storyGroup.stories.length === 1 ? 'Story' : 'Stories'}
                    </Typography>
                    
                    {/* Klick-Hinweis für nicht-aktive Stories */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#dcf8c6',
                        fontSize: '10px',
                        mt: 1,
                        opacity: 0.8,
                      }}
                    >
                      Klicken zum Ansehen
                    </Typography>
                  </Box>
                )}

                {/* Aktive Story Content */}
                {isActive && (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
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
                      {storyGroup.stories.map((story, index) => (
                        <Box
                          key={`${storyGroup.user_id}-${story.id}-${index}`}
                          sx={{
                            flex: 1,
                            height: '100%',
                            bgcolor: 'rgba(255,255,255,0.3)',
                            borderRadius: '2px',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {index === currentStoryIndex && (
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
                          src={avatarUrl}
                          sx={{ width: 32, height: 32, border: '2px solid #dcf8c6' }}
                          alt={storyGroup.user_name}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {storyGroup.user_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {storiesApi.formatTimeAgo(currentStory.created_at)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Controls */}
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
                        {/* Insights Button für Desktop - nur für eigene Stories */}
                        {!isMobile && isOwnStory && (
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: 'white',
                              bgcolor: 'rgba(0,0,0,0.7)',
                              border: '2px solid white',
                              '&:hover': { 
                                bgcolor: 'rgba(0,0,0,0.9)',
                                transform: 'scale(1.1)'
                              },
                              zIndex: 1000
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsightsOpen();
                            }}
                            title="Story-Insights öffnen (I)"
                          >
                            <InsightsIcon />
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
                    </Box>

                    {/* Story Media */}
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
                            objectFit: isMobile ? 'contain' : 'cover',
                            maxWidth: '100%',
                            maxHeight: '100%',
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
                            objectFit: isMobile ? 'contain' : 'cover',
                            maxWidth: '100%',
                            maxHeight: '100%',
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

                    {/* Chat Input Field */}
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
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && replyText.trim() && !isSendingReply && currentStoryId) {
                            e.preventDefault();
                            setIsSendingReply(true);
                            try {
                              if (storiesWebSocket && storiesWebSocket.isConnected()) {
                                storiesWebSocket.sendStoryReply(currentStoryId, replyText.trim());
                              } else {
                                await storiesApi.replyToStory(currentStoryId, replyText.trim());
                              }
                              setReplyText('');
                            } catch (err) {
                              console.error('Fehler beim Senden der Story-Antwort:', err);
                            } finally {
                              setIsSendingReply(false);
                            }
                          }
                        }}
                        placeholder={`Antwort an ${storyGroup.user_name}...`}
                        style={{
                          flex: 1,
                          outline: 'none',
                          border: 'none',
                          color: 'white',
                          background: 'rgba(0,0,0,0.7)',
                          borderRadius: 12,
                          padding: '10px 14px',
                          fontSize: 14,
                        }}
                        aria-label={`Antwort an ${storyGroup.user_name}`}
                      />
                      {/* Heart quick reaction */}
                      <IconButton
                        sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.7)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!currentStoryId) return;
                          try {
                            if (storiesWebSocket && storiesWebSocket.isConnected()) {
                              storiesWebSocket.sendStoryReaction(currentStoryId, 'heart');
                            } else {
                              await storiesApi.reactToStory(currentStoryId, 'heart');
                            }
                          } catch (err) {
                            console.error('Fehler bei Herz-Reaktion:', err);
                          }
                        }}
                        aria-label="Gefällt mir"
                      >
                        <FavoriteBorderIcon />
                      </IconButton>

                      {/* Send button (paper plane) */}
                      <IconButton
                        sx={{
                          color: 'white',
                          bgcolor: replyText.trim() ? '#dcf8c6' : 'rgba(0,0,0,0.7)',
                          '&:hover': { bgcolor: replyText.trim() ? '#c8e6a3' : 'rgba(0,0,0,0.8)' },
                          transition: 'background-color 0.2s ease',
                        }}
                        disabled={isSendingReply || !replyText.trim()}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!currentStoryId || !replyText.trim()) return;
                          setIsSendingReply(true);
                          try {
                            if (storiesWebSocket && storiesWebSocket.isConnected()) {
                              storiesWebSocket.sendStoryReply(currentStoryId, replyText.trim());
                            } else {
                              await storiesApi.replyToStory(currentStoryId, replyText.trim());
                            }
                            setReplyText('');
                            
                            // ✅ CHAT-INTEGRATION: Story-Antwort im Chat-UI anzeigen
                            // Erstelle temporäre Nachricht für Chat-UI
                            const tempMessage = {
                              id: Date.now(),
                              content: `📸 Story-Antwort: ${replyText.trim()}`,
                              sender_id: currentUserId,
                              conversation_id: `story_${currentStoryId}`,
                              created_at: new Date().toISOString(),
                              isOwn: true,
                              type: 'text'
                            };
                            
                            // Speichere temporäre Nachricht für Chat-UI
                            const tempConversations = JSON.parse(localStorage.getItem('temp_conversations') || '[]');
                            const storyConversation = {
                              id: `story_${currentStoryId}`,
                              title: `Story von ${currentStory?.user_name || 'Unbekannt'}`,
                              lastMessage: tempMessage.content,
                              timestamp: tempMessage.created_at,
                              unreadCount: 0,
                              other_user: {
                                id: currentStory?.user_id || 0,
                                name: currentStory?.user_name || 'Unbekannt',
                                avatar: currentStory?.user_avatar || ''
                              },
                              listingTitle: 'Story-Antwort',
                              listingPrice: 0,
                              listingImage: '',
                              avatar: currentStory?.user_avatar || '',
                              isDirectUserChat: true
                            };
                            
                            // Füge Story-Conversation hinzu falls nicht vorhanden
                            const existingConv = tempConversations.find((c: any) => c.id === storyConversation.id);
                            if (!existingConv) {
                              tempConversations.push(storyConversation);
                              localStorage.setItem('temp_conversations', JSON.stringify(tempConversations));
                            }
                            
                            // Speichere temporäre Nachricht
                            const tempMessages = JSON.parse(localStorage.getItem('temp_messages') || '[]');
                            tempMessages.push(tempMessage);
                            localStorage.setItem('temp_messages', JSON.stringify(tempMessages));
                            
                            console.log('✅ Story-Antwort für Chat-UI vorbereitet');
                          } catch (err) {
                            console.error('Fehler beim Senden der Story-Antwort:', err);
                          } finally {
                            setIsSendingReply(false);
                          }
                        }}
                        aria-label="Senden"
                      >
                        <SendIcon sx={{ color: replyText.trim() ? 'black' : 'white' }} />
                      </IconButton>
                    </Box>

                    {/* Navigation Hotzones */}
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
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Navigation Arrows - Instagram-Style mit Hover-Effekt */}
        <IconButton
          sx={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.3)',
            zIndex: 20,
            opacity: 0.7,
            transition: 'all 0.3s ease',
            '&:hover': { 
              bgcolor: 'rgba(0,0,0,0.7)',
              opacity: 1,
              transform: 'translateY(-50%) scale(1.1)',
            },
            '&:active': {
              transform: 'translateY(-50%) scale(0.95)',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 28 }} />
        </IconButton>
        <IconButton
          sx={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.3)',
            zIndex: 20,
            opacity: 0.7,
            transition: 'all 0.3s ease',
            '&:hover': { 
              bgcolor: 'rgba(0,0,0,0.7)',
              opacity: 1,
              transform: 'translateY(-50%) scale(1.1)',
            },
            '&:active': {
              transform: 'translateY(-50%) scale(0.95)',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          <ArrowForwardIcon sx={{ fontSize: 28 }} />
        </IconButton>
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

      {/* Instagram-Style Story Insights Overlay */}
      {insightsOpen && isOwnStory && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000000, // Höher als der Story-Viewer selbst
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #333'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
              Story-Insights
            </Typography>
            <IconButton onClick={handleInsightsClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Story Thumbnail Section */}
          <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
            {/* Story Thumbnail mit View Counter */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              mb: 2
            }}>
              {/* Story Thumbnail */}
              <Box sx={{
                position: 'relative',
                width: isMobile ? 60 : 80,
                height: isMobile ? 60 : 80,
                borderRadius: 2,
                overflow: 'hidden',
                border: '2px solid #dcf8c6',
                flexShrink: 0
              }}>
                {currentStory.media_url ? (
                  <img
                    src={storiesApi.getMediaUrl(currentStory.media_url)}
                    alt="Story"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <VisibilityIcon sx={{ color: '#666', fontSize: 20 }} />
                  </Box>
                )}
                
                {/* View Counter Badge */}
                {insights && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    backgroundColor: '#dcf8c6',
                    color: '#000',
                    borderRadius: '50%',
                    width: isMobile ? 20 : 24,
                    height: isMobile ? 20 : 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '0.6rem' : '0.7rem',
                    fontWeight: 'bold',
                    border: '2px solid #000'
                  }}>
                    {insights.total_views}
                  </Box>
                )}
              </Box>

              {/* Story Info */}
              <Box sx={{ flex: 1 }}>
                {insights ? (
                  <>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
                      {insights.total_views} Aufrufe
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999', mb: 0.5 }}>
                      {insights.viewers.length} Personen
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Erstellt: {new Date(insights.created_at).toLocaleDateString('de-DE')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    Lade Insights...
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Action Buttons Row */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              justifyContent: 'space-between'
            }}>
              <Button
                startIcon={<TrendingUpIcon />}
                sx={{
                  flex: 1,
                  backgroundColor: '#dcf8c6',
                  color: '#000',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  py: 1,
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  '&:hover': {
                    backgroundColor: '#c8e6a3',
                  },
                }}
              >
                Story bewerben
              </Button>
              
              <IconButton
                onClick={handleDeleteClick}
                sx={{
                  backgroundColor: '#ff4444',
                  color: 'white',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: '#ff6666',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Tabs Section */}
          {insights && (
            <>
              <Box sx={{ borderBottom: '1px solid #333' }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      color: '#999',
                      fontWeight: 'bold',
                      minHeight: 40,
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                    },
                    '& .Mui-selected': {
                      color: '#dcf8c6 !important',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#dcf8c6',
                    },
                  }}
                >
                  <Tab 
                    icon={<TrendingUpIcon />} 
                    label="Insights" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<PeopleIcon />} 
                    label={`Viewer (${insights.viewers.length})`}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              {activeTab === 0 && (
                <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'white' }}>
                    Story-Statistiken
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<VisibilityIcon />}
                      label={`${insights.total_views} Aufrufe`}
                      sx={{ backgroundColor: '#333', color: 'white' }}
                    />
                    <Chip 
                      icon={<PeopleIcon />}
                      label={`${insights.viewers.length} Viewer`}
                      sx={{ backgroundColor: '#333', color: 'white' }}
                    />
                  </Box>
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                      Diese Personen haben deine Story gesehen
                    </Typography>
                  </Box>

                  <List sx={{ p: 0 }}>
                    {insights.viewers.map((viewer: any, index: number) => (
                      <React.Fragment key={viewer.id}>
                        <ListItem sx={{ px: 2, py: 1 }}>
                          <ListItemAvatar>
                            <Avatar 
                              src={getAvatarUrl(viewer.avatar_url)}
                              sx={{ 
                                width: 40, 
                                height: 40,
                                border: '2px solid #333'
                              }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                                {viewer.username}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ color: '#999' }}>
                                  {viewer.full_name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                  {formatViewTime(viewer.viewed_at)}
                                </Typography>
                              </Box>
                            }
                            secondaryTypographyProps={{
                              component: 'div'
                            }}
                          />
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small" sx={{ color: '#999' }}>
                              <SendIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#999' }}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItem>
                        {index < insights.viewers.length - 1 && (
                          <Divider sx={{ backgroundColor: '#333' }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>

                  {insights.viewers.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Noch niemand hat deine Story gesehen
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}

          {/* Loading State */}
          {insightsLoading && (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <CircularProgress sx={{ color: '#dcf8c6' }} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  // Portal-basierte Rendering in document.body
  return ReactDOM.createPortal(storyViewerContent, document.body);
};

export default SuperTeamStoryViewer;
