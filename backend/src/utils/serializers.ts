import type {
  Address,
  Category,
  CMSContent as FrontendCMSContent,
  Collection,
  Coupon,
  Customer,
  MetalRate,
  Order,
  Product,
  ProductReview,
} from '../../../src/types';

type ProductRecord = Product & {
  variants?: Product['variants'];
};

export const toProductCreateData = (product: Product): Record<string, any> => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  sku: product.sku,
  shortDescription: product.shortDescription,
  description: product.description,
  category: product.category,
  subcategory: product.subcategory,
  collection: product.collection,
  tags: product.tags,
  gender: product.gender,
  occasion: product.occasion,
  images: product.images,
  videoUrl: product.videoUrl,
  metalType: product.metalType,
  metalPurity: product.metalPurity,
  metalColor: product.metalColor,
  grossWeightGrams: product.grossWeightGrams,
  netWeightGrams: product.netWeightGrams,
  gemstones: product.gemstones,
  hallmarked: product.hallmarked,
  hallmarkCenter: product.hallmarkCenter,
  certified: product.certified,
  certificationAgency: product.certificationAgency,
  pricingMode: product.pricingMode,
  fixedPrice: product.fixedPrice,
  compareAtPrice: product.compareAtPrice,
  makingChargeType: product.makingChargeType,
  makingChargeValue: product.makingChargeValue,
  wastagePercentage: product.wastagePercentage,
  certificationCharge: product.certificationCharge,
  packagingCharge: product.packagingCharge,
  gstPercentage: product.gstPercentage,
  totalStock: product.totalStock,
  hasVariants: product.hasVariants,
  variantAttributes: product.variantAttributes,
  lowStockThreshold: product.lowStockThreshold,
  readyToShip: product.readyToShip,
  dispatchDays: product.dispatchDays,
  returnEligible: product.returnEligible,
  returnPolicyDays: product.returnPolicyDays,
  codAvailable: product.codAvailable,
  badges: product.badges,
  rating: product.rating,
  reviewCount: product.reviewCount,
  status: product.status,
  seoTitle: product.seoTitle,
  seoDescription: product.seoDescription,
  createdAt: new Date(product.createdAt),
  updatedAt: new Date(product.updatedAt),
});

export const toProductResponse = (product: ProductRecord): Product => ({
  ...product,
  tags: product.tags || [],
  occasion: product.occasion || [],
  images: product.images || [],
  gemstones: product.gemstones || [],
  variantAttributes: product.variantAttributes || [],
  badges: product.badges || [],
  variants: product.variants || [],
  createdAt: new Date(product.createdAt).toISOString(),
  updatedAt: new Date(product.updatedAt).toISOString(),
}) as Product;

export const toCategoryData = (category: Category): Record<string, any> => ({
  ...category,
  subcategories: category.subcategories,
});

export const toCollectionData = (collection: Collection): Record<string, any> => ({
  ...collection,
});

export const toMetalRateData = (rate: MetalRate): Record<string, any> => ({
  ...rate,
  updatedAt: new Date(rate.updatedAt),
});

export const toMetalRateResponse = (rate: MetalRate): MetalRate => ({
  ...rate,
  updatedAt: new Date(rate.updatedAt).toISOString(),
}) as MetalRate;

export const toCustomerData = (customer: Customer): Record<string, any> => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  avatar: customer.avatar,
  totalOrders: customer.totalOrders,
  totalSpent: customer.totalSpent,
  averageOrderValue: customer.averageOrderValue,
  lastOrderAt: customer.lastOrderAt ? new Date(customer.lastOrderAt) : null,
  tags: customer.tags,
  marketingConsent: customer.marketingConsent,
  status: customer.status,
  createdAt: new Date(customer.createdAt),
});

export const toAddressData = (address: Address, customerId?: string): Record<string, any> => ({
  ...address,
  customerId,
});

export const toCouponData = (coupon: Coupon): Record<string, any> => ({
  ...coupon,
  startDate: new Date(coupon.startDate),
  endDate: new Date(coupon.endDate),
});

export const toReviewData = (review: ProductReview): Record<string, any> => ({
  ...review,
  createdAt: new Date(review.createdAt),
});

export const toCMSData = (cms: FrontendCMSContent): Record<string, any> => ({
  id: 'default',
  announcementBar: cms.announcementBar,
  heroBanner: cms.heroBanner,
  sections: cms.sections,
  footer: cms.footer,
});

export const toCMSResponse = (cms: {
  announcementBar: unknown;
  heroBanner: unknown;
  sections: unknown;
  footer: unknown;
}): FrontendCMSContent =>
  ({
    announcementBar: cms.announcementBar,
    heroBanner: cms.heroBanner,
    sections: cms.sections,
    footer: cms.footer,
  }) as FrontendCMSContent;

export const toOrderCreateData = (order: Order): Record<string, any> => ({
  id: order.id,
  orderNumber: order.orderNumber,
  customerId: order.customer.id,
  customerSnapshot: order.customer,
  shippingAddress: order.shippingAddress,
  billingAddress: order.billingAddress,
  subtotal: order.subtotal,
  discountAmount: order.discountAmount,
  couponCode: order.couponCode,
  gstTotal: order.gstTotal,
  shippingCharge: order.shippingCharge,
  totalAmount: order.totalAmount,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  orderStatus: order.orderStatus,
  trackingNumber: order.trackingNumber,
  courierPartner: order.courierPartner,
  placedAt: new Date(order.placedAt),
  metalRateSnapshotAtPlacement: order.metalRateSnapshotAtPlacement,
  notes: order.notes,
  gstInvoiceNumber: order.gstInvoiceNumber,
});

export const toOrderResponse = (order: any): Order =>
  ({
    ...order,
    customer: order.customerSnapshot || order.customer,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    metalRateSnapshotAtPlacement: order.metalRateSnapshotAtPlacement,
    placedAt: new Date(order.placedAt).toISOString(),
    history: (order.history || []).map((step) => ({
      ...step,
      timestamp: new Date(step.timestamp).toISOString(),
    })),
  }) as Order;
