import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  useMediaQuery,
  useTheme,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Chip
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { categories as frontendCategories } from '@/data/categories';

interface CategorySelectionFormProps {
  category: string;
  setCategory: (category: string) => void;
  subcategory?: string;
  setSubcategory?: (subcategory: string) => void;
  item?: string;
  setItem?: (item: string) => void;
  errors: { [key: string]: string };
}

export const CategorySelectionForm: React.FC<CategorySelectionFormProps> = ({
  category,
  setCategory,
  subcategory,
  setSubcategory,
  item,
  setItem,
  errors
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'categories' | 'subcategories' | 'items'>('categories');
  const [showModal, setShowModal] = useState(false);

  // Kategorie aus Frontend-Daten finden
  useEffect(() => {
    if (category) {
      const foundCategory = frontendCategories.find(cat => cat.value === category);
      if (foundCategory) {
        setSelectedCategory(foundCategory);
        
        if (subcategory) {
          const foundSubcategory = foundCategory.subcategories?.find(sub => sub.value === subcategory);
          if (foundSubcategory) {
            setSelectedSubcategory(foundSubcategory);
          }
        }
      }
    }
  }, [category, subcategory]);

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setCategory(category.value);
    setSelectedSubcategory(null);
    setSubcategory?.('');
    setItem?.('');
    
    if (isMobile) {
      setCurrentView('subcategories');
    }
  };

  const handleSubcategorySelect = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setSubcategory?.(subcategory.value);
    setItem?.('');
    
    if (isMobile) {
      setCurrentView('items');
    }
  };

  const handleItemSelect = (item: string) => {
    setItem?.(item);
    setShowModal(false);
  };

  const handleBack = () => {
    if (isMobile) {
      if (currentView === 'items') {
        setCurrentView('subcategories');
      } else if (currentView === 'subcategories') {
        setCurrentView('categories');
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setCategory('');
        setSubcategory?.('');
      }
    } else {
      if (selectedSubcategory) {
        setSelectedSubcategory(null);
        setSubcategory?.('');
      } else if (selectedCategory) {
        setSelectedCategory(null);
        setCategory('');
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
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
            {frontendCategories.map((category) => (
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
            {selectedCategory.subcategories?.map((subcategory: any) => (
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
            {selectedSubcategory.items.map((item: string, index: number) => (
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
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
      border: '1px solid #e0e0e0',
      borderRadius: 1,
      minHeight: 400
    }}>
      {/* Linke Spalte - Hauptkategorien */}
      <Box sx={{ borderRight: { md: '1px solid #e0e0e0' } }}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            Kategorie *
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {frontendCategories.map((category) => (
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
              {selectedCategory.subcategories?.map((subcategory: any) => (
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
              {selectedSubcategory.items.map((item: string, index: number) => (
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
  );

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          Kategorie auswählen
        </Typography>
        
        {/* Kategorie-Button */}
        <Button
          variant="outlined"
          onClick={() => setShowModal(true)}
          sx={{
            width: '100%',
            py: 2,
            px: 3,
            textAlign: 'left',
            justifyContent: 'flex-start',
            borderColor: errors.category ? 'error.main' : 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
        >
          {selectedCategory ? (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '1.2rem', marginRight: 12 }}>{selectedCategory.icon}</span>
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {selectedCategory.label}
                {selectedSubcategory && ` > ${selectedSubcategory.label}`}
                {item && ` > ${item}`}
              </Typography>
              <NavigateNextIcon sx={{ color: '#666' }} />
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Wähle deine Kategorie
            </Typography>
          )}
        </Button>
        
        {errors.category && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {errors.category}
          </Typography>
        )}

        {/* Ausgewählte Kategorie anzeigen */}
        {selectedCategory && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
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
              {item && (
                <Chip 
                  label={item} 
                  color="default"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Modal/Drawer */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={showModal}
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
        <Drawer
          anchor="right"
          open={showModal}
          onClose={handleClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: '80vw',
              maxWidth: 1200,
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Kategorie auswählen
              </Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <DesktopLayout />
          </Box>
        </Drawer>
      )}
    </>
  );
};
