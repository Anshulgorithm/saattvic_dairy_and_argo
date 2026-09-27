import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Star, Check, Shield, Truck, RotateCcw, Heart, ShoppingBag, Zap } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    formatPrice,
    addToCart,
    setIsCartOpen,
    setIsCheckoutOpen,
    isInWishlist,
    toggleWishlist,
    showToast,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittedReviews, setSubmittedReviews] = useState<{ author: string; rating: number; text: string; date: string }[]>([]);

  if (!selectedProduct) return null;

  const isSoldOut = selectedProduct.stock <= 0;
  const isLowStock = selectedProduct.stock > 0 && selectedProduct.stock <= selectedProduct.lowStockThreshold;
  const isWishlisted = isInWishlist(selectedProduct.id);

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(selectedProduct, quantity);
  };

  const handleInstantBuy = () => {
    if (isSoldOut) return;
    addToCart(selectedProduct, quantity);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !newReviewAuthor.trim()) return;

    setSubmittedReviews([
      {
        author: newReviewAuthor,
        rating: newReviewRating,
        text: newReviewText,
        date: 'Just now',
      },
      ...submittedReviews,
    ]);
    setNewReviewText('');
    setNewReviewAuthor('');
    showToast('Thank you! Your review has been added.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#fafaf8]">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{selectedProduct.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-nums">{selectedProduct.sku}</span>
          </div>
          <button
            onClick={() => setSelectedProduct(null)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Gallery Column */}
            <div className="md:col-span-6 flex flex-col gap-3">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60">
                <img
                  src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                {isSoldOut && (
                  <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                    <span className="text-white font-medium px-4 py-1.5 bg-stone-900/90 rounded-md text-sm">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-stone-900 shadow-xs' : 'border-stone-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Artisan Commitments */}
              <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-stone-700 shrink-0" />
                  <span>Genuine craft guarantee with studio inspection badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-stone-700 shrink-0" />
                  <span>Secure express courier packaging with tracked delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-stone-700 shrink-0" />
                  <span>7-day return window for unworn and pristine goods</span>
                </div>
              </div>
            </div>

            {/* Contiguous Purchase Module */}
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                {/* Rating line */}
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(selectedProduct.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-stone-800">{selectedProduct.rating}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedProduct.reviewsCount} collector reviews</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-display font-semibold text-stone-900 leading-snug mb-3">
                  {selectedProduct.name}
                </h1>

                {/* Price and Stock status */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono-nums text-2xl font-bold text-stone-900">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="font-mono-nums text-sm text-stone-400 line-through">
                      {formatPrice(selectedProduct.originalPrice)}
                    </span>
                  )}

                  {isSoldOut ? (
                    <span className="text-xs font-medium text-rose-600 ml-auto">
                      Currently Unavailable
                    </span>
                  ) : isLowStock ? (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 ml-auto">
                      Low Stock: {selectedProduct.stock} left
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-auto">
                      In Stock ({selectedProduct.stock} units)
                    </span>
                  )}
                </div>

                <p className="text-sm text-stone-600 leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>

                {/* Specifications List */}
                <div className="space-y-2 mb-6 text-xs text-stone-600 border-t border-b border-stone-100 py-3">
                  {selectedProduct.material && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Material:</span>
                      <span className="font-medium text-stone-800">{selectedProduct.material}</span>
                    </div>
                  )}
                  {selectedProduct.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Dimensions:</span>
                      <span className="font-medium text-stone-800">{selectedProduct.dimensions}</span>
                    </div>
                  )}
                  {selectedProduct.details?.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-stone-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Action Buttons */}
              <div className="pt-2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isSoldOut}
                      className="px-3 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 text-sm font-semibold"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-mono-nums font-semibold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      disabled={quantity >= selectedProduct.stock || isSoldOut}
                      className="px-3 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 text-sm font-semibold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white border border-stone-800 text-stone-900 text-sm font-medium hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </button>

                  {/* Wishlist toggle */}
                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      isWishlisted
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-stone-200 text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Instant Buy / Checkout */}
                <button
                  onClick={handleInstantBuy}
                  disabled={isSoldOut}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Instant Checkout · {formatPrice(selectedProduct.price * quantity)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-12 pt-8 border-t border-stone-200">
            <h3 className="text-base font-semibold text-stone-900 mb-4">
              Community Reviews & Impressions
            </h3>

            {/* Existing sample reviews */}
            <div className="space-y-4 mb-6">
              {submittedReviews.map((rev, i) => (
                <div key={i} className="p-4 rounded-lg bg-stone-50 border border-stone-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-stone-900">{rev.author}</span>
                    <span className="text-[11px] text-stone-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-amber-500 mb-2">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3 h-3 ${idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-stone-700">{rev.text}</p>
                </div>
              ))}

              <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-stone-900">Ananya Krishnan</span>
                  <span className="text-[11px] text-stone-400">September 18, 2026</span>
                </div>
                <div className="flex items-center text-amber-500 mb-2">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-700">
                  Exceptional craftsmanship and tactile feel. Packaged securely with zero plastic. Highly recommend this studio piece!
                </p>
              </div>
            </div>

            {/* Write a review form */}
            <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="text-xs font-semibold text-stone-800 block mb-2">
                Share your impression of this piece
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                  required
                />
                <div className="flex items-center gap-2 text-xs text-stone-600 bg-white border border-stone-200 rounded-lg px-3 py-1.5">
                  <span>Rating:</span>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="bg-transparent font-medium focus:outline-none"
                  >
                    <option value={5}>5 Stars (Exceptional)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                  </select>
                </div>
              </div>
              <textarea
                placeholder="Write your comments regarding material quality, finish, or daily utility..."
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                rows={2}
                className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400 mb-3"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
