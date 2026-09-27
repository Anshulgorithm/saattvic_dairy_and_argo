import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, Heart, SlidersHorizontal, Package, X } from 'lucide-react';
import { ProductCategory } from '../types';

export const Navbar: React.FC = () => {
  const {
    settings,
    cartCount,
    wishlist,
    setIsCartOpen,
    viewMode,
    setViewMode,
    requestAdminAccess,
    setIsOrderTrackingOpen,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setIsAboutModalOpen,
  } = useStore();

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleCategoryNav = (cat: ProductCategory) => {
    setViewMode('store');
    setSelectedCategory(cat);
    const grid = document.getElementById('catalog-section');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fafaf8]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      {settings.showAnnouncement && settings.announcementText && (
        <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 text-center font-normal tracking-wide">
          <span>{settings.announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            setViewMode('store');
            setSelectedCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-stone-900 hover:text-stone-700 transition-colors text-left"
        >
          {settings.storeName}
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => handleCategoryNav('All')}
            className="hover:text-stone-900 transition-colors cursor-pointer"
          >
            All Products
          </button>
          <button
            onClick={() => handleCategoryNav('Ghee & Dairy')}
            className="hover:text-stone-900 transition-colors cursor-pointer"
          >
            Ghee & Dairy
          </button>
          <button
            onClick={() => handleCategoryNav('Agro Produce')}
            className="hover:text-stone-900 transition-colors cursor-pointer"
          >
            Agro Produce
          </button>
          <button
            onClick={() => setIsOrderTrackingOpen(true)}
            className="hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer text-stone-500"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </button>
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="hover:text-stone-900 transition-colors cursor-pointer text-stone-500"
          >
            Our Story
          </button>
        </nav>

        {/* Zone 3: Primary interactive controls & cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative flex items-center">
            {isSearchExpanded ? (
              <div className="flex items-center bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 shadow-xs w-48 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setSearchQuery('');
                  }}
                  className="text-stone-400 hover:text-stone-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 text-stone-600 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100"
                aria-label="Open search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Wishlist indicator (subtle) */}
          {wishlist.length > 0 && (
            <div className="relative hidden sm:flex items-center">
              <span className="p-2 text-stone-600">
                <Heart className="w-4.5 h-4.5 fill-rose-500 text-rose-500" />
              </span>
              <span className="text-xs font-mono-nums text-stone-600 font-medium">
                {wishlist.length}
              </span>
            </div>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-4.5 h-4.5 text-stone-800" />
            <span className="hidden sm:inline text-xs font-semibold tracking-wide">Bag</span>
            <span className="font-mono-nums text-xs px-1.5 py-0.5 bg-stone-900 text-white rounded font-medium">
              {cartCount}
            </span>
          </button>

          {/* Mode Switcher: Merchant Admin / Storefront */}
          <button
            onClick={() => (viewMode === 'admin' ? setViewMode('store') : requestAdminAccess())}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors border ${
              viewMode === 'admin'
                ? 'bg-amber-600 border-amber-700 text-white shadow-xs'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap font-medium">
              {viewMode === 'admin' ? 'Storefront View' : 'Merchant Portal'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
