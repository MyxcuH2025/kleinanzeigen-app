import { Box, Typography, Card, CardContent, IconButton } from '@mui/material';
import NoImageIcon from '@mui/icons-material/Image';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRef, useState, useEffect } from 'react';

export const galleryItems = [
  {
    title: 'pferdekutsche, kutsche 6 Personen, einspänn...',
    price: 490,
    image: 'https://picsum.photos/400/300?random=11',
  },
  {
    title: 'Endstufe crown XLi 1500, inkl. Versand',
    price: 265,
    image: 'https://picsum.photos/400/300?random=12',
  },
  {
    title: 'Bayliner 2855',
    price: 35000,
    image: 'https://picsum.photos/400/300?random=13',
  },
  {
    title: 'DJ Schwani (www.dj-schwani.de)',
    price: 1281,
    image: 'https://picsum.photos/400/300?random=14',
  },
  {
    title: 'Wohnung Münster Geist',
    price: 2000000,
    image: 'https://picsum.photos/400/300?random=15',
  },
];

export const GallerySection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 260; // Card width + gap
    el.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', mb: 4, px: 2 }}>
      <Box sx={{ width: '100%', position: 'relative', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, px: 1 }}>
          Galerie
        </Typography>
        <Box sx={{ position: 'relative' }}>
          {canScrollLeft && (
            <IconButton
              onClick={() => scroll('left')}
              sx={{
                position: 'absolute', left: 0, top: '50%', zIndex: 2, transform: 'translateY(-50%)',
                bgcolor: '#fff', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}
          <Box
            ref={scrollRef}
            onScroll={checkScroll}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
              width: 'calc(4 * 236px + 3 * 16px)', // 4 Karten + 3 Gaps
              maxWidth: '100%',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'thin',
              '::-webkit-scrollbar': { height: 8 },
              mx: 'auto',
            }}
          >
            {galleryItems.map((item, idx) => {
              const previewImage = 'images' in item && Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image;
              return (
                <Card
                  key={idx}
                  sx={{
                    width: 236,
                    minWidth: 236,
                    maxWidth: 236,
                    scrollSnapAlign: 'start',
                    flex: '0 0 auto',
                    borderRadius: 1,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    bgcolor: '#fff',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }, /* Weniger Schatten */
                    m: '0 auto',
                  }}
                >
                  {previewImage ? (
                    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1/1', height: { xs: 196, md: 236 }, minHeight: { xs: 196, md: 236 }, maxHeight: { xs: 196, md: 236 }, borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: 'hidden' }}>
                      {/* Unscharfer, blasser Hintergrund */}
                      <Box
                        component="img"
                        src={previewImage}
                        alt=""
                        aria-hidden
                        sx={{
                          position: 'absolute',
                          top: 0, left: 0, width: '100%', height: '100%',
                          objectFit: 'cover',
                          filter: 'blur(18px) brightness(1.1) opacity(0.7)',
                          zIndex: 1,
                        }}
                      />
                      {/* Hauptbild */}
                      <Box
                        component="img"
                        src={previewImage}
                        alt={item.title}
                        loading="lazy"
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          zIndex: 2,
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4,
                          background: '#f3f4f6',
                          display: 'block',
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{
                      width: '100%',
                      aspectRatio: '1/1',
                      height: { xs: 196, md: 236 },
                      minHeight: { xs: 196, md: 236 },
                      maxHeight: { xs: 196, md: 236 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f3f4f6',
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    }}>
                      <NoImageIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                      <Typography variant="caption" color="grey.500">Kein Bild verfügbar</Typography>
                    </Box>
                  )}
                  <CardContent sx={{ pb: '8px !important' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                      {item.price.toLocaleString('de-DE')} €
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
          {canScrollRight && (
            <IconButton
              onClick={() => scroll('right')}
              sx={{
                position: 'absolute', right: 0, top: '50%', zIndex: 2, transform: 'translateY(-50%)',
                bgcolor: '#fff', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}; 