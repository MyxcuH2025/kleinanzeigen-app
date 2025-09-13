// TODO: Install zustand: npm install zustand
// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';

// Temporary implementation with React state
import { useState, useCallback } from 'react';
import { ListingDetail, ListingSummary, ReportData, ListingDetailState, ListingDetailActions } from '../types';

// API Services (will be implemented)
import { 
  getListingById, 
  getSimilarListings, 
  toggleFavoriteListing, 
  revealPhoneNumber, 
  incrementListingView,
  startChatConversation,
  reportListing,
  getUserStats
} from '../services/listings.api';

interface ListingDetailStore extends ListingDetailState, ListingDetailActions {}

// Temporary implementation with React state until zustand is installed
export const useListingDetailStore = () => {
  // State
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [similarListings, setSimilarListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Actions
  const loadListing = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Load real data from backend
      const realListing = await getListingById(id);
      setListing(realListing);
      setIsFavorited(realListing.isFavorited || false);
      setLoading(false);
      return;
    } catch (error: any) {
      console.error('Failed to load listing from backend:', error);
      setError(error.message || 'Fehler beim Laden der Anzeige');
      setLoading(false);
    }
  }, []);

  const loadSimilarListings = useCallback(async (id: string, radiusKm: number = 5) => {
    try {
      // Load real similar listings from backend
      const similarListings = await getSimilarListings(id, radiusKm);
      setSimilarListings(similarListings);
    } catch (error) {
      console.error('Failed to load similar listings:', error);
      setSimilarListings([]);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!listing) return;
    
    setIsFavorited(!isFavorited);
    setListing({
      ...listing,
      isFavorited: !isFavorited,
      favorites: isFavorited ? listing.favorites - 1 : listing.favorites + 1
    });
  }, [listing, isFavorited]);

  const revealPhone = useCallback(async (id: string) => {
    setPhoneRevealed(true);
    setRevealedPhone('+49 123 456789');
  }, []);

  const incrementView = useCallback(async (id: string) => {
    // Don't update state here to avoid infinite loop
    console.log('View incremented for listing:', id);
  }, []);

  const startChat = useCallback(async (listingId: string, sellerId: string) => {
    return 'mock-chat-id';
  }, []);

  const reportListing = useCallback(async (data: ReportData) => {
    console.log('Report listing:', data);
  }, []);

  const openChat = useCallback(() => setChatOpen(true), []);
  const closeChat = useCallback(() => setChatOpen(false), []);
  const openReport = useCallback(() => setReportOpen(true), []);
  const closeReport = useCallback(() => setReportOpen(false), []);

  return {
    // State
    listing,
    similarListings,
    loading,
    error,
    isFavorited,
    phoneRevealed,
    revealedPhone,
    chatOpen,
    reportOpen,
    
    // Actions
    loadListing,
    loadSimilarListings,
    toggleFavorite,
    revealPhone,
    incrementView,
    startChat,
    reportListing,
    openChat,
    closeChat,
    openReport,
    closeReport
  };
};

// Selectors are not needed with React state implementation
