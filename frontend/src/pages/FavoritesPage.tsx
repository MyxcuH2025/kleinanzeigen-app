import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/DashboardLayout';
import AdCard from '@/components/AdCard';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/context/FavoritesContext';
import { favoriteService } from '@/services/favoriteService';

interface Favorite {
  favorite_id: number;
  listing: {
    id: number;
    title: string;
    price: number;
    location: string;
    images: string[] | string;
    category: string;
  };
}

export const FavoritesPage: React.FC = () => {
  const { favorites: globalFavorites, removeFavorite, refreshFavorites, isLoading } = useFavorites();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      

      
      // Verwende den globalen FavoritesContext
      await refreshFavorites();
      
      // Lade die detaillierten Favoriten-Daten
      const favoritesData = await favoriteService.getFavorites();

      
      setFavorites(favoritesData);
    } catch (error) {
      console.error('FavoritesPage: Error loading favorites:', error);
      setError('Fehler beim Laden der Favoriten.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      setRemovingId(favoriteId);
      

      
      const favorite = favorites.find(fav => fav.favorite_id === favoriteId);
      if (!favorite || !favorite.listing) {

        setError('Favorit nicht gefunden.');
        return;
      }



      // Verwende den globalen removeFavorite aus dem Context
      await removeFavorite(String(favorite.listing.id));
      
      // Aktualisiere die lokale Liste
      await loadFavorites();
      
    } catch (error) {
      console.error('FavoritesPage: Error removing favorite:', error);
      setError('Fehler beim Entfernen des Favoriten.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={48} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={loadFavorites} variant="contained">
            Erneut versuchen
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
          Meine Favoriten ({favorites.length})
        </Typography>
        
        {favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FavoriteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Keine Favoriten gefunden
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Du hast noch keine Anzeigen zu deinen Favoriten hinzugefügt.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              startIcon={<FavoriteIcon />}
            >
              Anzeigen durchsuchen
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)', 
              lg: 'repeat(4, 1fr)'
            },
            gap: 3.5
          }}>
            {favorites.map((favorite) => {
              const listing = favorite.listing;
              
              return (
                <Box
                  key={favorite.favorite_id}
                  sx={{
                    position: 'relative',
                    '& .ad-card-delete-button': {
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 10,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                      }
                    }
                  }}
                >
                  {/* Löschen-Button (über der AdCard) */}
                  <IconButton
                    className="ad-card-delete-button"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.favorite_id);
                    }}
                    disabled={removingId === favorite.favorite_id}
                  >
                    {removingId === favorite.favorite_id ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DeleteIcon color="error" fontSize="small" />
                    )}
                  </IconButton>

                  {/* Verwende die gleiche AdCard Komponente wie auf der Hauptseite */}
                  <AdCard
                    id={String(listing.id)}
                    title={listing.title}
                    price={listing.price}
                    location={listing.location}
                    images={Array.isArray(listing.images) ? listing.images : [listing.images]}
                    category={listing.category}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};
