import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { rowToProduct, productToRow, rowToOrder, rowToSettings, settingsToRow } from '../lib/mappers';
import { Product, ProductCategory, CartItem, Order, OrderStatus, StoreSettings, CustomerDetails, PaymentMethodType } from '../types';
import { INITIAL_SETTINGS } from '../data/initialData';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface StoreContextType {
  // Loading
  loading: boolean;

  // Catalog & Inventory (admin actions are async now)
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, newStock: number) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  orders: Order[]; // admin only; empty for buyers
  refreshOrders: () => Promise<void>;
  createOrder: (data: {
    customer: CustomerDetails;
    paymentMethod: PaymentMethodType;
    paymentStatus?: 'paid' | 'pending' | 'verified';
    upiTransactionRef?: string;
  }) => Promise<Order | null>;
  trackOrder: (orderNumber: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus, tracking?: { carrier?: string; number?: string; note?: string }) => Promise<void>;
  markPaymentVerified: (orderId: string) => Promise<void>;

  // Store Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  formatPrice: (amount: number) => string;

  // UI Navigation & Modals
  viewMode: 'store' | 'admin';
  setViewMode: (mode: 'store' | 'admin') => void;
  isAdminUnlocked: boolean;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  requestAdminAccess: () => void;
  unlockAdmin: (email: string, password: string) => Promise<boolean>;
  lockAdmin: () => Promise<void>;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  trackingOrderNumber: string;
  setTrackingOrderNumber: (num: string) => void;
  isAboutModalOpen: boolean;
  setIsAboutModalOpen: (open: boolean) => void;
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  confirmedOrder: Order | null;
  setConfirmedOrder: (order: Order | null) => void;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  setSortBy: (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating') => void;
  filterInStockOnly: boolean;
  setFilterInStockOnly: (val: boolean) => void;

  // Notification Toasts
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Cart and wishlist are per-device, so they stay in localStorage.
const STORAGE_KEYS = {
  CART: 'saatvic_store_cart_v1',
  WISHLIST: 'saatvic_store_wishlist_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Shared data (lives in Supabase)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  // Per-device data (localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth / UI state
  const [session, setSession] = useState<Session | null>(null);
  const [viewMode, setViewModeRaw] = useState<'store' | 'admin'>('store');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const placingOrder = useRef(false);

  // ---------- Toast helpers ----------
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fail = (message: string, err?: unknown) => {
    console.error(message, err);
    showToast(message, 'error');
  };

  // ---------- Loading from Supabase ----------
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Could not load products', error);
      return;
    }
    setProducts((data ?? []).map(rowToProduct));
    setCatalogLoaded(true);
  };

  const loadSettings = async () => {
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
    if (error) {
      console.error('Could not load settings', error);
      return;
    }
    setSettings(rowToSettings(data));
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Could not load orders', error);
      return;
    }
    setOrders((data ?? []).map(rowToOrder));
  };

  const refreshOrders = async () => {
    await loadOrders();
  };

  // First load
  useEffect(() => {
    Promise.all([loadProducts(), loadSettings()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pick up merchant changes (stock, prices) when a visitor returns to the tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
        loadSettings();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep cart items in sync with live prices/stock; drop items that no longer exist
  useEffect(() => {
    if (!catalogLoaded) return;
    setCart((prev) =>
      prev.flatMap((item) => {
        const fresh = products.find((p) => p.id === item.product.id);
        if (!fresh || fresh.stock <= 0) return [];
        return [{ ...item, product: fresh, quantity: Math.min(item.quantity, fresh.stock) }];
      })
    );
  }, [products, catalogLoaded]);

  // ---------- Auth ----------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Whenever the session changes, confirm this account really is the merchant
  useEffect(() => {
    let cancelled = false;
    if (!session) {
      setIsAdminUnlocked(false);
      setOrders([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc('is_admin');
      if (cancelled) return;
      if (error || data !== true) {
        setIsAdminUnlocked(false);
        return;
      }
      setIsAdminUnlocked(true);
      loadOrders();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Merchant dashboard: check for new orders every 30s
  useEffect(() => {
    if (!isAdminUnlocked) return;
    const t = setInterval(loadOrders, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminUnlocked]);

  // ---------- Persist cart & wishlist ----------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // ---------- Price formatter ----------
  const formatPrice = (amount: number): string => {
    const sym = settings.currencySymbol || '₹';
    return `${sym}${amount.toLocaleString('en-IN')}`;
  };

  // ---------- Cart ----------
  const addToCart = (product: Product, quantity = 1) => {
    const fresh = products.find((p) => p.id === product.id) ?? product;
    if (fresh.stock <= 0) {
      showToast(`${fresh.name} is currently sold out.`, 'warning');
      return;
    }

    const existing = cart.find((item) => item.product.id === fresh.id);
    const requested = (existing ? existing.quantity : 0) + quantity;
    const finalQty = Math.min(requested, fresh.stock);

    if (requested > fresh.stock) {
      showToast(`Only ${fresh.stock} units available in stock.`, 'warning');
    } else {
      showToast(`Added ${fresh.name} to shopping bag.`, 'success');
    }

    setCart((prev) =>
      existing
        ? prev.map((item) => (item.product.id === fresh.id ? { ...item, product: fresh, quantity: finalQty } : item))
        : [...prev, { product: fresh, quantity: finalQty }]
    );
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (prod && quantity > prod.stock) {
      showToast(`Only ${prod.stock} units available in stock.`, 'warning');
      return;
    }
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from shopping bag.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // ---------- Wishlist ----------
  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      showToast('Removed from saved items', 'info');
      setWishlist((prev) => prev.filter((id) => id !== productId));
    } else {
      showToast('Saved to your collection', 'success');
      setWishlist((prev) => [...prev, productId]);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // ---------- Product & inventory management (merchant) ----------
  const addProduct = async (productInput: Omit<Product, 'id' | 'slug' | 'createdAt'>) => {
    let slug = productInput.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
    if (products.some((p) => p.slug === slug)) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({ ...productToRow(productInput), slug })
      .select()
      .single();

    if (error) {
      fail('Could not add product. Please try again.', error);
      return;
    }
    setProducts((prev) => [rowToProduct(data), ...prev]);
    showToast(`"${productInput.name}" published to catalog.`, 'success');
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(productToRow(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      fail('Could not update product. Please try again.', error);
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? rowToProduct(data) : p)));
    showToast('Product details updated successfully.', 'success');
  };

  const deleteProduct = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      fail('Could not delete product. Please try again.', error);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    showToast(`Deleted ${prod?.name || 'product'} from catalog.`, 'info');
  };

  const adjustStock = async (id: string, newStock: number) => {
    const safeStock = Math.max(0, Math.floor(newStock));
    const { error } = await supabase.from('products').update({ stock: safeStock }).eq('id', id);
    if (error) {
      fail('Could not update stock. Please try again.', error);
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: safeStock } : p)));
    showToast(`Stock updated to ${safeStock} units.`, 'info');
  };

  // ---------- Orders ----------
  // The server (place_order in schema.sql) recalculates prices, shipping and
  // totals, checks and deducts stock, and generates the order number.
  const createOrder = async ({
    customer,
    paymentMethod,
    upiTransactionRef,
  }: {
    customer: CustomerDetails;
    paymentMethod: PaymentMethodType;
    paymentStatus?: 'paid' | 'pending' | 'verified';
    upiTransactionRef?: string;
  }): Promise<Order | null> => {
    if (placingOrder.current) return null;
    if (cart.length === 0) {
      showToast('Your bag is empty.', 'warning');
      return null;
    }

    placingOrder.current = true;
    try {
      const { data, error } = await supabase.rpc('place_order', {
        p_customer: customer,
        p_items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        p_payment_method: paymentMethod,
        p_upi_ref: upiTransactionRef ?? null,
      });

      if (error || !data) {
        fail(error?.message || 'Could not place your order. Please try again.', error);
        loadProducts(); // stock may have changed
        return null;
      }

      const newOrder = rowToOrder(data);
      clearCart();
      setConfirmedOrder(newOrder);
      setIsCheckoutOpen(false);
      showToast(`Order #${newOrder.orderNumber} confirmed successfully!`, 'success');
      loadProducts(); // pick up the new stock numbers
      return newOrder;
    } finally {
      placingOrder.current = false;
    }
  };

  // Public order lookup: returns status, items and timeline, but no customer details.
  const trackOrder = async (orderNumber: string): Promise<Order | null> => {
    const { data, error } = await supabase.rpc('track_order', { p_order_number: orderNumber });
    if (error) {
      fail('Could not look up that order. Please try again.', error);
      return null;
    }
    return data ? rowToOrder(data) : null;
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    tracking?: { carrier?: string; number?: string; note?: string }
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (order.status === 'cancelled' && newStatus !== 'cancelled') {
      showToast('Cancelled orders cannot be reopened.', 'warning');
      return;
    }

    const defaultNote =
      newStatus === 'shipped'
        ? `Dispatched via ${tracking?.carrier || 'Carrier Express'}. Tracking: ${tracking?.number || 'Pending'}`
        : newStatus === 'delivered'
        ? 'Package successfully handed over to customer.'
        : newStatus === 'processing'
        ? 'Order is being packed.'
        : newStatus === 'cancelled'
        ? 'Order cancelled and stock restocked.'
        : `Order updated to ${newStatus}.`;

    const entry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: tracking?.note || defaultNote,
    };

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        tracking_carrier: tracking?.carrier || order.trackingCarrier || null,
        tracking_number: tracking?.number || order.trackingNumber || null,
        timeline: [...order.timeline, entry],
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      fail('Could not update the order. Please try again.', error);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? rowToOrder(data) : o)));
    if (newStatus === 'cancelled') loadProducts(); // stock was returned by the database
    showToast(`Order status updated to "${newStatus}".`, 'info');
  };

  const markPaymentVerified = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const entry = {
      status: order.status,
      timestamp: new Date().toISOString(),
      note: 'Merchant verified UPI / payment receipt.',
    };

    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: 'verified', timeline: [...order.timeline, entry] })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      fail('Could not verify payment. Please try again.', error);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? rowToOrder(data) : o)));
    showToast('Payment marked as verified.', 'success');
  };

  // ---------- Settings ----------
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const { data, error } = await supabase
      .from('store_settings')
      .update(settingsToRow(newSettings))
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      fail('Could not save settings. Please try again.', error);
      return;
    }
    setSettings(rowToSettings(data));
    showToast('Store settings updated.', 'success');
  };

  // ---------- Admin access ----------
  const setViewMode = (mode: 'store' | 'admin') => {
    if (mode === 'admin' && !isAdminUnlocked) {
      setIsAdminLoginOpen(true);
      return;
    }
    setViewModeRaw(mode);
  };

  const requestAdminAccess = () => {
    if (isAdminUnlocked) {
      setViewModeRaw('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const unlockAdmin = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      showToast('Incorrect email or password.', 'error');
      return false;
    }

    const { data: ok } = await supabase.rpc('is_admin');
    if (ok !== true) {
      await supabase.auth.signOut();
      showToast('This account does not have merchant access.', 'error');
      return false;
    }

    setIsAdminUnlocked(true);
    setIsAdminLoginOpen(false);
    setViewModeRaw('admin');
    showToast('Welcome back to the Merchant Portal.', 'success');
    return true;
  };

  const lockAdmin = async () => {
    await supabase.auth.signOut();
    setIsAdminUnlocked(false);
    setOrders([]);
    setViewModeRaw('store');
    showToast('Logged out of the Merchant Portal.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        loading,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        refreshOrders,
        createOrder,
        trackOrder,
        updateOrderStatus,
        markPaymentVerified,
        settings,
        updateSettings,
        formatPrice,
        viewMode,
        setViewMode,
        isAdminUnlocked,
        isAdminLoginOpen,
        setIsAdminLoginOpen,
        requestAdminAccess,
        unlockAdmin,
        lockAdmin,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        trackingOrderNumber,
        setTrackingOrderNumber,
        isAboutModalOpen,
        setIsAboutModalOpen,
        isContactModalOpen,
        setIsContactModalOpen,
        confirmedOrder,
        setConfirmedOrder,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        filterInStockOnly,
        setFilterInStockOnly,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
