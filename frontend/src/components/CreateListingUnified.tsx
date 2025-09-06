import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { DirectionsCar as CarIcon, Store as StoreIcon } from '@mui/icons-material';
import CreateListingOptimized from './CreateListingOptimized';
import CreateKleinanzeigenListingOptimized from './CreateKleinanzeigenListingOptimized';
import RealTimePreview from './RealTimePreview';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`listing-tabpanel-${index}`}
      aria-labelledby={`listing-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `listing-tab-${index}`,
    'aria-controls': `listing-tabpanel-${index}`,
  };
}

const CreateListingUnified: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState<File[]>([]);
  const [listingType, setListingType] = useState<'auto' | 'kleinanzeigen'>('auto');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setListingType(newValue === 0 ? 'auto' : 'kleinanzeigen');
  };

  const handleFormDataUpdate = (data: Record<string, unknown>, imageFiles: File[]) => {
    setFormData(data);
    setImages(imageFiles);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          Anzeige erstellen
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Wähle die Kategorie für deine Anzeige
        </Typography>
      </Box>

      {/* Layout mit Formular und Vorschau */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' }, 
        gap: 4,
        alignItems: 'start'
      }}>
        {/* Main Content - Formular */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: theme.shadows[4],
            bgcolor: '#ffffff'
          }}
        >
          {/* Tab Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="listing creation tabs"
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'text.primary',
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab
                icon={<CarIcon sx={{ fontSize: 24, mb: 0.5 }} />}
                label="Auto verkaufen"
                {...a11yProps(0)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1
                }}
              />
              <Tab
                icon={<StoreIcon sx={{ fontSize: 24, mb: 0.5 }} />}
                label="Kleinanzeige erstellen"
                {...a11yProps(1)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1
                }}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <CreateListingOptimized onFormDataUpdate={handleFormDataUpdate} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <CreateKleinanzeigenListingOptimized onFormDataUpdate={handleFormDataUpdate} />
          </TabPanel>
        </Paper>

        {/* Live-Vorschau - Separater Container rechts */}
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              p: 3,
              bgcolor: '#ffffff',
              boxShadow: theme.shadows[4],
              position: 'sticky',
              top: 24,
              maxHeight: 'calc(100vh - 48px)',
              overflow: 'auto'
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 3,
                textAlign: 'center'
              }}
            >
              Live-Vorschau
            </Typography>
            <RealTimePreview
              formData={formData}
              images={images}
              type={listingType}
              loading={false}
            />
          </Paper>
        </Box>
      </Box>
  </Container>
  );
};

export default CreateListingUnified; 