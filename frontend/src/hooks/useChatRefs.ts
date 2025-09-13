// ============================================================================
// CHAT REFS HOOK - Zentrale Ref-Verwaltung für Chat-Funktionalität
// ============================================================================

import { useRef } from 'react';
import type { ChatRefs } from '../types/ChatTypes';

export const useChatRefs = (): ChatRefs => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mobileMessagesContainerRef = useRef<HTMLDivElement>(null);

  return {
    messagesEndRef,
    fileInputRef,
    messagesContainerRef,
    mobileMessagesContainerRef
  };
};
