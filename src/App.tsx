import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSiteSettings } from './context/SettingsContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProductEnquirySection } from './components/enquiry/ProductEnquirySection';
import { ProductDetailsModal } from './components/products/ProductDetailsModal';
import { BrandedPageLoader } from './components/common/BrandedPageLoader';
import { FloatingWhatsAppButton } from './components/common/FloatingWhatsAppButton';
import { useScrollReveal } from './hooks/useScrollReveal';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductEditorPage } from './pages/admin/AdminProductEditorPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminHeroMediaPage } from './pages/admin/AdminHeroMediaPage';

// Data & Types
import { Product } from './types/product';
import { getPublishedProducts, subscribeToProducts } from './services/productService';

// Styles
import './styles/index.css';
import './styles/navigation.css';
import './styles/hero.css';
import './styles/products.css';
import './styles/quote-modal.css';
import './styles/admin.css';

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Wrapper for Admin Panel
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F7F4' }}>
        <p style={{ color: 'var(--color-primary-green-dark)', fontWeight: 600 }}>Verifying credentials...</p>
      </div>
    );
  }

  if (!user || !user.role || !['admin', 'superadmin', 'editor'].includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Main Public Layout Wrapper
const PublicLayout: React.FC<{
  children: React.ReactNode;
  products: Product[];
  selectedEnquiryProduct?: string;
  onOpenEnquiry: (prod?: Product) => void;
}> = ({ children, products, selectedEnquiryProduct, onOpenEnquiry }) => {
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';

  return (
    <>
      <Header onOpenQuoteModal={() => onOpenEnquiry()} />
      <main style={{ flex: 1 }}>{children}</main>
      {!isContactPage && (
        <ProductEnquirySection products={products} selectedProductId={selectedEnquiryProduct} />
      )}
      <Footer onOpenQuoteModal={() => onOpenEnquiry()} />
      <FloatingWhatsAppButton />
    </>
  );
};

export const AppContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedEnquiryProduct, setSelectedEnquiryProduct] = useState<string>('');
  const { handleCustomerCareWhatsApp } = useSiteSettings();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = () => {
      getPublishedProducts().then(prods => {
        if (isMounted) setProducts(prods);
      });
    };
    fetchProducts();
    const unsubscribe = subscribeToProducts(fetchProducts);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Agency-grade subtle scroll-reveal animations across all pages
  useScrollReveal();

  // 1-Click Direct WhatsApp Opening
  const handleDirectWhatsApp = (product?: Product) => {
    const target = product || (products.length > 0 ? products[0] : null);
    if (!target) return;
    handleCustomerCareWhatsApp(target);
  };

  // Smooth scroll to dedicated Product Enquiry section
  const handleScrollToEnquiry = (product?: Product) => {
    if (product) {
      setSelectedEnquiryProduct(product.id);
    }
    const el = document.getElementById('product-enquiry-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDetails = (product: Product) => {
    setDetailsProduct(product);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <BrandedPageLoader />
      <ScrollToTop />

      <Routes>
        {/* Public Website Routes */}
        <Route 
          path="/" 
          element={
            <PublicLayout 
              products={products} 
              selectedEnquiryProduct={selectedEnquiryProduct}
              onOpenEnquiry={handleScrollToEnquiry}
            >
              <HomePage 
                onOpenQuote={handleDirectWhatsApp} 
                onOpenDetails={handleOpenDetails} 
              />
            </PublicLayout>
          } 
        />
        <Route 
          path="/about" 
          element={
            <PublicLayout 
              products={products} 
              selectedEnquiryProduct={selectedEnquiryProduct}
              onOpenEnquiry={handleScrollToEnquiry}
            >
              <AboutPage onOpenQuote={() => handleScrollToEnquiry()} />
            </PublicLayout>
          } 
        />
        <Route 
          path="/products" 
          element={
            <PublicLayout 
              products={products} 
              selectedEnquiryProduct={selectedEnquiryProduct}
              onOpenEnquiry={handleScrollToEnquiry}
            >
              <ProductsPage 
                onOpenQuote={handleDirectWhatsApp} 
                onOpenDetails={handleOpenDetails} 
              />
            </PublicLayout>
          } 
        />
        <Route 
          path="/products/:id" 
          element={
            <PublicLayout 
              products={products} 
              selectedEnquiryProduct={selectedEnquiryProduct}
              onOpenEnquiry={handleScrollToEnquiry}
            >
              <ProductDetailPage onOpenQuote={handleDirectWhatsApp} />
            </PublicLayout>
          } 
        />
        <Route 
          path="/gallery" 
          element={
            <PublicLayout 
              products={products} 
              selectedEnquiryProduct={selectedEnquiryProduct}
              onOpenEnquiry={handleScrollToEnquiry}
            >
              <GalleryPage />
            </PublicLayout>
          } 
        />
        <Route 
          path="/contact" 
          element={
            <PublicLayout 
              products={products} 
              selectedEnquiryProduct={selectedEnquiryProduct}
              onOpenEnquiry={handleScrollToEnquiry}
            >
              <ContactPage onOpenQuote={() => handleScrollToEnquiry()} />
            </PublicLayout>
          } 
        />

        {/* Admin Authentication & Protected Dashboard Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/products" 
          element={
            <ProtectedAdminRoute>
              <AdminProductsPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/products/new" 
          element={
            <ProtectedAdminRoute>
              <AdminProductEditorPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/products/edit/:id" 
          element={
            <ProtectedAdminRoute>
              <AdminProductEditorPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/gallery" 
          element={
            <ProtectedAdminRoute>
              <AdminGalleryPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/enquiries" 
          element={
            <ProtectedAdminRoute>
              <AdminEnquiriesPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedAdminRoute>
              <AdminSettingsPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/hero-media" 
          element={
            <ProtectedAdminRoute>
              <AdminHeroMediaPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/hero" 
          element={<Navigate to="/admin/hero-media" replace />} 
        />

        {/* 404 Fallback */}
        <Route 
          path="*" 
          element={
            <PublicLayout 
              products={products} 
              selectedEnquiryProduct={selectedEnquiryProduct}
              onOpenEnquiry={handleScrollToEnquiry}
            >
              <NotFoundPage />
            </PublicLayout>
          } 
        />
      </Routes>

      {/* Product Technical Details Modal */}
      <ProductDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={detailsProduct}
        onOpenQuote={handleDirectWhatsApp}
      />
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
