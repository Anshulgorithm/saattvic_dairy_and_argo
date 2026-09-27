import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    formatPrice,
    settings,
    setIsCheckoutOpen,
    showToast,
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'STUDIO10' || promoCode.trim().toUpperCase() === 'WELCOME10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setAppliedDiscount(discount);
      showToast(`Promo "${promoCode.toUpperCase()}" applied! 10% off.`, 'success');
    } else {
      showToast('Invalid promo code. Try "STUDIO10"', 'warning');
    }
  };

  const handleProceedCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-[#fafaf8]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-stone-800" />
              <h2 className="text-base font-semibold text-stone-900">Your Shopping Bag</h2>
              <span className="font-mono-nums text-xs text-stone-500">
                ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Gauge */}
          <div className="px-6 py-3 bg-stone-50 border-b border-stone-200/80">
            <div className="flex justify-between text-xs text-stone-700 mb-1.5 font-medium">
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="font-mono-nums">{formatPrice(remainingForFreeShipping)}</strong> for free studio dispatch
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Qualified for complimentary studio delivery!
                </span>
              )}
              <span className="font-mono-nums text-stone-400">{Math.round(freeShippingPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-900 transition-all duration-300"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-stone-300 mb-3 stroke-[1.5]" />
                <p className="text-sm font-semibold text-stone-800 mb-1">Your bag is empty</p>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Explore our handcrafted studio pieces and find something durable for your space.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 pb-4 border-b border-stone-100 last:border-0"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-18 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] font-mono-nums text-stone-400">
                        SKU: {item.product.sku}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-stone-200 rounded bg-stone-50 text-xs">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-stone-900"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono-nums font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-0.5 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="font-mono-nums text-xs font-semibold text-stone-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer calculation & CTA */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-[#fafaf8] space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (try STUDIO10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 uppercase focus:outline-none focus:border-stone-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-medium text-stone-700 transition-colors"
                >
                  Apply
                </button>
              </form>

              {/* Subtotal breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-mono-nums font-medium text-stone-900">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount (10%)</span>
                    <span className="font-mono-nums">-{formatPrice(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-mono-nums">
                    {cartSubtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-700 font-medium">FREE</span>
                    ) : (
                      formatPrice(settings.standardShippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Due</span>
                  <span className="font-mono-nums text-base">
                    {formatPrice(
                      cartSubtotal -
                        appliedDiscount +
                        (cartSubtotal >= freeShippingThreshold ? 0 : settings.standardShippingFee)
                    )}
                  </span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={handleProceedCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium transition-colors shadow-xs group cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
