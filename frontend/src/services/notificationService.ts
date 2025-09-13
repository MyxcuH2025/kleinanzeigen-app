import { API_BASE_URL } from '../config/config';

export interface Notification {
  id: number;
  type: 'new_listing' | 'follow' | 'listing_view' | 'listing_favorite' | 'message' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_user_id?: number;
  related_listing_id?: number;
  related_entity_id?: number;
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
  notifications_by_type: {
    [key: string]: number;
  };
}

export const notificationService = {
  async getNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nicht eingeloggt');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unread_only: unreadOnly.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/api/notifications?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Laden der Benachrichtigungen: ${response.statusText}`);
    }

    return response.json();
  },

  async getNotificationStats(): Promise<NotificationStats> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nicht eingeloggt');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Laden der Benachrichtigungs-Statistiken: ${response.statusText}`);
    }

    return response.json();
  },

  async markAsRead(notificationId: number): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nicht eingeloggt');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Markieren als gelesen: ${response.statusText}`);
    }
  },

  async markAllAsRead(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nicht eingeloggt');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Markieren aller als gelesen: ${response.statusText}`);
    }
  },

  async deleteNotification(notificationId: number): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nicht eingeloggt');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Löschen der Benachrichtigung: ${response.statusText}`);
    }
  },

  async getNotificationPreferences(): Promise<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nicht eingeloggt');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Laden der Benachrichtigungseinstellungen: ${response.statusText}`);
    }

    return response.json();
  },

  async updateNotificationPreferences(preferences: any): Promise<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nicht eingeloggt');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Aktualisieren der Benachrichtigungseinstellungen: ${response.statusText}`);
    }

    return response.json();
  },
};
