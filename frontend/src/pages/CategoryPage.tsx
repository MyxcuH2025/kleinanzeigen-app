import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import AdCard from '@/components/AdCard';
import Breadcrumb from '@/components/Breadcrumb';
import { breadcrumbService } from '@/services/breadcrumbService';
import type { Ad } from '@/types';

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface CategoryResponse {
  category: CategoryData;
  listings: Ad[];
  count: number;
}

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [listings, setListings] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategoryListings = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Kategorien für Breadcrumbs laden
        await breadcrumbService.loadCategories();
        
        const response = await fetch(`http://localhost:8000/api/listings/category/${slug}`);
        if (!response.ok) {
          throw new Error('Kategorie nicht gefunden');
        }
        
        const data: CategoryResponse = await response.json();
        setCategoryData(data.category);
        setListings(data.listings);
        
        // Breadcrumb-Pfad erstellen
        const breadcrumbPath = breadcrumbService.getBreadcrumbPath(slug);
        setBreadcrumbItems(breadcrumbPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Anzeigen');
        console.error('Fehler beim Laden der Kategorie-Anzeigen:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryListings();
  }, [slug]);

  // Breadcrumb-Pfad mit Home und aktueller Kategorie erstellen
  const getBreadcrumbItems = () => {
    const items = [
      {
        id: 0,
        name: 'Home',
        slug: 'home',
        icon: '🏠',
        url: '/'
      }
    ];
    
    if (breadcrumbItems.length > 0) {
      items.push(...breadcrumbItems);
    }
    
    return items;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!categoryData) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Alert severity="warning">Kategorie nicht gefunden</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Neue Breadcrumb-Komponente */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumb 
          items={getBreadcrumbItems()}
          variant="category"
          showChangeLink={false}
        />
      </Box>

      {/* Kategorie-Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {categoryData.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {listings.length} Anzeigen in dieser Kategorie
        </Typography>
      </Box>

      {/* Anzeigen-Grid */}
      {listings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Keine Anzeigen in dieser Kategorie gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Schauen Sie später wieder vorbei oder erstellen Sie die erste Anzeige!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(6, 1fr)'
          },
          gap: 2,
          mt: 3
        }}>
          {listings.map((listing) => (
            <AdCard
              key={listing.id}
              {...listing}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}; 
