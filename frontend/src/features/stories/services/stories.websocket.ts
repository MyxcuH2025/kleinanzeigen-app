/**
 * Stories WebSocket Service - Echtzeit-Kommunikation für Stories
 */
import { storiesApi } from './stories.api';

export interface WebSocketMessage {
  type: 'connected' | 'new_story' | 'story_viewed' | 'story_reaction_update' | 'pong';
  story?: any;
  story_id?: number;
  user_id?: number;
  viewer_id?: number;
  reaction?: string;
  total_count?: number;
  views_count?: number;
  timestamp?: string;
  message?: string;
}

export class StoriesWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();

  constructor() {
    this.connect();
  }

  /**
   * WebSocket-Verbindung herstellen
   */
  private async connect(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Kein Token für Stories-WebSocket verfügbar');
        return;
      }

      const wsUrl = `ws://localhost:8000/ws/stories?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Stories-WebSocket verbunden');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Fehler beim Parsen der WebSocket-Nachricht:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('Stories-WebSocket getrennt:', event.code, event.reason);
        this.stopHeartbeat();
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Stories-WebSocket Fehler:', error);
      };

    } catch (error) {
      console.error('Fehler beim Verbinden mit Stories-WebSocket:', error);
      this.handleReconnect();
    }
  }

  /**
   * Nachricht-Handler registrieren
   */
  public onMessage(type: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Nachricht-Handler entfernen
   */
  public offMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Story-View senden
   */
  public sendStoryView(storyId: number): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'story_view',
        story_id: storyId
      }));
    }
  }

  /**
   * Story-Reaction senden
   */
  public sendStoryReaction(storyId: number, reaction: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'story_reaction',
        story_id: storyId,
        reaction: reaction
      }));
    }
  }

  /**
   * Nachrichten verarbeiten
   */
  private handleMessage(message: WebSocketMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Log für Debugging
    console.log('📨 Stories-WebSocket Nachricht:', message);
  }

  /**
   * Heartbeat starten
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now().toString()
        }));
      }
    }, 30000); // Alle 30 Sekunden
  }

  /**
   * Heartbeat stoppen
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Reconnect-Logik
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Stories-WebSocket Reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('❌ Stories-WebSocket: Max Reconnect-Versuche erreicht');
    }
  }

  /**
   * WebSocket-Verbindung schließen
   */
  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  /**
   * Verbindungsstatus prüfen
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton-Instanz
export const storiesWebSocket = new StoriesWebSocketService();
