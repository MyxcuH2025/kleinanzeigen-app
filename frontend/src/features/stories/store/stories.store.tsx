// User-basierte Stories-Store - Jeder User hat seine eigenen Stories
import React, { createContext, useContext, useReducer, ReactNode, useCallback, useMemo } from 'react';
import { storiesApi } from "../services/stories.api";
import { Story, StoryGroup } from "../types/stories.types";

interface StoriesState {
  storyGroups: StoryGroup[]; // Stories nach User gruppiert
  currentViewingUserId: string | null; // Welcher User gerade angesehen wird
  currentStoryIndex: number; // Index innerhalb der Stories des aktuellen Users
  loading: boolean;
  error: string | null;
  viewerOpen: boolean;
  createModalOpen: boolean;
}

type StoriesAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STORY_GROUPS'; payload: StoryGroup[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'OPEN_VIEWER'; payload: { userId: string; storyIndex: number } }
  | { type: 'CLOSE_VIEWER' }
  | { type: 'NEXT_STORY' }
  | { type: 'PREV_STORY' }
  | { type: 'OPEN_CREATE_MODAL' }
  | { type: 'CLOSE_CREATE_MODAL' }
  | { type: 'ADD_STORY'; payload: Story }
  | { type: 'DELETE_STORY'; payload: { userId: string; storyId: string } }
  | { type: 'MARK_STORY_VIEWED'; payload: { userId: string; storyId: string } };

const initialState: StoriesState = {
  storyGroups: [],
  currentViewingUserId: null,
  currentStoryIndex: 0,
  loading: false,
  error: null,
  viewerOpen: false,
  createModalOpen: false,
};

function storiesReducer(state: StoriesState, action: StoriesAction): StoriesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STORY_GROUPS':
      return { ...state, storyGroups: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'OPEN_VIEWER': {
      const { userId, storyIndex } = action.payload;
      return { 
        ...state, 
        currentViewingUserId: userId, 
        currentStoryIndex: storyIndex, 
        viewerOpen: true 
      };
    }
    case 'CLOSE_VIEWER':
      return { 
        ...state, 
        viewerOpen: false
        // currentViewingUserId und currentStoryIndex NICHT zurücksetzen - für Navigation beibehalten
      };
    case 'NEXT_STORY': {
      const currentGroup = state.storyGroups.find(group => group.user_id === state.currentViewingUserId);
      if (!currentGroup) return state;

      if (state.currentStoryIndex < currentGroup.stories.length - 1) {
        // Nächste Story des gleichen Users
        return { ...state, currentStoryIndex: state.currentStoryIndex + 1 };
      } else {
        // Versuche, zum nächsten User zu wechseln
        const currentIndexInGroups = state.storyGroups.findIndex(group => group.user_id === state.currentViewingUserId);
        if (currentIndexInGroups !== -1 && currentIndexInGroups < state.storyGroups.length - 1) {
          const nextUserGroup = state.storyGroups[currentIndexInGroups + 1];
          return {
            ...state,
            currentViewingUserId: nextUserGroup.user_id,
            currentStoryIndex: 0,
          };
        }
        // Keine weiteren Stories oder User - Viewer schließen
        return { ...state, viewerOpen: false, currentViewingUserId: null, currentStoryIndex: 0 };
      }
    }
    case 'PREV_STORY': {
      const currentGroup = state.storyGroups.find(group => group.user_id === state.currentViewingUserId);
      if (!currentGroup) return state;

      if (state.currentStoryIndex > 0) {
        // Vorherige Story des gleichen Users
        return { ...state, currentStoryIndex: state.currentStoryIndex - 1 };
      } else {
        // Versuche, zum vorherigen User zu wechseln
        const currentIndexInGroups = state.storyGroups.findIndex(group => group.user_id === state.currentViewingUserId);
        if (currentIndexInGroups > 0) {
          const prevUserGroup = state.storyGroups[currentIndexInGroups - 1];
          return {
            ...state,
            currentViewingUserId: prevUserGroup.user_id,
            currentStoryIndex: prevUserGroup.stories.length - 1, // Letzte Story des vorherigen Users
          };
        }
        // Bleibe bei der ersten Story des ersten Users
        return state;
      }
    }
    case 'OPEN_CREATE_MODAL':
      return { ...state, createModalOpen: true };
    case 'CLOSE_CREATE_MODAL':
      return { ...state, createModalOpen: false };
    case 'ADD_STORY': {
      const newStory = action.payload;
      const existingGroupIndex = state.storyGroups.findIndex(group => group.user_id === newStory.user_id);

      if (existingGroupIndex !== -1) {
        // Story zu existierender Gruppe hinzufügen
        const updatedStoryGroups = [...state.storyGroups];
        updatedStoryGroups[existingGroupIndex] = {
          ...updatedStoryGroups[existingGroupIndex],
          stories: [...updatedStoryGroups[existingGroupIndex].stories, newStory],
          has_unviewed_stories: true,
        };
        return { ...state, storyGroups: updatedStoryGroups };
      } else {
        // Neue StoryGroup erstellen
        const newStoryGroup: StoryGroup = {
          user_id: newStory.user_id,
          user_name: newStory.user_name,
          user_avatar: newStory.user_avatar,
          stories: [newStory],
          has_unviewed_stories: true,
        };
        return { ...state, storyGroups: [...state.storyGroups, newStoryGroup] };
      }
    }
    case 'DELETE_STORY': {
      const { userId, storyId } = action.payload;
      console.log('🗑️ Store: Story wird gelöscht:', { userId, storyId });
      
      const updatedStoryGroups = state.storyGroups.map(group => {
        if (group.user_id === userId) {
          const updatedStories = group.stories.filter(story => story.id !== storyId);
          const hasUnviewed = updatedStories.some(story => !story.has_viewed);
          
          // Wenn keine Stories mehr vorhanden, Gruppe komplett entfernen
          if (updatedStories.length === 0) {
            return null;
          }
          
          return { ...group, stories: updatedStories, has_unviewed_stories: hasUnviewed };
        }
        return group;
      }).filter(Boolean); // Entferne null-Werte (leere Gruppen)
      
      console.log('✅ Store: Story erfolgreich aus Store entfernt');
      return { ...state, storyGroups: updatedStoryGroups };
    }
    case 'MARK_STORY_VIEWED': {
      const { userId, storyId } = action.payload;
      const updatedStoryGroups = state.storyGroups.map(group => {
        if (group.user_id === userId) {
          const updatedStories = group.stories.map(story =>
            story.id === storyId ? { ...story, has_viewed: true } : story
          );
          const hasUnviewed = updatedStories.some(story => !story.has_viewed);
          return { ...group, stories: updatedStories, has_unviewed_stories: hasUnviewed };
        }
        return group;
      });
      return { ...state, storyGroups: updatedStoryGroups };
    }
    default:
      return state;
  }
}

