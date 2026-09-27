import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { ToastContainer } from './components/Toast';

const StorefrontApp: React.FC = () => {
  const { viewMode, isAdminUnlocked } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-stone-900">
      {viewMode === 'admin' && isAdminUnlocked ? (
        <AdminDashboard />
      ) : (
        <>
          <Navbar />
          <main className="flex-1">
            <Hero />
            <ProductGrid />
          </main>
          <Footer />
        </>
      )}

      {/* Global Overlays & Modals */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <OrderTrackingModal />
      <AboutModal />
      <ContactModal />
      <AdminLoginModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StorefrontApp />
    </StoreProvider>
  );
}
