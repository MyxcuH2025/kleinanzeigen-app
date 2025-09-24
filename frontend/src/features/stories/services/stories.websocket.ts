/**
 * Stories WebSocket Service - Echtzeit-Kommunikation für Stories
 */
import { storiesApi } from './stories.api';

export interface WebSocketMessage {
  type: 'connected' | 'new_story' | 'story_viewed' | 'story_reaction_update' | 'story_reply' | 'pong' | 'rate_limit_exceeded';
  story?: any;
  story_id?: number;
  user_id?: number;
  viewer_id?: number;
  reaction?: string;
  total_count?: number;
  views_count?: number;
  text?: string;
  timestamp?: string;
  message?: string;
  error?: string;
  event_type?: string;
}

export class StoriesWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private lastStoryViewTime = 0;
  private storyViewCooldown = 2000; // 2 Sekunden Cooldown zwischen Story-Views
  private rateLimitCount = 0;
  private maxRateLimitCount = 5; // Nach 5 Rate-Limits WebSocket stoppen

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
        console.log('User nicht authentifiziert - WebSocket-Verbindung übersprungen');
        return;
      }

      // TEMP: WebSocket deaktiviert - Backend hat keinen WebSocket-Endpoint
      // const wsUrl = `ws://localhost:8000/ws/stories?token=${encodeURIComponent(token)}`;
      // this.ws = new WebSocket(wsUrl);
      console.log('WebSocket temporär deaktiviert - Backend hat keinen WebSocket-Endpoint');

      // TEMP: WebSocket Event-Handler deaktiviert
      // this.ws.onopen = () => {
      //   console.log('✅ Stories-WebSocket verbunden');
      //   this.reconnectAttempts = 0;
      //   this.startHeartbeat();
      // };

      // TEMP: WebSocket onmessage deaktiviert
      // this.ws.onmessage = (event) => {
      //   try {
      //     const message: WebSocketMessage = JSON.parse(event.data);
      //     this.handleMessage(message);
      //   } catch (error) {
      //     console.error('Fehler beim Parsen der WebSocket-Nachricht:', error);
      //   }
      // };

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
   * Story-View senden (mit Rate-Limiting)
   */
  public sendStoryView(storyId: number): void {
    const now = Date.now();
    
    // Rate-Limiting: Nur alle 2 Sekunden eine Story-View senden
    if (now - this.lastStoryViewTime < this.storyViewCooldown) {
      console.log('⏳ Story-View zu schnell, warte...');
      return;
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.lastStoryViewTime = now;
      this.ws.send(JSON.stringify({
        type: 'story_view',
        story_id: storyId
      }));
      console.log('📤 Story-View gesendet:', storyId);
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
   * Story-Reply senden (Textantwort)
   */
  public sendStoryReply(storyId: number, text: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'story_reply',
        story_id: storyId,
        text
      }));
    }
  }

  /**
   * Nachrichten verarbeiten
   */
  private handleMessage(message: WebSocketMessage): void {
    // REPARIERT: Nur Base64-Bilder in WebSocket-Nachrichten filtern, lokale URLs erlauben
    if (message.story && message.story.media_url) {
      if (message.story.media_url.startsWith('data:') || message.story.media_url.includes('base64')) {
        console.warn('❌ Base64-Story-Media in WebSocket blockiert:', message.story.media_url.substring(0, 50) + '...');
        message.story.media_url = 'http://localhost:8000/api/images/noimage.jpeg';
      } else if (message.story.media_url.startsWith('/api/images/') || message.story.media_url.startsWith('/uploads/')) {
        // REPARIERT: Lokale Backend-URLs erlauben und korrekt formatieren
        message.story.media_url = `http://localhost:8000${message.story.media_url}`;
      }
    }

    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Rate-Limit-Handling
    if (message.type === 'rate_limit_exceeded') {
      console.warn('⚠️ Rate-Limit überschritten:', message);
      this.handleRateLimitExceeded(message);
      return; // Früher Return, um weitere Verarbeitung zu stoppen
    }

    // Log für Debugging (nur bei wichtigen Nachrichten)
    if (message.type !== 'story_viewed' && message.type !== 'pong') {
      console.log('📨 Stories-WebSocket Nachricht:', message);
    }
  }

  /**
   * Rate-Limit-Überschreitung behandeln
   */
  private handleRateLimitExceeded(message: WebSocketMessage): void {
    this.rateLimitCount++;
    console.warn(`⚠️ Rate-Limit überschritten (${this.rateLimitCount}/${this.maxRateLimitCount}):`, message);
    
    // Rate-Limit-Handler registrieren
    const rateLimitHandler = this.messageHandlers.get('rate_limit_exceeded');
    if (rateLimitHandler) {
      rateLimitHandler(message);
    }
    
    // Nach zu vielen Rate-Limits WebSocket komplett stoppen
    if (this.rateLimitCount >= this.maxRateLimitCount) {
      console.error('🚫 Zu viele Rate-Limits, WebSocket wird gestoppt');
      this.disconnect();
      return;
    }
    
    // WebSocket-Verbindung temporär pausieren
    this.pauseConnection(2000); // 2 Sekunden Pause
  }

  /**
   * WebSocket-Verbindung temporär pausieren
   */
  private pauseConnection(duration: number): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
      console.log(`⏸️ WebSocket pausiert für ${duration}ms`);
      
      // Verhindere Reconnect-Loop
      if (this.rateLimitCount < this.maxRateLimitCount) {
        setTimeout(() => {
          console.log('▶️ WebSocket-Verbindung wird wiederhergestellt');
          this.connect();
        }, duration);
      }
    }
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
    // Verhindere Reconnect bei zu vielen Rate-Limits
    if (this.rateLimitCount >= this.maxRateLimitCount) {
      console.error('🚫 Reconnect wegen zu vielen Rate-Limits gestoppt');
      return;
    }
    
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
