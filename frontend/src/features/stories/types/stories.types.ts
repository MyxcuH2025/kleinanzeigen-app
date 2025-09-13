/**
 * TypeScript-Interfaces für Stories-Feature
 */

export interface Story {
  id: number;
  user_id: number;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url?: string;
  caption?: string;
  duration: number;
  views_count: number;
  reactions_count: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  
  // User-Info
  user_name?: string;
  user_avatar?: string;
  
  // Viewer-Info
  has_viewed: boolean;
  user_reaction?: StoryReactionType;
}

export interface StoryView {
  id: number;
  story_id: number;
  viewer_id: number;
  viewed_at: string;
}

export interface StoryReaction {
  id: number;
  story_id: number;
  user_id: number;
  reaction_type: StoryReactionType;
  created_at: string;
}

export interface StoryComment {
  id: number;
  story_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  is_deleted: boolean;
  
  // User-Info
  user_name?: string;
  user_avatar?: string;
}

export type StoryReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface StoriesFeedResponse {
  stories: Story[];
  total_count: number;
  has_more: boolean;
}

export interface StoryStats {
  story_id: number;
  views_count: number;
  reactions_count: number;
  comments_count: number;
  unique_viewers: number;
  top_reactions: Record<StoryReactionType, number>;
}

export interface CreateStoryRequest {
  media: File;
  caption?: string;
  duration?: number;
}

export interface StoriesState {
  stories: Story[];
  currentStory: Story | null;
  loading: boolean;
  error: string | null;
  
  // UI State
  viewerOpen: boolean;
  createModalOpen: boolean;
  selectedStoryIndex: number;
  
  // Actions
  loadStories: () => Promise<void>;
  viewStory: (storyId: number) => Promise<void>;
  reactToStory: (storyId: number, reaction: StoryReactionType) => Promise<void>;
  createStory: (media: File, caption?: string) => Promise<void>;
  deleteStory: (storyId: number) => Promise<void>;
  
  // UI Actions
  openViewer: (storyIndex: number) => void;
  closeViewer: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  nextStory: () => void;
  previousStory: () => void;
}

export interface StoriesBarProps {
  stories: Story[];
  onStoryClick: (storyIndex: number) => void;
  loading?: boolean;
}

export interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onView: (storyId: number) => void;
  onReaction: (storyId: number, reaction: StoryReactionType) => void;
}

export interface StoryCardProps {
  story: Story;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

export interface CreateStoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (media: File, caption?: string) => Promise<void>;
}

export interface StoryProgressProps {
  stories: Story[];
  currentIndex: number;
  progress: number;
}

export interface StoryReactionsProps {
  story: Story;
  onReaction: (reaction: StoryReactionType) => void;
  compact?: boolean;
}
