/**
 * Stories-Feature - Hauptexport für einfache Imports
 */

// Hauptkomponenten
export { default as StoriesFeature } from './StoriesFeature';
export { default as StoriesBar } from './components/StoriesBar';
export { default as StoryViewer } from './components/StoryViewer';
// InstagramStyleStoryViewer wurde gelöscht und durch modulare Komponenten ersetzt
export { default as StoryCard } from './components/StoryCard';
export { default as CreateStoryModal } from './components/CreateStoryModal';
export { default as StoryProgress } from './components/StoryProgress';
export { default as StoryReactions } from './components/StoryReactions';

// Store und Services
export { useStoriesStore } from './store/stories.store';
export { default as storiesApi } from './services/stories.api';

// Types
export type {
  Story,
  StoryGroup,
  StoryReaction,
  StoryReactionType,
  StoriesBarProps,
  StoryViewerProps,
  CreateStoryModalProps
} from './types/stories.types';
