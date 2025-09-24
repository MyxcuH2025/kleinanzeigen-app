/**
 * Stories-API-Service für Backend-Kommunikation
 */
import { apiService } from '../../../services/api';
import type { 
  Story, 
  StoryReactionType 
} from '../types/stories.types';

const STORIES_API = '/api/stories';
const baseUrl = import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000';
export const storiesApi = {
  /**
   * Stories-Feed abrufen
   */
  async getFeed(limit: number = 20, offset: number = 0): Promise<Story[]> {
    // TEMPORÄR DEAKTIVIERT: Stories-API-Aufruf
    console.log('Stories-API temporär deaktiviert');
    return [];
    
    /* ORIGINAL CODE DEAKTIVIERT
    try {
      const response = await apiService.get<{ stories: Story[] }>(
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
    */
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
        formData
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
      const token = localStorage.getItem('token');
      
      // Prüfe ob Token vorhanden ist
      if (!token) {
        console.warn(`⚠️ Kein Token gefunden - Story ${storyId} wird nicht als gesehen markiert`);
        return; // Graceful degradation - nicht als Fehler behandeln
      }
      
      await apiService.post(`${STORIES_API}/${storyId}/view`);
    } catch (error: any) {
      // Graceful degradation - 401 Fehler nicht als kritisch behandeln
      if (error.message?.includes('401') || error.message?.includes('credentials')) {
        console.warn(`⚠️ Token ungültig - Story ${storyId} wird nicht als gesehen markiert`);
      } else {
        console.error(`Fehler beim Markieren der Story ${storyId} als gesehen:`, error);
      }
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
      const token = localStorage.getItem('token');
      
      // Prüfe ob Token vorhanden ist
      if (!token) {
        throw new Error('Nicht authentifiziert - Bitte melden Sie sich erneut an');
      }
      
      console.log('🗑️ API: Story wird gelöscht:', storyId);
      await apiService.delete(`${STORIES_API}/${storyId}`);
      console.log('✅ API: Story erfolgreich gelöscht:', storyId);
    } catch (error: any) {
      console.error(`❌ API: Fehler beim Löschen der Story ${storyId}:`, error);
      
      // Spezifische Fehlerbehandlung
      if (error.message?.includes('401') || error.message?.includes('credentials')) {
        throw new Error('Nicht authentifiziert - Bitte melden Sie sich erneut an');
      } else if (error.message?.includes('403')) {
        throw new Error('Keine Berechtigung zum Löschen dieser Story');
      } else {
        throw new Error(error.response?.data?.detail || 'Fehler beim Löschen der Story');
      }
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
  async getStoryStats(storyId: number): Promise<any> {
    try {
      const response = await apiService.get<any>(`${STORIES_API}/${storyId}/stats`);
      return response;
    } catch (error: any) {
      console.error(`Fehler beim Abrufen der Story-Statistiken ${storyId}:`, error);
      throw new Error(error.response?.data?.detail || 'Fehler beim Laden der Statistiken');
    }
  },

  /**
   * Text-Antwort auf eine Story senden (REST Fallback)
   */
  async replyToStory(storyId: number, text: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}${STORIES_API}/${storyId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        // 401 Unauthenticated ist normal - User ist nicht eingeloggt
        if (res.status === 401) {
          console.log('User nicht authentifiziert - Story-Antwort nicht möglich');
          return;
        }
        const msg = await res.text();
        throw new Error(msg || 'HTTP error');
      }
    } catch (error: any) {
      console.error(`Fehler beim Senden der Story-Antwort ${storyId}:`, error);
      // 401 Authentication Error nicht als Fehler werfen
      if (error?.message?.includes('Not authenticated') || error?.message?.includes('401')) {
        console.log('User nicht authentifiziert - Story-Antwort übersprungen');
        return;
      }
      throw new Error(error?.message || 'Fehler beim Senden der Story-Antwort');
    }
  },

  /**
   * Story-Insights abrufen (Viewer-Liste)
   */
  async getStoryInsights(storyId: number): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      
      // Prüfe ob Token vorhanden ist
      if (!token) {
        console.warn(`⚠️ Kein Token gefunden - Insights für Story ${storyId} können nicht geladen werden`);
        throw new Error('Nicht authentifiziert - Bitte melden Sie sich erneut an');
      }
      
      const response = await apiService.get<any>(`${STORIES_API}/${storyId}/insights`);
      return response;
    } catch (error: any) {
      // Graceful degradation - 401 Fehler nicht als kritisch behandeln
      if (error.message?.includes('401') || error.message?.includes('credentials') || error.message?.includes('Not authenticated')) {
        console.warn(`⚠️ Token ungültig - Insights für Story ${storyId} können nicht geladen werden`);
        throw new Error('Nicht authentifiziert - Bitte melden Sie sich erneut an');
      }
      console.error(`Fehler beim Abrufen der Story-Insights ${storyId}:`, error);
      throw new Error(error.response?.data?.detail || 'Fehler beim Laden der Insights');
    }
  },

  /**
   * Media-URL für Stories generieren
   */
  getMediaUrl(mediaUrl: string): string {
    // REPARIERT: Base64-Bilder komplett blockieren (vermeidet "Image corrupt" Fehler)
    if (mediaUrl.startsWith('data:') || mediaUrl.includes('base64') || mediaUrl.includes('data:image/')) {
      console.warn('❌ Base64-Story-Media blockiert:', mediaUrl.substring(0, 50) + '...');
      return `${baseUrl}/api/images/noimage.jpeg`;
    }
    
    // REPARIERT: Nur externe URLs blockieren, nicht lokale Backend-URLs
    if (mediaUrl.startsWith('http') && !mediaUrl.includes('localhost:8000')) {
      console.warn('❌ Externe Story-Media blockiert:', mediaUrl.substring(0, 50) + '...');
      return `${baseUrl}/api/images/noimage.jpeg`;
    }
    
    // REPARIERT: Lokale Backend-URLs erlauben (verursacht "gelbe story media url blockiert fehler")
    if (mediaUrl.startsWith('/api/images/') || mediaUrl.startsWith('/uploads/')) {
      return `${baseUrl}${mediaUrl}`;
    }
    
    // REPARIERT: Andere lokale URLs erlauben
    if (mediaUrl.startsWith('/') && !mediaUrl.startsWith('http')) {
      return `${baseUrl}${mediaUrl}`;
    }
    
    // REPARIERT: URLs die mit localhost:8000 beginnen erlauben
    if (mediaUrl.includes('localhost:8000')) {
      return mediaUrl;
    }
    
    // REPARIERT: URLs die mit api/images/ beginnen erlauben (ohne führenden Slash)
    if (mediaUrl.startsWith('api/images/') || mediaUrl.startsWith('uploads/')) {
      return `${baseUrl}/${mediaUrl}`;
    }
    
    // Fallback für unbekannte URLs
    console.warn('❌ Unbekannte Story-Media-URL blockiert:', mediaUrl.substring(0, 50) + '...');
    return `${baseUrl}/api/images/noimage.jpeg`;
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
  },

  /**
   * Story-Zeit als "vor X Stunden" formatieren
   */
  formatTimeAgo(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `vor ${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `vor ${hours}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `vor ${days}d`;
    }
  }
};

export default storiesApi;
