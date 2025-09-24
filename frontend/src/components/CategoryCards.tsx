import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import './CategoryCards.css'; // Import the CSS file

// Kategorie-Daten
interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface CategoryCardsProps {
  theme: 'kleinanzeigen' | 'autos';
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ theme }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funktion um Kategorie-Namen zu kurzen Wörtern zu verkürzen
  const getShortCategoryName = (categoryName: string): string => {
    const shortNames: { [key: string]: string } = {
      'Auto, Rad & Boot': 'Autos',
      'Immobilien': 'Immobilien',
      'Jobs': 'Jobs',
      'Dienstleistungen': 'Service',
      'Persönliche Gegenstände': 'Gegenstände',
      'Haus & Garten': 'Haus',
      'Elektronik': 'Elektronik',
      'Freizeit, Hobby & Nachbarschaft': 'Freizeit',
      'Familie, Kind & Baby': 'Familie',
      'Mode & Beauty': 'Mode',
      'Haustiere': 'Tiere',
      'Eintrittskarten & Tickets': 'Tickets',
      'Musik, Filme & Bücher': 'Medien',
      'Verschenken & Tauschen': 'Tauschen'
    };
    
    return shortNames[categoryName] || categoryName.split(' ')[0];
  };

  // Kategorien vom Backend laden
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.PROD ? 'https://kleinanzeigen-backend.onrender.com' : 'http://localhost:8000'}/api/categories`);
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Kategorien');
        }
        const data = await response.json();
        
        // Konvertiere Backend-Format zu Frontend-Format
        const convertedCategories = data.map((cat: any) => ({
          id: cat.id,
          name: cat.label,
          slug: cat.value,
          icon: cat.icon,
          color: '#059669',
          bgColor: '#f0fdf4'
        }));
        
        setCategories(convertedCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
        console.error('Fehler beim Laden der Kategorien:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [theme]);

  const handleCategoryClick = useCallback((category: Category) => {
    navigate(`/category/${category.slug}`);
  }, [navigate]);

  const getCategoryIcon = useCallback((category: Category): string => {
    // Verwende das Icon vom Backend (Emoji)
    return category.icon || '📦';
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            // Mobile: horizontale Scroll-Leiste mit Snap und verbesserter Swipe-Funktionalität
            display: { xs: 'flex', sm: 'grid' },
            overflowX: { xs: 'auto', sm: 'visible' },
            scrollSnapType: { xs: 'x mandatory', sm: 'none' },
            WebkitOverflowScrolling: { xs: 'touch', sm: 'auto' },
            px: { xs: 2, sm: 1 }, // Mehr Padding auf Mobile für bessere Swipe-Erfahrung
            gap: { xs: 1.5, sm: 1 }, // Größerer Abstand auf Mobile
            '&::-webkit-scrollbar': { display: 'none' }, // Scrollbar immer versteckt
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
            // Desktop: Grid - Eine Zeile direkt unter dem Menü
            gridTemplateColumns: {
              sm: 'repeat(auto-fit, minmax(64px, 1fr))', // Automatische Anpassung für eine Zeile
              md: 'repeat(auto-fit, minmax(64px, 1fr))', // Automatische Anpassung für eine Zeile
              lg: 'repeat(auto-fit, minmax(64px, 1fr))', // Automatische Anpassung für eine Zeile
              xl: 'repeat(auto-fit, minmax(64px, 1fr))'  // Automatische Anpassung für eine Zeile
            },
            justifyContent: { xs: 'flex-start', sm: 'center' }, // Mobile: links ausrichten für Swipe
            alignItems: 'center'       // Zentriert vertikal
          }}
        >
          {categories.map((category) => (
            <Box
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              sx={{
                // Mobile: fixe Kartenbreite zum Wischen, Snap-Anker
                flex: { xs: '0 0 auto', sm: 'initial' },
                width: { xs: 64, sm: 64 }, // Quadratisch 64x64px wie Icons
                height: { xs: 80, sm: 80 }, // Etwas höher für Text unter Icon
                minWidth: { xs: 64, sm: 64 },
                minHeight: { xs: 80, sm: 80 },
                maxWidth: { xs: 64, sm: 64 },
                maxHeight: { xs: 80, sm: 80 },
                scrollSnapAlign: { xs: 'start', sm: 'unset' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                cursor: 'pointer',
                // Verbesserte Mobile-Interaktion
                touchAction: { xs: 'pan-x', sm: 'auto' }, // Nur horizontales Wischen erlauben
                userSelect: 'none', // Text-Selektion verhindern
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                // Hover-Effekte nur auf Desktop
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-1px)' },
                  boxShadow: { xs: 'none', sm: '0 3px 6px rgba(0, 0, 0, 0.06)' }
                },
                // Active-Effekte für Mobile
                '&:active': {
                  transform: { xs: 'scale(0.95)', sm: 'translateY(0px)' },
                  transition: 'transform 0.1s ease-in-out'
                }
              }}
            >
              {/* Category Icon Container - wie iPhone Icons */}
              <Box
                className="category-icon"
                sx={{
                  width: 64,
                  height: 64,
                  backgroundColor: '#ffffff',
                  borderRadius: 2, // Abgerundete Ecken wie iPhone Icons (16px)
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                  mb: 1, // Abstand zum Text
                }}
              >
                <Box
                  sx={{
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }}
                >
                  {getCategoryIcon(category)}
                </Box>
              </Box>
              
              {/* Category Name - wie iPhone App-Namen */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: '11px', // Kleine Schrift wie iPhone
                  fontWeight: 400,
                  textAlign: 'center',
                  color: '#1f2937', // Dunkelgrau für gute Lesbarkeit
                  lineHeight: 1.2,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif', // iOS System Font
                  letterSpacing: '-0.01em' // iOS Letter Spacing
                }}
              >
                {getShortCategoryName(category.name)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}; 
