/**
 * Stories-Feature - Hauptkomponente für Stories-Integration
 */
import React, { useEffect } from 'react';
import {
  Box,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useStoriesStore } from './store/stories.store';
import { StoriesBar } from './components/StoriesBar';
import { StoryViewer } from './components/StoryViewer';
import { CreateStoryModal } from './components/CreateStoryModal';
import { useUser } from '../../context/UserContext';

interface StoriesFeatureProps {
  showInFeed?: boolean;
  showCreateButton?: boolean;
  maxStories?: number;
}

export const StoriesFeature: React.FC<StoriesFeatureProps> = ({
  showInFeed = true,
  showCreateButton = true,
  maxStories = 10
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useUser();
  
  const {
    state,
    loadStories,
    openStoryViewer,
    closeStoryViewer,
    nextStory,
    prevStory,
    openCreateModal,
    closeCreateModal,
    addStory
  } = useStoriesStore();
  
  const { stories, loading, error, currentStoryIndex, viewerOpen, createModalOpen } = state;
  
  // Stories nur für authentifizierte User laden
  useEffect(() => {
    if (isAuthenticated && user) {
      loadStories();
    }
  }, [loadStories, isAuthenticated, user]);
  
  // Nicht für nicht-authentifizierte User anzeigen
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // Loading-State
  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        Stories werden geladen...
      </Box>
    );
  }
  
  // Error-State
  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
        Fehler beim Laden der Stories: {error}
      </Box>
    );
  }
  
  // Keine Stories verfügbar
  if (stories.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        Noch keine Stories verfügbar
        {showCreateButton && (
          <Fab
            color="primary"
            size="small"
            onClick={openCreateModal}
            sx={{ ml: 2 }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Stories-Bar */}
      {showInFeed && (
        <StoriesBar 
          stories={stories.slice(0, maxStories)}
          onStoryClick={openStoryViewer}
          onCreateClick={openCreateModal}
          showCreateButton={showCreateButton}
        />
      )}
      
      {/* Story-Viewer */}
      <StoryViewer
        stories={stories}
        currentIndex={currentStoryIndex}
        open={viewerOpen}
        onClose={closeStoryViewer}
        onNext={nextStory}
        onPrev={prevStory}
      />
      
      {/* Create-Story-Modal */}
      <CreateStoryModal
        open={createModalOpen}
        onClose={closeCreateModal}
        onStoryCreated={addStory}
      />
    </Box>
  );
};