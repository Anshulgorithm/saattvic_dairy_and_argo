import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginOpen, setIsAdminLoginOpen, unlockAdmin } = useStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isAdminLoginOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockAdmin(password);
    if (!success) {
      setError(true);
      setPassword('');
    } else {
      setError(false);
      setPassword('');
    }
  };

  const handleClose = () => {
    setIsAdminLoginOpen(false);
    setPassword('');
    setError(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#fafaf8]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-700" />
            <h2 className="text-base font-semibold text-stone-900">Merchant Portal</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-stone-500 leading-relaxed">
            This area is for the store owner only. Enter the admin password to manage products, orders, and settings.
          </p>

          <div>
            <label className="block text-xs font-medium text-stone-800 mb-1">Admin Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password"
                className={`w-full bg-white border rounded-lg p-2.5 pr-10 text-sm text-stone-900 focus:outline-none ${
                  error ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-red-500 mt-1.5">Incorrect password. Please try again.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Merchant Portal</span>
          </button>

          <p className="text-[11px] text-stone-400 text-center">
            Buyers never need to log in — this password only protects store management.
          </p>
        </form>
      </div>
    </div>
  );
};
