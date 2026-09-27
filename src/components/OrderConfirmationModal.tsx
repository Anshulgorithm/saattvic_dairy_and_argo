import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Package, Printer, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const {
    confirmedOrder,
    setConfirmedOrder,
    formatPrice,
    setIsOrderTrackingOpen,
    setTrackingOrderNumber,
  } = useStore();

  if (!confirmedOrder) return null;

  const handleTrackShipment = () => {
    const orderNum = confirmedOrder.orderNumber;
    setConfirmedOrder(null);
    setTrackingOrderNumber(orderNum);
    setIsOrderTrackingOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#fafaf8] p-6 text-center border-b border-stone-200 relative">
          <button
            onClick={() => setConfirmedOrder(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors print:hidden"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>

          <h2 className="text-xl font-display font-semibold text-stone-900 mb-1">
            Order Confirmed & Allocated
          </h2>
          <p className="text-xs text-stone-500">
            Order Reference: <strong className="font-mono-nums text-stone-900">{confirmedOrder.orderNumber}</strong>
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5 text-xs text-stone-700 overflow-y-auto max-h-[60vh]">
          {/* Dispatch Notice */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
            <Package className="w-5 h-5 text-stone-700 shrink-0" />
            <div>
              <p className="font-semibold text-stone-900">Studio Packaging in Progress</p>
              <p className="text-stone-500 text-[11px]">
                Estimated delivery date: {confirmedOrder.estimatedDelivery || '3-4 business days'}
              </p>
            </div>
          </div>

          {/* Delivery & Payment details */}
          <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                Recipient & Address
              </span>
              <p className="font-semibold text-stone-900">{confirmedOrder.customer.fullName}</p>
              <p className="text-stone-600">{confirmedOrder.customer.addressLine1}</p>
              <p className="text-stone-600">
                {confirmedOrder.customer.city}, {confirmedOrder.customer.state} - {confirmedOrder.customer.postalCode}
              </p>
              <p className="text-stone-500 font-mono-nums mt-1">{confirmedOrder.customer.phone}</p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
                Payment Method
              </span>
              <p className="font-semibold text-stone-900 uppercase">
                {confirmedOrder.paymentMethod === 'upi_qr'
                  ? 'UPI / QR Code Scan'
                  : confirmedOrder.paymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : 'Credit / Debit Card'}
              </p>
              {confirmedOrder.upiTransactionRef && (
                <p className="text-stone-500 font-mono-nums text-[11px]">
                  Ref: {confirmedOrder.upiTransactionRef}
                </p>
              )}
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: {confirmedOrder.paymentStatus}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-2">
              Purchased Studio Articles
            </span>
            <div className="space-y-2">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-nums text-stone-400">×{item.quantity}</span>
                    <span className="font-medium text-stone-900">{item.name}</span>
                  </div>
                  <span className="font-mono-nums font-semibold text-stone-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal</span>
              <span className="font-mono-nums">{formatPrice(confirmedOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Shipping</span>
              <span className="font-mono-nums">
                {confirmedOrder.shippingFee === 0 ? 'FREE' : formatPrice(confirmedOrder.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Paid</span>
              <span className="font-mono-nums text-base">{formatPrice(confirmedOrder.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-6 border-t border-stone-200 bg-[#fafaf8] flex flex-col sm:flex-row gap-3 print:hidden">
          <button
            onClick={handleTrackShipment}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
          >
            <span>Track Live Shipment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-stone-300 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
