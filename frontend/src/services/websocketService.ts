/**
 * WebSocket Service für Echtzeit-Benachrichtigungen
 */

export interface WebSocketMessage {
  type: 'notification' | 'new_message' | 'new_follower' | 'connected' | 'pong';
  data?: any;
  message?: string;
  user_id?: number;
  timestamp?: string;
}

export interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_user_id?: number;
  related_listing_id?: number;
  related_entity_id?: number;
}

export interface MessageData {
  id: number;
  content: string;
  sender_id: number;
  conversation_id: number;
  created_at: string;
}

export interface FollowData {
  follower_id: number;
  following_id: number;
  follower_name: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 Sekunde
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Reconnect bei Visibility Change (Tab wird wieder aktiv)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isConnected()) {
        this.connect();
      }
    });

    // Reconnect bei Online-Status
    window.addEventListener('online', () => {
      if (!this.isConnected()) {
        this.connect();
      }
    });
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected()) {
        resolve();
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        // Kein Token vorhanden - das ist normal wenn User nicht eingeloggt ist
        console.log('WebSocket: Kein Token gefunden - Verbindung übersprungen');
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        // WebSocket URL mit Token als Query Parameter
        const wsUrl = `ws://localhost:8000/ws/notifications?token=${encodeURIComponent(token)}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket verbunden');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPingInterval();
          resolve();
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
          console.log('WebSocket getrennt:', event.code, event.reason);
          this.isConnecting = false;
          this.stopPingInterval();
          
          // Automatisches Reconnect (außer bei Auth-Fehlern)
          if (event.code !== 1008 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket Fehler:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`WebSocket Reconnect in ${delay}ms (Versuch ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected()) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.ping();
      }
    }, 30000); // Ping alle 30 Sekunden
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private ping() {
    if (this.isConnected()) {
      const message = {
        type: 'ping',
        timestamp: new Date().toISOString()
      };
      this.ws!.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('WebSocket Nachricht erhalten:', message);

    // Spezifische Handler aufrufen
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message.data || message);
      } catch (error) {
        console.error(`Fehler in WebSocket Handler für ${message.type}:`, error);
      }
    });

    // Globale Handler
    switch (message.type) {
      case 'connected':
        console.log('WebSocket erfolgreich verbunden für User:', message.user_id);
        break;
      case 'pong':
        // Ping-Pong erfolgreich
        break;
      case 'notification':
        this.handleNotification(message.data as NotificationData);
        break;
      case 'new_message':
        this.handleNewMessage(message.data as MessageData);
        break;
      case 'new_follower':
        this.handleNewFollower(message.data as FollowData);
        break;
    }
  }

  private handleNotification(notification: NotificationData) {
    console.log('Neue Benachrichtigung erhalten:', notification);
    
    // Browser-Benachrichtigung anzeigen (falls erlaubt)
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`
      });
    }

    // Event für React-Komponenten
    window.dispatchEvent(new CustomEvent('websocket-notification', {
      detail: notification
    }));
  }

  private handleNewMessage(message: MessageData) {
    console.log('Neue Nachricht erhalten:', message);
    
    // Event für React-Komponenten (neuer standardisierter Event-Name für Hooks)
    window.dispatchEvent(new CustomEvent('websocket-new-message', {
      detail: message
    }));

    // Kompatibilität: alter Event-Name, der in einigen Komponenten genutzt wird
    window.dispatchEvent(new CustomEvent('newMessage', {
      detail: {
        message: message,
        conversationId: message.conversation_id
      }
    }));
  }

  private handleNewFollower(follow: FollowData) {
    console.log('Neuer Follower:', follow);
    
    // Event für React-Komponenten
    window.dispatchEvent(new CustomEvent('websocket-new-follower', {
      detail: follow
    }));
  }

  // Public API
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPingInterval();
    this.reconnectAttempts = 0;
  }

  // Event Handler registrieren
  on(eventType: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);
  }

  // Event Handler entfernen
  off(eventType: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Browser-Benachrichtigungen aktivieren
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser unterstützt keine Benachrichtigungen');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Benachrichtigungen wurden verweigert');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

// Singleton-Instanz
export const websocketService = new WebSocketService();

// Automatisches Verbinden beim Import (falls User eingeloggt ist)
if (typeof window !== 'undefined' && localStorage.getItem('token')) {
  websocketService.connect().catch((error) => {
    console.log('WebSocket automatische Verbindung fehlgeschlagen:', error.message);
  });
}