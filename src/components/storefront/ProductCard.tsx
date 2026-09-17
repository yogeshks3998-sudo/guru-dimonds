import React, { useState } from 'react';
import { Product } from '../../types';
import { calculateJewelleryPrice } from '../../utils/pricing';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useCartStore } from '../../stores/useCartStore';
import { useToast } from '../ui/Toast';
import { formatINR } from '../../utils/formatters';
import { navigateTo } from '../../utils/navigation';
import { Badge } from '../ui/Badge';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { Heart, Star, Eye, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { getRate } = useMetalRateStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const isWishlisted = isInWishlist(product.id);
  const currentMetalRate = getRate(product.metalType, product.metalPurity);

  // Calculate live formula price
  const priceBreakdown = calculateJewelleryPrice({
    pricingMode: product.pricingMode,
    fixedPrice: product.fixedPrice,
    metalType: product.metalType,
    purity: product.metalPurity,
    netWeightGrams: product.netWeightGrams,
    ratePerGram: currentMetalRate,
    makingChargeType: product.makingChargeType,
    makingChargeValue: product.makingChargeValue,
    wastagePercentage: product.wastagePercentage,
    gemstones: product.gemstones,
    certificationCharge: product.certificationCharge,
    packagingCharge: product.packagingCharge,
    gstPercentage: product.gstPercentage,
  });

  const finalPrice = priceBreakdown.finalPrice;
  const compareAt = product.compareAtPrice;
  const discountPercent = compareAt && compareAt > finalPrice ? Math.round(((compareAt - finalPrice) / compareAt) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ product, quantity: 1 });
    showToast('Added to Cart', `${product.name} added to your shopping bag.`);
  };

  // Single most relevant badge to keep card clean and uncluttered
  const primaryBadge = (() => {
    if (product.badges?.includes('BEST_SELLER')) {
      return { label: 'BEST SELLER', variant: 'gold' as const };
    }
    if (discountPercent > 0) {
      return { label: `${discountPercent}% OFF`, variant: 'ruby' as const };
    }
    if (product.badges?.includes('NEW')) {
      return { label: 'NEW', variant: 'dark' as const };
    }
    if (product.badges?.includes('CERTIFIED')) {
      return { label: 'CERTIFIED', variant: 'emerald' as const };
    }
    if (product.badges?.includes('HALLMARKED')) {
      return { label: 'HALLMARKED', variant: 'gold' as const };
    }
    if (product.badges && product.badges.length > 0) {
      const first = product.badges[0];
      return {
        label: first.replace('_', ' '),
        variant: 'gold' as const,
      };
    }
    return null;
  })();

  const primaryImg = product.images[0] || 'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=600&q=80';
  const secondaryImg = product.images[1] || primaryImg;

  return (
    <div
      onClick={() => navigateTo(`/product/${product.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#B8893D]/60 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#FFF9F0]">
        <ImageWithFallback
          src={isHovered ? secondaryImg : primaryImg}
          fallbackSrc={primaryImg}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Single Primary Badge */}
        {primaryBadge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              label={primaryBadge.label}
              variant={primaryBadge.variant}
              className="shadow-sm font-bold text-[10px] px-2.5 py-0.5 rounded-md"
            />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
            showToast(isWishlisted ? 'Removed from Saved Creations' : 'Saved to Wishlist');
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md z-10 ${
            isWishlisted ? 'bg-[#7A1822] text-[#FFF9F0]' : 'bg-white/80 text-[#281C18] hover:bg-white hover:text-[#7A1822]'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 bg-white/95 hover:bg-[#7A1822] text-[#281C18] hover:text-[#FFF9F0] text-xs font-semibold py-2 rounded-xl backdrop-blur-md shadow-md flex items-center justify-center gap-1.5 transition-colors border border-[#E9D9C5]"
            >
              <Eye className="w-3.5 h-3.5 text-[#B8893D]" /> Quick Inspection
            </button>
          </div>
        )}
      </div>

      {/* Product Details Area */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Metal & Purity tag */}
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-[#796A65] font-medium tracking-wider uppercase mb-1">
            <span className="truncate max-w-[75%]">
              {product.metalPurity} {product.metalType}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-[#B8893D] shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span className="font-bold text-[#281C18]">
                {typeof product.rating === 'number' ? Number(product.rating).toFixed(1) : product.rating || '5.0'}
              </span>
            </div>
          </div>

          <h3 className="font-product font-bold text-xs sm:text-base text-[#281C18] line-clamp-2 group-hover:text-[#7A1822] transition-colors leading-snug min-h-[2.25rem] sm:min-h-[2.75rem]">
            {product.name}
          </h3>
        </div>

        {/* Price & Action */}
        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-[#E9D9C5] flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap min-h-[1.25rem] sm:min-h-[1.5rem]">
              <span className="text-xs sm:text-base font-bold text-[#7A1822]">{formatINR(finalPrice)}</span>
              {compareAt && compareAt > finalPrice && (
                <span className="text-[10px] sm:text-xs text-[#796A65] line-through">{formatINR(compareAt)}</span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#2E7D5B] font-semibold block truncate">3% GST Included</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="p-1.5 sm:p-2.5 bg-[#FFF9F0] hover:bg-[#7A1822] text-[#7A1822] hover:text-[#FFF9F0] border border-[#E9D9C5] hover:border-[#7A1822] rounded-lg sm:rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            aria-label="Add to cart"
            title="Add to shopping bag"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
