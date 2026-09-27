import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethodType, CustomerDetails } from '../types';
import { X, QrCode, CreditCard, Banknote, ShieldCheck, Copy, Check, Lock, Loader2 } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    settings,
    formatPrice,
    createOrder,
    showToast,
  } = useStore();

  // Customer shipping info
  const [formData, setFormData] = useState<CustomerDetails>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    deliveryNotes: '',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi_qr');
  const [upiRef, setUpiRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card state (for Gateway)
  const [cardInfo, setCardInfo] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  if (!isCheckoutOpen) return null;

  const shippingFee = cartSubtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
  const totalAmount = cartSubtotal + shippingFee;

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    showToast('UPI ID copied to clipboard.', 'info');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      showToast('Please complete all required shipping fields.', 'warning');
      return;
    }

    if (paymentMethod === 'upi_qr' && !upiRef.trim()) {
      showToast('Please enter your 12-digit UPI Reference / UTR Number.', 'warning');
      return;
    }

    if (paymentMethod === 'card') {
      if (cardInfo.number.replace(/\s/g, '').length < 16 || !cardInfo.expiry || cardInfo.cvv.length < 3) {
        showToast('Please provide valid card payment details.', 'warning');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate gateway verification
    setTimeout(() => {
      setIsProcessing(false);
      createOrder({
        customer: formData,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        upiTransactionRef: paymentMethod === 'upi_qr' ? upiRef : undefined,
      });
    }, 1200);
  };

  // UPI deep link
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.upiName)}&am=${totalAmount}&cu=INR&tn=Order%20Payment`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#fafaf8]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-700" />
            <h2 className="text-base font-semibold text-stone-900">Secure Studio Checkout</h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto flex-1 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Customer and Shipping Info */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-3 flex items-center justify-between">
                  <span>1. Contact & Delivery Address</span>
                  <span className="text-[11px] font-normal text-stone-400">* Required fields</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 mb-1 font-medium">Full Recipient Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">Email Address (for Receipt) *</label>
                    <input
                      type="email"
                      placeholder="priya@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">Phone Number (Courier Contact) *</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 mb-1 font-medium">Street Address & Apartment *</label>
                    <input
                      type="text"
                      placeholder="House/Apartment #, Building name, Street"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">City *</label>
                    <input
                      type="text"
                      placeholder="Bengaluru"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">State / Region *</label>
                    <input
                      type="text"
                      placeholder="Karnataka"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">Postal / PIN Code *</label>
                    <input
                      type="text"
                      placeholder="560038"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      required
                      className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600 font-mono-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery instructions */}
              <div className="text-xs">
                <label className="block text-stone-600 mb-1 font-medium">Delivery Notes / Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security guard or call upon arrival"
                  value={formData.deliveryNotes || ''}
                  onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
                />
              </div>

              {/* Payment Methods Selection */}
              <div>
                <h3 className="text-sm font-semibold text-stone-900 mb-3">
                  2. Choose Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {/* UPI QR Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_qr')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'upi_qr'
                        ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-stone-800 mb-1.5" />
                    <span className="text-xs font-semibold text-stone-900">UPI / QR Code</span>
                    <span className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</span>
                  </button>

                  {/* Cash on Delivery */}
                  {settings.enableCod && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-stone-800 mb-1.5" />
                      <span className="text-xs font-semibold text-stone-900">Cash on Delivery</span>
                      <span className="text-[10px] text-stone-500">Pay on doorstep</span>
                    </button>
                  )}

                  {/* Payment Gateway */}
                  {settings.enableCardGateway && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-stone-800 mb-1.5" />
                      <span className="text-xs font-semibold text-stone-900">Card & Gateway</span>
                      <span className="text-[10px] text-stone-500">Visa, RuPay, MC</span>
                    </button>
                  )}
                </div>

                {/* Sub-view: UPI QR Details */}
                {paymentMethod === 'upi_qr' && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      {/* QR Code preview */}
                      <div className="w-36 h-36 bg-white p-2 rounded-lg border border-stone-300 shadow-xs shrink-0 flex items-center justify-center">
                        <img
                          src={settings.upiQrImage}
                          alt="Merchant UPI QR Code"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Instructions */}
                      <div className="text-xs space-y-2 flex-1">
                        <div className="font-semibold text-stone-900">
                          Scan to pay using any UPI App
                        </div>
                        <p className="text-stone-600 leading-relaxed">
                          Open Google Pay, PhonePe, Paytm, or BHIM. Scan the merchant QR code or transfer directly to our registered studio ID.
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="bg-white border border-stone-300 font-mono-nums px-2.5 py-1 rounded text-stone-900 font-medium">
                            {settings.upiId}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="p-1.5 text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={upiDeepLink}
                            className="text-[11px] font-medium text-stone-800 underline hover:text-stone-950 ml-1"
                          >
                            Open App Link
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Reference / UTR Number Input */}
                    <div className="pt-2 border-t border-stone-200">
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        UPI Transaction ID / 12-Digit UTR Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 428901829471 (from payment confirmation screen)"
                        value={upiRef}
                        onChange={(e) => setUpiRef(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 font-mono-nums focus:outline-none focus:border-stone-600"
                        required={paymentMethod === 'upi_qr'}
                      />
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        Our merchant desk automatically validates this reference before dispatch.
                      </span>
                    </div>
                  </div>
                )}

                {/* Sub-view: COD */}
                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Cash on Delivery Verified</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      You can pay via cash or UPI directly to the courier executive upon physical inspection of the package.
                    </p>
                  </div>
                )}

                {/* Sub-view: Major Payment Gateway (Card simulation) */}
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">Direct Gateway Payment</span>
                      <span className="text-[10px] text-stone-500 font-mono">256-BIT SSL ENCRYPTED</span>
                    </div>

                    <div>
                      <label className="block text-stone-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 ···· ···· 8820"
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 font-mono-nums focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-600 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardInfo.expiry}
                          onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 font-mono-nums focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardInfo.cvv}
                          onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 font-mono-nums focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="bg-[#fafaf8] p-5 rounded-xl border border-stone-200 space-y-4">
                <h3 className="text-sm font-semibold text-stone-900 border-b border-stone-200 pb-3">
                  Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                </h3>

                {/* Items preview */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 text-xs">
                      <div className="w-12 h-12 rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 truncate">{item.product.name}</p>
                        <p className="text-stone-500 font-mono-nums text-[11px]">
                          Qty: {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <span className="font-mono-nums font-semibold text-stone-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Totals */}
                <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono-nums text-stone-900 font-medium">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Studio Shipping</span>
                    <span className="font-mono-nums">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 font-medium">FREE</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total Payable</span>
                    <span className="font-mono-nums">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>Backed by our 100% material & safe arrival promise.</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isProcessing || cart.length === 0}
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating & Confirming Order...</span>
                    </>
                  ) : (
                    <span>Confirm Order · {formatPrice(totalAmount)}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
