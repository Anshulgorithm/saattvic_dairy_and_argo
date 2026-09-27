import React from 'react';
import { useStore } from '../context/StoreContext';
import { QrCode, CreditCard, Banknote, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    settings,
    setIsAboutModalOpen,
    setIsContactModalOpen,
    setIsOrderTrackingOpen,
    setViewMode,
  } = useStore();

  return (
    <footer className="border-t border-stone-200 bg-[#f7f6f2] text-xs text-stone-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-200/80">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-base font-display font-semibold text-stone-900">
              {settings.storeName}
            </h3>
            <p className="text-stone-500 max-w-sm leading-relaxed">
              {settings.description}
            </p>
            <div className="text-[11px] text-stone-400 space-y-0.5">
              <p>{settings.storeAddress}</p>
              <p>Direct: {settings.contactPhone}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-2.5">
            <span className="font-semibold text-stone-900 block text-xs uppercase tracking-wider">
              Studio
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsAboutModalOpen(true)}
                  className="hover:text-stone-900 transition-colors text-stone-600 cursor-pointer"
                >
                  About Our Ethos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="hover:text-stone-900 transition-colors text-stone-600 cursor-pointer"
                >
                  Concierge & Care
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsOrderTrackingOpen(true)}
                  className="hover:text-stone-900 transition-colors text-stone-600 cursor-pointer"
                >
                  Live Order Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="md:col-span-3 space-y-2.5">
            <span className="font-semibold text-stone-900 block text-xs uppercase tracking-wider">
              Assurance & Policies
            </span>
            <ul className="space-y-1.5 text-stone-500">
              <li>Free shipping threshold: {settings.currencySymbol}{settings.freeShippingThreshold}</li>
              <li>Handcrafted 7-day studio returns</li>
              <li>Zero-plastic recyclable packaging</li>
              <li>256-bit encrypted checkout</li>
            </ul>
          </div>

          {/* Payment Badges & Merchant Portal */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-semibold text-stone-900 block text-xs uppercase tracking-wider">
              Accepted Checkout
            </span>
            <div className="flex flex-wrap gap-2 text-[11px] text-stone-700">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded">
                <QrCode className="w-3.5 h-3.5 text-stone-600" />
                <span>UPI / QR</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded">
                <Banknote className="w-3.5 h-3.5 text-stone-600" />
                <span>COD</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded">
                <CreditCard className="w-3.5 h-3.5 text-stone-600" />
                <span>Cards & NetBanking</span>
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setViewMode('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[11px] font-medium text-stone-800 hover:text-stone-950 underline cursor-pointer"
              >
                Owner / Merchant Dashboard Portal &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Encrypted Transactions · Verified Merchant Desk</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
