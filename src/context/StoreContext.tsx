import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem, Order, OrderStatus, StoreSettings, CustomerDetails, PaymentMethodType } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SETTINGS } from '../data/initialData';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface StoreContextType {
  // Catalog & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, newStock: number) => void;
  
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
  orders: Order[];
  createOrder: (data: {
    customer: CustomerDetails;
    paymentMethod: PaymentMethodType;
    paymentStatus?: 'paid' | 'pending' | 'verified';
    upiTransactionRef?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, tracking?: { carrier?: string; number?: string; note?: string }) => void;
  markPaymentVerified: (orderId: string) => void;

  // Store Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  formatPrice: (amount: number) => string;

  // UI Navigation & Modals
  viewMode: 'store' | 'admin';
  setViewMode: (mode: 'store' | 'admin') => void;
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

const STORAGE_KEYS = {
  PRODUCTS: 'saatvic_store_products_v1',
  ORDERS: 'saatvic_store_orders_v1',
  SETTINGS: 'saatvic_store_settings_v1',
  CART: 'saatvic_store_cart_v1',
  WISHLIST: 'saatvic_store_wishlist_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Could not save products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Could not save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage', e);
    }
  }, [settings]);

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

  // Toast Helpers
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

  // Price Formatter
  const formatPrice = (amount: number): string => {
    const sym = settings.currencySymbol || '₹';
    return `${sym}${amount.toLocaleString('en-IN')}`;
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    const currentStock = product.stock;
    if (currentStock <= 0) {
      showToast(`${product.name} is currently sold out.`, 'warning');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const currentQtyInCart = existing ? existing.quantity : 0;
      const requestedTotal = currentQtyInCart + quantity;

      if (requestedTotal > currentStock) {
        showToast(`Only ${currentStock} units available in stock.`, 'warning');
        if (currentQtyInCart === 0 && currentStock > 0) {
          return [...prev, { product, quantity: currentStock }];
        }
        return prev;
      }

      showToast(`Added ${product.name} to shopping bag.`, 'success');
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: requestedTotal } : item
        );
      }
      return [...prev, { product, quantity }];
    });
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

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
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

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from saved items', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your collection', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Product & Inventory Management
  const addProduct = (productInput: Omit<Product, 'id' | 'slug' | 'createdAt'>) => {
    const id = 'prod-' + Date.now().toString(36);
    const slug = productInput.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct: Product = {
      ...productInput,
      id,
      slug,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`"${productInput.name}" published to catalog.`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Product details updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    showToast(`Deleted ${prod?.name || 'product'} from catalog.`, 'info');
  };

  const adjustStock = (id: string, newStock: number) => {
    const safeStock = Math.max(0, newStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: safeStock } : p))
    );
    showToast(`Stock updated to ${safeStock} units.`, 'info');
  };

  // Orders
  const createOrder = ({
    customer,
    paymentMethod,
    paymentStatus = 'pending',
    upiTransactionRef,
  }: {
    customer: CustomerDetails;
    paymentMethod: PaymentMethodType;
    paymentStatus?: 'paid' | 'pending' | 'verified';
    upiTransactionRef?: string;
  }): Order => {
    const subtotal = cartSubtotal;
    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const orderNum = 'SDA-' + Math.floor(1000 + Math.random() * 9000);
    const orderId = 'ord-' + Date.now();

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0] || '/src/assets/images/product_bilona_ghee_jar_close.jpg',
    }));

    // Deduct stock automatically from inventory!
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatch = cart.find((c) => c.product.id === prod.id);
        if (cartMatch) {
          const newStock = Math.max(0, prod.stock - cartMatch.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    const initialTimelineNote =
      paymentMethod === 'upi_qr'
        ? `Order placed with UPI QR code payment. Ref: ${upiTransactionRef || 'Pending submission'}.`
        : paymentMethod === 'cod'
        ? 'Order placed with Cash on Delivery option.'
        : 'Payment authenticated and captured via secure gateway.';

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      customer,
      items: orderItems,
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : (paymentStatus || 'paid'),
      upiTransactionRef,
      status: 'confirmed',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: initialTimelineNote,
        },
        {
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          note: 'Inventory allocated and order queued for assembly at studio.',
        }
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setConfirmedOrder(newOrder);
    setIsCheckoutOpen(false);
    showToast(`Order #${orderNum} confirmed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    tracking?: { carrier?: string; number?: string; note?: string }
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const defaultNote =
          newStatus === 'shipped'
            ? `Dispatched via ${tracking?.carrier || 'Carrier Express'}. Tracking: ${tracking?.number || 'Pending'}`
            : newStatus === 'delivered'
            ? 'Package successfully handed over to customer.'
            : newStatus === 'processing'
            ? 'Order in studio assembly and packaging.'
            : newStatus === 'cancelled'
            ? 'Order cancelled and stock restocked.'
            : `Order updated to ${newStatus}.`;

        const newTimelineEntry = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: tracking?.note || defaultNote,
        };

        return {
          ...order,
          status: newStatus,
          trackingCarrier: tracking?.carrier || order.trackingCarrier,
          trackingNumber: tracking?.number || order.trackingNumber,
          timeline: [...order.timeline, newTimelineEntry],
        };
      })
    );
    showToast(`Order status updated to "${newStatus}".`, 'info');
  };

  const markPaymentVerified = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          paymentStatus: 'verified',
          timeline: [
            ...order.timeline,
            {
              status: order.status,
              timestamp: new Date().toISOString(),
              note: 'Merchant verified UPI / payment receipt.',
            },
          ],
        };
      })
    );
    showToast('Payment marked as verified.', 'success');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Store settings updated.', 'success');
  };

  return (
    <StoreContext.Provider
      value={{
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
        createOrder,
        updateOrderStatus,
        markPaymentVerified,
        settings,
        updateSettings,
        formatPrice,
        viewMode,
        setViewMode,
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
