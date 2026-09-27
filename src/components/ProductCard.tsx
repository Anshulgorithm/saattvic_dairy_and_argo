import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    formatPrice,
    addToCart,
    setSelectedProduct,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isSoldOut = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isWishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group flex flex-col bg-white rounded-xl border border-stone-200/90 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    >
      {/* Product Image Slot - 4:3 Aspect, 65-75% visual weight */}
      <div className="relative aspect-4/3 bg-[#f6f5f1] overflow-hidden">
        {!imageError && product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103 ${
              isSoldOut ? 'opacity-50 grayscale' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-stone-100 text-stone-400">
            <span className="text-xs uppercase font-medium tracking-wider mb-1 text-stone-500">
              {product.category}
            </span>
            <span className="text-sm font-medium text-stone-600 text-center px-2 line-clamp-2">
              {product.name}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition-colors ${
            isWishlisted
              ? 'bg-white text-rose-500 shadow-xs'
              : 'bg-white/80 text-stone-500 hover:text-stone-900 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Subtle status text banner if low stock or sold out */}
        {isSoldOut ? (
          <div className="absolute bottom-2.5 left-2.5 bg-stone-900/90 text-white text-[11px] font-medium px-2 py-0.5 rounded">
            Sold Out
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-2.5 left-2.5 bg-amber-800/90 text-white text-[11px] font-medium px-2 py-0.5 rounded">
            Only {product.stock} remaining
          </div>
        ) : null}
      </div>

      {/* Product Content & Pricing */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Metadata line: unboxed category & SKU */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-1">
            <span className="truncate">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-nums text-[11px] text-stone-600">{product.sku}</span>
          </div>

          <h3 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-stone-700 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-stone-100">
          <div className="flex items-baseline gap-2">
            <span className="font-mono-nums text-base font-semibold text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-mono-nums text-xs text-stone-600 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            aria-label={`Add ${product.name} to shopping bag`}
            className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
              isSoldOut
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {justAdded ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
