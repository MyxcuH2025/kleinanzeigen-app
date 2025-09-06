import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  useMediaQuery,
  useTheme,
  Drawer,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
// Use Box-based layout to avoid Grid type issues
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/categories';

// Interfaces direkt hier definieren
interface Category {
  value: string;
  label: string;
  icon: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  value: string;
  label: string;
  icon?: string;
  items?: string[];
}

const CategorySelection: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'subcategories' | 'items'>('categories');

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    if (isMobile) {
      setCurrentView('subcategories');
    }
  };

  const handleSubcategorySelect = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    if (isMobile) {
      setCurrentView('items');
    }
  };

  const handleItemSelect = (item: string) => {
    // Navigiere zur Anzeige-Erstellung mit der ausgewählten Kategorie
    navigate('/create-listing', { 
      state: { 
        category: selectedCategory?.value,
        subcategory: selectedSubcategory?.value,
        item: item
      }
    });
  };

  const handleBack = () => {
    if (isMobile) {
      if (currentView === 'items') {
        setCurrentView('subcategories');
      } else if (currentView === 'subcategories') {
        setCurrentView('categories');
        setSelectedCategory(null);
        setSelectedSubcategory(null);
      }
    } else {
      if (selectedSubcategory) {
        setSelectedSubcategory(null);
      } else if (selectedCategory) {
        setSelectedCategory(null);
      }
    }
  };

  const handleClose = () => {
    navigate('/create-listing');
  };

  // Mobile Modal Content
  const MobileModalContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Drag Handle */}
      <Box sx={{ 
        width: 40, 
        height: 4, 
        bgcolor: '#ccc', 
        borderRadius: 2, 
        mx: 'auto', 
        mt: 1, 
        mb: 2 
      }} />
      
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'black' }}>
        <Toolbar sx={{ px: 2 }}>
          <IconButton onClick={handleBack} sx={{ color: '#2e7d32', mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {currentView === 'categories' ? 'Kategorien' : 
             currentView === 'subcategories' ? selectedCategory?.label : 
             selectedSubcategory?.label}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: '#2e7d32' }}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {currentView === 'categories' && (
          <List sx={{ p: 0 }}>
            <ListItem sx={{ bgcolor: '#f5f5f5', py: 1 }}>
              <ListItemText 
                primary="Alle Kategorien" 
                primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }}
              />
            </ListItem>
            {categories.map((category) => (
              <ListItem key={category.value} disablePadding>
                <ListItemButton
                  onClick={() => handleCategorySelect(category)}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.label}
                    primaryTypographyProps={{ fontSize: '1rem' }}
                  />
                  <NavigateNextIcon fontSize="small" sx={{ color: '#666' }} />
                </ListItemButton>
                <Divider />
              </ListItem>
            ))}
          </List>
        )}

        {currentView === 'subcategories' && selectedCategory && (
          <List sx={{ p: 0 }}>
            {selectedCategory.subcategories?.map((subcategory) => (
              <ListItem key={subcategory.value} disablePadding>
                <ListItemButton
                  onClick={() => handleSubcategorySelect(subcategory)}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemText 
                    primary={subcategory.label}
                    primaryTypographyProps={{ fontSize: '1rem' }}
                  />
                  {subcategory.items && (
                    <NavigateNextIcon fontSize="small" sx={{ color: '#666' }} />
                  )}
                </ListItemButton>
                <Divider />
              </ListItem>
            ))}
          </List>
        )}

        {currentView === 'items' && selectedSubcategory && selectedSubcategory.items && (
          <List sx={{ p: 0 }}>
            {selectedSubcategory.items.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => handleItemSelect(item)}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemText 
                    primary={item}
                    primaryTypographyProps={{ fontSize: '1rem' }}
                  />
                </ListItemButton>
                <Divider />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );

  // Desktop Layout
  const DesktopLayout = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kategorie auswählen
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Wählen Sie eine Kategorie für Ihre Anzeige aus
        </Typography>
      </Box>

      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/create-listing')}
          sx={{ textDecoration: 'none' }}
        >
          Anzeige erstellen
        </Link>
        <Typography color="text.primary">Kategorie auswählen</Typography>
      </Breadcrumbs>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
        border: '1px solid #e0e0e0',
        borderRadius: 1
      }}>
        {/* Linke Spalte - Hauptkategorien */}
        <Box sx={{ borderRight: { md: '1px solid #e0e0e0' } }}>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
              Kategorie *
            </Typography>
          </Box>
          <List sx={{ p: 0 }}>
            {categories.map((category) => (
              <ListItem key={category.value} disablePadding>
                <ListItemButton
                  selected={selectedCategory?.value === category.value}
                  onClick={() => handleCategorySelect(category)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid #f0f0f0',
                    '&.Mui-selected': {
                      bgcolor: '#e8f5e8',
                      '&:hover': {
                        bgcolor: '#d4edda'
                      }
                    },
                    '&:hover': {
                      bgcolor: '#f8f9fa'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.label}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: selectedCategory?.value === category.value ? 600 : 400
                    }}
                  />
                  {category.subcategories && (
                    <NavigateNextIcon fontSize="small" sx={{ color: '#666' }} />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Mittlere Spalte - Unterkategorien */}
        <Box sx={{ borderRight: { md: '1px solid #e0e0e0' } }}>
          {selectedCategory ? (
            <>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowBackIcon 
                    sx={{ mr: 1, cursor: 'pointer', color: '#666' }} 
                    onClick={handleBack}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    Unterkategorie *
                  </Typography>
                </Box>
              </Box>
              <List sx={{ p: 0 }}>
                {selectedCategory.subcategories?.map((subcategory) => (
                  <ListItem key={subcategory.value} disablePadding>
                    <ListItemButton
                      selected={selectedSubcategory?.value === subcategory.value}
                      onClick={() => handleSubcategorySelect(subcategory)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid #f0f0f0',
                        '&.Mui-selected': {
                          bgcolor: '#e8f5e8',
                          '&:hover': {
                            bgcolor: '#d4edda'
                          }
                        },
                        '&:hover': {
                          bgcolor: '#f8f9fa'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={subcategory.label}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: selectedSubcategory?.value === subcategory.value ? 600 : 400
                        }}
                      />
                      {subcategory.items && (
                        <NavigateNextIcon fontSize="small" sx={{ color: '#666' }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>
              <Typography variant="body2">
                Wählen Sie zuerst eine Kategorie aus
              </Typography>
            </Box>
          )}
        </Box>

        {/* Rechte Spalte - Spezifische Items */}
        <Box>
          {selectedSubcategory && selectedSubcategory.items ? (
            <>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowBackIcon 
                    sx={{ mr: 1, cursor: 'pointer', color: '#666' }} 
                    onClick={handleBack}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    Art *
                  </Typography>
                </Box>
              </Box>
              <List sx={{ p: 0 }}>
                {selectedSubcategory.items.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton 
                      onClick={() => handleItemSelect(item)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid #f0f0f0',
                        '&:hover': {
                          bgcolor: '#f8f9fa'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={item}
                        primaryTypographyProps={{
                          fontSize: '0.9rem'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>
              <Typography variant="body2">
                {selectedCategory ? 'Wählen Sie eine Unterkategorie aus' : 'Wählen Sie zuerst eine Kategorie aus'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Weiter Button */}
      {selectedSubcategory && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Box
            component="button"
            onClick={() => {
              // Navigiere zur CreateListing-Seite mit der ausgewählten Unterkategorie
              navigate('/create-listing', { 
                state: { 
                  category: selectedCategory?.value,
                  subcategory: selectedSubcategory?.value
                }
              });
            }}
            sx={{
              bgcolor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: 1,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#1b5e20'
              }
            }}
          >
            Weiter
          </Box>
        </Box>
      )}

      {/* Ausgewählte Kategorie anzeigen */}
      {selectedCategory && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Ausgewählte Kategorie:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={selectedCategory.label} 
              icon={<span>{selectedCategory.icon}</span>}
              color="primary"
              variant="outlined"
            />
            {selectedSubcategory && (
              <Chip 
                label={selectedSubcategory.label} 
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}
    </Container>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={true}
          onClose={handleClose}
          sx={{
            '& .MuiDrawer-paper': {
              height: '90vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          <MobileModalContent />
        </Drawer>
      ) : (
        <DesktopLayout />
      )}
    </>
  );
};

export default CategorySelection;
