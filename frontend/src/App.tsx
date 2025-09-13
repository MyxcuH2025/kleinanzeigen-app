import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, Box, Skeleton, Button, CircularProgress } from '@mui/material';
import { CategoryCards } from './components/CategoryCards';

// OPTIMIERT: Lazy Loading für alle großen Komponenten
const ListingDetailMinimal = lazy(() => import('./components/ListingDetailMinimal'));
const ListingDetailStrong = lazy(() => import('./components/ListingDetailStrong'));
const ListingDetailNextLevel = lazy(() => import('./components/ListingDetailNextLevel'));
const ListingDetailPage = lazy(() => import('./features/listingDetail/ListingDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const Layout = lazy(() => import('./components/Layout').then(m => ({ default: m.Layout })));
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));

const CreateListing = lazy(() => import('./components/CreateListing_Optimized'));
const EditListing = lazy(() => import('./components/EditListing'));

// Context Provider (bleiben synchron geladen)
import { SnackbarProvider } from './context/SnackbarContext';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from "./context/UserContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AdminProvider } from "./context/AdminContext";
import { FollowProvider } from "./context/FollowContext";
import { StoriesProvider } from "./features/stories/store/stories.store";
import SessionManager from "./components/SessionManager";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

// Lazy Loading für alle Seiten
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const PasswordResetRequest = lazy(() => import('./components/PasswordResetRequest').then(m => ({ default: m.PasswordResetRequest })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AutosPage = lazy(() => import('./pages/AutosPage'));
const UniversalListingPage = lazy(() => import('./pages/UniversalListingPage').then(m => ({ default: m.UniversalListingPage })));
const AdCard = lazy(() => import('./components/AdCard'));
const TipsGuide = lazy(() => import('./components/TipsGuide'));
const Section = lazy(() => import('./components/Section').then(m => ({ default: m.Section })));
const LoginForm = lazy(() => import("./components/LoginForm").then(m => ({ default: m.LoginForm })));
const RegisterForm = lazy(() => import("./components/RegisterForm"));

// Admin und Dashboard (schwere Komponenten)
const AdminDashboard_Optimized = lazy(() => import("./components/AdminDashboard_Optimized").then(m => ({ default: m.AdminDashboard_Optimized })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const DashboardPage_Optimized = lazy(() => import("./pages/DashboardPage_Optimized").then(m => ({ default: m.DashboardPage_Optimized })));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage").then(m => ({ default: m.FavoritesPage })));
const ListingsPage = lazy(() => import("./pages/ListingsPage").then(m => ({ default: m.ListingsPage })));
const ListingsPage_Optimized = lazy(() => import("./pages/ListingsPage_Optimized").then(m => ({ default: m.ListingsPage_Optimized })));
const StoriesPage = lazy(() => import("./features/stories/StoriesPage").then(m => ({ default: m.StoriesPage })));

// Weitere Seiten
const CalendarPage = lazy(() => import("./pages/CalendarPage").then(m => ({ default: m.CalendarPage })));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })));
const TextTemplatesPage = lazy(() => import('./pages/TextTemplatesPage').then(m => ({ default: m.TextTemplatesPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const FAQContactPage = lazy(() => import('./pages/FAQContactPage'));
const ShopRegistrationPage = lazy(() => import('./pages/ShopRegistrationPage'));
const EntitySearchPage = lazy(() => import('./pages/EntitySearchPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ShopProfilePage = lazy(() => import('./pages/ShopProfilePage'));
const ProviderProfilePage = lazy(() => import('./pages/ProviderProfilePage'));
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const LokaleNewsPage = lazy(() => import('./pages/LokaleNewsPage'));
const PartnerWerdenPage = lazy(() => import('./pages/PartnerWerdenPage'));
const KarrierePage = lazy(() => import('./pages/KarrierePage'));
const SellerVerificationPage = lazy(() => import('./pages/SellerVerificationPage'));
const VerificationStatusPage = lazy(() => import('./pages/VerificationStatusPage'));
const AdminVerificationPage = lazy(() => import('./pages/AdminVerificationPage'));
const CategorySelection = lazy(() => import('./pages/CategorySelection'));

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

// OPTIMIERT: Verbesserte Loading-Komponenten für Code-Splitting
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

// Loading-Komponente für Suspense
const PageLoader: React.FC = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '200px',
    flexDirection: 'column',
    gap: 2
  }}>
    <CircularProgress size={40} />
    <Box sx={{ color: 'text.secondary', fontSize: '14px' }}>
      Seite wird geladen...
    </Box>
  </Box>
);

// Suspense-Wrapper für bessere UX
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
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
        
        // PERFORMANCE-OPTIMIERUNG: Verzögertes Laden um andere API-Calls nicht zu blockieren
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
                // Wenn bereits /api/images/ enthalten ist, verwende es direkt
                if (imagePath.startsWith('/api/images/')) {
                  return `http://localhost:8000${imagePath}`;
                }
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

          // console.log('Processed listing:', { // Removed for performance
          //   id: listing.id,
          //   title: listing.title,
          //   originalImages: listing.images,
          //   processedImages: parsedImages
          // });

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
            <AdminProvider>
              <FollowProvider>
                <StoriesProvider>
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
                    <Route path="/category/autos" element={<SuspenseWrapper><AutosPage /></SuspenseWrapper>} />
                    <Route path="/category/:slug" element={<SuspenseWrapper><CategoryPage /></SuspenseWrapper>} />
                    <Route path="/category/:slug/:sub" element={<SuspenseWrapper><CategoryPage /></SuspenseWrapper>} />
                    <Route path="/listing/:id" element={<SuspenseWrapper><ListingDetailPage /></SuspenseWrapper>} />
                    <Route path="/merkliste" element={<Navigate to="/favorites" replace />} />

                    <Route path="/login" element={<SuspenseWrapper><Login /></SuspenseWrapper>} />
                    <Route path="/register" element={<SuspenseWrapper><RegisterForm /></SuspenseWrapper>} />

                    <Route path="/password-reset" element={<SuspenseWrapper><PasswordResetRequest /></SuspenseWrapper>} />
                    <Route path="/reset-password" element={<SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>} />
                    <Route path="/verify-email" element={<SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper>} />
            
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage_Optimized />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard-old" element={
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
                        <ListingsPage_Optimized />
                      </ProtectedRoute>
                    } />
                    <Route path="/listings-old" element={
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
        <Route path="/faq" element={<FAQContactPage />} />
        <Route path="/faq-contact" element={<FAQContactPage />} />
        <Route path="/hilfe" element={<FAQContactPage />} />
                    <Route path="/feed" element={
                      <ProtectedRoute>
                        <FeedPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/stories" element={
                      <ProtectedRoute>
                        <SuspenseWrapper><StoriesPage /></SuspenseWrapper>
                      </ProtectedRoute>
                    } />
                    <Route path="/shops" element={<Navigate to="/entities?type=shops" replace />} />
                    <Route path="/shops/" element={<Navigate to="/entities?type=shops" replace />} />
                    <Route path="/dienstleister" element={<Navigate to="/entities?type=providers" replace />} />
                    <Route path="/dienstleister/" element={<Navigate to="/entities?type=providers" replace />} />
                    <Route path="/user" element={<Navigate to="/entities?type=users" replace />} />
                    <Route path="/user/" element={<Navigate to="/entities?type=users" replace />} />
        <Route path="/shop-registration" element={<ShopRegistrationPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/lokale-news" element={<LokaleNewsPage />} />
                    <Route path="/partner-werden" element={<PartnerWerdenPage />} />
                    <Route path="/karriere" element={<KarrierePage />} />
                    {/* <Route path="/hilfe" element={<HilfePage />} /> - Backup: HilfePage_backup_20250109.tsx */}
                    <Route path="/universal/:category" element={<UniversalListingPage />} />
                    <Route path="/create-listing" element={
                      <ProtectedRoute>
                        <CreateListing />
                      </ProtectedRoute>
                    } />
                    <Route path="/category-selection" element={<CategorySelection />} />
                    {/* /create-kleinanzeigen und /create-buttons Routen entfernt - nicht benötigt */}
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
                        <AdminDashboard_Optimized />
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
                </StoriesProvider>
              </FollowProvider>
            </AdminProvider>
          </FavoritesProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
