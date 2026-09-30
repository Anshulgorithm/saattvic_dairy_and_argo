import { Product, Order, StoreSettings, CustomerDetails } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const EMPTY_CUSTOMER: CustomerDetails = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

// ---------- Products ----------
export const rowToProduct = (r: any): Product => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  sku: r.sku,
  category: r.category,
  price: Number(r.price),
  originalPrice: r.original_price == null ? undefined : Number(r.original_price),
  stock: Number(r.stock),
  lowStockThreshold: r.low_stock_threshold ?? 5,
  description: r.description ?? '',
  details: r.details ?? [],
  dimensions: r.dimensions ?? undefined,
  material: r.material ?? undefined,
  images: r.images ?? [],
  featured: !!r.featured,
  rating: Number(r.rating ?? 0),
  reviewsCount: r.reviews_count ?? 0,
  tags: r.tags ?? [],
  createdAt: r.created_at,
});

export const productToRow = (p: Partial<Product>) => {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.sku !== undefined) row.sku = p.sku;
  if (p.category !== undefined) row.category = p.category;
  if (p.price !== undefined) row.price = p.price;
  if ('originalPrice' in p) row.original_price = p.originalPrice ?? null;
  if (p.stock !== undefined) row.stock = Math.max(0, Math.floor(p.stock));
  if (p.lowStockThreshold !== undefined) row.low_stock_threshold = p.lowStockThreshold;
  if (p.description !== undefined) row.description = p.description;
  if (p.details !== undefined) row.details = p.details;
  if ('dimensions' in p) row.dimensions = p.dimensions ?? null;
  if ('material' in p) row.material = p.material ?? null;
  if (p.images !== undefined) row.images = p.images;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.reviewsCount !== undefined) row.reviews_count = p.reviewsCount;
  if (p.tags !== undefined) row.tags = p.tags;
  return row;
};

// ---------- Orders ----------
// Works for full admin rows AND for the reduced rows track_order() returns
// (those have no `customer`, so it falls back to empty strings).
export const rowToOrder = (r: any): Order => ({
  id: r.id ?? '',
  orderNumber: r.order_number,
  createdAt: r.created_at,
  customer: r.customer ?? EMPTY_CUSTOMER,
  items: r.items ?? [],
  subtotal: Number(r.subtotal),
  shippingFee: Number(r.shipping_fee),
  discount: Number(r.discount ?? 0),
  total: Number(r.total),
  paymentMethod: r.payment_method,
  paymentStatus: r.payment_status,
  upiTransactionRef: r.upi_transaction_ref ?? undefined,
  status: r.status,
  trackingNumber: r.tracking_number ?? undefined,
  trackingCarrier: r.tracking_carrier ?? undefined,
  estimatedDelivery: r.estimated_delivery ?? undefined,
  timeline: r.timeline ?? [],
});

// ---------- Settings ----------
export const rowToSettings = (r: any): StoreSettings => ({
  storeName: r.store_name,
  tagline: r.tagline ?? '',
  description: r.description ?? '',
  currency: r.currency ?? 'INR',
  currencySymbol: r.currency_symbol ?? '₹',
  freeShippingThreshold: Number(r.free_shipping_threshold ?? 0),
  standardShippingFee: Number(r.standard_shipping_fee ?? 0),
  upiId: r.upi_id ?? '',
  upiName: r.upi_name ?? '',
  upiQrImage: r.upi_qr_image ?? '',
  enableCod: !!r.enable_cod,
  enableCardGateway: !!r.enable_card_gateway,
  contactEmail: r.contact_email ?? '',
  contactPhone: r.contact_phone ?? '',
  storeAddress: r.store_address ?? '',
  announcementText: r.announcement_text ?? '',
  showAnnouncement: !!r.show_announcement,
});

export const settingsToRow = (s: Partial<StoreSettings>) => {
  const row: Record<string, unknown> = {};
  if (s.storeName !== undefined) row.store_name = s.storeName;
  if (s.tagline !== undefined) row.tagline = s.tagline;
  if (s.description !== undefined) row.description = s.description;
  if (s.currency !== undefined) row.currency = s.currency;
  if (s.currencySymbol !== undefined) row.currency_symbol = s.currencySymbol;
  if (s.freeShippingThreshold !== undefined) row.free_shipping_threshold = s.freeShippingThreshold;
  if (s.standardShippingFee !== undefined) row.standard_shipping_fee = s.standardShippingFee;
  if (s.upiId !== undefined) row.upi_id = s.upiId;
  if (s.upiName !== undefined) row.upi_name = s.upiName;
  if (s.upiQrImage !== undefined) row.upi_qr_image = s.upiQrImage;
  if (s.enableCod !== undefined) row.enable_cod = s.enableCod;
  if (s.enableCardGateway !== undefined) row.enable_card_gateway = s.enableCardGateway;
  if (s.contactEmail !== undefined) row.contact_email = s.contactEmail;
  if (s.contactPhone !== undefined) row.contact_phone = s.contactPhone;
  if (s.storeAddress !== undefined) row.store_address = s.storeAddress;
  if (s.announcementText !== undefined) row.announcement_text = s.announcementText;
  if (s.showAnnouncement !== undefined) row.show_announcement = s.showAnnouncement;
  return row;
};
