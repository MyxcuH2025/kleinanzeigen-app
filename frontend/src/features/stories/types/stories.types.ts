// User types werden nicht direkt verwendet

export type StoryReactionType = 'like' | 'heart' | 'laugh' | 'sad' | 'angry';

export interface StoryReaction {
  id: string;
  story_id: string;
  user_id: string;
  reaction_type: StoryReactionType;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string; // Hinzugefügt: User ID zur Story
  user_name: string;
  user_avatar?: string;
  media_url: string;
  media_type: 'image' | 'video';
  duration: number; // In Sekunden
  expires_at: string; // ISO 8601 Datum
  created_at: string; // ISO 8601 Datum
  has_viewed: boolean; // Ob der aktuelle User diese Story angesehen hat
  caption?: string; // Instagram-Style Text Overlay
  reactions?: StoryReaction[];
}

export interface StoryGroup {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  stories: Story[];
  has_unviewed_stories: boolean; // Ob dieser User ungelesene Stories hat
}

export interface CreateStoryModalProps {
  open: boolean;
  onClose: () => void;
}

export interface StoriesBarProps {
  storyGroups: StoryGroup[]; // Jetzt StoryGroup[]
  onStoryClick: (userId: string, storyIndex: number) => void; // userId hinzugefügt
  onCreateClick: () => void;
  showCreateButton: boolean;
}

export interface StoryViewerProps {
  storyGroups: StoryGroup[]; // Jetzt StoryGroup[]
  currentViewingUserId: string | null; // Welcher User gerade angesehen wird
  currentStoryIndex: number; // Index innerhalb der Stories des aktuellen Users
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onView: (storyId: string) => void;
  onReaction: (storyId: string, reaction: StoryReactionType) => void;
}

export interface StoryReactionPayload {
  story_id: string;
  reaction_type: StoryReactionType;
}

export interface StoryViewPayload {
  story_id: string;
}

export interface StoryCreatedPayload {
  story: Story;
}

export interface StoryReactionUpdatePayload {
  story_id: string;
  reaction: StoryReaction;
}