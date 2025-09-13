import { useState, useEffect } from 'react';

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: string;
  views: number;
  createdAt: string;
  images: string[] | string;
  seller: {
    id: number;
    name: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    userType?: string;
    badge?: string;
    isFollowing?: boolean;
    createdAt?: string;
  };
  category: string;
}

export const useListingData = (id: string) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        // Mock data for now
        const mockAd: Ad = {
          id: id,
          title: "Beispiel Anzeige",
          description: "Das ist eine Beispiel-Beschreibung für die Anzeige.",
          price: 299,
          location: "Berlin",
          status: "active",
          views: 42,
          createdAt: "2024-01-15",
          images: ["/api/images/example.jpg"],
          seller: {
            id: 1,
            name: "Max Mustermann",
            avatar: "/api/images/avatars/avatar1.jpg",
            rating: 4.8,
            reviewCount: 127,
            userType: "private",
            badge: "Verifiziert",
            isFollowing: false,
            createdAt: "2023-06-01"
          },
          category: "Elektronik"
        };
        setAd(mockAd);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Anzeige');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  return { ad, loading, error };
};