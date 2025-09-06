# 🔥 CHAT WEBSOCKET BACKUP - KRITISCHE CODE-SNIPPETS

## ⚠️ NOTFALL-BACKUP: Falls WebSocket-Code versehentlich gelöscht wird

### 1. WebSocket-Import (Zeile 41 in ChatPage.tsx)
```typescript
import { useWebSocket } from '../hooks/useWebSocket';
```

### 2. WebSocket-Hook Integration (Zeilen 110-153 in ChatPage.tsx)
```typescript
// ============================================================================
// 🔥 KRITISCH: WEBSOCKET-HOOK FÜR ECHTZEIT-NACHRICHTEN
// ============================================================================
// ⚠️  NICHT LÖSCHEN! Diese Integration ist ESSENTIELL für Live-Chat!
// ⚠️  Ohne diese WebSocket-Verbindung funktioniert KEIN Echtzeit-Chat!
// ⚠️  Bei UI-Verbesserungen: Diese Sektion UNBEDINGT beibehalten!
// ============================================================================
const { isConnected } = useWebSocket({
  onNewMessage: (messageData) => {
    console.log('Echtzeit-Nachricht erhalten:', messageData);
    
    // Prüfen ob die Nachricht zur aktuellen Conversation gehört
    if (selectedConversation && messageData.conversation_id === parseInt(selectedConversation.id)) {
      const newMessage: Message = {
        id: messageData.id,
        content: messageData.content,
        sender_id: messageData.sender_id,
        conversation_id: messageData.conversation_id,
        created_at: messageData.created_at,
        isOwn: messageData.sender_id === user?.id,
        type: 'text'
      };
      
      // Duplikat-Schutz: Verhindert doppelte Nachrichten
      setMessages(prev => {
        const existingIds = prev.map(m => m.id);
        if (existingIds.includes(newMessage.id)) {
          console.log('Nachricht bereits vorhanden (WebSocket-Duplikat verhindert):', newMessage.id);
          return prev;
        }
        return [...prev, newMessage];
      });
      
      // Auto-Scroll zur neuen Nachricht
      setTimeout(() => scrollToBottom(), 100);
    }
    
    // Conversations neu laden um unread_count zu aktualisieren
    loadConversations(false);
  }
});
// ============================================================================
// ENDE WEBSOCKET-INTEGRATION - NICHT LÖSCHEN!
// ============================================================================
```

### 3. handleSendMessage mit WebSocket-Fallback (Zeilen 258-334 in ChatPage.tsx)
```typescript
// ============================================================================
// 🔥 KRITISCH: NACHRICHTEN-SENDEN MIT WEBSOCKET-FALLBACK
// ============================================================================
// ⚠️  NICHT LÖSCHEN! Diese Funktion ist ESSENTIELL für Chat-Funktionalität!
// ⚠️  WebSocket-Fallback: Falls WebSocket nicht verbunden, wird lokal hinzugefügt
// ⚠️  Bei UI-Verbesserungen: Diese Logik UNBEDINGT beibehalten!
// ============================================================================
const handleSendMessage = async () => {
  if (!newMessage.trim() || !user || !selectedConversation) {
    console.warn('Nachricht kann nicht gesendet werden: Fehlende Daten');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Kein Token gefunden');
    return;
  }

  try {
    setIsLoading(true);
    const response = await fetch(`http://localhost:8000/api/conversations/${selectedConversation.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: newMessage })
    });

    if (response.ok) {
      const data = await response.json();
      
      // ============================================================================
      // 🔥 WEBSOCKET-FALLBACK: Lokale Nachrichten-Hinzufügung
      // ============================================================================
      // ⚠️  KRITISCH: Falls WebSocket nicht verbunden, wird Nachricht lokal hinzugefügt
      // ⚠️  Dies stellt sicher, dass Chat auch ohne WebSocket funktioniert!
      // ⚠️  NICHT LÖSCHEN bei UI-Verbesserungen!
      // ============================================================================
      if (!isConnected) {
        const message: Message = {
          id: data.id,
          content: data.content,
          sender_id: data.sender_id,
          conversation_id: data.conversation_id,
          created_at: data.created_at,
          isOwn: true,
          type: 'text'
        };

        setMessages(prev => {
          const existingIds = prev.map(m => m.id);
          if (existingIds.includes(message.id)) {
            console.log('Nachricht bereits vorhanden (WebSocket-Duplikat verhindert):', message.id);
            return prev;
          }
          return [...prev, message];
        });
        
        // Auto-Scroll zur neuen Nachricht
        setTimeout(() => scrollToBottom(), 100);
      }
      
      setNewMessage('');
    } else {
      console.error('Fehler beim Senden der Nachricht');
    }
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht:', error);
  } finally {
    setIsLoading(false);
  }
};
// ============================================================================
// ENDE NACHRICHTEN-SENDEN - NICHT LÖSCHEN!
// ============================================================================
```

## 🚨 Notfall-Wiederherstellung

Falls diese Code-Snippets versehentlich gelöscht wurden:

1. **Kopiere** die entsprechenden Code-Blöcke aus dieser Datei
2. **Füge sie** an der richtigen Stelle in `ChatPage.tsx` ein
3. **Prüfe** die Zeilennummern (können sich durch andere Änderungen verschoben haben)
4. **Teste** die Chat-Funktionalität

## 📍 Wichtige Dateien

- **Hauptdatei**: `frontend/src/pages/ChatPage.tsx`
- **WebSocket-Hook**: `frontend/src/hooks/useWebSocket.ts`
- **WebSocket-Service**: `frontend/src/services/websocketService.ts`
- **Dokumentation**: `WEBSOCKET_CHAT_CRITICAL.md`

## ⚠️ Warnung

**DIESE CODE-SNIPPETS SIND LEBENSWICHTIG FÜR DEN CHAT!**

Ohne diese Integrationen:
- ❌ Keine Echtzeit-Nachrichten
- ❌ Chat funktioniert nicht richtig
- ❌ Schlechte User Experience

**BEHALTEN = CHAT FUNKTIONIERT** ✅
**LÖSCHEN = CHAT KAPUTT** ❌
