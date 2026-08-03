import React, { useState, useRef } from 'react';
import { Product, ProductVariant } from '../types';
import { useProductStore } from '../stores/useProductStore';
import { useMetalRateStore } from '../stores/useMetalRateStore';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useCompareStore } from '../stores/useCompareStore';
import { useToast } from '../components/ui/Toast';
import { calculateJewelleryPrice } from '../utils/pricing';
import { formatINR, formatDate } from '../utils/formatters';
import { navigateTo } from '../utils/navigation';
import { PriceBreakdownModal } from '../components/common/PriceBreakdownModal';
import { SizeGuideModal } from '../components/storefront/SizeGuideModal';
import { CompareDrawer } from '../components/storefront/CompareDrawer';
import { Badge } from '../components/ui/Badge';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import {
  ShieldCheck,
  Award,
  Truck,
  Heart,
  Star,
  MessageCircle,
  Clock,
  Info,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ZoomIn,
  Maximize2,
  X,
  Scale,
  Ruler,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { products } = useProductStore();
  const { getRate, rates } = useMetalRateStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, compareIds, setDrawerOpen } = useCompareStore();
  const { showToast } = useToast();

  const product = products.find((p) => p.slug === slug) || products[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    selectedVariant?.attributes || {}
  );
  const [quantity, setQuantity] = useState(1);
  const [customEngraving, setCustomEngraving] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'certification' | 'reviews'>('description');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');

  // Hover-Based Detail Zoom Lens State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = compareIds.includes(product.id);
  const currentRate = getRate(product.metalType, product.metalPurity);

  // Handle Mouse Move for Hover Zoom Lens
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  // Price breakdown formula calculation
  const netWeight = selectedVariant ? selectedVariant.netWeightGrams : product.netWeightGrams;
  const priceBreakdown = calculateJewelleryPrice({
    pricingMode: product.pricingMode,
    fixedPrice: selectedVariant ? selectedVariant.price : product.fixedPrice,
    metalType: product.metalType,
    purity: product.metalPurity,
    netWeightGrams: netWeight,
    ratePerGram: currentRate,
    makingChargeType: product.makingChargeType,
    makingChargeValue: product.makingChargeValue,
    wastagePercentage: product.wastagePercentage,
    gemstones: product.gemstones,
    certificationCharge: product.certificationCharge,
    packagingCharge: product.packagingCharge,
    gstPercentage: product.gstPercentage,
  });

  const finalPrice = priceBreakdown.finalPrice;

  const handleAttributeChange = (attrName: string, optionValue: string) => {
    const newAttrs = { ...selectedAttributes, [attrName]: optionValue };
    setSelectedAttributes(newAttrs);

    // Find matching variant if exists
    if (product.variants) {
      const match = product.variants.find((v) =>
        Object.entries(newAttrs).every(([k, val]) => v.attributes[k] === val)
      );
      if (match) setSelectedVariant(match);
    }
  };

  const handleAddToCart = () => {
    addItem({
      product,
      variant: selectedVariant,
      selectedAttributes,
      quantity,
      customEngraving,
    });
    showToast('Added to Shopping Bag', `${product.name} added to your cart.`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigateTo('/checkout');
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeMessage(`✅ Express Insured Delivery available to ${pincode} by BlueDart Air Express within 2-3 business days.`);
    } else {
      setPincodeMessage('❌ Please enter a valid 6-digit Indian PIN Code.');
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#6F6A62]">
        <button onClick={() => navigateTo('/')} className="hover:text-[#A67C32] transition-colors">Home</button>
        <ChevronRight className="w-3 h-3 text-[#A67C32]" />
        <button onClick={() => navigateTo('/shop')} className="hover:text-[#A67C32] transition-colors">{product.category}</button>
        <ChevronRight className="w-3 h-3 text-[#A67C32]" />
        <span className="text-[#1B1A18] font-bold line-clamp-1">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Images Gallery with Hover-Based Zoom Effect */}
        <div className="space-y-4 sticky top-28">
          <div
            ref={imageContainerRef}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
            className="relative aspect-square rounded-3xl overflow-hidden bg-[#FAF8F3] border border-[#E7E1D7] shadow-xl group cursor-zoom-in select-none"
          >
            {/* Main Image with Smooth Zoom Transformation */}
            <ImageWithFallback
              src={images[selectedImageIndex]}
              fallbackSrc={images[0]}
              alt={product.name}
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: isZooming ? 'scale(2.6)' : 'scale(1)',
              }}
              className="w-full h-full object-cover object-center transition-transform duration-200 ease-out pointer-events-none"
            />

            {/* Hover Lens Hint Badge */}
            <div className={`absolute bottom-4 left-4 bg-[#1B1A18]/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 transition-opacity duration-300 ${isZooming ? 'opacity-100 bg-[#A67C32]/90 border-[#A67C32]' : 'opacity-80'}`}>
              <ZoomIn className="w-3.5 h-3.5 text-[#D8C29D]" />
              <span>{isZooming ? '2.6x Micro-Detail Zoom Active' : 'Hover over image to inspect hallmark & gemstones'}</span>
            </div>

            {/* Lightbox Trigger Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#1B1A18] shadow-md transition-all hover:scale-110"
              title="Expand Fullscreen Studio View"
            >
              <Maximize2 className="w-4 h-4 text-[#A67C32]" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                isWishlisted ? 'bg-[#A67C32] text-white' : 'bg-white/80 text-[#1B1A18] hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Image Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#FAF8F3] relative ${
                  selectedImageIndex === idx ? 'border-[#A67C32] scale-105 shadow-md ring-2 ring-[#A67C32]/20' : 'border-[#E7E1D7] opacity-70 hover:opacity-100'
                }`}
              >
                <ImageWithFallback src={img} fallbackSrc={images[0]} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Technical Specs & Purchasing Actions */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-[#E7E1D7] pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {product.badges?.map((b, idx) => (
                <Badge key={idx} label={b.replace('_', ' ')} variant="gold" />
              ))}
              <span className="text-xs text-[#6F6A62] font-mono ml-auto">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B1A18] leading-tight">{product.name}</h1>

            <div className="flex items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-1 text-[#A67C32]">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-[#1B1A18]">{product.rating}</span>
                <span className="text-[#6F6A62]">({product.reviewCount} Patron Reviews)</span>
              </div>
              <span className="text-[#6F6A62]">|</span>
              <span className="text-[#2E7D5B] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% BIS Hallmarked {product.metalPurity}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-gradient-to-br from-[#FAF8F3] to-[#FAF3E6] border border-[#D8C29D]/60 p-6 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-widest text-[#6F6A62] block">Current Formula Retail Price</span>
                <span className="text-3xl sm:text-4xl font-serif font-extrabold text-[#A67C32] tracking-tight">{formatINR(finalPrice)}</span>
              </div>
              <span className="text-xs text-[#2E7D5B] font-bold bg-[#E6F4EA] border border-[#2E7D5B]/30 px-3 py-1 rounded-full shadow-xs">
                Includes 3% GST
              </span>
            </div>

            {/* Live rate timestamp notice */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#6F6A62] pt-3 border-t border-[#D8C29D]/40 gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#A67C32]" /> Spot Rate: {formatINR(currentRate)}/g ({product.metalPurity} {product.metalType})
              </span>
              <button
                onClick={() => setShowPriceModal(true)}
                className="text-[#A67C32] font-bold underline hover:text-[#8e6828] transition-colors"
              >
                View Transparent Formula
              </button>
            </div>
          </div>

          {/* Jewellery Technical Parameters Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white p-4 border border-[#E7E1D7] rounded-2xl shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[#6F6A62] block text-[10px] uppercase font-semibold">Metal & Purity</span>
              <span className="font-bold text-[#1B1A18]">{product.metalPurity} {product.metalType}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#6F6A62] block text-[10px] uppercase font-semibold">Net Weight</span>
              <span className="font-bold text-[#1B1A18]">{netWeight}g</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#6F6A62] block text-[10px] uppercase font-semibold">Gross Weight</span>
              <span className="font-bold text-[#1B1A18]">{product.grossWeightGrams}g</span>
            </div>
            {product.gemstones && product.gemstones.length > 0 && (
              <div className="space-y-0.5">
                <span className="text-[#6F6A62] block text-[10px] uppercase font-semibold">Gemstone</span>
                <span className="font-bold text-[#1B1A18]">{product.gemstones[0].type}</span>
              </div>
            )}
            <div className="space-y-0.5">
              <span className="text-[#6F6A62] block text-[10px] uppercase font-semibold">Hallmarking</span>
              <span className="font-bold text-[#2E7D5B]">{product.hallmarkCenter || 'BIS HUID Verified'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#6F6A62] block text-[10px] uppercase font-semibold">Lab Certification</span>
              <span className="font-bold text-[#1B1A18]">{product.certificationAgency || 'SGL Certified'}</span>
            </div>
          </div>

          {/* Variant Attribute Selectors */}
          {product.variantAttributes?.map((attr, idx) => (
            <div key={idx} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1B1A18] block">
                Select {attr.name}:
              </label>
              <div className="flex flex-wrap gap-2">
                {attr.options.map((option) => {
                  const isSelected = selectedAttributes[attr.name] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleAttributeChange(attr.name, option)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#1B1A18] text-white border-[#1B1A18] shadow-md'
                          : 'bg-white text-[#1B1A18] border-[#E7E1D7] hover:border-[#A67C32]'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom Engraving Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1B1A18] uppercase tracking-wider flex items-center justify-between">
              <span>Custom Engraving (Optional)</span>
              <span className="text-[10px] text-[#6F6A62]">Max 20 chars</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ananya & Rajesh 2026"
              maxLength={20}
              value={customEngraving}
              onChange={(e) => setCustomEngraving(e.target.value)}
              className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3.5 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
            />
          </div>

          {/* Pincode Delivery Checker */}
          <div className="p-4 bg-white border border-[#E7E1D7] rounded-2xl space-y-2">
            <span className="text-xs font-bold text-[#1B1A18] block uppercase tracking-wider">
              Check Express Insured Delivery:
            </span>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#A67C32]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1B1A18] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#A67C32] transition-colors"
              >
                Check
              </button>
            </form>
            {pincodeMessage && <p className="text-xs font-medium mt-1">{pincodeMessage}</p>}
          </div>

          {/* Action Helper Bar: Size Guide & Compare */}
          <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-[#E7E1D7]">
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-[#7A1822] hover:underline flex items-center gap-1.5 p-1"
            >
              <Ruler className="w-4 h-4 text-[#B8893D]" />
              <span>Royal Sizing & Fit Guide</span>
            </button>
            <button
              onClick={() => toggleCompare(product.id)}
              className={`flex items-center gap-1.5 p-1 hover:underline ${
                isCompared ? 'text-[#7A1822] font-extrabold' : 'text-[#796A65]'
              }`}
            >
              <Scale className="w-4 h-4 text-[#B8893D]" />
              <span>{isCompared ? 'In Comparison Matrix' : 'Compare Creation'}</span>
            </button>
          </div>

          {/* Primary Call-to-Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-[#7A1822] hover:bg-[#4D1017] text-[#FFF9F0] text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#B8893D]" /> Add to Shopping Bag
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 bg-[#B8893D] hover:bg-[#966d2a] text-[#281C18] text-xs font-extrabold uppercase tracking-widest rounded-2xl transition-all shadow-xl"
            >
              Buy Now (Insured Express)
            </button>
          </div>

          {/* Sticky Mobile Add to Bag Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9F0] border-t border-[#E9D9C5] p-3 shadow-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#796A65] font-bold block">
                {product.metalPurity} {product.metalType}
              </span>
              <span className="text-sm font-extrabold text-[#7A1822]">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="px-4 py-2.5 bg-[#7A1822] text-[#FFF9F0] text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-md"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#B8893D]" /> Add
              </button>
              <button
                onClick={handleBuyNow}
                className="px-4 py-2.5 bg-[#B8893D] text-[#281C18] text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-md"
              >
                Buy
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Inquiry */}
          <a
            href={`https://wa.me/919820098200?text=${encodeURIComponent(
              `Namaste Vedaara Concierge, I am interested in ${product.name} (SKU: ${product.sku}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Chat with Concierge on WhatsApp
          </a>
        </div>
      </div>

      {/* Accordion Tabs Section */}
      <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="flex border-b border-[#E7E1D7] space-x-8 text-sm font-serif font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === 'description' ? 'text-[#7A1822] border-b-2 border-[#7A1822]' : 'text-[#6F6A62]'
            }`}
          >
            Detailed Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === 'specs' ? 'text-[#7A1822] border-b-2 border-[#7A1822]' : 'text-[#6F6A62]'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('certification')}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === 'certification' ? 'text-[#7A1822] border-b-2 border-[#7A1822]' : 'text-[#6F6A62]'
            }`}
          >
            Hallmark & Certification
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors relative whitespace-nowrap ${
              activeTab === 'reviews' ? 'text-[#7A1822] border-b-2 border-[#7A1822]' : 'text-[#6F6A62]'
            }`}
          >
            Patron Reviews ({product.reviewCount || 12})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#1B1A18] leading-relaxed">
            <p>{product.description}</p>
            <p className="text-[#6F6A62]">
              Vedaara Fine Jewellery guarantees that all precious metals are 100% ethically sourced and refined to pure 916 (22K) / 750 (18K) standards.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#FAF8F3] rounded-xl flex justify-between">
              <span className="text-[#6F6A62]">Product Category:</span>
              <span className="font-bold">{product.category}</span>
            </div>
            <div className="p-3 bg-[#FAF8F3] rounded-xl flex justify-between">
              <span className="text-[#6F6A62]">Metal Type & Purity:</span>
              <span className="font-bold">{product.metalPurity} {product.metalType}</span>
            </div>
            <div className="p-3 bg-[#FAF8F3] rounded-xl flex justify-between">
              <span className="text-[#6F6A62]">Gross Weight:</span>
              <span className="font-bold">{product.grossWeightGrams} grams</span>
            </div>
            <div className="p-3 bg-[#FAF8F3] rounded-xl flex justify-between">
              <span className="text-[#6F6A62]">Net Metal Weight:</span>
              <span className="font-bold">{netWeight} grams</span>
            </div>
            <div className="p-3 bg-[#FAF8F3] rounded-xl flex justify-between">
              <span className="text-[#6F6A62]">Return Eligibility:</span>
              <span className="font-bold text-[#2E7D5B]">{product.returnPolicyDays}-Day Easy Return Policy</span>
            </div>
          </div>
        )}

        {activeTab === 'certification' && (
          <div className="space-y-3 text-xs text-[#6F6A62] leading-relaxed">
            <p>
              This creation is officially hallmarked by BIS (Bureau of Indian Standards) carrying the unique 6-digit HUID code.
            </p>
            <div className="p-4 bg-[#FAF3E6] border border-[#D8C29D] rounded-2xl flex items-center gap-3 text-[#1B1A18]">
              <Award className="w-6 h-6 text-[#A67C32] shrink-0" />
              <span>
                Accompanying Lab Certificate: <strong>{product.certificationAgency || 'SGL Certified Lab Certificate'}</strong>.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#FFF9F0] border border-[#E9D9C5] rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-serif font-extrabold text-[#7A1822]">{product.rating}</span>
                  <div className="flex text-[#B8893D]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#796A65]">Based on {product.reviewCount || 12} verified buyer experiences</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-5 py-2 bg-[#7A1822] text-[#FFF9F0] text-xs font-bold rounded-xl uppercase tracking-wider shadow-md hover:bg-[#4D1017] transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Write a Review
              </button>
            </div>

            {/* Sample Reviews List */}
            <div className="space-y-4 divide-y divide-[#E9D9C5]">
              {[
                {
                  author: 'Maharani Rajeshwari Devi',
                  rating: 5,
                  date: '14 July 2026',
                  title: 'Exceptional craftsmanship & hallmarking clarity',
                  comment:
                    'The weight and finish of the 22K gold is flawless. Verified the 6-digit HUID code on the BIS CARE app instantly. Shipped with secure royal armored packaging.',
                },
                {
                  author: 'Vikramaditya Singhania',
                  rating: 5,
                  date: '28 June 2026',
                  title: 'Pure Sphatika beads with authentic lab certificate',
                  comment:
                    'The clarity of the quartz crystal beads is pristine. SGL laboratory QR certificate matched perfectly.',
                },
              ].map((rev, idx) => (
                <div key={idx} className="pt-4 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#281C18] flex items-center gap-1.5">
                      {rev.author}
                      <span className="text-[10px] text-[#2E7D5B] bg-[#2E7D5B]/10 px-2 py-0.5 rounded-full font-semibold">
                        Verified Patron
                      </span>
                    </span>
                    <span className="text-[#796A65] text-[11px]">{rev.date}</span>
                  </div>
                  <div className="flex text-[#B8893D] py-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="font-bold text-[#7A1822]">{rev.title}</p>
                  <p className="text-[#281C18] leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={product.category}
      />

      {/* Comparison Drawer */}
      <CompareDrawer />

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#281C18]/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#FFF9F0] w-full max-w-lg rounded-3xl border border-[#E9D9C5] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9D9C5]">
              <h3 className="font-serif font-bold text-base text-[#281C18]">Write a Patron Review</h3>
              <button onClick={() => setReviewModalOpen(false)} className="p-1 text-[#796A65]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Review Submitted', 'Thank you! Your feedback will be published post moderation.');
                setReviewModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-[#281C18] mb-1">Rating</label>
                <div className="flex gap-1 text-[#B8893D]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#281C18] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="e.g. Maharani Devi"
                  className="w-full bg-white border border-[#E9D9C5] rounded-xl px-3 py-2 text-xs text-[#281C18]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#281C18] mb-1">Headline / Summary</label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Masterpiece quality & hallmarking clarity"
                  className="w-full bg-white border border-[#E9D9C5] rounded-xl px-3 py-2 text-xs text-[#281C18]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#281C18] mb-1">Your Review</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience regarding weight, finish, hallmarking, or royal packaging..."
                  className="w-full bg-white border border-[#E9D9C5] rounded-xl px-3 py-2 text-xs text-[#281C18]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#7A1822] text-[#FFF9F0] font-bold rounded-xl uppercase tracking-wider shadow-md hover:bg-[#4D1017]"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox View */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
            <ImageWithFallback
              src={images[selectedImageIndex]}
              fallbackSrc={images[0]}
              alt={product.name}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white text-xs font-serif mt-4">{product.name} — High Resolution Studio View</p>
          </div>
        </div>
      )}

      {/* Formula Price Modal */}
      {showPriceModal && (
        <PriceBreakdownModal
          isOpen={showPriceModal}
          onClose={() => setShowPriceModal(false)}
          priceBreakdown={priceBreakdown}
          productName={product.name}
        />
      )}
    </div>
  );
};
