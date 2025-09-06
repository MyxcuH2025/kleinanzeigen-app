import { useEffect, useRef } from 'react';
import { websocketService } from '../services/websocketService';
import type { NotificationData, MessageData, FollowData } from '../services/websocketService';

// Types sind jetzt aus dem websocketService importiert

export interface UseWebSocketOptions {
  onNotification?: (notification: NotificationData) => void;
  onNewMessage?: (message: MessageData) => void;
  onNewFollower?: (follow: FollowData) => void;
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    onNotification,
    onNewMessage,
    onNewFollower,
    autoConnect = true
  } = options;

  const handlersRef = useRef({
    onNotification,
    onNewMessage,
    onNewFollower
  });

  // Handler-Referenzen aktualisieren
  useEffect(() => {
    handlersRef.current = {
      onNotification,
      onNewMessage,
      onNewFollower
    };
  }, [onNotification, onNewMessage, onNewFollower]);

  useEffect(() => {
    if (!autoConnect) return;

    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        console.log('WebSocket Hook: Verbindung hergestellt');
      } catch (error) {
        console.log('WebSocket Hook: Verbindungsfehler:', error);
      }
    };

    // Event Handler für WebSocket-Events
    const handleNotification = (event: CustomEvent) => {
      const notification = event.detail as NotificationData;
      if (handlersRef.current.onNotification) {
        handlersRef.current.onNotification(notification);
      }
    };

    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail as MessageData;
      if (handlersRef.current.onNewMessage) {
        handlersRef.current.onNewMessage(message);
      }
    };

    const handleNewFollower = (event: CustomEvent) => {
      const follow = event.detail as FollowData;
      if (handlersRef.current.onNewFollower) {
        handlersRef.current.onNewFollower(follow);
      }
    };

    // Event Listener registrieren
    window.addEventListener('websocket-notification', handleNotification as EventListener);
    window.addEventListener('websocket-new-message', handleNewMessage as EventListener);
    window.addEventListener('websocket-new-follower', handleNewFollower as EventListener);

    // WebSocket verbinden
    connectWebSocket();

    // Cleanup
    return () => {
      window.removeEventListener('websocket-notification', handleNotification as EventListener);
      window.removeEventListener('websocket-new-message', handleNewMessage as EventListener);
      window.removeEventListener('websocket-new-follower', handleNewFollower as EventListener);
    };
  }, [autoConnect]);

  return {
    isConnected: websocketService.isConnected(),
    connect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    requestNotificationPermission: () => websocketService.requestNotificationPermission()
  };
};
