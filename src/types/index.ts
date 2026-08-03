export type MetalType = 'GOLD' | 'SILVER' | 'PLATINUM' | 'DIAMOND';

export type GoldPurity = '24K' | '22K' | '18K' | '14K';
export type SilverPurity = '999' | '925';
export type MetalPurity = GoldPurity | SilverPurity | '950'; // Platinum 950

export interface MetalRate {
  id: string;
  metal: MetalType;
  purity: MetalPurity;
  ratePerGram: number;
  previousRate: number;
  effectiveDate: string; // YYYY-MM-DD
  effectiveTime: string; // HH:mm
  rateSource: string;
  notes?: string;
  updatedBy: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ROLLED_BACK';
  updatedAt: string;
}

export type PricingMode = 'FIXED' | 'RATE_LINKED' | 'FORMULA' | 'MADE_TO_ORDER';

export interface GemstoneInfo {
  type: string; // Emerald, Ruby, Sapphire, Diamond, Sphatika, Pearl, Rudraksha, etc.
  weightCaratOrGrams: number;
  color: string;
  clarity?: string;
  count: number;
  totalPrice: number;
  certified: boolean;
}

export interface PriceBreakdown {
  metalType: MetalType;
  purity: MetalPurity;
  netWeightGrams: number;
  ratePerGram: number;
  metalValue: number;
  makingChargeType: 'FIXED' | 'PERCENTAGE' | 'PER_GRAM';
  makingChargeValue: number;
  makingChargeTotal: number;
  wastagePercentage: number;
  wastageValue: number;
  gemstoneValue: number;
  certificationCharge: number;
  packagingCharge: number;
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  gstPercentage: number;
  gstAmount: number;
  finalPrice: number;
  calculatedAt: string;
}

export interface ProductAttribute {
  name: string; // Ring Size, Chain Length, Metal Colour, Gemstone, etc.
  options: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  attributes: Record<string, string>; // e.g. { "Ring Size": "14", "Metal": "18K Gold" }
  price: number;
  compareAtPrice?: number;
  netWeightGrams: number;
  grossWeightGrams: number;
  stock: number;
  images: string[];
  enabled: boolean;
  dispatchTimeDays: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory: string;
  collection?: string;
  tags: string[];
  gender: 'Men' | 'Women' | 'Unisex' | 'Kids';
  occasion: string[];
  images: string[];
  videoUrl?: string;
  
  // Jewellery technical parameters
  metalType: MetalType;
  metalPurity: MetalPurity;
  metalColor: 'Yellow' | 'Rose' | 'White' | 'Oxidized' | 'Dual Tone';
  grossWeightGrams: number;
  netWeightGrams: number;
  gemstones: GemstoneInfo[];
  hallmarked: boolean;
  hallmarkCenter?: string;
  certified: boolean;
  certificationAgency?: string; // SGL, IGI, BIS
  
  // Pricing parameters
  pricingMode: PricingMode;
  fixedPrice?: number; // Used if PricingMode === 'FIXED'
  compareAtPrice?: number;
  makingChargeType: 'FIXED' | 'PERCENTAGE' | 'PER_GRAM';
  makingChargeValue: number;
  wastagePercentage: number;
  certificationCharge: number;
  packagingCharge: number;
  gstPercentage: number; // Defaults to 3% for jewellery
  
  // Inventory
  totalStock: number;
  hasVariants: boolean;
  variantAttributes: ProductAttribute[];
  variants: ProductVariant[];
  lowStockThreshold: number;

  // Logistics
  readyToShip: boolean;
  dispatchDays: number;
  returnEligible: boolean;
  returnPolicyDays: number;
  codAvailable: boolean;
  
  // Marketing & Metadata
  badges: ('NEW' | 'BEST_SELLER' | 'HALLMARKED' | 'CERTIFIED' | 'SALE' | 'LIMITED' | 'MADE_TO_ORDER')[];
  rating: number;
  reviewCount: number;
  status: 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'HIDDEN' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: string[];
  featured: boolean;
  itemCount: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
  featured: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  product: Product;
  selectedVariant?: ProductVariant;
  selectedAttributes: Record<string, string>;
  quantity: number;
  unitPrice: number;
  priceBreakdown: PriceBreakdown;
  metalRateSnapshot: number;
  customEngraving?: string;
  giftWrap: boolean;
  giftMessage?: string;
  addedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  addressType: 'Home' | 'Work' | 'Other';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  createdAt: string;
  lastOrderAt?: string;
  tags: string[];
  marketingConsent: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'QUALITY_CHECK'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantSku?: string;
  variantDetails?: Record<string, string>;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  priceBreakdownSnapshot: PriceBreakdown;
  customEngraving?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  gstTotal: number;
  shippingCharge: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'COD';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierPartner?: string;
  placedAt: string;
  metalRateSnapshotAtPlacement: Record<string, number>;
  notes?: string;
  history: {
    status: OrderStatus;
    timestamp: string;
    note: string;
    updatedBy: string;
  }[];
  gstInvoiceNumber?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  active: boolean;
  applicableCategories?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  module: 'METAL_RATES' | 'PRODUCTS' | 'ORDERS' | 'INVENTORY' | 'CONTENT' | 'SETTINGS' | 'CUSTOMERS' | 'ROLES';
  entityId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
}

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'PRODUCT_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'ORDER_MANAGER'
  | 'CONTENT_MANAGER'
  | 'FINANCE'
  | 'STAFF';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  active: boolean;
  lastLogin: string;
}

export interface CMSSection {
  id: string;
  type: 'HERO' | 'CATEGORIES' | 'FEATURED_PRODUCTS' | 'GEMSTONES' | 'RATES' | 'BRAND_STORY' | 'AUTHENTICITY' | 'TESTIMONIALS' | 'BANNER' | 'BLOG' | 'NEWSLETTER';
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  content: Record<string, any>;
}

export interface CMSContent {
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  heroBanner: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    mobileImageUrl: string;
  };
  sections: CMSSection[];
  footer: {
    aboutText: string;
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
}
