import { useState, useEffect } from 'react';
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
        
        const response = await fetch(`http://localhost:8000/api/listings/category/${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Retry-Logik für bessere Stabilität
          signal: AbortSignal.timeout(10000) // 10 Sekunden Timeout
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Kategorie nicht gefunden');
          } else if (response.status >= 500) {
            throw new Error('Server-Fehler. Bitte versuchen Sie es später erneut.');
          } else {
            throw new Error(`HTTP-Fehler: ${response.status}`);
          }
        }
        
        const data: CategoryResponse = await response.json();
        setCategoryData(data.category);
        
        // REPARIERT: Bildverarbeitung wie in ListingsPage_Optimized
        const processedListings = data.listings.map((listing: any) => {
          let parsedImages: string[] = [];
          
          try {
            // Bilder parsen (JSON String oder Array)
            let imageList: string[] = [];
            if (typeof listing.images === 'string') {
              try {
                imageList = JSON.parse(listing.images);
              } catch {
                imageList = [listing.images];
              }
            } else if (Array.isArray(listing.images)) {
              imageList = listing.images;
            }
            
            // Base64 und leere Bilder filtern
            imageList = imageList.filter((img: string) => 
              img && 
              img.trim() !== '' && 
              !img.includes('data:') && 
              !img.includes('base64')
            );
            
            // Cache-Busting für Bilder
            if (imageList.length > 0) {
              const timestamp = new Date().getTime();
              parsedImages = imageList.map((imagePath: string) => {
                if (imagePath.startsWith('/api/images/')) {
                  return `http://localhost:8000${imagePath}?t=${timestamp}`;
                }
                const cleanPath = imagePath.replace('/uploads/', '').replace('/api/uploads/', '');
                return `http://localhost:8000/api/images/${cleanPath}?t=${timestamp}`;
              });
            }
          } catch (error) {
            console.warn('Fehler beim Parsen der Bilder für Listing:', listing.id, error);
          }
          
          return {
            ...listing,
            images: parsedImages
          };
        });
        
        setListings(processedListings);
        
        // Breadcrumb-Pfad erstellen
        const breadcrumbPath = breadcrumbService.getBreadcrumbPath(slug);
        setBreadcrumbItems(breadcrumbPath);
      } catch (err) {
        let errorMessage = 'Fehler beim Laden der Anzeigen';
        
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Anfrage wurde abgebrochen. Bitte versuchen Sie es erneut.';
          } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
            errorMessage = 'Netzwerk-Fehler. Bitte überprüfen Sie Ihre Internetverbindung.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
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
