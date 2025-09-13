// Vereinfachte Stories-Store ohne Zustand - nur React Context
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { storiesApi } from "../services/stories.api";
import { Story } from "../types/stories.types";

interface StoriesState {
  stories: Story[];
  loading: boolean;
  error: string | null;
  currentStoryIndex: number;
  viewerOpen: boolean;
  createModalOpen: boolean;
}

type StoriesAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STORIES'; payload: Story[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'OPEN_VIEWER'; payload: number }
  | { type: 'CLOSE_VIEWER' }
  | { type: 'NEXT_STORY' }
  | { type: 'PREV_STORY' }
  | { type: 'OPEN_CREATE_MODAL' }
  | { type: 'CLOSE_CREATE_MODAL' }
  | { type: 'ADD_STORY'; payload: Story };

const initialState: StoriesState = {
  stories: [],
  loading: false,
  error: null,
  currentStoryIndex: 0,
  viewerOpen: false,
  createModalOpen: false,
};

function storiesReducer(state: StoriesState, action: StoriesAction): StoriesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STORIES':
      return { ...state, stories: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'OPEN_VIEWER':
      return { ...state, currentStoryIndex: action.payload, viewerOpen: true };
    case 'CLOSE_VIEWER':
      return { ...state, viewerOpen: false, currentStoryIndex: 0 };
    case 'NEXT_STORY':
      const nextIndex = (state.currentStoryIndex + 1) % state.stories.length;
      return { ...state, currentStoryIndex: nextIndex };
    case 'PREV_STORY':
      const prevIndex = state.currentStoryIndex === 0 ? state.stories.length - 1 : state.currentStoryIndex - 1;
      return { ...state, currentStoryIndex: prevIndex };
    case 'OPEN_CREATE_MODAL':
      return { ...state, createModalOpen: true };
    case 'CLOSE_CREATE_MODAL':
      return { ...state, createModalOpen: false };
    case 'ADD_STORY':
      return { ...state, stories: [action.payload, ...state.stories] };
    default:
      return state;
  }
}

interface StoriesContextType {
  state: StoriesState;
  loadStories: () => Promise<void>;
  openStoryViewer: (index: number) => void;
  closeStoryViewer: () => void;
  nextStory: () => void;
  prevStory: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  addStory: (story: Story) => void;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storiesReducer, initialState);

  const loadStories = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const stories = await storiesApi.getFeed(20, 0);
      dispatch({ type: 'SET_STORIES', payload: stories });
    } catch (error: any) {
      if (error.message?.includes('nicht authentifiziert') || error.message?.includes('Not authenticated')) {
        dispatch({ type: 'SET_STORIES', payload: [] });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Fehler beim Laden der Stories' });
      }
    }
  };

  const openStoryViewer = (index: number) => {
    dispatch({ type: 'OPEN_VIEWER', payload: index });
  };

  const closeStoryViewer = () => {
    dispatch({ type: 'CLOSE_VIEWER' });
  };

  const nextStory = () => {
    dispatch({ type: 'NEXT_STORY' });
  };

  const prevStory = () => {
    dispatch({ type: 'PREV_STORY' });
  };

  const openCreateModal = () => {
    dispatch({ type: 'OPEN_CREATE_MODAL' });
  };

  const closeCreateModal = () => {
    dispatch({ type: 'CLOSE_CREATE_MODAL' });
  };

  const addStory = (story: Story) => {
    dispatch({ type: 'ADD_STORY', payload: story });
  };

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
    }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStoriesStore() {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error('useStoriesStore must be used within a StoriesProvider');
  }
  return context;
}