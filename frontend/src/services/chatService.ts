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
  id: string | number;  // Flexibel für temp_user_ IDs
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

  async createConversation(listingId: number | null, sellerId?: number): Promise<number> {
    console.log(`🔍 createConversation: listingId=${listingId}, sellerId=${sellerId}`);
    
    // 1) Zuerst lokal prüfen, ob es bereits eine Konversation gibt
    try {
      console.log(`🔍 Prüfe bestehende Conversations für listingId=${listingId}, sellerId=${sellerId}`);
      const conversations = await this.getConversations();
      console.log(`📋 Gefundene Conversations:`, conversations);
      
      let existing;
      if (listingId) {
        // Für Listing-Chats: Suche nach listing_id
        existing = conversations.find(c => c.listing?.id === listingId);
      } else if (sellerId) {
        // Für direkte User-Chats: Suche nach seller_id ohne listing
        existing = conversations.find(c => c.other_user?.id === sellerId && !c.listing?.id);
      }
      
      if (existing) {
        console.log(`✅ Bestehende Conversation gefunden: ID=${existing.id}`);
        return typeof existing.id === 'string' ? parseInt(existing.id) : existing.id;
      }
      console.log(`❌ Keine bestehende Conversation gefunden`);
    } catch (_) {
      console.log(`⚠️ Fehler beim Laden bestehender Conversations, versuche neue zu erstellen`);
      // Ignorieren – wir versuchen dann normal zu erstellen
    }

    // 2) Backend erwartet einen rohen JSON-Integer als Body (kein Objekt)
    const payload = listingId ? Number(listingId) : null;
    console.log(`📤 POST /api/conversations mit payload:`, payload);
    
    // URL mit Query-Parameter für direkte User-Chats erstellen
    let url = getFullApiUrl('api/conversations');
    if (listingId === null && sellerId) {
      url += `?seller_id=${sellerId}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    console.log(`📥 Response Status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Conversation-Erstellung fehlgeschlagen: ${response.status} - ${text}`);
      
      // Fallback in allen Fehlerfällen: Prüfe vorhandene Konversationen
      try {
        const conversations = await this.getConversations();
        let existing;
        if (listingId) {
          existing = conversations.find(c => c.listing?.id === listingId);
        } else if (sellerId) {
          existing = conversations.find(c => c.other_user?.id === sellerId && !c.listing?.id);
        }
        if (existing) {
          console.log(`🔄 Fallback: Bestehende Conversation gefunden: ID=${existing.id}`);
          return typeof existing.id === 'string' ? parseInt(existing.id) : existing.id;
        }
      } catch (_) { /* ignore */ }
      throw new Error(text || `Failed to create conversation (status ${response.status})`);
    }

    const data = await response.json();
    console.log(`✅ Conversation erstellt:`, data);
    console.log(`🆔 Zurückgegebene ID: ${data.id}`);
    
    return data.id;  // Backend gibt 'id' zurück, nicht 'conversation_id'
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(getFullApiUrl('api/conversations'), {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // 401 Unauthenticated ist normal - User ist nicht eingeloggt
        if (response.status === 401) {
          console.log('User nicht authentifiziert - leere Conversations-Liste');
          return [];
        }
        
        // Echte Server-Fehler loggen
        const errorText = await response.text();
        console.error(`Server-Fehler beim Laden der Conversations (${response.status}):`, errorText);
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
    console.log(`📤 sendMessage: conversationId=${conversationId}, content="${content}"`);
    
    // Backend erwartet ein Dictionary mit 'content' Feld
    const response = await fetch(getFullApiUrl(`api/conversations/${conversationId}/messages`), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content: content }),
    });

    console.log(`📥 sendMessage Response Status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Nachricht senden fehlgeschlagen: ${response.status} - ${error}`);
      throw new Error(error || 'Failed to send message');
    }

    const result = await response.json();
    console.log(`✅ Nachricht gesendet:`, result);
    return result;
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
        conversationId = typeof existingConversation.id === 'string' ? parseInt(existingConversation.id) : existingConversation.id;
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
