/**
 * Stories-API-Service für Backend-Kommunikation
 */
import { apiService } from '../../../services/api';
import type { 
  Story, 
  StoriesFeedResponse, 
  StoryStats, 
  CreateStoryRequest,
  StoryReactionType 
} from '../types/stories.types';

const STORIES_API = '/api/stories';

export const storiesApi = {
  /**
   * Stories-Feed abrufen
   */
  async getFeed(limit: number = 20, offset: number = 0): Promise<Story[]> {
    try {
      const response = await apiService.get<StoriesFeedResponse>(
        `${STORIES_API}/feed?limit=${limit}&offset=${offset}`
      );
      return response.stories || [];
    } catch (error: any) {
      // Bei Authentifizierungsfehlern leeres Array zurückgeben statt Fehler werfen
      if (error.response?.status === 401 || error.response?.data?.detail?.includes('Not authenticated')) {
        console.log('Stories-Feed nicht verfügbar - User nicht authentifiziert');
        return [];
      }
      console.error('Fehler beim Abrufen des Stories-Feeds:', error);
      throw new Error(error.response?.data?.detail || 'Fehler beim Laden der Stories');
    }
  },

  /**
   * Einzelne Story abrufen
   */
  async getStory(storyId: number): Promise<Story> {
    try {
      const response = await apiService.get<Story>(`${STORIES_API}/${storyId}`);
      return response;
    } catch (error: any) {
      console.error(`Fehler beim Abrufen der Story ${storyId}:`, error);
      throw new Error(error.response?.data?.detail || 'Story nicht gefunden');
    }
  },

  /**
   * Story erstellen
   */
  async createStory(media: File, caption?: string, duration?: number): Promise<{ story_id: number; media_url: string }> {
    try {
      const formData = new FormData();
      formData.append('media', media);
      
      if (caption) {
        formData.append('caption', caption);
      }
      
      if (duration) {
        formData.append('duration', duration.toString());
      }

      const response = await apiService.post<{ story_id: number; media_url: string }>(
        STORIES_API,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response;
    } catch (error: any) {
      console.error('Fehler beim Erstellen der Story:', error);
      throw new Error(error.response?.data?.detail || 'Fehler beim Erstellen der Story');
    }
  },

  /**
   * Story als gesehen markieren
   */
  async viewStory(storyId: number): Promise<void> {
    try {
      await apiService.post(`${STORIES_API}/${storyId}/view`);
    } catch (error: any) {
      console.error(`Fehler beim Markieren der Story ${storyId} als gesehen:`, error);
      // Nicht kritisch - Fehler ignorieren
    }
  },

  /**
   * Reaktion auf Story hinzufügen/entfernen
   */
  async reactToStory(storyId: number, reactionType: StoryReactionType): Promise<void> {
    try {
      await apiService.post(`${STORIES_API}/${storyId}/reaction`, {
        reaction_type: reactionType
      });
    } catch (error: any) {
      console.error(`Fehler beim Reagieren auf Story ${storyId}:`, error);
      throw new Error(error.response?.data?.detail || 'Fehler beim Reagieren auf Story');
    }
  },

  /**
   * Story löschen
   */
  async deleteStory(storyId: number): Promise<void> {
    try {
      await apiService.delete(`${STORIES_API}/${storyId}`);
    } catch (error: any) {
      console.error(`Fehler beim Löschen der Story ${storyId}:`, error);
      throw new Error(error.response?.data?.detail || 'Fehler beim Löschen der Story');
    }
  },

  /**
   * Stories eines Users abrufen
   */
  async getUserStories(userId: number): Promise<Story[]> {
    try {
      const response = await apiService.get<{ stories: Story[] }>(`${STORIES_API}/user/${userId}`);
      return response.stories || [];
    } catch (error: any) {
      console.error(`Fehler beim Abrufen der Stories von User ${userId}:`, error);
      throw new Error(error.response?.data?.detail || 'Fehler beim Laden der User-Stories');
    }
  },

  /**
   * Story-Statistiken abrufen
   */
  async getStoryStats(storyId: number): Promise<StoryStats> {
    try {
      const response = await apiService.get<StoryStats>(`${STORIES_API}/${storyId}/stats`);
      return response;
    } catch (error: any) {
      console.error(`Fehler beim Abrufen der Story-Statistiken ${storyId}:`, error);
      throw new Error(error.response?.data?.detail || 'Fehler beim Laden der Statistiken');
    }
  },

  /**
   * Media-URL für Stories generieren
   */
  getMediaUrl(mediaUrl: string): string {
    if (mediaUrl.startsWith('http')) {
      return mediaUrl;
    }
    
    // Relative URL zu vollständiger URL konvertieren
    const baseUrl = apiService.baseUrl || 'http://localhost:8000';
    return `${baseUrl}${mediaUrl}`;
  },

  /**
   * Thumbnail-URL für Videos generieren
   */
  getThumbnailUrl(thumbnailUrl: string): string {
    if (!thumbnailUrl) {
      return '/images/no-video-thumbnail.png';
    }
    
    return this.getMediaUrl(thumbnailUrl);
  },

  /**
   * Prüfe ob Story abgelaufen ist
   */
  isStoryExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  },

  /**
   * Verbleibende Zeit bis Story-Ablauf berechnen
   */
  getTimeUntilExpiry(expiresAt: string): number {
    const expiry = new Date(expiresAt);
    const now = new Date();
    return Math.max(0, expiry.getTime() - now.getTime());
  },

  /**
   * Story-Alter in Stunden berechnen
   */
  getStoryAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    return (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  }
};

export default storiesApi;
