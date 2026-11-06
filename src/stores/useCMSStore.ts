import { create } from 'zustand';
import { CMSContent, CMSHeroSlide, CMSSection } from '../types';
import { INITIAL_CMS } from '../data/mockData';
import { cmsApi } from '../services/cmsApi';

interface CMSState {
  cms: CMSContent;
  loading: boolean;
  error: string | null;

  // Actions
  updateAnnouncement: (enabled: boolean, text: string, link?: string) => Promise<void>;
  updateHeroBanner: (heroData: Partial<CMSContent['heroBanner']>) => Promise<void>;
  toggleSection: (sectionId: string, enabled: boolean) => Promise<void>;
  reorderSections: (newSections: CMSSection[]) => Promise<void>;
  updateSectionTitle: (sectionId: string, title: string, subtitle?: string) => Promise<void>;
  updateFooter: (footerData: Partial<CMSContent['footer']>) => Promise<void>;
  hydrateCMS: () => Promise<void>;
}

const LOCAL_KEY = 'guru_diamonds_cms_content_v1';
const LEGACY_LOCAL_KEY = 'vedaara_cms_content_v1';

const BRAND_FOOTER_FALLBACK: Pick<CMSContent['footer'], 'phone' | 'email' | 'address' | 'whatsapp' | 'facebook' | 'instagram'> = {
  phone: '+91 78991 25449',
  email: 'info@gurudimonds.in',
  address: 'No. 1108, 1st Cross, Kurubageri, Lashkar Mohalla, Mysuru - 570001, Karnataka, India',
  whatsapp: '+91 78991 25449',
  facebook: 'https://www.facebook.com/profile.php?id=61567178701595',
  instagram: 'https://www.instagram.com/guru_diamonds?stkn=YWZpeHc1dm9taGtr',
};

export const sanitizeLink = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) {
    return '#';
  }
  return trimmed;
};

const isDemoHeroImage = (imageUrl?: string): boolean =>
  !imageUrl || imageUrl.includes('images.unsplash.com') || imageUrl.includes('images.pexels.com');

const createFallbackHeroSlides = (heroBanner: CMSContent['heroBanner']): CMSHeroSlide[] => {
  const defaultSlides = INITIAL_CMS.heroBanner.slides || [];
  if (defaultSlides.length > 0) {
    return defaultSlides.slice(0, 3);
  }

  const firstSlide: CMSHeroSlide = {
    id: 'hero-slide-1',
    eyebrow: 'Where Trust Meets Brilliance',
    title: heroBanner.title || 'Guru Diamonds',
    subtitle: heroBanner.subtitle || '',
    ctaLabel: heroBanner.ctaLabel || 'Explore Collection',
    ctaLink: heroBanner.ctaLink || '/shop',
    secondaryCtaLabel: 'Contact Store',
    secondaryCtaLink: '/contact',
    imageUrl: isDemoHeroImage(heroBanner.imageUrl) ? '/hero/hero1.png' : heroBanner.imageUrl,
    mobileImageUrl: isDemoHeroImage(heroBanner.mobileImageUrl) ? '/hero/hero1.png' : heroBanner.mobileImageUrl,
  };

  return [firstSlide];
};

const normalizeHeroBanner = (heroBanner: CMSContent['heroBanner']): CMSContent['heroBanner'] => {
  if (!heroBanner) return INITIAL_CMS.heroBanner;
  const fallbackSlides = createFallbackHeroSlides(heroBanner);
  const slides = Array.isArray(heroBanner.slides) && heroBanner.slides.length > 0
    ? heroBanner.slides
    : fallbackSlides;

  const normalizedSlides = fallbackSlides.map((fallback, index) => {
    const slide = slides[index] || fallback;
    const hasDemoImage = isDemoHeroImage(slide.imageUrl);
    if (hasDemoImage) {
      return {
        ...fallback,
        id: slide.id || fallback.id,
      };
    }

    return {
      ...fallback,
      ...slide,
      id: slide.id || fallback.id,
      imageUrl: slide.imageUrl,
      mobileImageUrl: isDemoHeroImage(slide.mobileImageUrl)
        ? fallback.mobileImageUrl
        : slide.mobileImageUrl || slide.imageUrl || fallback.mobileImageUrl,
    };
  });

  return {
    ...heroBanner,
    title: normalizedSlides[0].title,
    subtitle: normalizedSlides[0].subtitle,
    ctaLabel: normalizedSlides[0].ctaLabel,
    ctaLink: normalizedSlides[0].ctaLink,
    imageUrl: normalizedSlides[0].imageUrl,
    mobileImageUrl: normalizedSlides[0].mobileImageUrl,
    slides: normalizedSlides,
  };
};

/**
 * Apply fallbacks only when authoritative fields are absent or undefined,
 * preserving all custom admin-configured values.
 */
const applyCMSFallbacks = (cms: Partial<CMSContent>): CMSContent => ({
  announcementBar: {
    enabled: cms.announcementBar?.enabled ?? INITIAL_CMS.announcementBar.enabled,
    text: cms.announcementBar?.text ?? INITIAL_CMS.announcementBar.text,
    link: sanitizeLink(cms.announcementBar?.link ?? INITIAL_CMS.announcementBar.link),
  },
  heroBanner: normalizeHeroBanner(cms.heroBanner || INITIAL_CMS.heroBanner),
  sections: Array.isArray(cms.sections) && cms.sections.length > 0 ? cms.sections : INITIAL_CMS.sections,
  footer: {
    aboutText: cms.footer?.aboutText ?? INITIAL_CMS.footer.aboutText,
    address: cms.footer?.address ?? BRAND_FOOTER_FALLBACK.address,
    phone: cms.footer?.phone ?? BRAND_FOOTER_FALLBACK.phone,
    email: cms.footer?.email ?? BRAND_FOOTER_FALLBACK.email,
    whatsapp: cms.footer?.whatsapp ?? BRAND_FOOTER_FALLBACK.whatsapp,
    instagram: sanitizeLink(cms.footer?.instagram ?? BRAND_FOOTER_FALLBACK.instagram),
    facebook: sanitizeLink(cms.footer?.facebook ?? BRAND_FOOTER_FALLBACK.facebook),
  },
});

