import { getFullApiUrl } from '@/config/config';

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  listing: {
    id: number;
    title: string;
    price: number;
    images: string | string[];
  };
  other_user: {
    id: number;
    email: string;
    name?: string;
    avatar?: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: number | null;
  };
  unread_count: number;
  created_at: string;
  updated_at: string;
}

class ChatService {

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async createConversation(listingId: number, _sellerId: number): Promise<number> {
    // 1) Zuerst lokal prüfen, ob es bereits eine Konversation zu diesem Listing gibt
    try {
      const existing = (await this.getConversations()).find(c => c.listing?.id === listingId);
      if (existing) return existing.id;
    } catch (_) {
      // Ignorieren – wir versuchen dann normal zu erstellen
    }

    // 2) Backend erwartet einen rohen JSON-Integer als Body (kein Objekt)
    const payload = Number(listingId);
    const response = await fetch(getFullApiUrl('api/conversations'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      // Fallback: Wenn Konversation bereits existiert, passende ID ermitteln
      if (response.status === 400 && text?.toLowerCase().includes('konversation existiert bereits')) {
        const conversations = await this.getConversations();
        const existing = conversations.find(c => c.listing?.id === listingId);
        if (existing) return existing.id;
      }
      throw new Error(text || 'Failed to create conversation');
    }

    const data = await response.json();
    return data.id;  // Backend gibt 'id' zurück, nicht 'conversation_id'
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(getFullApiUrl('api/conversations'), {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {

        return [];
      }

      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Fehler beim Laden der Konversationen:', error);
      return [];
    }
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    try {
      const response = await fetch(getFullApiUrl(`api/conversations/${conversationId}/messages`), {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {

        return [];
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      return [];
    }
  }

  async sendMessage(conversationId: number, content: string): Promise<Message> {
    // Backend erwartet ein Dictionary mit 'content' Feld
    const response = await fetch(getFullApiUrl(`api/conversations/${conversationId}/messages`), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content: content }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to send message');
    }

    return response.json();
  }

  async markConversationAsRead(conversationId: number): Promise<void> {
    const response = await fetch(getFullApiUrl(`api/conversations/${conversationId}/mark-read`), {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to mark conversation as read');
    }
  }

  // Legacy method for compatibility
  async sendMessageLegacy(message: {
    senderId: string;
    receiverId: string;
    listingId: string;
    content: string;
  }): Promise<string> {
    try {
      // sendMessageLegacy called
      
      // First, try to find existing conversation
      const conversations = await this.getConversations();
              // Existing conversations loaded
      
      const existingConversation = conversations.find(conv => 
        conv.listing.id.toString() === message.listingId
      );

      let conversationId: number;
      if (existingConversation) {
        conversationId = existingConversation.id;
        // Using existing conversation
      } else {
        // Create new conversation
                  // Creating new conversation
        conversationId = await this.createConversation(
          parseInt(message.listingId),
          parseInt(message.receiverId)
        );
                  // Conversation created
      }

      // Send message
              // Sending message to conversation
      const sentMessage = await this.sendMessage(conversationId, message.content);
              // Message sent successfully
      return sentMessage.id?.toString() || 'unknown';
    } catch (error) {
      console.error('Error in sendMessageLegacy:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService(); 
