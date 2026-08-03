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

  const primaryImg = product.images[0] || 'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=600&q=80';
  const secondaryImg = product.images[1] || primaryImg;

  return (
    <div
      onClick={() => navigateTo(`/product/${product.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#B8893D]/60 transition-all duration-300 flex flex-col cursor-pointer"
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

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.badges?.map((badge, idx) => (
            <Badge
              key={idx}
              label={badge.replace('_', ' ')}
              variant={badge === 'BEST_SELLER' ? 'gold' : badge === 'CERTIFIED' ? 'emerald' : 'dark'}
            />
          ))}
          {discountPercent > 0 && <Badge label={`${discountPercent}% OFF`} variant="ruby" />}
        </div>

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
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Metal & Purity tag */}
          <div className="flex items-center justify-between text-[11px] text-[#796A65] font-medium tracking-wider uppercase mb-1">
            <span>
              {product.metalPurity} {product.metalType} • {product.metalColor}
            </span>
            <div className="flex items-center gap-1 text-[#B8893D]">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-bold text-[#281C18]">{product.rating}</span>
            </div>
          </div>

          <h3 className="font-serif font-bold text-base text-[#281C18] line-clamp-2 group-hover:text-[#7A1822] transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-3 border-t border-[#E9D9C5] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#7A1822]">{formatINR(finalPrice)}</span>
              {compareAt && compareAt > finalPrice && (
                <span className="text-xs text-[#796A65] line-through">{formatINR(compareAt)}</span>
              )}
            </div>
            <span className="text-[10px] text-[#2E7D5B] font-semibold block">Formula Price (3% GST Included)</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2.5 bg-[#FFF9F0] hover:bg-[#7A1822] text-[#7A1822] hover:text-[#FFF9F0] border border-[#E9D9C5] hover:border-[#7A1822] rounded-xl transition-all shadow-xs"
            aria-label="Add to cart"
            title="Add to shopping bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