const getInitialCMS = (): CMSContent => {
  try {
    const data = localStorage.getItem(LOCAL_KEY) || localStorage.getItem(LEGACY_LOCAL_KEY);
    if (data && !localStorage.getItem(LOCAL_KEY)) {
      localStorage.setItem(LOCAL_KEY, data);
    }
    const parsed = data ? JSON.parse(data) : INITIAL_CMS;
    return applyCMSFallbacks(parsed);
  } catch {
    return applyCMSFallbacks(INITIAL_CMS);
  }
};

const saveCMS = (cms: CMSContent) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cms));
  } catch { }
};

export const useCMSStore = create<CMSState>((set, get) => ({
  cms: getInitialCMS(),
  loading: false,
  error: null,

  hydrateCMS: async () => {
    set({ loading: true, error: null });
    try {
      const apiData = await cmsApi.getCMS();
      const cms = applyCMSFallbacks(apiData);
      saveCMS(cms);
      set({ cms, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Unable to load CMS content from API' });
    }
  },

  updateAnnouncement: async (enabled, text, link) => {
    const previous = get().cms;
    const updated: CMSContent = {
      ...previous,
      announcementBar: { enabled, text, link: sanitizeLink(link) },
    };
    saveCMS(updated);
    set({ cms: updated, error: null });

    try {
      const saved = await cmsApi.updateCMS(updated);
      const normalized = applyCMSFallbacks(saved);
      saveCMS(normalized);
      set({ cms: normalized });
    } catch (error) {
      set({ cms: previous, error: error instanceof Error ? error.message : 'Unable to save announcement' });
      saveCMS(previous);
      throw error;
    }
  },

  updateHeroBanner: async (heroData) => {
    const previous = get().cms;
    const updated: CMSContent = {
      ...previous,
      heroBanner: normalizeHeroBanner({ ...previous.heroBanner, ...heroData }),
    };
    saveCMS(updated);
    set({ cms: updated, error: null });

    try {
      const saved = await cmsApi.updateCMS(updated);
      const normalized = applyCMSFallbacks(saved);
      saveCMS(normalized);
      set({ cms: normalized });
    } catch (error) {
      set({ cms: previous, error: error instanceof Error ? error.message : 'Unable to save hero banner' });
      saveCMS(previous);
      throw error;
    }
  },

  toggleSection: async (sectionId, enabled) => {
    const previous = get().cms;
    const updatedSections = previous.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, enabled } : sec
    );
    const updated: CMSContent = { ...previous, sections: updatedSections };
    saveCMS(updated);
    set({ cms: updated, error: null });

    try {
      const saved = await cmsApi.updateCMS(updated);
      const normalized = applyCMSFallbacks(saved);
      saveCMS(normalized);
      set({ cms: normalized });
    } catch (error) {
      set({ cms: previous, error: error instanceof Error ? error.message : 'Unable to save CMS section' });
      saveCMS(previous);
      throw error;
    }
  },

  reorderSections: async (newSections) => {
    const previous = get().cms;
    const updated: CMSContent = { ...previous, sections: newSections };
    saveCMS(updated);
    set({ cms: updated, error: null });

    try {
      const saved = await cmsApi.updateCMS(updated);
      const normalized = applyCMSFallbacks(saved);
      saveCMS(normalized);
      set({ cms: normalized });
    } catch (error) {
      set({ cms: previous, error: error instanceof Error ? error.message : 'Unable to reorder CMS sections' });
      saveCMS(previous);
      throw error;
    }
  },

  updateSectionTitle: async (sectionId, title, subtitle) => {
    const previous = get().cms;
    const updatedSections = previous.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, title, subtitle } : sec
    );
    const updated: CMSContent = { ...previous, sections: updatedSections };
    saveCMS(updated);
    set({ cms: updated, error: null });

    try {
      const saved = await cmsApi.updateCMS(updated);
      const normalized = applyCMSFallbacks(saved);
      saveCMS(normalized);
      set({ cms: normalized });
    } catch (error) {
      set({ cms: previous, error: error instanceof Error ? error.message : 'Unable to save section title' });
      saveCMS(previous);
      throw error;
    }
  },

  updateFooter: async (footerData) => {
    const previous = get().cms;
    const sanitizedFooterData: Partial<CMSContent['footer']> = {};
    for (const [key, value] of Object.entries(footerData)) {
      if (typeof value === 'string' && (key.includes('Link') || key === 'instagram' || key === 'facebook')) {
        (sanitizedFooterData as any)[key] = sanitizeLink(value);
      } else {
        (sanitizedFooterData as any)[key] = value;
      }
    }

    const updated: CMSContent = {
      ...previous,
      footer: {
        ...previous.footer,
        ...sanitizedFooterData,
      },
    };

    saveCMS(updated);
    set({ cms: updated, error: null });

    try {
      const saved = await cmsApi.updateCMS(updated);
      const normalized = applyCMSFallbacks(saved);
      saveCMS(normalized);
      set({ cms: normalized });
    } catch (error) {
      set({ cms: previous, error: error instanceof Error ? error.message : 'Unable to save footer changes' });
      saveCMS(previous);
      throw error;
    }
  },
}));
