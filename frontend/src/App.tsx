import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, Box, Skeleton, Button } from '@mui/material';
import { CategoryCards } from './components/CategoryCards';

import ListingDetail from './components/ListingDetail';

import { CategoryPage } from './pages/CategoryPage';
import { ChatPage } from './pages/ChatPage';
import { Layout } from './components/Layout';
import { Login } from './components/Login';

import CreateListing from './components/CreateListing';
import CreateKleinanzeigenListing from './components/CreateKleinanzeigenListing';

import CreateListingUnifiedButtons from './components/CreateListingUnifiedButtons';
import EditListing from './components/EditListing';
// removed dynamic forms
import { SnackbarProvider } from './context/SnackbarContext';
import { ThemeProvider } from './context/ThemeContext';
import { SearchPage } from './pages/SearchPage';
import { PasswordResetRequest } from './components/PasswordResetRequest';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AutosPage from './pages/AutosPage';
import { UniversalListingPage } from './pages/UniversalListingPage';
import AdCard from './components/AdCard';
import TipsGuide from './components/TipsGuide';
import { Section } from './components/Section';
import { LoginForm } from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserProvider } from "./context/UserContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import SessionManager from "./components/SessionManager";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminRoute } from "./components/AdminRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ListingsPage } from "./pages/ListingsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { TemplatesPage } from './pages/TemplatesPage';
import { TextTemplatesPage } from './pages/TextTemplatesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import ShopRegistrationPage from './pages/ShopRegistrationPage';
import EntitySearchPage from './pages/EntitySearchPage';
import UserProfilePage from './pages/UserProfilePage';
import ShopProfilePage from './pages/ShopProfilePage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import FeedPage from './pages/FeedPage';
import EventsPage from './pages/EventsPage';
import HilfePage from './pages/HilfePage';
import LokaleNewsPage from './pages/LokaleNewsPage';
import PartnerWerdenPage from './pages/PartnerWerdenPage';
import KarrierePage from './pages/KarrierePage';
import SellerVerificationPage from './pages/SellerVerificationPage';
import VerificationStatusPage from './pages/VerificationStatusPage';
import AdminVerificationPage from './pages/AdminVerificationPage';
import CategorySelection from './pages/CategorySelection';
// logger removed (unused)

interface SearchData {
  query?: string;
  filters?: Array<{
    id: string;
    label: string;
    value: string;
    category: string;
  }>;
  timestamp?: string;
}

// Navigation components
const CategoryRedirect: React.FC = () => {
  const { slug } = useParams();
  return <Navigate to={`/category/${slug}`} replace />;
};

const CategorySubRedirect: React.FC = () => {
  const { slug, sub } = useParams();
  return <Navigate to={`/category/${slug}/${sub}`} replace />;
};

