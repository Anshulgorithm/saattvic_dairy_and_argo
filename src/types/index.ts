export type ProductCategory = 
  | 'All'
  | 'Ghee & Dairy'
  | 'Honey & Naturals'
  | 'Cold-Pressed Oils'
  | 'Agro Produce'
  | 'Farm Essentials';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  details: string[];
  dimensions?: string;
  material?: string;
  images: string[];
  featured: boolean;
  rating: number;
  reviewsCount: number;
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type PaymentMethodType = 'upi_qr' | 'cod' | 'card' | 'gateway';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'paid' | 'pending' | 'verified';
  upiTransactionRef?: string;
  status: OrderStatus;
  trackingNumber?: string;
  trackingCarrier?: string;
  estimatedDelivery?: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  description: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  upiId: string;
  upiName: string;
  upiQrImage: string;
  enableCod: boolean;
  enableCardGateway: boolean;
  contactEmail: string;
  contactPhone: string;
  storeAddress: string;
  announcementText: string;
  showAnnouncement: boolean;
  adminPassword: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}
