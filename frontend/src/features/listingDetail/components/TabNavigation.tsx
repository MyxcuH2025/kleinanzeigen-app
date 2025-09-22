import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Chip
} from '@mui/material';
import {
  List as ListIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  CompareArrows as SimilarIcon,
  Security as SecurityIcon,
  Help as HelpIcon
} from '@mui/icons-material';

import { ListingDetail, ListingSummary } from '../types';
import ListingReviews from './ListingReviews';

interface TabNavigationProps {
  listing: ListingDetail;
  similarListings: ListingSummary[];
  onTabChange?: (tabIndex: number) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`listing-tabpanel-${index}`}
      aria-labelledby={`listing-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `listing-tab-${index}`,
    'aria-controls': `listing-tabpanel-${index}`,
  };
};

/**
 * Premium Tab Navigation Component
 * Features: Responsive Tabs, Icons, Smart Layout
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  listing,
  similarListings,
  onTabChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    onTabChange?.(newValue);
  };

  // Tab Configuration
  const tabs = [
    {
      label: 'Eigenschaften',
      icon: <ListIcon />,
      count: Object.keys(listing.attributes).length,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Produktdetails
          </Typography>
          {/* AttributesGrid wird hier eingebunden */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2 
          }}>
            {Object.entries(listing.attributes).map(([key, value]) => (
              <Paper 
                key={key} 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 0,
                }}
              >
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}
                >
                  {key.replace(/_/g, ' ')}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600,
                    color: typeof value === 'boolean' ? (value ? '#4caf50' : '#f44336') : '#000000'
                  }}
                >
                  {typeof value === 'boolean' ? (value ? 'Ja' : 'Nein') : String(value)}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )
    },
    {
      label: 'Bewertungen',
      icon: <StarIcon />,
      count: listing.seller.reviewsCount || 0,
      content: (
        <ListingReviews
          reviews={[]} // TODO: Load real reviews from backend
          averageRating={listing.seller.rating || 4.8}
          totalReviews={listing.seller.reviewsCount || 0}
          onAddReview={(rating, comment) => {
            console.log('Adding review:', { rating, comment });
            // TODO: Implement review submission
          }}
          onHelpful={(reviewId) => {
            console.log('Marking review as helpful:', reviewId);
            // TODO: Implement helpful functionality
          }}
          onReply={(reviewId, reply) => {
            console.log('Replying to review:', { reviewId, reply });
            // TODO: Implement reply functionality
          }}
        />
      )
    },
    {
      label: 'Standort',
      icon: <LocationIcon />,
      count: listing.location.distanceKm ? Math.round(listing.location.distanceKm) : null,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Standort & Umgebung
          </Typography>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 0 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              📍 {listing.location.city}
            </Typography>
            {listing.location.distanceKm && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Entfernung: {Math.round(listing.location.distanceKm)} km
              </Typography>
            )}
            <Box sx={{ 
              height: 200, 
              bgcolor: '#f5f5f5', 
              borderRadius: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'text.secondary'
            }}>
              🗺️ Karte wird hier angezeigt
            </Box>
          </Paper>
        </Box>
      )
    },
    {
      label: 'Ähnliche',
      icon: <SimilarIcon />,
      count: similarListings.length,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Ähnliche Anzeigen
          </Typography>
          {similarListings.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2 
            }}>
              {similarListings.map((similarListing) => (
                <Paper 
                  key={similarListing.id} 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    border: '1px solid #e8e8e8', 
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {similarListing.title}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#000000', fontWeight: 700 }}>
                    € {similarListing.price.toLocaleString('de-DE')}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 0, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                🔍 Keine ähnlichen Anzeigen gefunden
              </Typography>
            </Paper>
          )}
        </Box>
      )
    },
    {
      label: 'Sicherheit',
      icon: <SecurityIcon />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Sicherheit & Support
          </Typography>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 0 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                🛡️ Sicherheitstipps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Treffe dich an öffentlichen Orten<br/>
                • Überprüfe die Identität des Verkäufers<br/>
                • Nutze sichere Zahlungsmethoden<br/>
                • Melde verdächtige Anzeigen
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                📞 Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Anzeigen-ID: {listing.listingIdPublic}<br/>
                Bei Problemen wende dich an unseren Support
              </Typography>
            </Box>
          </Paper>
        </Box>
      )
    },
    {
      label: 'FAQ',
      icon: <HelpIcon />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Häufige Fragen
          </Typography>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 0 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ❓ Wie kann ich den Verkäufer kontaktieren?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nutze den "Chat starten" Button oder die "Telefon anzeigen" Funktion.
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ❓ Ist der Verkäufer verifiziert?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ja, dieser Verkäufer hat {Object.values(listing.seller.verified).filter(Boolean).length} Verifikationen.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ❓ Wie sicher ist der Kauf?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Treffe dich an öffentlichen Orten und nutze sichere Zahlungsmethoden.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ mt: 4 }}>
      {/* Tab Navigation */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 64,
              px: 3,
              borderRadius: 0,
              borderRight: '1px solid rgba(0,0,0,0.04)',
              '&.Mui-selected': {
                color: '#000000',
                bgcolor: 'transparent',
              },
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.02)',
              },
              '&:last-child': {
                borderRight: 'none',
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#000000',
              height: '1px',
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count !== undefined && tab.count > 0 && (
                    <Chip 
                      label={tab.count} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#000000', 
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20,
                        minWidth: 20
                      }} 
                    />
                  )}
                </Box>
              }
              {...a11yProps(index)}
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.content}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

export default TabNavigation;
