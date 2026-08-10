import React, { useEffect, useState, useRef } from 'react';
import { navigateTo } from '../utils/navigation';
import { useCMSStore } from '../stores/useCMSStore';
import { useProductStore } from '../stores/useProductStore';
import { ProductCard } from '../components/storefront/ProductCard';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { CubeButton } from '../components/ui/CubeButton';
import { isGemstoneProduct } from '../utils/productFilters';
const spiritualCollectionImage = 'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=800&q=80';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  Gem,
  CheckCircle2,
  Sparkles,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
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
        eyebrow: 'Silver Gemstone Rings',
        title: 'Handpicked Silver Statements',
        subtitle: 'Explore bold silver rings set with natural stones, crafted for everyday elegance and trusted gemstone guidance.',
        ctaLabel: 'Shop Silver Rings',
        ctaLink: '/shop?category=Rings',
        secondaryCtaLabel: 'View Ring Guide',
        secondaryCtaLink: '/size-guide',
        imageUrl: '/hero/hero.png',
        mobileImageUrl: '/hero/hero.png',
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
        eyebrow: 'Rudraksha Heritage',
        title: 'Every Bead Carries Meaning',
        subtitle: 'Choose carefully verified 1-24 Mukhi Rudraksha maalas for spiritual practice, gifting, astrology, and daily devotion.',
        ctaLabel: 'Shop Rudraksha',
        ctaLink: '/shop?category=Rudrakshas%20(1%20to%2024%20Mukhi)',
        secondaryCtaLabel: 'Contact Store',
        secondaryCtaLink: '/contact',
        imageUrl: '/hero/hero-3.png',
        mobileImageUrl: '/hero/hero-3.png',
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

  const gemstonesList = products.filter((p) => isGemstoneProduct(p) || p.category === 'Gemstones').slice(0, 4);
  const matchingStatues = products.filter((p) => p.category === 'God Small Statues' || p.category === 'Silver Pendants' || p.category === 'Pendants');
  const godStatuesList = matchingStatues.length >= 4 
    ? matchingStatues.slice(0, 4) 
    : [...matchingStatues, ...activeProducts.filter((p) => !matchingStatues.some((m) => m.id === p.id))].slice(0, 4);

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

  const categoryList = [
    {
      name: 'Rings',
      category: 'Rings',
      image: '/categories/Rings.png',
    },
    {
      name: 'Earrings',
      category: 'Earrings',
      image: '/categories/earrings.png',
    },
    {
      name: 'Neck Jewellery',
      category: 'Neck Jewellery',
      image: '/categories/Neck%20Jewellery.png',
    },
    {
      name: 'Pendants',
      category: 'Silver Pendants',
      image: '/categories/Pendants.png',
    },
    {
      name: 'Bracelets & Bangles',
      category: 'Silver & Navarathna Bracelets',
      image: '/categories/Bracelets%20&%20Bangles.png',
    },
    {
      name: 'Gemstones',
      category: 'Gemstones',
      image: '/categories/Gemstones.png',
    },
    {
      name: 'Spiritual Maalas',
      category: 'Maalas',
      image: '/categories/Spiritual%20Maalas.png',
    },
    {
      name: 'Rudraksha',
      category: 'Rudrakshas (1 to 24 Mukhi)',
      image: '/categories/Rudraksha.png',
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-clip bg-[#FFF9F0] text-[#281C18] flex flex-col">
      {/* 1. Hero Campaign Section (Full Width Edge-to-Edge) */}
      <section className="relative w-full overflow-hidden bg-[#2D080C] text-[#FFF9F0] min-h-[520px] sm:min-h-[600px] lg:min-h-[715px] xl:min-h-[780px] flex items-center">
        {/* Full Width Background Image Carousel (Only images from public/hero) */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, index) => {
            const localHeroImages = ['/hero/hero1.png', '/hero/hero2.png', '/hero/hero3.png'];
            const localSrc = slide.imageUrl && (slide.imageUrl.endsWith('hero1.png') || slide.imageUrl.endsWith('hero2.png') || slide.imageUrl.endsWith('hero3.png'))
              ? slide.imageUrl
              : localHeroImages[index % localHeroImages.length];

            return (
              <img
                key={slide.id}
                src={localSrc}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                  index === activeHeroIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            );
          })}
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 pt-14 sm:pt-20 lg:pt-24 pb-14 sm:pb-20 lg:pb-24">
          <div className="max-w-3xl space-y-6 sm:space-y-8 drop-shadow-[0_4px_24px_rgba(45,8,12,0.92)]">
            <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-[#B8893D]/30 border-2 border-[#B8893D]/60 text-[#F4E4C8] text-xs sm:text-sm font-extrabold uppercase tracking-widest backdrop-blur-md">
              <span>{activeHeroSlide.eyebrow}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-[#FFF9F0] leading-[1.08] tracking-tight">
              {activeHeroSlide.title}
            </h1>

            <p className="text-base sm:text-xl lg:text-2xl text-[#F4E4C8] font-sans leading-relaxed max-w-2xl font-medium">
              {activeHeroSlide.subtitle}
            </p>

            <div className="flex flex-wrap gap-5 pt-3">
              <button
                onClick={() => handleHeroNavigation(activeHeroSlide.ctaLink)}
                className="btn-12 btn-12-gold"
              >
                <span>{activeHeroSlide.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleHeroNavigation(activeHeroSlide.secondaryCtaLink)}
                className="btn-12 btn-12-secondary"
              >
                <span>{activeHeroSlide.secondaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveHeroIndex(index)}
                aria-label={`Show hero slide ${index + 1}`}
                className={`h-2.5 rounded-full border border-[#F4E4C8]/70 transition-all ${index === activeHeroIndex
                  ? 'w-8 bg-[#B8893D]'
                  : 'w-2.5 bg-[#FFF9F0]/35 hover:bg-[#FFF9F0]/70'
                  }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. Featured Categories Single Line Carousel (Zoomed-In Prominent Cards) */}
      <section className="bg-[#FFF9F0] py-20 sm:py-24 border-b border-[#E9D9C5]">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#B8893D]">Curated Masterpieces</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#281C18] mt-1">Explore Categories</h2>
            </div>
          </div>

          {/* Single Line Horizontal Carousel */}
          <div className="relative group">
            {/* Floating Side Left Arrow */}
            <button
              onClick={() => scrollCategories('left')}
              className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#FFFFFF] backdrop-blur-md border-2 border-[#E9D9C5] text-[#281C18] items-center justify-center shadow-2xl hover:bg-[#7A1822] hover:text-[#FFF9F0] hover:border-[#7A1822] transition-all cursor-pointer"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            {/* Cards Container (Zoomed-In Large Cards) */}
            <div
              ref={categoryScrollRef}
              className="flex items-center gap-5 sm:gap-6 overflow-x-auto scroll-smooth py-5 px-1 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categoryList.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat.category);
                    navigateTo('/shop');
                  }}
                  className="shrink-0 w-[85%] min-w-[270px] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2*1.5rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)] group/card cursor-pointer bg-[#FFFFFF] border-2 border-[#E9D9C5] rounded-3xl p-5 text-center space-y-4 hover:shadow-2xl hover:border-[#B8893D] transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* 1:1 Aspect Ratio Square Image Container */}
                    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FFF9F0] border border-[#E9D9C5]/60 relative">
                      <ImageWithFallback
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover scale-105 group-hover/card:scale-115 transition-transform duration-700"
                      />
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg uppercase tracking-wider text-[#281C18] group-hover/card:text-[#7A1822] transition-colors truncate">
                      {cat.name}
                    </h3>
                  </div>

                  {/* View Button for Each Card */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="btn-12 btn-12-burgundy w-full py-2.5 px-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Side Right Arrow */}
            <button
              onClick={() => scrollCategories('right')}
              className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#FFFFFF] backdrop-blur-md border-2 border-[#E9D9C5] text-[#281C18] items-center justify-center shadow-2xl hover:bg-[#7A1822] hover:text-[#FFF9F0] hover:border-[#7A1822] transition-all cursor-pointer"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Sacred Rudraksha (1 to 24 Mukhi) & Maalas Spotlight */}
      <section className="bg-[#3D0B10] text-[#FFF9F0] py-18 sm:py-24 lg:py-26 border-y-2 border-[#B8893D]/50">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B8893D]/20 border border-[#B8893D]/50 text-[#F4E4C8] text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#B8893D]" /> Timeless Spiritual Heritage
            </span>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#FFF9F0]">
              Certified 1–24 Mukhi Rudraksha Collection
            </h2>

            <p className="text-xs sm:text-sm lg:text-base text-[#F4E4C8]/90 leading-relaxed font-sans max-w-xl">
              Honor centuries of Vedic tradition with our carefully curated collection of authentic 1 Mukhi to 24 Mukhi Rudrakshas. Every bead undergoes strict authenticity verification and is beautifully finished for lifelong spiritual practice and wear.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-[#F4E4C8] font-medium">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#B8893D] shrink-0" /> 100% Genuine & Laboratory Certified Rudrakshas
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#B8893D] shrink-0" /> Complete Collection from 1 Mukhi to Rare 24 Mukhi
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#B8893D] shrink-0" /> Available as Loose Beads, Silver-Capped & Custom Pendants
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Rudrakshas (1 to 24 Mukhi)');
                  navigateTo('/shop');
                }}
                className="btn-12 btn-12-gold"
              >
                <span>Browse All Rudrakshas</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigateTo('/contact');
                }}
                className="btn-12 btn-12-secondary"
              >
                <span>Request Expert Guidance</span>
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full aspect-square max-w-[540px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#B8893D]/60 shadow-2xl bg-[#2D080C] p-3 flex items-center justify-center">
              <img
                src="/rudraksha-spotlight.png"
                alt="Certified 1–24 Mukhi Rudraksha Collection"
                className="w-full h-full object-contain rounded-xl sm:rounded-2xl hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Signature Bestsellers */}
      <section className="bg-[#F3DDD7] py-20 sm:py-24 border-y border-[#E9D9C5]/80">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between border-b border-[#E9D9C5] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1822]">Patron Favorites</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#281C18]">Signature Bestsellers</h2>
            </div>
            <button
              onClick={() => navigateTo('/shop')}
              className="btn-12 btn-12-burgundy"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Certified Astrological Gemstones & Navarathna Showcase */}
      <section className="bg-[#F4E4C8] py-20 sm:py-24 border-b border-[#E9D9C5]">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between border-b border-[#E9D9C5] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1822]">Astrological Alignment</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#281C18]">Certified Precious Gemstones & Navarathna</h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('Gemstones');
                navigateTo('/shop');
              }}
              className="btn-12 btn-12-burgundy"
            >
              <span>Explore Gemstones</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gemstonesList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Bespoke Customisation Service Banner (Center Aligned with 3 CTA Buttons) */}
      <section className="bg-gradient-to-r from-[#2D080C] via-[#4A1017] to-[#2D080C] text-[#FFF9F0] py-20 sm:py-24 border-y border-[#B8893D]/40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B8893D]/20 border border-[#B8893D]/40 text-[#F4E4C8] text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
            <Wrench className="w-4 h-4 text-[#B8893D]" /> Bespoke Custom Service
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FFF9F0] leading-tight text-center max-w-4xl">
            Bespoke Customization – Crafted To Your Exact Requirements
          </h2>

          <p className="text-xs sm:text-base text-[#F4E4C8]/90 leading-relaxed font-sans max-w-3xl text-center">
            Looking for a custom Silver Ring, bespoke Earring design, tailored Rudraksha combination, astrological Gemstone setting, or custom Silver God Idol? Our master craftsmen handcraft personalized orders tailored to your specifications.
          </p>

          {/* CTA Buttons: Contact Us and Call Us */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigateTo('/contact')}
              className="btn-12 btn-12-gold"
            >
              <span>Contact Us</span>
              <Mail className="w-4 h-4" />
            </button>

            <a
              href="tel:+917899125449"
              className="btn-12 btn-12-secondary"
            >
              <span>Call Us (+91 78991 25449)</span>
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 7. God Statues & Devotional Artifacts Feature */}
      <section className="bg-[#F3DDD7] py-20 sm:py-24 border-b border-[#E9D9C5]">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between border-b border-[#E9D9C5] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1822]">Puja & Devotional</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#281C18]">God Small Statues & Silver Pendants</h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('God Small Statues');
                navigateTo('/shop');
              }}
              className="btn-12 btn-12-burgundy"
            >
              <span>View Statues & Idols</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {godStatuesList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Authenticity & Brand Trust */}
      <section className="bg-[#FFF9F0] py-20 sm:py-24">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFF9F0] border border-[#E9D9C5] rounded-3xl p-8 lg:p-12 text-center space-y-8 shadow-xs">
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8893D]">Uncompromising Trust</span>
              <h2 className="font-serif text-3xl font-bold text-[#281C18]">The Guru Diamonds Authenticity Promise</h2>
              <p className="text-xs text-[#796A65] leading-relaxed">
                Every gemstone, Rudraksha, statue, and jewellery piece at Guru Diamonds is carefully verified for authenticity, quality, and long-lasting value before reaching you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
              <div className="p-6 bg-white rounded-2xl border border-[#E9D9C5] space-y-2 shadow-xs">
                <ShieldCheck className="w-8 h-8 text-[#7A1822]" />
                <h4 className="font-serif font-bold text-base text-[#281C18]">100% Verified Products</h4>
                <p className="text-xs text-[#796A65]">
                  Natural unheated gemstones, lab-certified Rudrakshas, and hallmarked 925 silver.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E9D9C5] space-y-2 shadow-xs">
                <Award className="w-8 h-8 text-[#B8893D]" />
                <h4 className="font-serif font-bold text-base text-[#281C18]">Strict Lab Certification</h4>
                <p className="text-xs text-[#796A65]">
                  Each gemstone and rare 1-24 Mukhi Rudraksha comes with genuine lab test reports.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E9D9C5] space-y-2 shadow-xs">
                <Wrench className="w-8 h-8 text-[#B8893D]" />
                <h4 className="font-serif font-bold text-base text-[#281C18]">Bespoke Customization</h4>
                <p className="text-xs text-[#796A65]">
                  Tailored designs for rings, pendants, maalas, and deity idols based on your exact requirements.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E9D9C5] space-y-2 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-[#2E7D5B]" />
                <h4 className="font-serif font-bold text-base text-[#281C18]">Transparent Pricing</h4>
                <p className="text-xs text-[#796A65]">
                  Guaranteed price lock during checkout with no hidden making charge surprises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
