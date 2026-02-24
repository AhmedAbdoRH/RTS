import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from './lib/supabase';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import BannerSlider from './components/BannerSlider';
import Services from './components/Services';
import Footer from './components/Footer';
import Testimonials from './components/Testimonials';
import WhatsAppButton from './components/WhatsAppButton';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetails from './pages/ServiceDetails';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetails from './pages/ProductDetails';
import LoadingScreen from './components/LoadingScreen';
import RamadanLanterns from './components/RamadanLanterns';
import type { StoreSettings, Banner } from './types/database';
import { ThemeProvider } from './theme/ThemeContext';

// PrivateRoute component with professional loading spinner
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  }

  if (isAuthenticated === null) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-spinner-text"> </p>
      </div>
    );
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

function App() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function initApp() {
      await fetchStoreSettings();
      const { data: bannersData, error: bannersError } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (isMounted) {
        if (bannersError) {
          console.error("Error fetching banners:", bannersError);
          setBanners([]);
        } else {
          setBanners(bannersData || []);
        }
      }

      // Wait for at least 2 seconds OR until settings are fetched, whichever is longer
      // This part is primarily for the initial LoadingScreen, not PrivateRoute
      const timer = setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 2000); // Minimum 2 seconds for initial loading screen

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
    initApp();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (storeSettings) {
      const theme = (storeSettings as any).theme_settings || {};
      const fontFamily = theme.fontFamily || 'Cairo, sans-serif';

      const root = document.documentElement;
      root.style.setProperty('--color-primary', '#1c594e');
      root.style.setProperty('--color-secondary', '#ffffff');
      root.style.setProperty('--color-accent', '#ffd453'); 
      root.style.setProperty('--color-accent-light', '#ffd453'); 
      root.style.setProperty('--font-family', fontFamily);

      root.style.setProperty('--background-gradient', ''); 
      root.style.setProperty('--background-color', '#1c594e');
    }
  }, [storeSettings]);

  const fetchStoreSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching store settings:", error);
        // Set default settings if fetch fails
        setStoreSettings({
          id: '00000000-0000-0000-0000-000000000001',
          store_name: 'شركة الريان للحلول التكنولوجية',
          store_description: 'متخصصون في توريد وتركيب الأبواب الأوتوماتيك والشيش الحصير والهاندريل وكبائن الحمامات للبنوك والشركات والمولات والمستشفيات والقرى السياحية والفلل',
          logo_url: null,
          meta_title: 'شركة الريان | الأبواب الأوتوماتيك والحلول التكنولوجية',
          meta_description: 'متخصصون في توريد وتركيب الأبواب الأوتوماتيك والشيش الحصير والهاندريل وكبائن الحمامات. أجود الخامات المعدنية ودهان إلكتروستاتيك مانع للصدأ.',
          show_testimonials: true,
          theme_settings: {
            primaryColor: '#1c594e',
            secondaryColor: '#ffffff',
            fontFamily: 'Cairo, sans-serif',
            backgroundColor: '#1c594e',
            backgroundGradient: ''
          }
        } as StoreSettings);
        return;
      }

      if (data) {
        // Fix invalid logo URL that causes 400 error
        if (data.logo_url === 'https://dndnvufgohkacfbqenhj.supabase.co/storage/v1/object/public/services/logo.png') {
          data.logo_url = null;
        }

        // Apply custom theme settings
        if (data.theme_settings) {
          data.theme_settings.backgroundColor = '#1c594e';
          data.theme_settings.secondaryColor = '#ffffff';
          data.theme_settings.primaryColor = '#1c594e';
        } else {
          data.theme_settings = {
            backgroundColor: '#1c594e',
            secondaryColor: '#ffffff',
            primaryColor: '#1c594e',
            fontFamily: 'Cairo',
            backgroundGradient: ''
          }
        }

        setStoreSettings(data);
      } else {
        // No data found, set default settings
        setStoreSettings({
          id: '00000000-0000-0000-0000-000000000001',
          store_name: 'شركة الريان للحلول التكنولوجية',
          store_description: 'متخصصون في توريد وتركيب الأبواب الأوتوماتيك والشيش الحصير والهاندريل وكبائن الحمامات للبنوك والشركات والمولات والمستشفيات والقرى السياحية والفلل',
          logo_url: null,
          meta_title: 'شركة الريان | الأبواب الأوتوماتيك والحلول التكنولوجية',
          meta_description: 'متخصصون في توريد وتركيب الأبواب الأوتوماتيك والشيش الحصير والهاندريل وكبائن الحمامات. أجود الخامات المعدنية ودهان إلكتروستاتيك مانع للصدأ.',
          show_testimonials: true,
          theme_settings: {
            primaryColor: '#1c594e',
            secondaryColor: '#ffffff',
            fontFamily: 'Cairo, sans-serif',
            backgroundColor: '#1c594e',
            backgroundGradient: ''
          }
        } as StoreSettings);
      }
    } catch (error) {
      console.error("Unexpected error fetching store settings:", error);
      // Set default settings on any unexpected error
      setStoreSettings({
        id: '00000000-0000-0000-0000-000000000001',
        store_name: 'شركة الريان للحلول التكنولوجية',
        store_description: 'متخصصون في توريد وتركيب الأبواب الأوتوماتيك والشيش الحصير والهاندريل وكبائن الحمامات للبنوك والشركات والمولات والمستشفيات والقرى السياحية والفلل',
        logo_url: null,
        meta_title: 'شركة الريان | الأبواب الأوتوماتيك والحلول التكنولوجية',
        meta_description: 'متخصصون في توريد وتركيب الأبواب الأوتوماتيك والشيش الحصير والهاندريل وكبائن الحمامات. أجود الخامات المعدنية ودهان إلكتروستاتيك مانع للصدأ.',
        show_testimonials: true,
        theme_settings: {
          primaryColor: '#1c594e',
          secondaryColor: '#ffffff',
          fontFamily: 'Cairo, sans-serif',
          backgroundColor: '#1c594e',
          backgroundGradient: ''
        }
      } as StoreSettings);
    }
  };

  interface LayoutProps {
    children: React.ReactNode;
    banners: Banner[];
  }

  const Layout = ({ children, banners: layoutBanners }: LayoutProps) => ( // Renamed banners prop to avoid conflict
    <div
      className="min-h-screen font-cairo" // Ensure font-cairo is defined in tailwind.config.js if used like this
      style={{
        background: (storeSettings && (storeSettings as any).theme_settings?.backgroundGradient)
          ? (storeSettings as any).theme_settings.backgroundGradient
          : (storeSettings && (storeSettings as any).theme_settings?.backgroundColor)
            ? (storeSettings as any).theme_settings.backgroundColor
            : "linear-gradient(135deg, #232526 0%, #414345 100%)", // Default fallback
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <RamadanLanterns />
      <Header />
      {window.location.pathname === '/' && layoutBanners.length > 0 && (
        <BannerSlider banners={layoutBanners} />
      )}
      <MainFade>{children}</MainFade>
      <Footer storeSettings={storeSettings} />
      <WhatsAppButton />
    </div>
  );

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <CartProvider>
          <Helmet>
            <title>{storeSettings?.meta_title || storeSettings?.store_name || 'شركة الريان | الأبواب الأوتوماتيك'}</title>
            <meta name="description" content={storeSettings?.meta_description || storeSettings?.store_description || 'متخصصون في توريد وتركيب الأبواب الأوتوماتيك والحلول التكنولوجية'} />
            {storeSettings?.keywords && storeSettings.keywords.length > 0 && (
              <meta name="keywords" content={storeSettings.keywords.join(', ')} />
            )}
            {storeSettings?.favicon_url && (
              <link rel="icon" href={storeSettings.favicon_url} />
            )}
            {storeSettings?.og_image_url && (
              <meta property="og:image" content={storeSettings.og_image_url} />
            )}
            <meta property="og:title" content={storeSettings?.meta_title || storeSettings?.store_name || ''} />
            <meta property="og:description" content={storeSettings?.meta_description || storeSettings?.store_description || ''} />
            <meta property="og:type" content="website" />
          </Helmet>
          <Router>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <PrivateRoute>
                  <AdminDashboard onSettingsUpdate={fetchStoreSettings} />
                </PrivateRoute>
              } />

              <Route path="/service/:id" element={
                <Layout banners={banners}>
                  <ServiceDetails />
                </Layout>
              } />
              <Route path="/product/:id" element={
                <Layout banners={banners}>
                  <ProductDetails />
                </Layout>
              } />
              <Route path="/category/:categoryId" element={
                <Layout banners={banners}>
                  <CategoryProducts />
                </Layout>
              } />
              <Route path="/" element={
                <Layout banners={banners}>
                  <StaggeredHome
                    storeSettings={storeSettings}
                  />
                </Layout>
              } />
            </Routes>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function StaggeredHome({
  storeSettings,
}: {
  storeSettings: StoreSettings | null;
}) {
  return (
    <>
      {/* Services component is part of the staggered load */}
      <Services />
      {/* You can add more home page sections here to stagger them if needed */}
      {storeSettings?.show_testimonials && (
        <Testimonials />
      )}
    </>
  );
}

function MainFade({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50); // Quick fade-in for content
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className="main-fade-content" // Added class for specific styling if needed
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 1200ms cubic-bezier(.4,0,.2,1), transform 700ms cubic-bezier(.4,0,.2,1)',
      }}
    >
      {children}
    </div>
  );
}

export default App;