// Simple skeleton component for loading state
const AdCardSkeleton: React.FC = () => (
  <Box sx={{ height: 400, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e1e8ed' }}>
    <Skeleton variant="rectangular" height={200} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="60%" />
    </Box>
  </Box>
 );

interface HomePageProps {
  searchQuery: string;
}

const HomePage: React.FC<HomePageProps> = ({ searchQuery }) => {
  const [listings, setListings] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  

  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoadingAds(true);
        // Verwende die gleiche API wie die User-Profil-Seite
        const response = await fetch('http://localhost:8000/api/listings');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Backend gibt jetzt {listings: [...], pagination: {...}} zurück
        const listingsData = data.listings || data;
        
        // Verarbeite die Bilder für jedes Listing (wie in User-Profil-Seite)
        const processedListings = listingsData.map((listing: any) => {
          let parsedImages: string[] = [];
          try {
            // Bilder können als String (kommagetrennt) oder Array kommen
            let imageList: string[] = [];
            
            if (typeof listing.images === 'string') {
              // Kommagetrennte Liste in Array umwandeln
              imageList = listing.images.split(',').map((img: string) => img.trim()).filter((img: string) => img.length > 0);
            } else if (Array.isArray(listing.images)) {
              imageList = listing.images;
            }
            
            if (imageList.length > 0) {
              parsedImages = imageList.map((imagePath: string) => {
                // Entferne /uploads/ Präfix falls vorhanden
                const cleanPath = imagePath.replace('/uploads/', '');
                // Verwende den /api/images/ Endpunkt
                return `http://localhost:8000/api/images/${cleanPath}`;
              });
            }
          } catch (error) {
            console.warn('Fehler beim Parsen der Bilder für Listing:', listing.id, error);
          }
          
          // Fallback-Bild nur wenn wirklich keine Bilder vorhanden
          if (parsedImages.length === 0) {
            parsedImages = ['/images/noimage.jpeg'];
          }

          console.log('Processed listing:', {
            id: listing.id,
            title: listing.title,
            originalImages: listing.images,
            processedImages: parsedImages
          });

          return {
            ...listing,
            images: parsedImages
          };
        });
        
        setListings(processedListings);
      } catch (error) {
        console.error('Error loading ads:', error);
      } finally {
        setLoadingAds(false);
      }
    };

    loadAds();
  }, []);

  // Live-Search Filterung
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Wenn Suche leer ist, zeige alle Anzeigen
      setFilteredAds(listings);
    } else {
      // Filtere Anzeigen basierend auf Suchbegriff
      const filtered = listings.filter((listing: any) => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          listing.title?.toLowerCase().includes(searchTerm) ||
          listing.description?.toLowerCase().includes(searchTerm) ||
          listing.category?.toLowerCase().includes(searchTerm) ||
          listing.location?.toLowerCase().includes(searchTerm)
        );
      });
      setFilteredAds(filtered);
    }
  }, [searchQuery, listings]);

  // Filter ads - immer Kleinanzeigen für die Hauptseite
  useEffect(() => {
    // Zeige nur Kleinanzeigen (alle außer Autos) auf der Hauptseite
    setFilteredAds(listings.filter(listing => 
      listing.category?.toLowerCase() !== 'autos'
    ));
  }, [listings]);

  return (
    <Box sx={{ 
      width: '100%', 
      py: { xs: 0.5, sm: 0.5, md: 0.5 }, // Reduziert von 1/1/1 auf 0.5/0.5/0.5
      height: '100%',
      bgcolor: '#ffffff'
    }}>
      {/* Keine Suchmaske mehr - direkt zu Kleinanzeigen-Inhalten */}
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, bgcolor: '#ffffff', pt: { xs: 0.5, sm: 1, md: 1 } }}>
        {/* Kategorie-Buttons nur auf Desktop */}
        {/* Hauptkategorien entfernt - Autos Button ist jetzt in der oberen Menüleiste */}

        {/* Kategorie-Kärtchen - Desktop und Mobile mit Swipe */}
        <Box sx={{ display: 'block' }}>
          <CategoryCards theme="kleinanzeigen" />
        </Box>
        
        <Section title="Neueste Kleinanzeigen">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', // Mobile: 2 Spalten
              sm: 'repeat(2, 1fr)', // Tablet: 2 Spalten
              md: 'repeat(3, 1fr)', // Desktop: 3 Spalten
              lg: 'repeat(4, 1fr)', // Large: 4 Spalten
              xl: 'repeat(5, 1fr)'  // Extra Large: 5 Spalten
            },
            gap: { xs: 2.5, sm: 2.5, md: 3, lg: 3.5 }, // Erhöhte vertikale Abstände
            mt: { xs: 1, sm: 1.5, md: 2 }, // Reduziert von 2/3/3 auf 1/1.5/2
            alignItems: 'start', // Verhindert, dass Karten sich aneinander anpassen
            bgcolor: '#ffffff'
          }}>
            {loadingAds ? (
              Array.from({ length: 6 }).map((_, index) => (
                <AdCardSkeleton key={index} />
              ))
            ) : (
              filteredAds.map((listing) => (
                <AdCard
                  key={listing.id}
                  id={listing.id.toString()}
                  title={listing.title}
                  price={listing.price}
                  location={listing.location}
                  images={listing.images}
                  category={listing.category}
                  status={listing.status}
                  views={listing.views || 0}
                  created_at={listing.created_at}
                  attributes={listing.attributes || {}}
                  seller={{
                    name: 'max.mueller',
                    avatar: ''
                  }}
                  vehicleDetails={undefined}
                />
              ))
            )}
          </Box>
        </Section>
      </Box>
    </Box>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CssBaseline />
        <UserProvider>
          <FavoritesProvider>
            <SnackbarProvider>
              <SessionManager timeoutMinutes={30} warningMinutes={5} />
              <Router>
                <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
                  <Layout 
                    onSearchChange={setSearchQuery}
                    searchValue={searchQuery}
                  >
                    <Routes>
                    <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
                    <Route path="/category/autos" element={<AutosPage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/category/:slug/:sub" element={<CategoryPage />} />
                    <Route path="/listing/:id" element={<ListingDetail />} />
                    <Route path="/merkliste" element={<Navigate to="/favorites" replace />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<RegisterForm />} />

                    <Route path="/password-reset" element={<PasswordResetRequest />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
            
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/favorites" element={
                      <ProtectedRoute>
                        <FavoritesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/merkliste" element={
                      <ProtectedRoute>
                        <FavoritesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/vorlagen" element={
                      <ProtectedRoute>
                        <TemplatesPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/listings" element={
                      <ProtectedRoute>
                        <ListingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/calendar" element={
                      <ProtectedRoute>
                        <CalendarPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    } />

                    <Route path="/text-templates" element={
                      <ProtectedRoute>
                        <TextTemplatesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/autos" element={<AutosPage />} />
                    <Route path="/entities" element={<EntitySearchPage />} />
                            <Route path="/user/:id" element={<UserProfilePage />} />
        <Route path="/shop/:id" element={<ShopProfilePage />} />
        <Route path="/provider/:id" element={<ProviderProfilePage />} />
        <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
                    <Route path="/feed" element={
                      <ProtectedRoute>
                        <FeedPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/shops" element={<Navigate to="/entities?type=shops" replace />} />
                    <Route path="/dienstleister" element={<Navigate to="/entities?type=providers" replace />} />
                    <Route path="/user" element={<Navigate to="/entities?type=users" replace />} />
        <Route path="/shop-registration" element={<ShopRegistrationPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/lokale-news" element={<LokaleNewsPage />} />
                    <Route path="/partner-werden" element={<PartnerWerdenPage />} />
                    <Route path="/karriere" element={<KarrierePage />} />
                    <Route path="/hilfe" element={<HilfePage />} />
                    <Route path="/universal/:category" element={<UniversalListingPage />} />
                    <Route path="/create-listing" element={
                      <ProtectedRoute>
                        <CreateListing />
                      </ProtectedRoute>
                    } />
                    <Route path="/category-selection" element={<CategorySelection />} />
                    <Route path="/create-kleinanzeigen" element={
                      <ProtectedRoute>
                        <CreateKleinanzeigenListing />
                      </ProtectedRoute>
                    } />
                    <Route path="/create-buttons" element={
                      <ProtectedRoute>
                        <CreateListingUnifiedButtons />
                      </ProtectedRoute>
                    } />
                    {/* removed: /create-dynamic */}
                    <Route path="/edit-listing/:id" element={
                      <ProtectedRoute>
                        <EditListing />
                      </ProtectedRoute>
                    } />
                    <Route path="/chat" element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/admin" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    {/* dynamic forms admin removed */}
                    <Route path="/kategorien" element={<Navigate to="/" replace />} />
                    <Route path="/kategorien/elektronik" element={<Navigate to="/category/elektronik" replace />} />
                    <Route path="/kategorien/:slug" element={<CategoryRedirect />} />
                    <Route path="/kategorien/:slug/:sub" element={<CategorySubRedirect />} />
                    <Route path="/ratgeber" element={<TipsGuide />} />
                    <Route path="/login-form" element={<LoginForm />} />
                    
                    {/* Verifizierungs-Routen */}
                    <Route path="/seller-verification" element={
                      <ProtectedRoute>
                        <SellerVerificationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/verification-status" element={
                      <ProtectedRoute>
                        <VerificationStatusPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/verifications" element={
                      <AdminRoute>
                        <AdminVerificationPage />
                      </AdminRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  </Layout>
                </Box>
              </Router>
            </SnackbarProvider>
          </FavoritesProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
