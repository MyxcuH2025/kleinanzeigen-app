/**
 * Stories-Feature - Hauptkomponente für Stories-Integration
 * Modulare Architektur mit sauberer Trennung
 */
import React, { useEffect, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useStoriesStore } from './store/stories.store';
import { StoryBar } from './components/StoryBar';
import { SuperTeamStoryViewer } from './components/SuperTeamStoryViewer';
import { CreateStoryModal } from './components/CreateStoryModal';
import { storiesWebSocket, type WebSocketMessage } from './services/stories.websocket';
import { useUser } from '../../context/UserContext';

interface StoriesFeatureProps {
  showInFeed?: boolean;
  showCreateButton?: boolean;
  maxStories?: number;
}

export const StoriesFeature: React.FC<StoriesFeatureProps> = ({
  showInFeed = true,
  showCreateButton = true,
  maxStories = 10,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useUser();
  
  const {
    storyGroups,
    loading,
    error,
    addStory,
    markStoryViewed,
    loadStories,
  } = useStoriesStore();

  // Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Stories laden beim Mount und bei User-Änderungen (FIXED: Endlos-Loop behoben)
  useEffect(() => {
    loadStories();
  }, [user?.id]); // FIXED: loadStories aus Dependencies entfernt um Endlos-Loop zu vermeiden


  // WebSocket Connection
  useEffect(() => {
    if (user?.id) {
      // WebSocket wird automatisch beim ersten Aufruf verbunden
      const handleMessage = (message: WebSocketMessage) => {
      };

      storiesWebSocket.onMessage('*', handleMessage);

      return () => {
        storiesWebSocket.disconnect();
      };
    }
  }, [user?.id]);

  // Story-Viewer öffnen
  const openStoryViewer = useCallback((userId: string, storyIndex: number = 0) => {
    setCurrentUserId(userId);
    setCurrentStoryIndex(storyIndex);
    setViewerOpen(true);
    
    // Story als gesehen markieren
    const userGroup = storyGroups.find(group => group.user_id === userId);
    if (userGroup?.stories[storyIndex]) {
      markStoryViewed(userId, userGroup.stories[storyIndex].id);
    }
  }, [storyGroups, markStoryViewed]);

  // Story-Viewer schließen
  const closeStoryViewer = useCallback(() => {
    setViewerOpen(false);
    setCurrentUserId(null);
    setCurrentStoryIndex(0);
  }, []);

  // Navigation zwischen Users
  const handleNextUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setCurrentStoryIndex(0);
  }, []);

  const handlePrevUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    const userGroup = storyGroups.find(group => group.user_id === userId);
    setCurrentStoryIndex(userGroup ? userGroup.stories.length - 1 : 0);
  }, [storyGroups]);

  // Navigation zwischen Stories
  const handleNextStory = useCallback((userId: string, storyIndex: number) => {
    setCurrentStoryIndex(storyIndex);
    const userGroup = storyGroups.find(group => group.user_id === userId);
    if (userGroup?.stories[storyIndex]) {
      markStoryViewed(userId, userGroup.stories[storyIndex].id);
    }
  }, [storyGroups, markStoryViewed]);

  const handlePrevStory = useCallback((userId: string, storyIndex: number) => {
    setCurrentStoryIndex(storyIndex);
    const userGroup = storyGroups.find(group => group.user_id === userId);
    if (userGroup?.stories[storyIndex]) {
      markStoryViewed(userId, userGroup.stories[storyIndex].id);
    }
  }, [storyGroups, markStoryViewed]);

  // Story erstellen
  const handleCreateStory = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  // handleCreateStorySubmit wird nicht mehr benötigt - das Modal verwaltet alles selbst

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">
          Fehler beim Laden der Stories: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Story-Bar */}
      <StoryBar
        storyGroups={storyGroups}
        onStoryClick={openStoryViewer}
        onCreateClick={handleCreateStory}
        showCreateButton={showCreateButton}
        maxStories={maxStories}
        loading={loading}
      />
      
      {/* Super Team Story Viewer - 100 Top-Experten Lösung */}
      <SuperTeamStoryViewer
        storyGroups={storyGroups}
        currentUserId={currentUserId}
        currentStoryIndex={currentStoryIndex}
        open={viewerOpen}
        onClose={closeStoryViewer}
        onNextUser={handleNextUser}
        onPrevUser={handlePrevUser}
        onNextStory={handleNextStory}
        onPrevStory={handlePrevStory}
      />

      {/* Create Story Modal */}
      <CreateStoryModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Floating Action Button entfernt - nur noch gestrichelter Button in der Story-Bar */}

      {/* CSS-Regeln entfernt - jetzt Portal-basierte Lösung mit Body-Scroll-Lock */}
    </Box>
  );
};

export default StoriesFeature;