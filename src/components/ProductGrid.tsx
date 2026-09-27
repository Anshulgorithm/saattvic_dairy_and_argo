import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ProductCategory } from '../types';
import { ArrowUpDown, Check, X } from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'All',
  'Ghee & Dairy',
  'Honey & Naturals',
  'Cold-Pressed Oils',
  'Agro Produce',
  'Farm Essentials',
];

export const ProductGrid: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterInStockOnly,
    setFilterInStockOnly,
  } = useStore();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      // In-stock filter
      if (filterInStockOnly && p.stock <= 0) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchSku && !matchTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: featured first, then newest
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, filterInStockOnly, searchQuery, sortBy]);

  return (
    <section id="catalog-section" className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-medium text-stone-500 tracking-wide mb-1">
            Studio Inventory · Direct Fulfillment
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 tracking-tight">
            Curated Collection
          </h2>
        </div>

        {/* Search status / Clear tag */}
        {searchQuery && (
          <div className="flex items-center gap-2 text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-md border border-stone-200">
            <span>Showing results for &ldquo;{searchQuery}&rdquo;</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-stone-400 hover:text-stone-800 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        {/* Category Segmented Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary controls: In stock toggle & Sort */}
        <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
          {/* In-stock toggle */}
          <button
            onClick={() => setFilterInStockOnly(!filterInStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              filterInStockOnly
                ? 'bg-stone-100 border-stone-300 text-stone-900'
                : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                filterInStockOnly ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300'
              }`}
            >
              {filterInStockOnly && <Check className="w-2.5 h-2.5" />}
            </div>
            <span>In Stock Only</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 mr-1" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-stone-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Works</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Product Cards */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pt-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <p className="text-base font-medium text-stone-800 mb-1">No products match your criteria</p>
          <p className="text-xs text-stone-500 mb-4 max-w-sm">
            Try adjusting your search query, clearing categories, or toggling off stock filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setFilterInStockOnly(false);
            }}
            className="px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
};