interface StoriesContextType {
  state: StoriesState;
  loadStories: () => Promise<void>;
  openStoryViewer: (userId: string, storyIndex: number) => void;
  closeStoryViewer: () => void;
  nextStory: () => void;
  prevStory: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  addStory: (story: Story) => void;
  deleteStory: (storyId: string) => void;
  markStoryViewed: (userId: string, storyId: string) => void;
  // Computed values
  currentStories: Story[]; // Stories des aktuell angesehenen Users
  otherUserStoryGroups: StoryGroup[]; // StoryGroups der anderen User für seitliche Navigation
  // Compatibility properties
  stories: Story[]; // Flache Liste für Kompatibilität
  loading: boolean;
  error: string | null;
  openViewer: (index: number) => void;
  getUnviewedStoriesCount: () => number;
  clearError: () => void;
  // State properties
  storyGroups: StoryGroup[];
  currentViewingUserId: string | null;
  currentStoryIndex: number;
  viewerOpen: boolean;
  createModalOpen: boolean;
}

// REPARIERT: Context mit Default-Werten initialisieren (verursacht "useStoriesStore must be used within a StoriesProvider")
const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storiesReducer, initialState);

  const loadStories = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const stories = await storiesApi.getFeed(20, 0);
      
      // Stories nach User gruppieren
      const groupedStoriesMap = new Map<string, StoryGroup>();
      stories.forEach(story => {
        if (!groupedStoriesMap.has(story.user_id)) {
          groupedStoriesMap.set(story.user_id, {
            user_id: story.user_id,
            user_name: story.user_name,
            user_avatar: story.user_avatar,
            stories: [],
            has_unviewed_stories: false,
          });
        }
        groupedStoriesMap.get(story.user_id)!.stories.push(story);
      });

      const storyGroups: StoryGroup[] = Array.from(groupedStoriesMap.values()).map(group => {
        // Sortiere Stories innerhalb jeder Gruppe nach Erstellungsdatum (älteste zuerst = links nach rechts)
        group.stories.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        // Prüfe, ob ungelesene Stories vorhanden sind
        group.has_unviewed_stories = group.stories.some(story => !story.has_viewed);
        return group;
      });

      // Sortiere StoryGroups: Ungelesene zuerst, dann nach Erstellungsdatum der neuesten Story
      storyGroups.sort((a, b) => {
        if (a.has_unviewed_stories && !b.has_unviewed_stories) return -1;
        if (!a.has_unviewed_stories && b.has_unviewed_stories) return 1;
        const lastStoryA = a.stories[a.stories.length - 1];
        const lastStoryB = b.stories[b.stories.length - 1];
        return new Date(lastStoryB.created_at).getTime() - new Date(lastStoryA.created_at).getTime();
      });

      dispatch({ type: 'SET_STORY_GROUPS', payload: storyGroups });
    } catch (error: any) {
      console.error('❌ Error loading stories:', error);
      if (error.message?.includes('nicht authentifiziert') || error.message?.includes('Not authenticated')) {
        dispatch({ type: 'SET_STORY_GROUPS', payload: [] });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Fehler beim Laden der Stories' });
      }
    }
  }, []);

  const openStoryViewer = useCallback((userId: string, storyIndex: number) => {
    dispatch({ type: 'OPEN_VIEWER', payload: { userId, storyIndex } });
  }, []);

  const closeStoryViewer = useCallback(() => {
    dispatch({ type: 'CLOSE_VIEWER' });
  }, []);

  const nextStory = useCallback(() => {
    dispatch({ type: 'NEXT_STORY' });
  }, []);

  const prevStory = useCallback(() => {
    dispatch({ type: 'PREV_STORY' });
  }, []);

  const openCreateModal = useCallback(() => {
    dispatch({ type: 'OPEN_CREATE_MODAL' });
  }, []);

  const closeCreateModal = useCallback(() => {
    dispatch({ type: 'CLOSE_CREATE_MODAL' });
  }, []);

  const addStory = useCallback((story: Story) => {
    dispatch({ type: 'ADD_STORY', payload: story });
  }, []);

  const deleteStory = useCallback((storyId: string, userId?: string) => {
    dispatch({ type: 'DELETE_STORY', payload: { storyId, userId: userId || '' } });
  }, []);

  const markStoryViewed = useCallback((userId: string, storyId: string) => {
    dispatch({ type: 'MARK_STORY_VIEWED', payload: { userId, storyId } });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const getUnviewedStoriesCount = useCallback(() => {
    return state.storyGroups.reduce((count, group) => {
      return count + group.stories.filter(story => !story.has_viewed).length;
    }, 0);
  }, [state.storyGroups]);

  // Aktuell angezeigte Stories des Users
  const currentStories = useMemo(() => {
    if (!state.currentViewingUserId) return [];
    const group = state.storyGroups.find(g => g.user_id === state.currentViewingUserId);
    return group ? group.stories : [];
  }, [state.storyGroups, state.currentViewingUserId]);

  // Andere User StoryGroups für die seitliche Navigation
  const otherUserStoryGroups = useMemo(() => {
    return state.storyGroups.filter(g => g.user_id !== state.currentViewingUserId);
  }, [state.storyGroups, state.currentViewingUserId]);

  // Flache Liste für Kompatibilität
  const stories = useMemo(() => {
    return state.storyGroups.flatMap(group => group.stories);
  }, [state.storyGroups]);

  // Kompatibilitäts-Funktion
  const openViewer = useCallback((index: number) => {
    const story = stories[index];
    if (story) {
      openStoryViewer(story.user_id, 0); // Erste Story des Users öffnen
    }
  }, [stories, openStoryViewer]);

  return (
    <StoriesContext.Provider value={{
      state,
      loadStories,
      openStoryViewer,
      closeStoryViewer,
      nextStory,
      prevStory,
      openCreateModal,
      closeCreateModal,
      addStory,
      deleteStory,
      markStoryViewed,
      // Computed values
      currentStories,
      otherUserStoryGroups,
      // Compatibility properties
      stories,
      loading: state.loading,
      error: state.error,
      openViewer,
      getUnviewedStoriesCount,
      clearError,
      // State properties
      storyGroups: state.storyGroups,
      currentViewingUserId: state.currentViewingUserId,
      currentStoryIndex: state.currentStoryIndex,
      viewerOpen: state.viewerOpen,
      createModalOpen: state.createModalOpen,
    }}>
      {children}
    </StoriesContext.Provider>
  );
}

// useStoriesStore Hook für Vite Fast Refresh kompatibel
const useStoriesStore = () => {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error('useStoriesStore must be used within a StoriesProvider');
  }
  return context;
};

export { useStoriesStore };