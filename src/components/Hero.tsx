import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, ShieldCheck, QrCode, Truck } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setSelectedCategory, settings } = useStore();

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative border-b border-stone-200 bg-[#f7f6f2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text and campaign message */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-3 tracking-wide">
              <span>From the Hills of Chamba</span>
              <span aria-hidden="true">·</span>
              <span>Traditional Bilona Method</span>
              <span aria-hidden="true">·</span>
              <span>Small Batches</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-stone-900 leading-tight mb-4 text-balance">
              Pure A2 cow ghee, made with tradition, made for wellness.
            </h1>

            <p className="text-base text-stone-600 leading-relaxed max-w-xl mb-8">
              Hand-churned using the age-old Bilona method by families in the hills of Chamba, Himachal Pradesh. No preservatives, no shortcuts — just curd, a wooden churner, and generations of practice.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToCatalog}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs cursor-pointer group"
              >
                <span>Shop Ghee</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('Ghee & Dairy');
                  scrollToCatalog();
                }}
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Ghee & Dairy
              </button>
            </div>

            {/* Adjacent Trust Proof - 3 columns, clean typography */}
            <div className="mt-10 pt-6 border-t border-stone-200/80 grid grid-cols-3 gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-0.5">
                  <QrCode className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span>Instant UPI / QR</span>
                </div>
                <span className="text-[11px] text-stone-500">Scan & pay or COD option</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-0.5">
                  <Truck className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span>Dispatched in 24h</span>
                </div>
                <span className="text-[11px] text-stone-500">Free above {settings.currencySymbol}{settings.freeShippingThreshold}</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span>Direct Guarantee</span>
                </div>
                <span className="text-[11px] text-stone-500">Lifetime artisan support</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Asset */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden aspect-16/10 shadow-sm border border-stone-200/60 bg-stone-100">
              <img
                src="/images/product_bilona_ghee_jars_group.jpg"
                alt="Jars of traditional Bilona cow ghee from Saatvic Dairy and Agro"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-102"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="text-xs font-medium tracking-wider text-stone-200 uppercase">Featured Batch</p>
                  <p className="text-lg font-display font-medium text-white">Traditional Bilona Cow Ghee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
