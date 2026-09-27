import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Award, Sparkles, Compass } from 'lucide-react';

export const AboutModal: React.FC = () => {
  const { isAboutModalOpen, setIsAboutModalOpen, settings } = useStore();

  if (!isAboutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#fafaf8]">
          <h2 className="text-base font-semibold text-stone-900">About {settings.storeName}</h2>
          <button
            onClick={() => setIsAboutModalOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-stone-600 leading-relaxed">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Our Story
            </span>
            <h3 className="text-xl font-display font-semibold text-stone-900 leading-snug mb-3">
              Pure Bilona ghee, made the way our grandmothers made it.
            </h3>
            <p>
              {settings.storeName} works directly with farming families in the hills of Chamba, Himachal Pradesh, who still follow the traditional Bilona method: curd is hand-churned in a wooden bilona, and the butter is slow-cooked over a wood fire until it turns into golden, grainy ghee. No shortcuts, no cream separators, no additives — just patience and technique passed down over generations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <Award className="w-5 h-5 text-stone-800 mb-2" />
              <h4 className="font-semibold text-stone-900 text-xs mb-1">Traditional Bilona Method</h4>
              <p className="text-[11px] text-stone-500">
                Curd-churned, not cream-separated, for authentic taste, texture, and aroma.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <Sparkles className="w-5 h-5 text-stone-800 mb-2" />
              <h4 className="font-semibold text-stone-900 text-xs mb-1">A2 Cow Milk</h4>
              <p className="text-[11px] text-stone-500">
                Sourced from grass-fed indigenous cows reared by local families in the hills.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <Compass className="w-5 h-5 text-stone-800 mb-2" />
              <h4 className="font-semibold text-stone-900 text-xs mb-1">From the Hills of Chamba</h4>
              <p className="text-[11px] text-stone-500">
                Small batches, made close to the source and shipped fresh across India.
              </p>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4">
            <h4 className="font-semibold text-stone-900 mb-1">Our Farm & Dispatch Centre</h4>
            <p className="text-stone-500">{settings.storeAddress}</p>
            <p className="text-stone-500 mt-1">Inquiries: {settings.contactEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
