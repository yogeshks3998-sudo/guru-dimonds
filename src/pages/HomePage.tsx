import React, { useEffect, useState, useRef } from 'react';
import { navigateTo } from '../utils/navigation';
import { useCMSStore } from '../stores/useCMSStore';
import { useProductStore } from '../stores/useProductStore';
import { useMetalRateStore } from '../stores/useMetalRateStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useCartStore } from '../stores/useCartStore';
import { useToast } from '../components/ui/Toast';
import { formatINR } from '../utils/formatters';
import { calculateJewelleryPrice } from '../utils/pricing';
import { Product } from '../types';
import { ProductCard } from '../components/storefront/ProductCard';
import { TestimonialCarousel } from '../components/storefront/TestimonialCarousel';
import { NavarathnaGemstonesShowcase } from '../components/storefront/NavarathnaGemstonesShowcase';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { CubeButton } from '../components/ui/CubeButton';
import { isGemstoneProduct, productMatchesCategory } from '../utils/productFilters';
const spiritualCollectionImage = 'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=800&q=80';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  ArrowLeft,
  Gem,
  CheckCircle2,
  Sparkles,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Play,
  Gift,
  Truck,
  Users,
  TrendingUp,
  Star,
  Heart,
  ShoppingBag,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { cms } = useCMSStore();
  const { products, setSelectedCategory, setSelectedCollection, setSelectedGender, resetFilters } = useProductStore();
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const hero = cms.heroBanner;
  const rawHeroSlides = hero.slides && hero.slides.length > 0
    ? hero.slides
    : [
      {
        id: 'hero-slide-1',
        eyebrow: 'TIMELESS CRAFTSMANSHIP',
        title: 'Elegance with Purpose',
        subtitle: 'Sacred jewellery for a more mindful, balanced and beautiful you.',
        ctaLabel: 'EXPLORE NECK JEWELLERY',
        ctaLink: '/shop?category=Neck%20Jewellery',
        secondaryCtaLabel: 'WATCH STORY',
        secondaryCtaLink: '/about',
        imageUrl: '/hero/hero1.png',
        mobileImageUrl: '/hero/hero1.png',
      },
      {
        id: 'hero-slide-2',
        eyebrow: 'Sacred Sphatika Collection',
        title: 'Purity For Prayer And Peace',
        subtitle: 'Discover Sphatika maalas and spiritual accessories selected for clarity, authenticity, and devotional gifting.',
        ctaLabel: 'Explore Maalas',
        ctaLink: '/shop?category=Maalas',
        secondaryCtaLabel: 'About Our Quality',
        secondaryCtaLink: '/about',
        imageUrl: '/hero/hero-2.png',
        mobileImageUrl: '/hero/hero-2.png',
      },
      {
        id: 'hero-slide-3',
        eyebrow: 'RUDRAKSHA HERITAGE',
        title: 'Every Bead Carries Meaning',
        subtitle: 'Choose carefully verified 1-24 Mukhi Rudraksha maalas for spiritual practice, gifting, astrology, and daily devotion.',
        ctaLabel: 'SHOP RUDRAKSHA',
        ctaLink: '/shop?category=Rudraksha',
        secondaryCtaLabel: 'CONTACT STORE',
        secondaryCtaLink: '/contact',
        imageUrl: '/hero/hero3.png',
        mobileImageUrl: '/hero/hero3.png',
      },
    ];
  const heroSlides = rawHeroSlides.slice(0, 3);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const activeHeroSlide = heroSlides[activeHeroIndex] || heroSlides[0];

  const activeProducts = products.filter((product) => product.status === 'ACTIVE');
  const rankedActiveProducts = [...activeProducts].sort((a, b) => {
    const ratingDifference = (b.rating || 0) - (a.rating || 0);
    if (ratingDifference !== 0) return ratingDifference;
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  });

  const bestSellers = (
    activeProducts.some((product) => product.badges.includes('BEST_SELLER'))
      ? activeProducts.filter((product) => product.badges.includes('BEST_SELLER'))
      : rankedActiveProducts
  ).slice(0, 4);

  const ringsList = products
    .filter((p) => p.status === 'ACTIVE' && productMatchesCategory(p, 'Rings'))
    .slice(0, 4);
  const neckJewelleryList = products
    .filter((p) => p.status === 'ACTIVE' && productMatchesCategory(p, 'Neck Jewellery'))
    .slice(0, 4);
  const gemstonesList = products.filter((p) => p.category === 'Gemstones' && p.status === 'ACTIVE').slice(0, 4);
  const godStatuesList = products.filter((p) => p.category === 'God Small Statues' && p.status === 'ACTIVE').slice(0, 4);

  // Single representative product from each distinct category for auto-moving bestseller slots
  const allCategoryNames = [
    'Pendants',
    'Neck Jewellery',
    'Rings',
    'Earrings',
    'Bracelets & Bangles',
    'Gemstones',
    'Rudraksha',
    'Spiritual Maalas',
    'God Small Statues',
  ];

  const categoryShowcaseProducts: Product[] = React.useMemo(() => {
    const result: Product[] = [];
    const usedIds = new Set<string>();

    for (const cat of allCategoryNames) {
      const prod = products.find(
        (p) => p.status === 'ACTIVE' && productMatchesCategory(p, cat) && !usedIds.has(p.id)
      );
      if (prod) {
        result.push(prod);
        usedIds.add(prod.id);
      }
    }

    if (result.length < 4) {
      for (const p of activeProducts) {
        if (!usedIds.has(p.id)) {
          result.push(p);
          usedIds.add(p.id);
        }
      }
    }
    return result;
  }, [products, activeProducts]);

  const [bestsellerSlideIndex, setBestsellerSlideIndex] = useState(0);
  const [isBestsellerPaused, setIsBestsellerPaused] = useState(false);

  useEffect(() => {
    if (categoryShowcaseProducts.length <= 2 || isBestsellerPaused) return;

    const timer = window.setInterval(() => {
      setBestsellerSlideIndex((prev) => (prev + 1) % categoryShowcaseProducts.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [categoryShowcaseProducts.length, isBestsellerPaused]);

  useEffect(() => {
    if (activeHeroIndex >= heroSlides.length) {
      setActiveHeroIndex(0);
    }
  }, [activeHeroIndex, heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const handleHeroNavigation = (link: string) => {
    const targetLink = link || '/shop';

    if (targetLink.startsWith('/shop?')) {
      const queryString = targetLink.split('?')[1] || '';
      const params = new URLSearchParams(queryString);

      resetFilters();
      setSelectedCategory(params.get('category'));
      setSelectedCollection(params.get('collection'));
      setSelectedGender(params.get('gender'));
      navigateTo('/shop');
      return;
    }

    navigateTo(targetLink);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const firstChild = container.firstElementChild as HTMLElement;
      const cardWidth = firstChild ? firstChild.offsetWidth : 280;
      const gap = 20;
      const scrollDistance = (cardWidth + gap) * 2;
      container.scrollBy({ left: direction === 'left' ? -scrollDistance : scrollDistance, behavior: 'smooth' });
    }
  };

  const CategoryIcon: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-6 h-6 text-[#9A622A]' }) => {
    switch (type) {
      case 'Rings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="14.5" r="6.5" />
            <path d="M12 8l-2.5-3.5h5L12 8z" />
            <path d="M9.5 4.5h5" />
          </svg>
        );
      case 'Earrings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="8" cy="7.5" r="2.5" />
            <path d="M8 10v3" />
            <circle cx="8" cy="16" r="3" />
            <circle cx="16" cy="7.5" r="2.5" />
            <path d="M16 10v3" />
            <circle cx="16" cy="16" r="3" />
          </svg>
        );
      case 'Neck Jewellery':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4 6c3 8.5 13 8.5 16 0" />
            <circle cx="12" cy="14" r="2.2" />
            <path d="M12 16.2v2.3" />
            <circle cx="12" cy="19.5" r="0.8" fill="currentColor" />
          </svg>
        );
      case 'Pendants':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 3v3.5" />
            <circle cx="12" cy="4" r="1.5" />
            <path d="M12 6.5c-3.2 2.8-4.2 5.5-4.2 8.5a4.2 4.2 0 0 0 8.4 0c0-3-1-5.7-4.2-8.5z" />
            <circle cx="12" cy="14.5" r="1.5" fill="currentColor" />
          </svg>
        );
      case 'Bracelets & Bangles':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <ellipse cx="12" cy="12" rx="8" ry="5.2" transform="rotate(-20 12 12)" />
            <ellipse cx="12" cy="12" rx="5.8" ry="3.3" transform="rotate(-20 12 12)" />
            <circle cx="17.5" cy="9" r="0.9" fill="currentColor" />
          </svg>
        );
      case 'Gemstones':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="6 4 18 4 22 9.5 12 21 2 9.5 6 4" />
            <line x1="2" y1="9.5" x2="22" y2="9.5" />
            <line x1="12" y1="21" x2="6" y2="9.5" />
            <line x1="12" y1="21" x2="18" y2="9.5" />
            <line x1="6" y1="9.5" x2="9" y2="4" />
            <line x1="18" y1="9.5" x2="15" y2="4" />
          </svg>
        );
      case 'Spiritual Maalas':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="10" r="6.5" strokeDasharray="2.5 2.5" strokeWidth="1.8" />
            <circle cx="12" cy="16.5" r="1.5" />
            <path d="M12 18v3" />
            <path d="M10 21h4" />
          </svg>
        );
      case 'Rudraksha':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="7" />
            <path d="M12 5v14" />
            <path d="M7 7.5c2 2 2 7 0 9" />
            <path d="M17 7.5c-2 2-2 7 0 9" />
          </svg>
        );
      case 'God Small Statues':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 3v3" />
            <path d="M6.5 9c2-2.5 9-2.5 11 0l1 9H5.5l1-9z" />
            <path d="M9 18v-3.5a3 3 0 0 1 6 0V18" />
            <circle cx="12" cy="11.5" r="1.2" fill="currentColor" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
    }
  };

  const categoryList = [
    {
      name: 'RINGS',
      category: 'Rings',
      image: '/categories/Rings.png',
      tagline: 'Bold designs, timeless elegance',
      iconType: 'Rings',
    },
    {
      name: 'EARRINGS',
      category: 'Earrings',
      image: '/categories/earrings.png',
      tagline: 'Grace in every detail',
      iconType: 'Earrings',
    },
    {
      name: 'NECK JEWELLERY',
      category: 'Neck Jewellery',
      image: '/categories/Neck%20Jewellery.png',
      tagline: 'Tradition meets modernity',
      iconType: 'Neck Jewellery',
    },
    {
      name: 'PENDANTS',
      category: 'Pendants',
      image: '/categories/Pendants.png',
      tagline: 'Meaningful pieces, lasting beauty',
      iconType: 'Pendants',
    },
    {
      name: 'BRACELETS & BANGLES',
      category: 'Bracelets & Bangles',
      image: '/categories/Bracelets%20&%20Bangles.png',
      tagline: 'Graceful contours, enduring charm',
      iconType: 'Bracelets & Bangles',
    },
    {
      name: 'GEMSTONES',
      category: 'Gemstones',
      image: '/categories/Gemstones.png',
      tagline: 'Astrological purity, natural radiance',
      iconType: 'Gemstones',
    },
    {
      name: 'SPIRITUAL MAALAS',
      category: 'Spiritual Maalas',
      image: '/categories/Spiritual%20Maalas.png',
      tagline: 'Sacred beads, inner peace',
      iconType: 'Spiritual Maalas',
    },
    {
      name: 'RUDRAKSHA',
      category: 'Rudraksha',
      image: '/categories/Rudraksha.png',
      tagline: 'Divine power, certified authenticity',
      iconType: 'Rudraksha',
    },
    {
      name: 'GOD SMALL STATUES',
      category: 'God Small Statues',
      image: '/categories/God%20Small%20Statues.png',
      tagline: 'Sacred blessings, devotional grace',
      iconType: 'God Small Statues',
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-clip bg-[#FFF9F0] text-[#281C18] flex flex-col">
      {/* 1. Hero Campaign Section (Full Width Edge-to-Edge) */}
      <section className="relative w-full overflow-hidden bg-[#FBF7F0] text-[#281C18] min-h-[495px] sm:min-h-[575px] lg:min-h-[685px] xl:min-h-[745px] flex items-center">
        {/* Full Width Background Image Carousel (Only images from public/hero) */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, index) => {
            const localHeroImages = ['/hero/hero1.png', '/hero/hero2.png', '/hero/hero3.png'];
            const localSrc = slide.imageUrl || localHeroImages[index % localHeroImages.length];

            return (
              <img
                key={slide.id}
                src={localSrc}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${index === activeHeroIndex ? 'opacity-100' : 'opacity-0'
                  }`}
              />
            );
          })}
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-20">
          {activeHeroIndex === 0 ? (
            /* SLIDE 1: EXACT MATCH WITH USER'S REFERENCE IMAGE */
            <div className="max-w-2xl space-y-5 sm:space-y-6">
              {/* Eyebrow with gold line */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#9A622A]">
                  TIMELESS CRAFTSMANSHIP
                </span>
                <span className="h-[1px] w-12 sm:w-16 bg-[#9A622A]/60" />
              </div>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[1.05] tracking-tight text-[#1B1A18]">
                Elegance
                <span className="text-[#6D121B] block font-serif">with Purpose</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-[#5A524C] font-sans leading-relaxed max-w-xl font-normal">
                Sacred jewellery for a more mindful, balanced and beautiful you.
              </p>

              {/* 3 Feature Pillars in a Row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg pt-1">
                {/* Item 1 */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF3E8] border border-[#E6D2BC] flex items-center justify-center text-[#9A622A] shadow-xs">
                    <Gem className="w-5 h-5 text-[#9A622A]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-[#1B1A18] leading-tight">Authentic Products</span>
                </div>

                {/* Item 2 */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF3E8] border border-[#E6D2BC] flex items-center justify-center text-[#9A622A] shadow-xs">
                    <svg className="w-5 h-5 text-[#9A622A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 4c-1.5 3-4 6-8 7 3.5 1.5 7 1.5 8-1 1 2.5 4.5 2.5 8 1-4-1-6.5-4-8-7z" />
                      <path d="M12 10c-2 3.5-5 5.5-9 6 3 2 6 2 9-0.5 3 2.5 6 2.5 9 0.5-4-0.5-7-2.5-9-6z" />
                    </svg>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-[#1B1A18] leading-tight">Premium Craftsmanship</span>
                </div>

                {/* Item 3 */}
                <div className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF3E8] border border-[#E6D2BC] flex items-center justify-center text-[#9A622A] shadow-xs">
                    <Gift className="w-5 h-5 text-[#9A622A]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-[#1B1A18] leading-tight">Meaningful Gifting</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Neck Jewellery');
                    navigateTo('/shop');
                  }}
                  className="px-6 sm:px-8 py-3.5 rounded-full bg-[#6D121B] hover:bg-[#520B12] text-white text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>EXPLORE NECK JEWELLERY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/about')}
                  className="flex items-center gap-2.5 text-[#1B1A18] hover:text-[#6D121B] font-bold text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full border border-[#1B1A18] group-hover:border-[#6D121B] flex items-center justify-center transition-colors">
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                  </div>
                  <span>WATCH STORY</span>
                </button>
              </div>
            </div>
          ) : activeHeroIndex === 1 ? (
            /* SLIDE 2: EXACT MATCH WITH USER'S REFERENCE IMAGE (ALIGNED TO THE RIGHT) */
            <div className="max-w-xl ml-auto lg:translate-x-16 xl:translate-x-20 space-y-5 sm:space-y-6 text-left">
              {/* Eyebrow with gold line */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#D8B474]">
                  TIMELESS ELEGANCE
                </span>
                <span className="h-[1px] w-12 sm:w-16 bg-[#D8B474]/60" />
              </div>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[1.05] tracking-tight">
                <span className="text-[#FFFDF9] block font-serif">JEWELLERY</span>
                <span className="text-[#D8B474] block font-serif">THAT CONNECTS</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-[#D6DCD7] font-sans leading-relaxed max-w-lg font-normal">
                A beautiful blend of tradition and modern design, for every meaningful moment.
              </p>

              {/* 3 Feature Pillars in a Row with subtle vertical dividers */}
              <div className="flex items-center gap-4 sm:gap-6 pt-1 max-w-lg">
                {/* Item 1 */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1A3328] border border-[#2D5443] flex items-center justify-center text-[#D8B474] shadow-xs">
                    <Gem className="w-5 h-5 text-[#D8B474]" />
                  </div>
                  <span className="font-medium text-[11px] sm:text-xs text-[#E4EDE7] leading-tight">
                    Certified<br />Gemstones
                  </span>
                </div>

                {/* Divider */}
                <span className="h-10 w-[1px] bg-[#2D5443]/80 my-auto" />

                {/* Item 2 */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1A3328] border border-[#2D5443] flex items-center justify-center text-[#D8B474] shadow-xs">
                    <svg className="w-5 h-5 text-[#D8B474]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 4c-1.5 3-4 6-8 7 3.5 1.5 7 1.5 8-1 1 2.5 4.5 2.5 8 1-4-1-6.5-4-8-7z" />
                      <path d="M12 10c-2 3.5-5 5.5-9 6 3 2 6 2 9-0.5 3 2.5 6 2.5 9 0.5-4-0.5-7-2.5-9-6z" />
                    </svg>
                  </div>
                  <span className="font-medium text-[11px] sm:text-xs text-[#E4EDE7] leading-tight">
                    Thoughtful<br />Craftsmanship
                  </span>
                </div>

                {/* Divider */}
                <span className="h-10 w-[1px] bg-[#2D5443]/80 my-auto" />

                {/* Item 3 */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1A3328] border border-[#2D5443] flex items-center justify-center text-[#D8B474] shadow-xs">
                    <Gift className="w-5 h-5 text-[#D8B474]" />
                  </div>
                  <span className="font-medium text-[11px] sm:text-xs text-[#E4EDE7] leading-tight">
                    Meaningful<br />Gifting
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    navigateTo('/shop');
                  }}
                  className="px-8 py-3.5 rounded-full bg-[#E5BA78] hover:bg-[#D4A55E] text-[#1B1A18] text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight className="w-4 h-4 text-[#1B1A18]" />
                </button>
              </div>
            </div>
          ) : (
            /* SLIDE 3: EXACT MATCH WITH USER'S REFERENCE IMAGE */
            <div className="max-w-2xl space-y-5 sm:space-y-6 text-left">
              {/* Eyebrow with line on left */}
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-12 sm:w-16 bg-[#D8B474]/60" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#D8B474]">
                  RUDRAKSHA HERITAGE
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[1.05] tracking-tight text-[#FFFDF9]">
                Every Bead<br />
                Carries
                <span className="text-[#D8B474] block font-serif">Meaning</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-[#D6D0C7] font-sans leading-relaxed max-w-xl font-normal">
                Choose carefully verified 1-24 Mukhi Rudraksha maalas for spiritual practice, gifting, astrology, and daily devotion.
              </p>

              {/* Buttons Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Rudraksha');
                    navigateTo('/shop');
                  }}
                  className="px-7 sm:px-8 py-3.5 rounded-full bg-[#E5BA78] hover:bg-[#D4A55E] text-[#1B1A18] text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-2 shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>SHOP RUDRAKSHA</span>
                  <ArrowRight className="w-4 h-4 text-[#1B1A18]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/contact')}
                  className="px-7 sm:px-8 py-3.5 rounded-full bg-transparent hover:bg-white/10 border border-[#D8B474]/80 text-[#FFFDF9] text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-2 transition-all duration-200 cursor-pointer"
                >
                  <span>CONTACT STORE</span>
                  <ArrowRight className="w-4 h-4 text-[#D8B474]" />
                </button>
              </div>

              {/* 3 Trust Features with Dividers */}
              <div className="flex items-center gap-4 sm:gap-6 pt-3 max-w-lg text-[#E4EDE7]">
                {/* Feature 1 */}
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 text-[#D8B474] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4c-1.5 3-4 6-8 7 3.5 1.5 7 1.5 8-1 1 2.5 4.5 2.5 8 1-4-1-6.5-4-8-7z" />
                    <path d="M12 10c-2 3.5-5 5.5-9 6 3 2 6 2 9-0.5 3 2.5 6 2.5 9 0.5-4-0.5-7-2.5-9-6z" />
                  </svg>
                  <span className="text-[11px] sm:text-xs font-medium leading-tight">Authentic<br />& Verified</span>
                </div>

                {/* Divider */}
                <span className="h-7 w-[1px] bg-[#D8B474]/40" />

                {/* Feature 2 */}
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#D8B474] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-medium leading-tight">Trusted<br />Quality</span>
                </div>

                {/* Divider */}
                <span className="h-7 w-[1px] bg-[#D8B474]/40" />

                {/* Feature 3 */}
                <div className="flex items-center gap-2.5">
                  <Truck className="w-5 h-5 text-[#D8B474] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-medium leading-tight">Shipping<br />Across India</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide Indicators & Chevron Controls (Bottom Bar) */}
        <div className="absolute bottom-6 left-0 right-0 z-20 max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between pointer-events-none">
          {/* Bottom Left Index Indicator */}
          <div className="flex items-center gap-3 text-xs font-mono font-bold tracking-widest pointer-events-auto text-[#1B1A18]">
            <span>{String(activeHeroIndex + 1).padStart(2, '0')}</span>
            <div className="flex items-center gap-1.5">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveHeroIndex(index)}
                  aria-label={`Show hero slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${index === activeHeroIndex
                      ? 'w-8 bg-[#6D121B]'
                      : 'w-3 bg-[#9A622A]/40 hover:bg-[#9A622A]/80'
                    }`}
                />
              ))}
            </div>
            <span>{String(heroSlides.length).padStart(2, '0')}</span>
          </div>

          {/* Bottom Right Chevron Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveHeroIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FAF3E8] border border-[#E6D2BC] text-[#1B1A18] flex items-center justify-center hover:bg-[#6D121B] hover:text-white transition-all shadow-sm cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveHeroIndex((prev) => (prev + 1) % heroSlides.length)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FAF3E8] border border-[#E6D2BC] text-[#1B1A18] flex items-center justify-center hover:bg-[#6D121B] hover:text-white transition-all shadow-sm cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section (Curated Masterpieces) */}
      <section className="relative bg-[#FAF5EE] py-16 sm:py-24 border-b border-[#E9D9C5] overflow-hidden">
        {/* Soft Ambient Leaf / Shadow Overlays */}
        <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none opacity-25 select-none">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#C5A880]/40">
            <circle cx="30" cy="30" r="90" fill="currentColor" filter="blur(50px)" />
          </svg>
        </div>
        <div className="absolute -bottom-10 -left-10 w-52 h-52 pointer-events-none opacity-40 select-none hidden sm:block">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-full h-full text-[#C5A880]">
            <path d="M40 180 C30 140 60 110 100 110 C140 110 170 140 160 180 Z" fill="#EAE0D2" fillOpacity="0.4" />
            <circle cx="85" cy="120" r="10" stroke="#C5A880" />
            <circle cx="115" cy="115" r="8" stroke="#C5A880" />
          </svg>
        </div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 pointer-events-none opacity-25 select-none hidden sm:block">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#6E8B68]">
            <path d="M180 180 C140 150 120 110 130 60 C160 80 180 120 180 180 Z" fill="currentColor" fillOpacity="0.4" />
            <path d="M150 190 C120 160 105 130 115 90 C140 110 155 145 150 190 Z" fill="currentColor" fillOpacity="0.3" />
          </svg>
        </div>

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          {/* Header with delicate lines, title and subtitle */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 sm:w-16 bg-[#B8893D]/60" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#B8893D]">
                CURATED MASTERPIECES
              </span>
              <span className="h-[1px] w-8 sm:w-16 bg-[#B8893D]/60" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1B1A18] tracking-tight uppercase">
              EXPLORE CATEGORIES
            </h2>
            <p className="text-xs sm:text-sm text-[#7A746B] font-light">
              Timeless designs for every occasion
            </p>
          </div>

          {/* Single Line Horizontal Carousel */}
          <div className="relative group px-6 sm:px-12 lg:px-14">
            {/* Floating Side Left Arrow (Aligned towards outer border) */}
            <button
              onClick={() => scrollCategories('left')}
              className="flex absolute left-0 sm:left-1 top-[36%] -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FFFBF5] border border-[#E0D0BE] text-[#9A622A] items-center justify-center shadow-md hover:bg-[#7A1822] hover:text-[#FFF9F0] hover:border-[#7A1822] transition-all cursor-pointer"
              aria-label="Scroll categories left"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Cards Container */}
            <div
              ref={categoryScrollRef}
              className="flex items-start gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-4 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categoryList.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat.category);
                    navigateTo('/shop');
                  }}
                  className="shrink-0 w-[calc((100%-1rem)/2)] min-w-[145px] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2*1.5rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)] group/cat cursor-pointer flex flex-col items-center select-none"
                >
                  {/* Orbital Circular Image Presentation */}
                  <div className="relative w-full aspect-square flex items-center justify-center p-2.5 sm:p-3.5">
                    {/* Golden orbital ring with accent dots */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none -rotate-6 group-hover/cat:rotate-0 transition-transform duration-700 ease-out"
                      viewBox="0 0 200 200"
                      fill="none"
                    >
                      <circle cx="100" cy="100" r="95" stroke="#C5A880" strokeWidth="1.2" strokeOpacity="0.75" />
                      <circle cx="178" cy="50" r="3.2" fill="#B8893D" />
                      <circle cx="22" cy="50" r="3.2" fill="#B8893D" />
                    </svg>

                    {/* Main Circular Image */}
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-[#FAF6F0]">
                      <ImageWithFallback
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover/cat:scale-108 transition-transform duration-700 ease-out"
                      />
                    </div>

                    {/* Overlapping Round Icon Badge at Bottom Center with Clean Cutout Ring Gap */}
                    <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FFFBF5] ring-4 ring-[#FAF5EE] border border-[#D5BA96] flex items-center justify-center shadow-md text-[#9A622A] group-hover/cat:scale-110 group-hover/cat:border-[#7A1822] group-hover/cat:text-[#7A1822] transition-all duration-300">
                      <CategoryIcon type={cat.iconType} className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" />
                    </div>
                  </div>

                  {/* Title, Subtitle and Explore Button */}
                  <div className="mt-5 sm:mt-6 text-center space-y-1 sm:space-y-1.5 flex flex-col items-center w-full px-1">
                    <h3 className="font-sans font-bold text-xs sm:text-sm tracking-[0.22em] text-[#1B1A18] uppercase group-hover/cat:text-[#7A1822] transition-colors leading-tight line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#7A746B] font-light leading-relaxed line-clamp-1">
                      {cat.tagline}
                    </p>

                    {/* Explore Pill Button */}
                    <div className="pt-2 w-full flex justify-center">
                      <button
                        type="button"
                        className="px-5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#7A1822] hover:bg-[#5C1019] text-white text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <span>EXPLORE</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Side Right Arrow (Aligned towards outer border) */}
            <button
              onClick={() => scrollCategories('right')}
              className="flex absolute right-0 sm:right-1 top-[36%] -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FFFBF5] border border-[#E0D0BE] text-[#9A622A] items-center justify-center shadow-md hover:bg-[#7A1822] hover:text-[#FFF9F0] hover:border-[#7A1822] transition-all cursor-pointer"
              aria-label="Scroll categories right"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2.5. About Guru Diamonds Section (Pixel-Perfect Reference Match with Seamless Blend & Smoke/Silk Overlay) */}
      <section className="relative w-full bg-[#FAF5EC] py-16 sm:py-20 lg:py-24 border-b border-[#E9D9C5] overflow-hidden">

        {/* Soft Lotus Floral Watermark Artwork in Top Right Background */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] pointer-events-none opacity-20 text-[#C5A880]">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.85" className="w-full h-full">
            <path d="M100 20 C105 50 120 70 140 85 C160 70 175 50 180 20 C160 45 130 55 100 20 Z" />
            <path d="M100 20 C95 50 80 70 60 85 C40 70 25 50 20 20 C40 45 70 55 100 20 Z" />
            <path d="M100 60 C120 85 145 110 180 120 C155 135 125 130 100 160 C75 130 45 135 20 120 C55 110 80 85 100 60 Z" />
            <path d="M100 70 C110 90 130 110 160 120 C140 130 115 125 100 145 C85 125 60 130 40 120 C70 110 90 90 100 70 Z" />
            <circle cx="100" cy="110" r="30" strokeDasharray="2 3" />
          </svg>
        </div>

        {/* Far-Left Vertical Tradition Text */}
        <div className="hidden xl:flex items-center left-4 absolute top-1/2 -translate-y-1/2 -rotate-90 origin-center select-none pointer-events-none z-20">
          <span className="text-[10px] tracking-[0.38em] font-sans font-medium uppercase text-[#A89887] whitespace-nowrap">
            TRADITION &nbsp;|&nbsp; CRAFTSMANSHIP &nbsp;|&nbsp; TRUST
          </span>
        </div>

        <div className="max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column: Seamless Showcase Image with On-Image Gradient & Overlay */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#E8DEC8]/80 bg-[#F4EDE2] aspect-[4/3] sm:aspect-[16/11] lg:aspect-[16/11] group">

                {/* Background Showcase Photo */}
                <img
                  src="/home-about-showcase.png"
                  alt="Guru Diamonds Sacred Heritage Jewellery"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                />

                {/* Soft Right-Side Natural Blend Gradient (Blends into section background on the right) */}
                <div className="absolute inset-y-0 right-0 w-24 sm:w-32 bg-gradient-to-l from-[#FAF5EC]/80 to-transparent pointer-events-none hidden sm:block" />

                {/* Bottom Silk/Smoke Soft Fog Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/70 via-white/20 to-transparent pointer-events-none" />

                {/* Bottom Left Minimalist Line & Typography Overlay (Exact Match with Reference) */}
                <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-7 z-20 pointer-events-none">
                  <div className="border-l-2 border-[#8E7969] pl-3">
                    <span className="text-[10px] sm:text-[11px] font-serif tracking-[0.24em] uppercase text-[#38281F] font-bold block">
                      MORE THAN JEWELLERY
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.2em] uppercase text-[#6B5A4E] font-medium block mt-0.5">
                      A LEGACY OF FAITH
                    </span>
                  </div>
                  <div className="h-[1px] w-36 sm:w-52 bg-[#8E7969]/50 mt-1.5" />
                </div>

              </div>
            </div>

            {/* Right Column: About Us Content & Pillars */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 lg:pl-2">

              {/* Eyebrow & Title */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#9A622A]">
                    A BIT
                  </span>
                  <span className="h-[1px] w-14 sm:w-20 bg-[#B8893D]/60" />
                </div>

                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1B1613] tracking-tight uppercase leading-none">
                  ABOUT US
                </h2>

                <p className="text-xs sm:text-sm font-bold tracking-[0.24em] text-[#9A622A] uppercase font-sans pt-1">
                  CRAFTING SACRED ELEGANCE SINCE GENERATIONS
                </p>
              </div>

              {/* Descriptive Paragraphs */}
              <div className="space-y-3.5 text-xs sm:text-sm lg:text-[14.5px] text-[#554E48] leading-relaxed font-sans font-normal">
                <p>
                  At Guru Diamonds, we bring together authentic craftsmanship, certified gemstones, and timeless silver jewelry to create pieces that carry beauty, meaning, and spiritual significance. From Vedic gemstones and Navarathna collections to handcrafted rings, pendants, Rudraksha combinations, and divine silver idols, every creation is designed with precision, purity, and purpose.
                </p>
                <p className="text-[#6F6760]">
                  Our commitment to authenticity, quality, and customer trust has made us a preferred destination for those seeking both luxury and spiritual value.
                </p>
              </div>

              {/* 4 Feature Heritage Pillars with Vertical Dividers */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-3 border-t border-[#E8D9C8]">

                {/* Pillar 1: Authentic Gemstones */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-[120px] sm:min-w-0 group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0E1] border border-[#E2CEB8] flex items-center justify-center text-[#9A622A] shadow-2xs group-hover:scale-110 transition-transform">
                    <Gem className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#281C18] leading-tight">
                    AUTHENTIC<br />GEMSTONES
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="h-9 w-[1px] bg-[#E2D2C1] hidden sm:block shrink-0" />

                {/* Pillar 2: Expert Craftsmanship */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-[120px] sm:min-w-0 group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0E1] border border-[#E2CEB8] flex items-center justify-center text-[#9A622A] shadow-2xs group-hover:scale-110 transition-transform">
                    <Wrench className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#281C18] leading-tight">
                    EXPERT<br />CRAFTSMANSHIP
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="h-9 w-[1px] bg-[#E2D2C1] hidden sm:block shrink-0" />

                {/* Pillar 3: Trusted Quality */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-[120px] sm:min-w-0 group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0E1] border border-[#E2CEB8] flex items-center justify-center text-[#9A622A] shadow-2xs group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#281C18] leading-tight">
                    TRUSTED<br />QUALITY
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="h-9 w-[1px] bg-[#E2D2C1] hidden sm:block shrink-0" />

                {/* Pillar 4: Spiritual Significance */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-[120px] sm:min-w-0 group">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0E1] border border-[#E2CEB8] flex items-center justify-center text-[#9A622A] shadow-2xs group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4.5 h-4.5 text-[#9A622A]" />
                  </div>
                  <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#281C18] leading-tight">
                    SPIRITUAL<br />SIGNIFICANCE
                  </span>
                </div>

              </div>

              {/* Call to Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('/about')}
                  className="px-8 sm:px-9 py-3.5 rounded-full bg-[#6D121B] hover:bg-[#520911] text-white text-xs font-bold uppercase tracking-[0.16em] flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>EXPLORE MORE</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2.6. Statistics Bar */}
      <section className="w-full bg-[#5E0D17] text-white py-10 sm:py-12 border-t border-[#7A1822]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-center">

          {/* Stat 1 */}
          <div className="flex flex-col items-center space-y-2 group">
            <div className="w-12 h-12 rounded-full bg-[#7A1822] border border-[#D4AF37]/40 flex items-center justify-center text-[#E8C589] shadow-sm group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-[#E8C589]" />
            </div>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E8C589] tracking-tight">
              5000+
            </span>
            <span className="text-xs sm:text-sm text-[#F7E7CE]/90 font-medium">
              Satisfied Customers
            </span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center space-y-2 group">
            <div className="w-12 h-12 rounded-full bg-[#7A1822] border border-[#D4AF37]/40 flex items-center justify-center text-[#E8C589] shadow-sm group-hover:scale-110 transition-transform">
              <Gem className="w-6 h-6 text-[#E8C589]" />
            </div>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E8C589] tracking-tight">
              100%
            </span>
            <span className="text-xs sm:text-sm text-[#F7E7CE]/90 font-medium">
              Certified Gemstones
            </span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center space-y-2 group">
            <div className="w-12 h-12 rounded-full bg-[#7A1822] border border-[#D4AF37]/40 flex items-center justify-center text-[#E8C589] shadow-sm group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-[#E8C589]" />
            </div>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E8C589] tracking-tight">
              25+
            </span>
            <span className="text-xs sm:text-sm text-[#F7E7CE]/90 font-medium">
              Years of Craftsmanship
            </span>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center space-y-2 group">
            <div className="w-12 h-12 rounded-full bg-[#7A1822] border border-[#D4AF37]/40 flex items-center justify-center text-[#E8C589] shadow-sm group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6 text-[#E8C589]" />
            </div>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E8C589] tracking-tight">
              Pan India
            </span>
            <span className="text-xs sm:text-sm text-[#F7E7CE]/90 font-medium">
              Secure Delivery
            </span>
          </div>

        </div>
      </section>

      {/* 2.7. Signature Bestsellers (Redesigned with Featured Dark Card + 3 Product Cards) */}
      <section className="relative w-full bg-[#FAF5EE] py-18 sm:py-24 border-b border-[#E9D9C5] overflow-hidden">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#E8D9C8] pb-6 gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.26em] text-[#9A622A]">
                  PATRON FAVORITES
                </span>
                <span className="h-[1px] w-12 sm:w-16 bg-[#B8893D]/60" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3B0910] tracking-tight">
                SIGNATURE BESTSELLERS
              </h2>
              <p className="text-xs sm:text-sm text-[#796A65] font-normal leading-relaxed">
                Timeless designs. Meaningful creations. Our most loved pieces, chosen by customers across the world.
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6">
              <button
                type="button"
                onClick={() => navigateTo('/shop')}
                className="px-7 sm:px-8 py-3 rounded-full bg-[#520911] hover:bg-[#3B040A] text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>EXPLORE ALL</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="hidden xl:flex flex-col items-end text-right pl-4">
                <span className="text-[10px] tracking-[0.24em] font-serif text-[#8E7969] uppercase font-bold">
                  TRADITION
                </span>
                <span className="text-[10px] tracking-[0.18em] font-serif text-[#8E7969] uppercase font-medium">
                  WEARS BEAUTIFULLY
                </span>
                <span className="h-[1px] w-14 bg-[#B8893D]/50 mt-1.5" />
              </div>
            </div>
          </div>

          {/* Cards Asymmetric Grid: Card 1 is extra wide (50%), accompanied by 2 product cards (25% each) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">

            {/* Card 1: Extra-Wide Featured Dark Hero Pendant Card (Navigates to Pendants) */}
            <div
              onClick={() => {
                setSelectedCategory('Pendants');
                navigateTo('/shop');
              }}
              className="md:col-span-2 lg:col-span-6 relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group cursor-pointer bg-[#200407] min-h-[420px] flex flex-col justify-between p-6 sm:p-8 border border-[#4A1118]"
            >
              {/* Background Image of Ganesha Om Divine Pendant on rock positioned prominently on the right */}
              <img
                src="/bestseller-featured-pendant.png"
                alt="Divine Omkara Diamond Studded Silver Pendant"
                className="absolute inset-0 w-full h-full object-cover object-[80%_center] group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              {/* Soft dark gradient on left half to give text high contrast while clearly revealing the pendant on the right */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F0407]/95 via-[#1F0407]/70 to-[#1F0407]/30 sm:bg-gradient-to-r sm:from-[#1F0407]/95 sm:via-[#1F0407]/75 sm:to-transparent pointer-events-none" />

              {/* Top Badge */}
              <div className="relative z-10">
                <span className="bg-[#D4A759] text-[#1B1107] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.14em] px-3 py-1 rounded-sm shadow-sm inline-block">
                  BEST SELLER
                </span>
              </div>

              {/* Bottom Content Area (Comfortably fits on the left side) */}
              <div className="relative z-10 space-y-4 max-w-[280px] sm:max-w-[340px] pt-12 sm:pt-16">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-[#FFFDF9] leading-snug group-hover:text-[#E5BA78] transition-colors">
                    Divine Omkara Diamond Studded Silver Pendant
                  </h3>
                  <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[#D8B474] font-semibold mt-2">
                    925 SILVER | WHITE
                  </p>
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                    ₹3,914
                  </span>
                  <span className="text-sm sm:text-base text-[#D1B59F] line-through font-normal">
                    ₹4,606
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-sm bg-white hover:bg-[#FAF0E6] text-[#280409] text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] shadow-md group-hover:gap-3.5 transition-all cursor-pointer"
                  >
                    <span>VIEW PRODUCT</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#280409]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-moving 2nd & 3rd Cards Across All Categories (2-Column on Mobile) */}
            <div
              className="md:col-span-2 lg:col-span-6 grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-5 relative pb-8 group/bestseller-carousel"
              onMouseEnter={() => setIsBestsellerPaused(true)}
              onMouseLeave={() => setIsBestsellerPaused(false)}
            >
              {/* Product Slot 1 */}
              {categoryShowcaseProducts.length > 0 && (
                <div
                  key={`slot1-${categoryShowcaseProducts[bestsellerSlideIndex % categoryShowcaseProducts.length]?.id}`}
                  className="flex flex-col transition-all duration-500 ease-out"
                >
                  <ProductCard
                    product={categoryShowcaseProducts[bestsellerSlideIndex % categoryShowcaseProducts.length]}
                  />
                </div>
              )}

              {/* Product Slot 2 */}
              {categoryShowcaseProducts.length > 1 && (
                <div
                  key={`slot2-${categoryShowcaseProducts[(bestsellerSlideIndex + 1) % categoryShowcaseProducts.length]?.id}`}
                  className="flex flex-col transition-all duration-500 ease-out"
                >
                  <ProductCard
                    product={categoryShowcaseProducts[(bestsellerSlideIndex + 1) % categoryShowcaseProducts.length]}
                  />
                </div>
              )}

              {/* Floating Slide Navigation Controls on Right */}
              <div className="absolute bottom-0 right-0 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 z-10 pt-1">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#9A622A] truncate max-w-[200px]">
                  {categoryShowcaseProducts[bestsellerSlideIndex % categoryShowcaseProducts.length]?.category || 'Category'} &{' '}
                  {categoryShowcaseProducts[(bestsellerSlideIndex + 1) % categoryShowcaseProducts.length]?.category || 'Jewellery'}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setBestsellerSlideIndex((prev) =>
                        prev === 0 ? categoryShowcaseProducts.length - 1 : prev - 1
                      )
                    }
                    className="w-6 h-6 rounded-full bg-white border border-[#E0D0BE] flex items-center justify-center text-[#281C18] hover:bg-[#7A1822] hover:text-white transition-all shadow-2xs cursor-pointer"
                    aria-label="Previous Category"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBestsellerSlideIndex((prev) => (prev + 1) % categoryShowcaseProducts.length)
                    }
                    className="w-6 h-6 rounded-full bg-white border border-[#E0D0BE] flex items-center justify-center text-[#281C18] hover:bg-[#7A1822] hover:text-white transition-all shadow-2xs cursor-pointer"
                    aria-label="Next Category"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Sacred Rudraksha (1 to 24 Mukhi) & Maalas Spotlight */}
      <section className="relative w-full bg-[url('/spiritual-heritage-bg.png')] bg-cover bg-center bg-no-repeat py-16 sm:py-20 lg:py-24 border-y border-[#E9D9C5] overflow-hidden">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Eyebrow */}
            <div className="flex items-center justify-center lg:justify-start gap-2.5 text-[#9A622A]">
              <svg className="w-5 h-5 text-[#9A622A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4c-1.5 3-4 6-8 7 3.5 1.5 7 1.5 8-1 1 2.5 4.5 2.5 8 1-4-1-6.5-4-8-7z" />
                <path d="M12 10c-2 3.5-5 5.5-9 6 3 2 6 2 9-0.5 3 2.5 6 2.5 9 0.5-4-0.5-7-2.5-9-6z" />
              </svg>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#9A622A]">
                TIMELESS SPIRITUAL HERITAGE
              </span>
              <span className="h-[1px] w-8 sm:w-12 bg-[#9A622A]/60" />
            </div>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B1A18] leading-[1.15] tracking-tight text-center lg:text-left">
              Certified 1–24 Mukhi
              <span className="text-[#6D121B] block font-serif mt-1">Rudraksha Collection</span>
            </h2>

            {/* Paragraph */}
            <p className="text-xs sm:text-sm lg:text-[14px] text-[#554E48] leading-relaxed font-sans max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              Honor centuries of Vedic tradition with our carefully curated collection of authentic 1 Mukhi to 24 Mukhi Rudrakshas. Every bead undergoes strict authenticity verification and is beautifully finished for lifelong spiritual practice and wear.
            </p>

            {/* 3 Feature Pillars */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-1 max-w-xl mx-auto lg:mx-0">
              {/* Feature 1 */}
              <div className="space-y-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF3E8] border border-[#E6D2BC] flex items-center justify-center text-[#9A622A] shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#9A622A]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1B1A18]">100% Genuine</h4>
                  <p className="text-[10px] sm:text-[11px] text-[#7A746B] mt-0.5">Lab Certified</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="space-y-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF3E8] border border-[#E6D2BC] flex items-center justify-center text-[#9A622A] shadow-xs">
                  <svg className="w-5 h-5 text-[#9A622A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4c-1.5 3-4 6-8 7 3.5 1.5 7 1.5 8-1 1 2.5 4.5 2.5 8 1-4-1-6.5-4-8-7z" />
                    <path d="M12 10c-2 3.5-5 5.5-9 6 3 2 6 2 9-0.5 3 2.5 6 2.5 9 0.5-4-0.5-7-2.5-9-6z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1B1A18]">Complete Range</h4>
                  <p className="text-[10px] sm:text-[11px] text-[#7A746B] mt-0.5">1 Mukhi to 24 Mukhi</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="space-y-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FAF3E8] border border-[#E6D2BC] flex items-center justify-center text-[#9A622A] shadow-xs">
                  <Gem className="w-5 h-5 text-[#9A622A]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1B1A18]">Multiple Options</h4>
                  <p className="text-[10px] sm:text-[11px] text-[#7A746B] mt-0.5 leading-tight">Loose Beads, Silver-Capped & Custom Pendants</p>
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Rudraksha');
                  navigateTo('/shop');
                }}
                className="px-6 sm:px-8 py-3 rounded-full bg-[#6D121B] hover:bg-[#520B12] text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>BROWSE ALL RUDRAKSHAS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo('/contact')}
                className="px-6 sm:px-7 py-3 rounded-full bg-white/90 hover:bg-white border border-[#B8893D] text-[#6D121B] text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>REQUEST EXPERT GUIDANCE</span>
                <Mail className="w-4 h-4 text-[#6D121B]" />
              </button>
            </div>

            {/* Trust Points Footer */}
            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-[10px] sm:text-[11px] text-[#7A746B]">
              <div className="flex items-center gap-2">
                <span className="h-[1px] w-4 bg-[#B8893D]/70" />
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#9A622A] block">AUTHENTIC</span>
                  <strong className="text-[#281C18] text-[11px]">Vedic Source</strong>
                </div>
              </div>

              <span className="h-6 w-[1px] bg-[#D4C3AF]" />

              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#9A622A] block">TRUSTED BY</span>
                <strong className="text-[#281C18] text-[11px]">Thousands</strong>
              </div>

              <span className="h-6 w-[1px] bg-[#D4C3AF]" />

              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#9A622A] block">SUPPORT</span>
                <strong className="text-[#281C18] text-[11px]">Expert Guidance</strong>
              </div>
            </div>
          </div>

          {/* Right Chart Card Column */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[560px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#B8893D]/60 shadow-2xl bg-[#FFFDF9] p-3 sm:p-5">
              <img
                src="/rudraksha-chart.png"
                alt="Certified 1–24 Mukhi Rudraksha Collection"
                className="w-full h-auto object-contain rounded-xl hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Handcrafted Rings Collection Showcase */}
      <section className="bg-[#FBF6EE] py-14 sm:py-24 border-y border-[#E9D9C5]/80">
        <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between border-b border-[#E9D9C5] pb-5 gap-4 text-center sm:text-left">
            <div className="space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#7A1822]">
                  Timeless Masterpieces
                </span>
                <span className="h-[1px] w-8 sm:w-12 bg-[#7A1822]/40" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#281C18]">
                Handcrafted Rings Collection
              </h2>
              <p className="text-xs sm:text-sm text-[#796A65] max-w-2xl mx-auto sm:mx-0">
                Exquisitely crafted 925 sterling silver and astrological gemstone rings designed for elegance, power, and prestige.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Rings');
                navigateTo('/shop');
              }}
              className="btn-12 btn-12-burgundy shrink-0 cursor-pointer self-center sm:self-auto"
            >
              <span>Explore Rings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {ringsList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4.5. Certified Precious Gemstones & Navarathna Showcase */}
      <NavarathnaGemstonesShowcase />

      {/* 5. Handcrafted Neck Jewellery Collection Showcase */}
      <section className="relative w-full bg-[#FAF6F0] py-14 sm:py-24 border-b border-[#E9D9C5] overflow-hidden">
        <div className="relative z-10 max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between border-b border-[#E9D9C5]/80 pb-5 gap-4 text-center sm:text-left">
            <div className="space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#7A1822]">
                  Timeless Elegance
                </span>
                <span className="h-[1px] w-8 sm:w-12 bg-[#7A1822]/40" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B1A18] tracking-tight">
                Handcrafted Neck Jewellery Collection
              </h2>
              <p className="text-xs sm:text-sm text-[#6F6A62] max-w-2xl mx-auto sm:mx-0">
                Exquisite 925 sterling silver necklaces, malas, and sacred pendants designed for timeless beauty and spiritual grace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Neck Jewellery');
                navigateTo('/shop');
              }}
              className="btn-12 btn-12-burgundy shrink-0 cursor-pointer self-center sm:self-auto"
            >
              <span>Explore Neck Jewellery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {neckJewelleryList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Bespoke Customisation Service Banner (Left-Aligned with Reference Layout) */}
      <section className="relative w-full bg-[url('/bespoke-custom-bg.png')] bg-cover bg-center lg:bg-right bg-no-repeat text-[#FFF9F0] py-18 sm:py-24 lg:py-28 border-y border-[#B8893D]/40 overflow-hidden">
        {/* Subtle dark gradient overlay on mobile/tablet to ensure crisp readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#200407]/90 via-[#200407]/70 to-transparent lg:from-[#200407]/80 lg:via-[#200407]/40 lg:to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl space-y-6 sm:space-y-7">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A0407]/80 border border-[#D4AF37]/60 text-[#E8C589] text-[11px] font-bold uppercase tracking-[0.22em] shadow-sm backdrop-blur-xs">
              <Gem className="w-3.5 h-3.5 text-[#E8C589]" />
              <span>Bespoke Custom Service</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-[3.4rem] font-normal leading-[1.1] tracking-tight">
                <span className="text-white block font-serif tracking-[0.03em]">BESPOKE</span>
                <span className="text-[#E8C589] block font-serif tracking-[0.03em] font-semibold">CUSTOMIZATION</span>
              </h2>
              <div className="pt-1">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E8C589]/90">
                  CRAFTED TO YOUR EXACT REQUIREMENTS
                </p>
                <span className="h-[1px] w-12 bg-[#E8C589]/60 block mt-2.5" />
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-[#F7E8D8]/85 leading-relaxed font-sans max-w-xl">
              Looking for a custom Silver Ring, bespoke Earring design, tailored Rudraksha combination, astrological Gemstone setting, or custom Silver God Idol? Our master craftsmen handcraft personalized orders tailored to your specifications.
            </p>

            {/* 3 Feature Pillars */}
            <div className="flex items-center gap-4 sm:gap-6 pt-1">
              {/* Pillar 1 */}
              <div className="flex flex-col items-start space-y-2">
                <div className="w-11 h-11 rounded-full bg-[#1A0407]/80 border border-[#D4AF37]/50 flex items-center justify-center text-[#E8C589] shadow-xs">
                  <svg className="w-5 h-5 text-[#E8C589]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 2 4 4-14 14H4v-4L18 2z" />
                    <path d="m14.5 5.5 4 4" />
                  </svg>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-[#F7E8D8] leading-snug">
                  Personalized<br />Design
                </p>
              </div>

              {/* Divider */}
              <span className="h-10 w-[1px] bg-[#D4AF37]/40" />

              {/* Pillar 2 */}
              <div className="flex flex-col items-start space-y-2">
                <div className="w-11 h-11 rounded-full bg-[#1A0407]/80 border border-[#D4AF37]/50 flex items-center justify-center text-[#E8C589] shadow-xs">
                  <Gem className="w-5 h-5 text-[#E8C589]" />
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-[#F7E8D8] leading-snug">
                  Expert<br />Craftsmanship
                </p>
              </div>

              {/* Divider */}
              <span className="h-10 w-[1px] bg-[#D4AF37]/40" />

              {/* Pillar 3 */}
              <div className="flex flex-col items-start space-y-2">
                <div className="w-11 h-11 rounded-full bg-[#1A0407]/80 border border-[#D4AF37]/50 flex items-center justify-center text-[#E8C589] shadow-xs">
                  <svg className="w-5 h-5 text-[#E8C589]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4c-1.5 3-4 6-8 7 3.5 1.5 7 1.5 8-1 1 2.5 4.5 2.5 8 1-4-1-6.5-4-8-7z" />
                    <path d="M12 10c-2 3.5-5 5.5-9 6 3 2 6 2 9-0.5 3 2.5 6 2.5 9 0.5-4-0.5-7-2.5-9-6z" />
                  </svg>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-[#F7E8D8] leading-snug">
                  Authentic<br />Gemstones
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('/contact')}
                className="px-7 sm:px-8 py-3.5 rounded-full bg-[#E2BA7A] hover:bg-[#D4A75F] text-[#240A0D] text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <span>CONTACT US</span>
                <Mail className="w-4 h-4 text-[#240A0D]" />
              </button>

              <a
                href="tel:+917899125449"
                className="px-6 sm:px-7 py-3.5 rounded-full bg-[#1D0609]/70 hover:bg-[#1D0609] border border-[#E2BA7A]/70 text-[#FFF9F0] text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span>CALL US (+91 78991 25449)</span>
                <Phone className="w-4 h-4 text-[#E2BA7A]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. God Statues & Devotional Artifacts Feature */}
      <section className="bg-[#F3DDD7] py-14 sm:py-24 border-b border-[#E9D9C5]">
        <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between border-b border-[#E9D9C5] pb-5 gap-4 text-center sm:text-left">
            <div className="space-y-1 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#7A1822]">Puja & Devotional</span>
                <span className="h-[1px] w-8 sm:w-12 bg-[#7A1822]/40" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#281C18]">God Small Statues & Silver Pendants</h2>
              <p className="text-xs sm:text-sm text-[#796A65] max-w-2xl mx-auto sm:mx-0">
                Pure 925 hallmarked silver idols and sacred devotional accessories crafted for auspicious home mandirs and divine gifting.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('God Small Statues');
                navigateTo('/shop');
              }}
              className="btn-12 btn-12-burgundy shrink-0 cursor-pointer self-center sm:self-auto"
            >
              <span>View Statues & Idols</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {godStatuesList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7.5. What Others Say (Testimonials Carousel) */}
      <TestimonialCarousel />

      {/* 8. Authenticity & Brand Trust (The Guru Diamonds Authenticity Promise) */}
      <section className="relative w-full bg-[#FAF5ED] py-20 sm:py-24 border-t border-[#E9D9C5] overflow-hidden">
        {/* Subtle decorative background foliage line accents */}
        <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none opacity-40 hidden md:block">
          <svg className="w-full h-full text-[#B8893D]/30" viewBox="0 0 100 400" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M-20,50 Q40,120 10,200 T30,350" />
            <path d="M10,120 Q50,110 30,80" />
            <path d="M15,190 Q65,180 40,150" />
            <path d="M20,260 Q70,250 45,220" />
          </svg>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none opacity-40 hidden md:block">
          <svg className="w-full h-full text-[#B8893D]/30" viewBox="0 0 100 400" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M120,50 Q60,120 90,200 T70,350" />
            <path d="M90,120 Q50,110 70,80" />
            <path d="M85,190 Q35,180 60,150" />
            <path d="M80,260 Q30,250 55,220" />
          </svg>
        </div>

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 sm:w-14 bg-[#B8893D]/60" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-[#9A622A]">
                OUR COMMITMENT
              </span>
              <span className="h-[1px] w-8 sm:w-14 bg-[#B8893D]/60" />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1B1A18] tracking-tight">
              The Guru Diamonds Authenticity Promise
            </h2>

            <p className="text-xs sm:text-sm text-[#7A746B] leading-relaxed max-w-2xl mx-auto font-light">
              Every gemstone, Rudraksha, statue, and jewellery piece at Guru Diamonds is carefully verified for authenticity, quality, and long-lasting value before reaching you.
            </p>
          </div>

          {/* 4 Feature Columns with 2/2 Layout on Mobile and 4 Columns on Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 lg:divide-x divide-[#E9D9C5]/80">
            {/* Pillar 1: 100% Verified Products */}
            <div className="text-center px-2 sm:px-4 lg:px-8 flex flex-col items-center space-y-2 sm:space-y-3 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border border-[#B8893D] flex items-center justify-center text-[#B8893D] bg-transparent group-hover:bg-[#FAF0DF] group-hover:scale-105 transition-all shadow-xs">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-[#B8893D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l4 6-10 12L2 9z" />
                  <path d="M11 3 8 9l4 12 4-12-3-6" />
                  <path d="M2 9h20" />
                </svg>
              </div>
              <h3 className="font-bold text-[11px] sm:text-xs lg:text-sm text-[#1B1A18] tracking-[0.08em] sm:tracking-[0.14em] uppercase pt-1">
                100% VERIFIED PRODUCTS
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7A746B] leading-relaxed max-w-[240px]">
                Natural unheated gemstones, lab-certified Rudrakshas, and hallmarked 925 silver.
              </p>
            </div>

            {/* Pillar 2: Strict Lab Certification */}
            <div className="text-center px-2 sm:px-4 lg:px-8 flex flex-col items-center space-y-2 sm:space-y-3 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border border-[#B8893D] flex items-center justify-center text-[#B8893D] bg-transparent group-hover:bg-[#FAF0DF] group-hover:scale-105 transition-all shadow-xs">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-[#B8893D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 13h6" />
                  <path d="M9 17h3" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3 className="font-bold text-[11px] sm:text-xs lg:text-sm text-[#1B1A18] tracking-[0.08em] sm:tracking-[0.14em] uppercase pt-1">
                STRICT LAB CERTIFICATION
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7A746B] leading-relaxed max-w-[240px]">
                Each gemstone and rare 1-24 Mukhi Rudraksha comes with genuine lab test reports.
              </p>
            </div>

            {/* Pillar 3: Bespoke Customization */}
            <div className="text-center px-2 sm:px-4 lg:px-8 flex flex-col items-center space-y-2 sm:space-y-3 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border border-[#B8893D] flex items-center justify-center text-[#B8893D] bg-transparent group-hover:bg-[#FAF0DF] group-hover:scale-105 transition-all shadow-xs">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-[#B8893D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 2 4 4-14 14H4v-4L18 2z" />
                  <path d="m14.5 5.5 4 4" />
                  <path d="M6 18l6-6" />
                </svg>
              </div>
              <h3 className="font-bold text-[11px] sm:text-xs lg:text-sm text-[#1B1A18] tracking-[0.08em] sm:tracking-[0.14em] uppercase pt-1">
                BESPOKE CUSTOMIZATION
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7A746B] leading-relaxed max-w-[240px]">
                Tailored designs for rings, pendants, maalas, and deity idols based on your exact requirements.
              </p>
            </div>

            {/* Pillar 4: Transparent Pricing */}
            <div className="text-center px-2 sm:px-4 lg:px-8 flex flex-col items-center space-y-2 sm:space-y-3 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border border-[#B8893D] flex items-center justify-center text-[#B8893D] bg-transparent group-hover:bg-[#FAF0DF] group-hover:scale-105 transition-all shadow-xs">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-[#B8893D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="6" rx="8" ry="3" />
                  <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
                  <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
                </svg>
              </div>
              <h3 className="font-bold text-[11px] sm:text-xs lg:text-sm text-[#1B1A18] tracking-[0.08em] sm:tracking-[0.14em] uppercase pt-1">
                TRANSPARENT PRICING
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7A746B] leading-relaxed max-w-[240px]">
                No hidden charges, clear gemstone and silver pricing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
