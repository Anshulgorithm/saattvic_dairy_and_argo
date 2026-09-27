import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Search, CheckCircle2, Clock, Truck, Package, ArrowRight } from 'lucide-react';
import { OrderStatus } from '../types';

export const OrderTrackingModal: React.FC = () => {
  const {
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    orders,
    trackingOrderNumber,
    setTrackingOrderNumber,
    formatPrice,
  } = useStore();

  const [inputVal, setInputVal] = useState(trackingOrderNumber || '');
  const [searchedId, setSearchedId] = useState(trackingOrderNumber || '');

  if (!isOrderTrackingOpen) return null;

  const currentOrder = orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === searchedId.trim().toLowerCase() ||
      o.id.toLowerCase() === searchedId.trim().toLowerCase() ||
      o.customer.phone.replace(/[\s+-]/g, '') === searchedId.trim().replace(/[\s+-]/g, '')
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedId(inputVal);
  };

  const STEPS: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Order Received', desc: 'Payment details captured' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Inventory allocated' },
    { key: 'processing', label: 'Assembly & Pack', desc: 'Quality checked' },
    { key: 'shipped', label: 'Dispatched', desc: 'Handed to courier' },
    { key: 'delivered', label: 'Delivered', desc: 'Safely arrived' },
  ];

  const getStepStatus = (stepKey: OrderStatus, orderStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(orderStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (orderStatus === 'cancelled') return 'cancelled';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#fafaf8]">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-stone-700" />
            <h2 className="text-base font-semibold text-stone-900">Track Studio Shipment</h2>
          </div>
          <button
            onClick={() => setIsOrderTrackingOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Enter Order # (e.g. SDA-8842) or Phone Number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-500 font-mono-nums"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shrink-0"
            >
              Lookup Order
            </button>
          </form>

          {/* Quick suggestions if not found */}
          {!currentOrder && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs">
              <span className="font-semibold text-stone-800 block mb-2">
                Recent Orders you can preview:
              </span>
              <div className="flex flex-wrap gap-2">
                {orders.slice(0, 3).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setInputVal(o.orderNumber);
                      setSearchedId(o.orderNumber);
                    }}
                    className="px-2.5 py-1 bg-white border border-stone-200 rounded text-stone-700 hover:border-stone-400 font-mono-nums flex items-center gap-1"
                  >
                    <span>{o.orderNumber}</span>
                    <span className="text-stone-400">({o.status})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Details View */}
          {currentOrder && (
            <div className="space-y-6">
              {/* Order summary bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono-nums text-stone-900">
                      {currentOrder.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        currentOrder.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : currentOrder.status === 'shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {currentOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <p className="font-medium text-stone-900">
                    Carrier: {currentOrder.trackingCarrier || 'Studio Express Courier'}
                  </p>
                  <p className="text-stone-500 font-mono-nums text-[11px]">
                    AWB: {currentOrder.trackingNumber || 'Pending pickup'}
                  </p>
                </div>
              </div>

              {/* Visual Step Timeline */}
              <div className="py-2">
                <div className="grid grid-cols-5 gap-1 relative">
                  {/* Connecting bar */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0" />

                  {STEPS.map((step, idx) => {
                    const state = getStepStatus(step.key, currentOrder.status);
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-all ${
                            state === 'completed'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : state === 'current'
                              ? 'bg-stone-900 text-white ring-4 ring-stone-100'
                              : 'bg-white border border-stone-300 text-stone-400'
                          }`}
                        >
                          {state === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            state === 'current'
                              ? 'text-stone-900'
                              : state === 'completed'
                              ? 'text-emerald-700'
                              : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-stone-500 hidden sm:block mt-0.5">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Activity Log */}
              <div>
                <h4 className="text-xs font-semibold text-stone-900 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Activity Log & Checkpoints</span>
                </h4>
                <div className="space-y-3 pl-2 border-l-2 border-stone-200 ml-2">
                  {currentOrder.timeline.map((entry, idx) => (
                    <div key={idx} className="relative pl-4">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-stone-400 border-2 border-white" />
                      <p className="text-xs font-medium text-stone-800">{entry.note}</p>
                      <span className="text-[10px] text-stone-400 font-mono-nums">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in shipment */}
              <div className="border-t border-stone-200 pt-4">
                <h4 className="text-xs font-semibold text-stone-900 mb-2">Articles in this parcel</h4>
                <div className="space-y-2">
                  {currentOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-nums text-stone-400">×{item.quantity}</span>
                        <span className="text-stone-800 font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono-nums font-semibold text-stone-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
