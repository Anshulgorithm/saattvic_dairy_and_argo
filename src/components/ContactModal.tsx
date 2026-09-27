import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export const ContactModal: React.FC = () => {
  const { isContactModalOpen, setIsContactModalOpen, settings, showToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isContactModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitted(true);
    showToast('Your message has been sent to our concierge desk.', 'success');
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setMessage('');
      setIsContactModalOpen(false);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#fafaf8]">
          <h2 className="text-base font-semibold text-stone-900">Studio Concierge & Support</h2>
          <button
            onClick={() => setIsContactModalOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-stone-600">
          {/* Contact Direct Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2">
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block text-[11px]">Email</span>
                <span className="text-[11px] text-stone-600 break-all">{settings.contactEmail}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block text-[11px]">Direct Phone</span>
                <span className="text-[11px] text-stone-600">{settings.contactPhone}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block text-[11px]">Studio</span>
                <span className="text-[11px] text-stone-600 line-clamp-2">{settings.storeAddress}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-stone-100 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-800 font-medium mb-1">Your Name *</label>
                <input
                  type="text"
                  placeholder="Aarav Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="aarav@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Inquiry Topic</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none font-medium"
              >
                <option value="Order inquiry">Order Tracking or Status Inquiry</option>
                <option value="Custom commission">Custom Studio Piece / Commission</option>
                <option value="Wholesale / Hospitality">Wholesale & Hospitality Procurement</option>
                <option value="General inquiry">General Feedback & Suggestions</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Message *</label>
              <textarea
                rows={3}
                placeholder="How can our concierge assist you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitted}
              className="w-full py-2.5 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Message Sent Successfully</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Concierge Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
