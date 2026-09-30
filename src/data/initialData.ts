import { Product, StoreSettings, Order } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Saatvic Dairy and Agro',
  tagline: 'Pure Essence of Nature',
  description: 'Traditional Bilona-method cow ghee and farm produce, made with age-old methods in the hills of Chamba, Himachal Pradesh.',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 1500,
  standardShippingFee: 99,
  upiId: 'jsridhima-1@okhdfcbank',
  upiName: 'Saatvic Dairy and Agro',
  upiQrImage: '/images/upi_qr_code_real.jpg',
  enableCod: true,
  enableCardGateway: false,
  contactEmail: 'hello@saatvicdairy.com',
  contactPhone: '+91 98765 43210',
  storeAddress: 'Chamba, Himachal Pradesh, India',
  announcementText: 'Free shipping across India on all orders above ₹1,500.',
  showAnnouncement: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Traditional Bilona Cow Ghee',
    slug: 'traditional-bilona-cow-ghee',
    sku: 'SDA-GHE-001',
    category: 'Ghee & Dairy',
    price: 1100,
    originalPrice: 1300,
    stock: 25,
    lowStockThreshold: 5,
    description: 'Pure A2 cow ghee, hand-churned using the traditional Bilona method by families in the hills of Chamba, Himachal Pradesh. Made from curd, not cream, and slow-cooked over a wood fire for a rich aroma and deep, grainy texture.',
    details: [
      'Made using the age-old Bilona (hand-churning) method',
      'Sourced from grass-fed indigenous cows of Chamba',
      'Curd-churned, not cream-separated, for authentic taste and texture',
      'Slow-cooked over a wood fire in small batches',
      'No preservatives, additives, or artificial colours',
    ],
    dimensions: 'Net Wt. 1 Ltr (910g)',
    material: 'Pure A2 cow milk ghee',
    images: [
      '/images/product_bilona_ghee_jar_close.jpg',
      '/images/product_bilona_ghee_hand_1.jpg',
      '/images/product_bilona_ghee_hand_2.jpg',
      '/images/product_bilona_ghee_jars_group.jpg',
    ],
    featured: true,
    rating: 4.9,
    reviewsCount: 12,
    tags: ['Ghee', 'Dairy', 'Bilona', 'Chamba', 'A2', 'Organic'],
    createdAt: '2026-09-27T09:00:00Z',
  },
];

export const INITIAL_ORDERS: Order[] = [];
