import React, { useEffect, useState } from 'react';
import { navigateTo } from '../utils/navigation';
import { useCMSStore } from '../stores/useCMSStore';
import { useProductStore } from '../stores/useProductStore';
import { useMetalRateStore } from '../stores/useMetalRateStore';
import { ProductCard } from '../components/storefront/ProductCard';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { formatINR } from '../utils/formatters';
import { isGemstoneProduct } from '../utils/productFilters';
import spiritualCollectionImage from '../../assets/Screenshot 2026-08-04 170018.png';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  Gem,
  CheckCircle2,
  Star,
  BookOpen,
  Calendar,
  Flame,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { cms } = useCMSStore();
  const { products, setSelectedCategory, setSelectedCollection, setSelectedGender, resetFilters } = useProductStore();
  const { rates } = useMetalRateStore();

  const hero = cms.heroBanner;
  const heroSlides = hero.slides && hero.slides.length > 0
    ? hero.slides
    : [
        {
          id: 'hero-slide-fallback',
          eyebrow: 'Where Trust Meets Brilliance',
          title: hero.title,
          subtitle: hero.subtitle,
          ctaLabel: hero.ctaLabel,
          ctaLink: hero.ctaLink,
          secondaryCtaLabel: 'Custom Commissions',
          secondaryCtaLink: '/contact',
          imageUrl: hero.imageUrl,
          mobileImageUrl: hero.mobileImageUrl,
        },
      ];
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const activeHeroSlide = heroSlides[activeHeroIndex] || heroSlides[0];
  const bestSellers = products.filter((p) => p.badges.includes('BEST_SELLER')).slice(0, 4);
  const newArrivals = products.filter((p) => p.badges.includes('NEW')).slice(0, 4);
  const gemstonesList = products.filter((p) => isGemstoneProduct(p) || p.category === 'Maalas').slice(0, 4);

  const gold24k = rates.find((r) => r.metal === 'GOLD' && r.purity === '24K')?.ratePerGram || 7450;
  const gold22k = rates.find((r) => r.metal === 'GOLD' && r.purity === '22K')?.ratePerGram || 6830;
  const silver925 = rates.find((r) => r.metal === 'SILVER' && r.purity === '925')?.ratePerGram || 82;

  useEffect(() => {
    if (activeHeroIndex >= heroSlides.length) {
      setActiveHeroIndex(0);
    }
  }, [activeHeroIndex, heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveHeroIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, 5500);

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

  return (
    <div className="bg-[#FFF9F0] text-[#281C18] flex flex-col">
      {/* 1. Hero Campaign Section (Light Ivory Background Container) */}
      <section className="bg-[#FFF9F0] py-8 sm:py-12">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-[#2D080C] text-[#FFF9F0] min-h-[500px] lg:min-h-[600px] xl:min-h-[640px] flex items-center border border-[#B8893D]/30 shadow-xl">
            {/* Campaign Image Slider */}
            <div className="absolute inset-0 z-0">
              {heroSlides.map((slide, index) => (
                <ImageWithFallback
                  key={slide.id}
                  src={slide.imageUrl || '/hero/hero.png'}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover object-center scale-102 transition-opacity duration-700 ${
                    index === activeHeroIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>

            <div className="relative z-10 max-w-2xl px-6 sm:px-12 lg:px-16 py-20 space-y-6 drop-shadow-[0_3px_18px_rgba(45,8,12,0.72)]">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B8893D]/20 border border-[#B8893D]/40 text-[#F4E4C8] text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
                <span>{activeHeroSlide.eyebrow}</span>
              </div>

              <h1 className="font-hero text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#FFF9F0] leading-tight">
                {activeHeroSlide.title}
              </h1>

              <p className="text-sm sm:text-base text-[#F4E4C8]/90 font-sans leading-relaxed max-w-xl">
                {activeHeroSlide.subtitle}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => handleHeroNavigation(activeHeroSlide.ctaLink)}
                  className="luxury-action-button"
                >
                  <span className="circle" aria-hidden="true">
                    <span className="icon arrow" />
                  </span>
                  <span className="button-text">{activeHeroSlide.ctaLabel}</span>
                </button>

                <button
                  onClick={() => handleHeroNavigation(activeHeroSlide.secondaryCtaLink)}
                  className="luxury-action-button luxury-action-button-secondary"
                >
                  <span className="circle" aria-hidden="true">
                    <span className="icon arrow" />
                  </span>
                  <span className="button-text">{activeHeroSlide.secondaryCtaLabel}</span>
                </button>
              </div>
            </div>

            {heroSlides.length > 1 && (
              <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveHeroIndex(index)}
                    aria-label={`Show hero slide ${index + 1}`}
                    className={`h-2.5 rounded-full border border-[#F4E4C8]/70 transition-all ${
                      index === activeHeroIndex
                        ? 'w-8 bg-[#B8893D]'
                        : 'w-2.5 bg-[#FFF9F0]/35 hover:bg-[#FFF9F0]/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Daily Bullion Rate & Formula Guarantee Banner (Champagne Background - #F4E4C8) */}
      <section className="bg-[#F4E4C8] py-14 sm:py-20 border-y border-[#E9D9C5]">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFF9F0] border border-[#E9D9C5] rounded-2xl p-6 lg:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A1822] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#B8893D]" /> Transparent Price Guarantee
              </span>
              <h3 className="font-serif font-bold text-xl text-[#281C18] mt-1">Live Bullion Spot Standards</h3>
              <p className="text-xs text-[#796A65] mt-1 leading-relaxed">
                Prices dynamically match live 22K gold & 925 silver MCX market spot rates with itemized breakdown.
              </p>
            </div>

            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E9D9C5] text-center shadow-xs">
                <span className="text-[11px] text-[#796A65] uppercase font-semibold block">24K Pure Gold (999)</span>
                <span className="text-xl font-bold text-[#281C18] block mt-1">{formatINR(gold24k)} / g</span>
                <span className="text-[10px] text-[#2E7D5B] font-semibold mt-0.5 block">MCX Spot Index</span>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E9D9C5] text-center shadow-xs">
                <span className="text-[11px] text-[#796A65] uppercase font-semibold block">22K Standard Gold (916)</span>
                <span className="text-xl font-bold text-[#7A1822] block mt-1">{formatINR(gold22k)} / g</span>
                <span className="text-[10px] text-[#2E7D5B] font-semibold mt-0.5 block">Jewellery Benchmark</span>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E9D9C5] text-center shadow-xs">
                <span className="text-[11px] text-[#796A65] uppercase font-semibold block">925 Sterling Silver</span>
                <span className="text-xl font-bold text-[#281C18] block mt-1">{formatINR(silver925)} / g</span>
                <span className="text-[10px] text-[#2E7D5B] font-semibold mt-0.5 block">Hallmarked Standard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories (Light Ivory Background - #FFF9F0) */}
      <section className="bg-[#FFF9F0] py-20 sm:py-24">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B8893D]">Curated Masterpieces</span>
            <h2 className="font-serif text-3xl font-bold text-[#281C18]">Explore Heritage Categories</h2>
            <div className="w-12 h-0.5 bg-[#B8893D] mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: 'Gold Rings',
                category: 'Gold rings',
                image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=400&q=80',
              },
              {
                name: 'Sphatika Maalas',
                category: 'Maalas',
                image: 'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=400&q=80',
              },
              {
                name: 'Gemstones',
                category: 'Gemstones',
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80',
              },
              {
                name: 'Silver Jhumkas',
                category: 'Earrings',
                image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80',
              },
              {
                name: 'Bridal Chokers',
                category: 'Necklaces',
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
              },
              {
                name: 'Men’s Kadas',
                category: 'Chains',
                image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=400&q=80',
              },
            ].map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedCategory(cat.category);
                  navigateTo('/shop');
                }}
                className="group cursor-pointer bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl p-3 text-center space-y-3 hover:shadow-xl hover:border-[#B8893D]/60 transition-all duration-300"
              >
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#FFF9F0]">
                  <ImageWithFallback
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#281C18] group-hover:text-[#7A1822] transition-colors">
                  {cat.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Signature Bestsellers (Dusty Blush Background - #F3DDD7) */}
      <section className="bg-[#F3DDD7] py-20 sm:py-24 border-y border-[#E9D9C5]/80">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between border-b border-[#E9D9C5] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1822]">Patron Favorites</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#281C18]">Signature Bestsellers</h2>
            </div>
            <button
              onClick={() => navigateTo('/shop')}
              className="text-xs font-bold uppercase tracking-wider text-[#7A1822] hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B8893D]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Spiritual Heritage Spotlight (Deep Imperial Burgundy Background - #3D0B10) */}
      <section className="bg-[#3D0B10] text-[#FFF9F0] py-20 sm:py-24 border-y border-[#B8893D]/40">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8893D]/20 border border-[#B8893D]/40 text-[#F4E4C8] text-xs font-semibold uppercase tracking-widest">
              <Gem className="w-3.5 h-3.5 text-[#B8893D]" /> Sacred Spiritual Collection
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Sphatika Crystal & Rudraksha Meditation Maalas
            </h2>

            <p className="text-xs sm:text-sm text-[#F4E4C8]/90 leading-relaxed font-sans">
              Experience divine stillness with 108 hand-strung natural Sphatika quartz crystals and 5-Mukhi Himalayan Rudraksha beads encased in pure hallmarked 925 sterling silver caps.
            </p>

            <ul className="space-y-2.5 text-xs text-[#F4E4C8]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B8893D]" /> SGL Certified Natural Quartz Crystals & Rudraksha
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B8893D]" /> Hand-Capped with 925 BIS Hallmarked Sterling Silver
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B8893D]" /> Includes Sacred Velvet Pouch & Vedic Care Guide
              </li>
            </ul>

            <button
              onClick={() => {
                setSelectedCollection('Spiritual Heritage');
                navigateTo('/shop');
              }}
              className="px-8 py-3.5 bg-[#B8893D] hover:bg-[#966d2c] text-[#281C18] text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl"
            >
              Explore Spiritual Maalas
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <ImageWithFallback
              src={spiritualCollectionImage}
              alt="Sphatika Maala"
              className="w-full h-auto max-h-[560px] object-contain"
            />
          </div>
        </div>
      </section>

      {/* 6. Certified Gemstones Showcase (Champagne Background - #F4E4C8) */}
      <section className="bg-[#F4E4C8] py-20 sm:py-24 border-b border-[#E9D9C5]">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between border-b border-[#E9D9C5] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1822]">Astrological Alignment</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#281C18]">Certified Precious Gemstones</h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('Gemstones');
                navigateTo('/shop');
              }}
              className="text-xs font-bold uppercase tracking-wider text-[#7A1822] hover:underline flex items-center gap-1"
            >
              <span>Explore Gemstones</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B8893D]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gemstonesList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Authenticity & Brand Trust (Light Ivory Background - #FFF9F0) */}
      <section className="bg-[#FFF9F0] py-20 sm:py-24">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFF9F0] border border-[#E9D9C5] rounded-3xl p-8 lg:p-12 text-center space-y-8 shadow-xs">
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8893D]">Uncompromising Trust</span>
              <h2 className="font-serif text-3xl font-bold text-[#281C18]">The Guru Diamonds Authenticity Promise</h2>
              <p className="text-xs text-[#796A65] leading-relaxed">
                Every gemstone and jewellery piece at Guru Diamonds is carefully verified for authenticity, quality, and long-lasting value before it reaches you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-white rounded-2xl border border-[#E9D9C5] space-y-2 shadow-xs">
                <ShieldCheck className="w-8 h-8 text-[#7A1822]" />
                <h4 className="font-serif font-bold text-base text-[#281C18]">100% Genuine Products</h4>
                <p className="text-xs text-[#796A65]">
                  Carefully verified stones and jewellery selected for authenticity, purity, and dependable quality.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E9D9C5] space-y-2 shadow-xs">
                <Award className="w-8 h-8 text-[#B8893D]" />
                <h4 className="font-serif font-bold text-base text-[#281C18]">Strict Quality Inspection</h4>
                <p className="text-xs text-[#796A65]">
                  Each product is reviewed for stone quality, finish, and craftsmanship before dispatch.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E9D9C5] space-y-2 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-[#2E7D5B]" />
                <h4 className="font-serif font-bold text-base text-[#281C18]">Transparent Formula Rate</h4>
                <p className="text-xs text-[#796A65]">
                  Guaranteed price lock during checkout. No hidden making charge surprises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
